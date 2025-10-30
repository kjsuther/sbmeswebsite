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

    console.log('Received request to fill PDF template');
    const { contractData } = await req.json();
    console.log('Contract data vendor:', contractData?.vendor_name);

    // First, check if the bucket exists and list files
    console.log('Checking contract-templates bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('contract-templates')
      .list();

    if (listError) {
      console.error('List bucket error:', listError);
    } else {
      console.log('Files in bucket:', files?.map(f => f.name));
    }

    // Download the template PDF from storage
    console.log('Downloading template: master- contract-template.pdf');
    const { data: templateData, error: downloadError } = await supabase.storage
      .from('contract-templates')
      .download('master- contract-template.pdf');

    if (downloadError) {
      console.error('Download error details:', JSON.stringify(downloadError));
      throw new Error(`Failed to download template: ${downloadError.message}`);
    }

    console.log('Template downloaded successfully, size:', templateData?.size);

    // Load the PDF template with form fields
    console.log('Loading PDF template...');
    const templateBytes = await templateData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    console.log('PDF loaded, filling form fields...');

    // Fill the form fields by name
    try {
      form.getTextField('vendor_name').setText(contractData.vendor_name || '');
    } catch (e) {
      console.warn('Field vendor_name not found');
    }

    try {
      form.getTextField('vendor_address').setText(contractData.vendor_address || '');
    } catch (e) {
      console.warn('Field vendor_address not found');
    }

    try {
      const solicitationInfo = contractData.solicitation;
      if (solicitationInfo?.solicitation_id) {
        form.getTextField('solicitation_id').setText(solicitationInfo.solicitation_id);
      }
    } catch (e) {
      console.warn('Field solicitation_id not found');
    }

    try {
      const solicitationInfo = contractData.solicitation;
      if (solicitationInfo?.swift_event_no) {
        form.getTextField('swift_event_no').setText(solicitationInfo.swift_event_no);
      }
    } catch (e) {
      console.warn('Field swift_event_no not found');
    }

    try {
      if (contractData.solicitation_date) {
        const solDate = new Date(contractData.solicitation_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        form.getTextField('solicitation_date').setText(solDate);
      }
    } catch (e) {
      console.warn('Field solicitation_date not found');
    }

    try {
      if (contractData.effective_date) {
        const effDate = new Date(contractData.effective_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        form.getTextField('effective_date').setText(effDate);
      }
    } catch (e) {
      console.warn('Field effective_date not found');
    }

    try {
      const authRepInfo = `${contractData.auth_rep_name || ''}, ${contractData.auth_rep_title || ''}`;
      form.getTextField('auth_rep_name_title').setText(authRepInfo);
    } catch (e) {
      console.warn('Field auth_rep_name_title not found');
    }

    try {
      const authRepContact = `${contractData.auth_rep_address || ''} and ${contractData.auth_rep_phone || ''}`;
      form.getTextField('auth_rep_contact').setText(authRepContact);
    } catch (e) {
      console.warn('Field auth_rep_contact not found');
    }

    try {
      form.getTextField('submitter_name').setText(contractData.submitter_name || '');
    } catch (e) {
      console.warn('Field submitter_name not found');
    }

    try {
      form.getTextField('submitter_title').setText(contractData.submitter_title || '');
    } catch (e) {
      console.warn('Field submitter_title not found');
    }

    try {
      if (contractData.submission_date) {
        const subDate = new Date(contractData.submission_date).toLocaleDateString('en-US');
        form.getTextField('submission_date').setText(subDate);
      }
    } catch (e) {
      console.warn('Field submission_date not found');
    }

    try {
      form.getTextField('insurance_cert_holder').setText(contractData.insurance_cert_holder || '');
    } catch (e) {
      console.warn('Field insurance_cert_holder not found');
    }

    try {
      form.getTextField('insurance_agency_address').setText(contractData.insurance_agency_address || '');
    } catch (e) {
      console.warn('Field insurance_agency_address not found');
    }

    // Flatten the form so fields become regular text
    console.log('Flattening form and saving PDF...');
    form.flatten();

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();
    console.log('PDF saved successfully, size:', pdfBytes.length);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="master-contract.pdf"',
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