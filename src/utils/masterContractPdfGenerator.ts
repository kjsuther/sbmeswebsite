import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface MasterContractData {
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
  solicitation?: {
    solicitation_id: string;
    swift_event_no: string;
    description: string;
  };
}

export const generateMasterContractPDF = (contractData: MasterContractData, contractId: string): Blob => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 50;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Logo area (left side) - Placeholder for MN logo
  doc.setFillColor(0, 56, 101); // Minnesota blue
  doc.rect(margin - 10, 40, 50, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('mn', margin + 5, 58);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('MINNESOTA', margin - 5, 70);

  // Title section (right side)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const titleX = pageWidth - margin;
  doc.text('State of Minnesota', titleX, 55, { align: 'right' });

  doc.setFontSize(18);
  doc.text('Professional and Technical', titleX, 80, { align: 'right' });
  doc.text('Services Master Contract', titleX, 100, { align: 'right' });

  // SWIFT and Master Contract Numbers (blank lines)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SWIFT Contract Number: _______________', titleX, 130, { align: 'right' });
  doc.text('Master Contract T-Number: _______________', titleX, 145, { align: 'right' });

  let yPos = 180;

  // Opening paragraph with inline red text
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(0, 0, 0);

  const line1 = 'This Master Contract is between the State of Minnesota, acting through its Commissioner of the Department of';
  doc.text(line1, margin, yPos, { maxWidth: pageWidth - 2 * margin });
  yPos += 14;

  const line2Start = 'Human Services ("State") and ';
  doc.text(line2Start, margin, yPos);
  const line2StartWidth = doc.getTextWidth(line2Start);

  // Red text for contractor name
  doc.setTextColor(220, 38, 38);
  doc.text(`[${contractData.vendor_name}]`, margin + line2StartWidth, yPos);
  const contractorWidth = doc.getTextWidth(`[${contractData.vendor_name}]`);

  doc.setTextColor(0, 0, 0);
  const line2End = ' whose designated business address is ';
  doc.text(line2End, margin + line2StartWidth + contractorWidth, yPos);
  yPos += 14;

  // Red text for address
  doc.setTextColor(220, 38, 38);
  doc.text(`[${contractData.vendor_address}]`, margin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 14;

  const line3 = '("Contractor"). State and Contractor may be referred to jointly as "Parties."';
  doc.text(line3, margin, yPos, { maxWidth: pageWidth - 2 * margin });

  yPos += 30;

  // Recitals section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recitals', margin, yPos);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

  yPos += 25;

  // Recital items
  doc.setFontSize(11);
  doc.setFont('times', 'normal');

  // Recital 1
  const rec1Start = '1.    State issued a solicitation identified as ';
  doc.text(rec1Start, margin, yPos);
  const rec1StartWidth = doc.getTextWidth(rec1Start);

  doc.setTextColor(220, 38, 38);
  const solId = `[${contractData.solicitation?.solicitation_id || contractData.solicitation_id}]`;
  doc.text(solId, margin + rec1StartWidth, yPos);
  const solIdWidth = doc.getTextWidth(solId);

  doc.setTextColor(0, 0, 0);
  const swiftStart = ' [';
  doc.text(swiftStart, margin + rec1StartWidth + solIdWidth, yPos);
  const swiftStartWidth = doc.getTextWidth(swiftStart);

  doc.setTextColor(220, 38, 38);
  const swiftNo = contractData.solicitation?.swift_event_no || 'SWIFT Event No.';
  doc.text(swiftNo, margin + rec1StartWidth + solIdWidth + swiftStartWidth, yPos);
  const swiftWidth = doc.getTextWidth(swiftNo);

  doc.setTextColor(0, 0, 0);
  const onText = '] on ';
  doc.text(onText, margin + rec1StartWidth + solIdWidth + swiftStartWidth + swiftWidth, yPos);
  const onWidth = doc.getTextWidth(onText);

  doc.setTextColor(220, 38, 38);
  doc.text(`[${formatDate(contractData.solicitation_date)}]`, margin + rec1StartWidth + solIdWidth + swiftStartWidth + swiftWidth + onWidth, yPos);

  doc.setTextColor(0, 0, 0);
  yPos += 14;
  doc.text('      participation in the Great MES Modernization Bake-Off ("Solicitation");', margin, yPos);

  yPos += 25;

  // Recital 2
  doc.text('2.    Contractor provided a response to the Solicitation indicating its interest in and ability to provide the goods', margin, yPos);
  yPos += 14;
  doc.text('      or services requested in the Solicitation; and', margin, yPos);

  yPos += 25;

  // Recital 3 with underlined text
  doc.text('3.    ', margin, yPos);
  const rec3Width = doc.getTextWidth('3.    ');

  // Underline "Subsequent"
  doc.setFont('times', 'underline');
  const subText = 'Subsequent';
  doc.text(subText, margin + rec3Width, yPos);
  const subWidth = doc.getTextWidth(subText);

  doc.setFont('times', 'normal');
  doc.text(' to an evaluation in accordance with the terms of the Solicitation and negotiation, the Parties', margin + rec3Width + subWidth, yPos);
  yPos += 14;
  doc.text('      desire to enter into a contract.', margin, yPos);

  yPos += 25;

  // Accordingly
  doc.text('Accordingly, the Parties agree as follows:', margin, yPos);

  yPos += 30;

  // Contract section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Contract', margin, yPos);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

  // Footer with contract ID and page number
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Contract ID: ${contractId}`, margin, pageHeight - 30);
  doc.text('Page 1', pageWidth - margin, pageHeight - 30, { align: 'right' });

  return doc.output('blob');
};

export const downloadMasterContractPDF = (contractData: MasterContractData, contractId: string): void => {
  const blob = generateMasterContractPDF(contractData, contractId);

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Master_Contract_${contractData.vendor_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown'}_${timestamp}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
