import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, rgb } from 'npm:pdf-lib@1.17.1';

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

    // Load the PDF template
    const templateBytes = await templateData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the first page to add text
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Define red color for filled fields
    const redColor = rgb(220 / 255, 38 / 255, 38 / 255);
    
    // Fill in the fields on page 1
    // These coordinates are approximate and may need adjustment
    firstPage.drawText(contractData.vendor_name, {
      x: 310,
      y: 660,
      size: 10,
      color: redColor,
    });
    
    firstPage.drawText(contractData.vendor_address, {
      x: 310,
      y: 645,
      size: 10,
      color: redColor,
    });

    const solicitationInfo = contractData.solicitation;
    if (solicitationInfo) {
      firstPage.drawText(solicitationInfo.solicitation_id, {
        x: 310,
        y: 595,
        size: 10,
        color: redColor,
      });
      
      firstPage.drawText(solicitationInfo.swift_event_no, {
        x: 410,
        y: 595,
        size: 10,
        color: redColor,
      });

      const solDate = new Date(contractData.solicitation_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      firstPage.drawText(solDate, {
        x: 500,
        y: 595,
        size: 10,
        color: redColor,
      });
    }

    const effDate = new Date(contractData.effective_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    firstPage.drawText(effDate, {
      x: 210,
      y: 425,
      size: 10,
      color: redColor,
    });

    // Fill authorized representative info
    firstPage.drawText(`${contractData.auth_rep_name}, ${contractData.auth_rep_title}`, {
      x: 50,
      y: 195,
      size: 10,
      color: redColor,
    });

    firstPage.drawText(`${contractData.auth_rep_address} and ${contractData.auth_rep_phone}`, {
      x: 50,
      y: 170,
      size: 10,
      color: redColor,
    });

    // Fill page 4 (signature page) - index 3
    const signaturePage = pages[3];
    signaturePage.drawText(contractData.submitter_name, {
      x: 150,
      y: 520,
      size: 10,
      color: redColor,
    });

    signaturePage.drawText(contractData.submitter_title, {
      x: 80,
      y: 485,
      size: 10,
      color: redColor,
    });

    const subDate = new Date(contractData.submission_date).toLocaleDateString('en-US');
    signaturePage.drawText(subDate, {
      x: 200,
      y: 485,
      size: 10,
      color: redColor,
    });

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