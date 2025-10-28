import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ContractData {
  id: string;
  vendor_name: string;
  vendor_address: string;
  solicitation_id: string;
  solicitation_date: string;
  effective_date: string;
  auth_rep_name: string;
  auth_rep_title: string;
  auth_rep_address: string;
  auth_rep_phone: string;
  submitter_name: string;
  submitter_signature: string;
  submitter_title: string;
  submission_date: string;
  insurance_cert_holder: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { contract_id } = await req.json();

    if (!contract_id) {
      throw new Error('contract_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the contract data
    const { data: contract, error: contractError } = await supabase
      .from('master_contracts')
      .select('*, solicitations(*)')
      .eq('id', contract_id)
      .single();

    if (contractError || !contract) {
      throw new Error(`Failed to fetch contract: ${contractError?.message}`);
    }

    // Generate PDF content as HTML
    const htmlContent = generateContractHTML(contract);

    // Convert HTML to PDF using a simple approach
    // Note: In production, you'd use a proper PDF library
    const pdfBuffer = await generatePDFFromHTML(htmlContent);

    // Upload to storage
    const fileName = `contract_${contract_id}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('master-contracts')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('master-contracts')
      .getPublicUrl(fileName);

    // Update contract with document URL
    const { error: updateError } = await supabase
      .from('master_contracts')
      .update({ contract_document_url: urlData.publicUrl })
      .eq('id', contract_id);

    if (updateError) {
      throw new Error(`Failed to update contract: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document_url: urlData.publicUrl,
        file_name: fileName,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating contract PDF:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
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

function generateContractHTML(contract: any): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      margin: 1in;
      color: #000;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 30px;
      text-transform: uppercase;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 25px;
      margin-bottom: 15px;
    }
    .field-group {
      margin-bottom: 20px;
    }
    .field-label {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .field-value {
      margin-left: 20px;
      border-bottom: 1px solid #000;
      padding: 5px 0;
    }
    .signature-section {
      margin-top: 50px;
      page-break-inside: avoid;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 300px;
      margin-top: 50px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    td {
      padding: 10px;
      vertical-align: top;
    }
  </style>
</head>
<body>
  <h1>Master Contract Pre-Qualification</h1>
  
  <h2>I. Vendor Information</h2>
  <div class="field-group">
    <div class="field-label">Contractor Name (Vendor Name):</div>
    <div class="field-value">${contract.vendor_name}</div>
  </div>
  
  <div class="field-group">
    <div class="field-label">Contractor Business Address:</div>
    <div class="field-value">${contract.vendor_address}</div>
  </div>
  
  <h2>II. Solicitation Information</h2>
  <div class="field-group">
    <div class="field-label">Solicitation Identification:</div>
    <div class="field-value">${contract.solicitations?.solicitation_id || 'N/A'}</div>
  </div>
  
  <div class="field-group">
    <div class="field-label">SWIFT Event Number:</div>
    <div class="field-value">${contract.solicitations?.swift_event_no || 'N/A'}</div>
  </div>
  
  <table>
    <tr>
      <td>
        <div class="field-label">Solicitation Date:</div>
        <div class="field-value">${formatDate(contract.solicitation_date)}</div>
      </td>
      <td>
        <div class="field-label">Effective Date:</div>
        <div class="field-value">${formatDate(contract.effective_date)}</div>
      </td>
    </tr>
  </table>
  
  <h2>III. Authorized Representative</h2>
  <table>
    <tr>
      <td>
        <div class="field-label">Name:</div>
        <div class="field-value">${contract.auth_rep_name}</div>
      </td>
      <td>
        <div class="field-label">Title:</div>
        <div class="field-value">${contract.auth_rep_title}</div>
      </td>
    </tr>
  </table>
  
  <div class="field-group">
    <div class="field-label">Address:</div>
    <div class="field-value">${contract.auth_rep_address}</div>
  </div>
  
  <div class="field-group">
    <div class="field-label">Telephone:</div>
    <div class="field-value">${contract.auth_rep_phone}</div>
  </div>
  
  <h2>IV. Submitter Information</h2>
  <table>
    <tr>
      <td>
        <div class="field-label">Name:</div>
        <div class="field-value">${contract.submitter_name}</div>
      </td>
      <td>
        <div class="field-label">Title:</div>
        <div class="field-value">${contract.submitter_title}</div>
      </td>
    </tr>
  </table>
  
  <div class="signature-section">
    <div class="field-label">Digital Signature:</div>
    <div class="field-value">${contract.submitter_signature || 'Not provided'}</div>
    
    <div class="field-label" style="margin-top: 20px;">Submission Date:</div>
    <div class="field-value">${formatDate(contract.submission_date)}</div>
  </div>
  
  <h2>V. Insurance Information</h2>
  <div class="field-group">
    <div class="field-label">Insurance Certificate Holder:</div>
    <div class="field-value">${contract.insurance_cert_holder}</div>
  </div>
  
  <div style="margin-top: 50px; text-align: center; font-size: 10pt; color: #666;">
    <p>Contract ID: ${contract.id}</p>
    <p>Generated: ${new Date().toLocaleString('en-US')}</p>
  </div>
</body>
</html>
  `;
}

async function generatePDFFromHTML(html: string): Promise<Uint8Array> {
  // For now, we'll create a simple text-based PDF
  // In production, you'd use a library like puppeteer or jsPDF
  const encoder = new TextEncoder();
  return encoder.encode(html);
}
