import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log('Supabase URL:', supabaseUrl);
    console.log('Service key exists:', !!supabaseKey);

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Received request to fill slice RFP PDF template');
    const { submissionData } = await req.json();
    console.log('Submission data company:', submissionData?.company_name);

    console.log('Checking contract-templates bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('contract-templates')
      .list();

    if (listError) {
      console.error('List bucket error:', listError);
    } else {
      console.log('Files in bucket:', files?.map(f => f.name));
    }

    console.log('Downloading template: work-order-contract-template.pdf');
    const { data: templateData, error: downloadError } = await supabase.storage
      .from('contract-templates')
      .download('work-order-contract-template.pdf');

    if (downloadError) {
      console.error('Download error details:', JSON.stringify(downloadError));
      throw new Error(`Failed to download template: ${downloadError.message}`);
    }

    console.log('Template downloaded successfully, size:', templateData?.size);

    console.log('Loading PDF template...');
    const templateBytes = await templateData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    console.log('PDF loaded, inspecting form fields...');

    const fields = form.getFields();
    console.log(`Found ${fields.length} form fields:`);
    fields.forEach((field) => {
      const name = field.getName();
      console.log(`  - ${name}`);
    });

    console.log('Filling form fields...');

    const data = submissionData.submission_data || {};

    // Map form data to actual PDF field names
    try {
      form.getTextField('company_name').setText(submissionData.company_name || '');
      console.log('Set company_name:', submissionData.company_name);
    } catch (e) {
      console.warn('Field company_name not found');
    }

    try {
      const date = submissionData.created_at
        ? new Date(submissionData.created_at)
        : new Date();
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      form.getTextField('current_date').setText(formattedDate);
      console.log('Set current_date:', formattedDate);
    } catch (e) {
      console.warn('Field current_date not found');
    }

    try {
      form.getTextField('delivery_contact_name').setText(data.deliveryContactName || '');
      console.log('Set delivery_contact_name:', data.deliveryContactName);
    } catch (e) {
      console.warn('Field delivery_contact_name not found');
    }

    try {
      form.getTextField('project_manager').setText(data.stateProjectManager || '');
      console.log('Set project_manager:', data.stateProjectManager);
    } catch (e) {
      console.warn('Field project_manager not found');
    }

    try {
      // Format: "6A - Multiple PMI – Newborn (also on a food support case)"
      const sliceFocusText = data.sliceFocus || data.customSliceFocus || '';
      form.getTextField('slice_number_description').setText(sliceFocusText);
      console.log('Set slice_number_description:', sliceFocusText);
    } catch (e) {
      console.warn('Field slice_number_description not found');
    }

    try {
      // Same as slice_number_description
      const sliceFocusText = data.sliceFocus || data.customSliceFocus || '';
      form.getTextField('slice_number_description_2').setText(sliceFocusText);
      console.log('Set slice_number_description_2:', sliceFocusText);
    } catch (e) {
      console.warn('Field slice_number_description_2 not found');
    }

    try {
      // Format as dollar amount without cents
      const costValue = parseFloat(data.firstSliceCost?.replace(/[^0-9.]/g, '') || '0');
      const formattedCost = costValue > 0 ? `$${Math.round(costValue).toLocaleString('en-US')}` : '';
      form.getTextField('cost_of_delivering').setText(formattedCost);
      console.log('Set cost_of_delivering:', formattedCost);
    } catch (e) {
      console.warn('Field cost_of_delivering not found');
    }

    try {
      // Format as dollar amount
      const monthlyValue = parseFloat(data.monthlyTeamCost?.replace(/[^0-9.]/g, '') || '0');
      const formattedMonthly = monthlyValue > 0 ? `$${monthlyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
      form.getTextField('monthly_delivery_cost').setText(formattedMonthly);
      console.log('Set monthly_delivery_cost:', formattedMonthly);
    } catch (e) {
      console.warn('Field monthly_delivery_cost not found');
    }

    try {
      // Calculate: Cost of first slice + (Monthly Cost x months) until Sept 30, 2026
      const firstCost = parseFloat(data.firstSliceCost?.replace(/[^0-9.]/g, '') || '0');
      const monthlyCost = parseFloat(data.monthlyTeamCost?.replace(/[^0-9.]/g, '') || '0');

      // Calculate months from today to September 30, 2026
      const today = new Date();
      const expirationDate = new Date('2026-09-30');
      const monthsDiff = Math.max(0, Math.round((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));

      const total = firstCost + (monthlyCost * monthsDiff);

      if (total > 0) {
        const formattedTotal = `$${Math.round(total).toLocaleString('en-US')}`;
        form.getTextField('calculated_total').setText(formattedTotal);
        console.log('Set calculated_total:', formattedTotal, `(${monthsDiff} months until expiration)`);
      }
    } catch (e) {
      console.warn('Field calculated_total not found or calculation error');
    }

    console.log('Flattening form and saving PDF...');
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    console.log('PDF saved successfully, size:', pdfBytes.length);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="slice-rfp-response.pdf"',
      },
    });
  } catch (error) {
    console.error('Error filling PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});