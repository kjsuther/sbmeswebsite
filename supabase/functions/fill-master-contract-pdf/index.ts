import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { contractData } = await req.json();

    // Download the template PDF from storage
    const { data: templateData, error: downloadError } = await supabase.storage
      .from('contract-templates')
      .download('master- contract-template.pdf');

    if (downloadError) throw downloadError;

    // Load the PDF template with form fields
    const templateBytes = await templateData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

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
    form.flatten();

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();

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
      JSON.stringify({ error: error.message }),
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