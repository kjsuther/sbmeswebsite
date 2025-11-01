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
    console.log('PDF loaded, filling form fields...');

    try {
      form.getTextField('company_name').setText(submissionData.company_name || '');
    } catch (e) {
      console.warn('Field company_name not found');
    }

    try {
      form.getTextField('contact_person').setText(submissionData.contact_person || '');
    } catch (e) {
      console.warn('Field contact_person not found');
    }

    try {
      form.getTextField('email').setText(submissionData.email || '');
    } catch (e) {
      console.warn('Field email not found');
    }

    try {
      form.getTextField('phone').setText(submissionData.phone || '');
    } catch (e) {
      console.warn('Field phone not found');
    }

    const data = submissionData.submission_data || {};

    try {
      form.getTextField('slice_focus').setText(data.sliceFocus || data.customSliceFocus || '');
    } catch (e) {
      console.warn('Field slice_focus not found');
    }

    try {
      form.getTextField('cake_solution').setText(data.cakeSolution || '');
    } catch (e) {
      console.warn('Field cake_solution not found');
    }

    try {
      form.getTextField('ingredients_needed').setText(data.ingredientsNeeded || '');
    } catch (e) {
      console.warn('Field ingredients_needed not found');
    }

    try {
      form.getTextField('dependencies').setText(data.dependencies || '');
    } catch (e) {
      console.warn('Field dependencies not found');
    }

    try {
      form.getTextField('team_description').setText(data.teamDescription || '');
    } catch (e) {
      console.warn('Field team_description not found');
    }

    try {
      form.getTextField('delivery_contact_name').setText(data.deliveryContactName || '');
    } catch (e) {
      console.warn('Field delivery_contact_name not found');
    }

    try {
      form.getTextField('delivery_contact_email').setText(data.deliveryContactEmail || '');
    } catch (e) {
      console.warn('Field delivery_contact_email not found');
    }

    try {
      form.getTextField('delivery_contact_phone').setText(data.deliveryContactPhone || '');
    } catch (e) {
      console.warn('Field delivery_contact_phone not found');
    }

    try {
      form.getTextField('first_slice_cost').setText(data.firstSliceCost || '');
    } catch (e) {
      console.warn('Field first_slice_cost not found');
    }

    try {
      form.getTextField('monthly_team_cost').setText(data.monthlyTeamCost || '');
    } catch (e) {
      console.warn('Field monthly_team_cost not found');
    }

    try {
      if (submissionData.created_at) {
        const subDate = new Date(submissionData.created_at).toLocaleDateString('en-US');
        form.getTextField('submission_date').setText(subDate);
      }
    } catch (e) {
      console.warn('Field submission_date not found');
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
