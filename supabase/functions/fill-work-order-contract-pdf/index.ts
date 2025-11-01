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

    console.log('Received request to fill Work Order Contract PDF');
    const { contractData } = await req.json();
    console.log('Contract data company:', contractData?.company_name);

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

    try {
      form.getTextField('company_name').setText(contractData.company_name || '');
    } catch (e) {
      console.warn('Field company_name not found');
    }

    try {
      if (contractData.contract_date) {
        const contractDate = new Date(contractData.contract_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        form.getTextField('current_date').setText(contractDate);
      }
    } catch (e) {
      console.warn('Field current_date not found');
    }

    try {
      form.getTextField('slice_number_description').setText(contractData.slice_number_description || '');
    } catch (e) {
      console.warn('Field slice_number_description not found');
    }

    try {
      if (contractData.monthly_delivery_cost) {
        form.getTextField('monthly_delivery_cost').setText(`$${parseFloat(contractData.monthly_delivery_cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    } catch (e) {
      console.warn('Field monthly_delivery_cost not found');
    }

    try {
      form.getTextField('slice_number_description_2').setText(contractData.slice_number_description || '');
    } catch (e) {
      console.warn('Field slice_number_description_2 not found');
    }

    try {
      if (contractData.cost_of_delivering) {
        form.getTextField('cost_of_delivering').setText(`$${parseFloat(contractData.cost_of_delivering).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    } catch (e) {
      console.warn('Field cost_of_delivering not found');
    }

    try {
      if (contractData.calculated_total) {
        form.getTextField('calculated_total').setText(`$${parseFloat(contractData.calculated_total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    } catch (e) {
      console.warn('Field calculated_total not found');
    }

    try {
      form.getTextField('state_project_manager').setText(contractData.state_project_manager || '');
    } catch (e) {
      console.warn('Field state_project_manager not found');
    }

    try {
      form.getTextField('delivery_contact_name').setText(contractData.delivery_contact_name || '');
    } catch (e) {
      console.warn('Field delivery_contact_name not found');
    }

    console.log('Flattening form and saving PDF...');
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    console.log('PDF saved successfully, size:', pdfBytes.length);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="work-order-contract.pdf"',
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