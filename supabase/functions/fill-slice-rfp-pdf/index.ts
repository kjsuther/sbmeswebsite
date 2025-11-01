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
        ? new Date(submissionData.created_at).toLocaleDateString('en-US')
        : new Date().toLocaleDateString('en-US');
      form.getTextField('current_date').setText(date);
      console.log('Set current_date:', date);
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
      // Slice description with details
      const sliceDesc = [
        data.sliceFocus || data.customSliceFocus || '',
        data.cakeSolution || '',
        data.ingredientsNeeded || '',
        data.dependencies || '',
        data.teamDescription || ''
      ].filter(Boolean).join('\n\n');

      form.getTextField('slice_number_description').setText(sliceDesc);
      console.log('Set slice_number_description with combined data');
    } catch (e) {
      console.warn('Field slice_number_description not found');
    }

    try {
      // Additional description field if needed
      const contactInfo = [
        `Primary Contact: ${data.deliveryContactName || 'N/A'}`,
        `Email: ${data.deliveryContactEmail || 'N/A'}`,
        `Phone: ${data.deliveryContactPhone || 'N/A'}`
      ].join('\n');

      form.getTextField('slice_number_description_2').setText(contactInfo);
      console.log('Set slice_number_description_2 with contact info');
    } catch (e) {
      console.warn('Field slice_number_description_2 not found');
    }

    try {
      form.getTextField('cost_of_delivering').setText(data.firstSliceCost || '');
      console.log('Set cost_of_delivering:', data.firstSliceCost);
    } catch (e) {
      console.warn('Field cost_of_delivering not found');
    }

    try {
      form.getTextField('monthly_delivery_cost').setText(data.monthlyTeamCost || '');
      console.log('Set monthly_delivery_cost:', data.monthlyTeamCost);
    } catch (e) {
      console.warn('Field monthly_delivery_cost not found');
    }

    try {
      // Calculate total if both costs are provided
      const firstCost = parseFloat(data.firstSliceCost?.replace(/[^0-9.]/g, '') || '0');
      const monthlyCost = parseFloat(data.monthlyTeamCost?.replace(/[^0-9.]/g, '') || '0');
      const total = firstCost + monthlyCost;

      if (total > 0) {
        form.getTextField('calculated_total').setText(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log('Set calculated_total:', total);
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
