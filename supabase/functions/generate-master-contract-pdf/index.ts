import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';

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
    const { contractData, contractId } = await req.json();

    if (!contractData) {
      throw new Error('contractData is required');
    }

    console.log('Generating PDF for contract:', contractId);

    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    let page = pdfDoc.addPage([612, 792]);
    let yPos = 720;
    const margin = 50;
    const lineHeight = 13;

    page.drawText('State of Minnesota', {
      x: page.getWidth() - margin - helveticaBold.widthOfTextAtSize('State of Minnesota', 20),
      y: yPos,
      size: 20,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    page.drawText('Professional and Technical', {
      x: page.getWidth() - margin - helveticaBold.widthOfTextAtSize('Professional and Technical', 16),
      y: yPos,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPos -= 17;

    page.drawText('Services Master Contract', {
      x: page.getWidth() - margin - helveticaBold.widthOfTextAtSize('Services Master Contract', 16),
      y: yPos,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPos -= 30;

    page.drawText('SWIFT Contract Number: _______________', {
      x: page.getWidth() - margin - helvetica.widthOfTextAtSize('SWIFT Contract Number: _______________', 10),
      y: yPos,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPos -= 15;

    page.drawText('Master Contract T-Number: _______________', {
      x: page.getWidth() - margin - helvetica.widthOfTextAtSize('Master Contract T-Number: _______________', 10),
      y: yPos,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPos -= 40;

    const vendorName = contractData.vendor_name || '';
    const vendorAddress = contractData.vendor_address || '';

    page.drawText(`This Master Contract is between the State of Minnesota, acting through its Commissioner of the Department of`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText(`Human Services ("State") and [${vendorName}] whose designated business address is`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText(`[${vendorAddress}]`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0.86, 0.15, 0.15),
    });
    yPos -= lineHeight;

    page.drawText(`("Contractor"). State and Contractor may be referred to jointly as "Parties."`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= 25;

    page.drawText('Recitals', {
      x: margin,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: margin, y: yPos - 2 },
      end: { x: page.getWidth() - margin, y: yPos - 2 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    const solId = contractData.solicitation?.solicitation_id || contractData.solicitation_id || 'MES MODERNIZATION';
    const swiftNo = contractData.solicitation?.swift_event_no || 'N/A';
    const solDate = formatDate(contractData.solicitation_date);

    page.drawText(`1.     State issued a solicitation identified as [${solId}] [${swiftNo}] on [${solDate}]`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
      maxWidth: page.getWidth() - 2 * margin,
    });
    yPos -= lineHeight;

    page.drawText('       participation in the Great MES Modernization Bake-Off ("Solicitation");', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    page.drawText('2.     Contractor provided a response to the Solicitation indicating its interest in and ability to provide the goods', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('       or services requested in the Solicitation; and', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    page.drawText('3.     Subsequent to an evaluation in accordance with the terms of the Solicitation and negotiation, the Parties', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('       desire to enter into a contract.', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    page.drawText('Accordingly, the Parties agree as follows:', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= 25;

    page.drawText('Contract', {
      x: margin,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: margin, y: yPos - 2 },
      end: { x: page.getWidth() - margin, y: yPos - 2 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;

    page.drawText('1.     Term of Contract', {
      x: margin,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPos -= 18;

    const effDate = formatDate(contractData.effective_date);
    page.drawText(`         1.1  Effective date. [${effDate}], or the date the State obtains all required signatures under Minn. Stat.`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('               § 16C.05, subd. 2, whichever is later. The Contractor must not accept work under this Master Contract', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('               until this Master Contract is fully executed and the Contractor has been notified by the State\'s', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('               Authorized Representative that it may begin accepting Work Order Contracts.', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });

    page.drawText('Rev. 07.01.2024', {
      x: margin,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText('Page 1 of 25', {
      x: page.getWidth() / 2 - 25,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    page = pdfDoc.addPage([612, 792]);
    yPos = 150;

    page.drawText('2. Contractor', {
      x: margin,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPos -= 15;

    page.drawText('The Contractor certifies that the appropriate person has', {
      x: margin,
      y: yPos,
      size: 9,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('executed the Contract on behalf of the Contractor as', {
      x: margin,
      y: yPos,
      size: 9,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('required by applicable articles, bylaws, resolutions, or', {
      x: margin,
      y: yPos,
      size: 9,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;

    page.drawText('ordinances.', {
      x: margin,
      y: yPos,
      size: 9,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= 25;

    page.drawText(`Print Name: ${contractData.submitter_name || ''}`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight + 5;

    page.drawText('Signature: ____________________________________', {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight + 5;

    const subDate = new Date(contractData.submission_date).toLocaleDateString('en-US');
    page.drawText(`Title: ${contractData.submitter_title || ''}       Date: ${subDate}`, {
      x: margin,
      y: yPos,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });

    page.drawText('Rev. 07.01.2024', {
      x: margin,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText('Page 4 of 25', {
      x: page.getWidth() / 2 - 25,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="master-contract.pdf"',
      },
    });
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