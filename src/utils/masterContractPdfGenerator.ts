import jsPDF from 'jspdf';

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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const addFormField = (label: string, value: string, x: number, y: number, width: number, isRed: boolean = true): number => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(label, x, y);

    const labelHeight = 6;
    const fieldY = y + labelHeight;

    // Draw underline for field
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(x, fieldY, x + width, fieldY);

    // Add value in red
    doc.setFont('helvetica', 'normal');
    if (isRed) {
      doc.setTextColor(220, 38, 38); // Red color
    }
    doc.text(value || '', x + 2, fieldY - 1);
    doc.setTextColor(0, 0, 0);

    return fieldY + 8;
  };

  // Header with logo space
  doc.setFillColor(26, 77, 46);
  doc.rect(margin, 15, 35, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STATE OF', margin + 17.5, 23, { align: 'center' });
  doc.text('MINNESOTA', margin + 17.5, 30, { align: 'center' });

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text('MASTER CONTRACT', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(14);
  doc.text('PRE-QUALIFICATION SUBMISSION', pageWidth / 2, 33, { align: 'center' });

  let yPos = 50;

  // Section I - Vendor Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('I. CONTRACTOR (VENDOR) INFORMATION:', margin, yPos);
  yPos += 10;

  yPos = addFormField('Contractor Name (Vendor Name):', contractData.vendor_name, margin, yPos, contentWidth, true);
  yPos = addFormField('Contractor Business Address:', contractData.vendor_address, margin, yPos, contentWidth, true);

  yPos += 5;

  // Section II - Solicitation Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('II. SOLICITATION INFORMATION:', margin, yPos);
  yPos += 10;

  if (contractData.solicitation) {
    yPos = addFormField('Solicitation Identification:', contractData.solicitation.solicitation_id, margin, yPos, contentWidth, true);
    yPos = addFormField('SWIFT Event Number:', contractData.solicitation.swift_event_no, margin, yPos, contentWidth, true);
  }

  // Two column layout for dates
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Solicitation Date:', margin, yPos);
  doc.text('Effective Date:', margin + 90, yPos);

  const dateY = yPos + 6;
  doc.setLineWidth(0.3);
  doc.line(margin, dateY, margin + 70, dateY);
  doc.line(margin + 90, dateY, margin + 160, dateY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 38, 38);
  doc.text(formatDate(contractData.solicitation_date), margin + 2, dateY - 1);
  doc.text(formatDate(contractData.effective_date), margin + 92, dateY - 1);
  doc.setTextColor(0, 0, 0);

  yPos = dateY + 12;

  // Section III - Authorized Representative
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('III. AUTHORIZED REPRESENTATIVE:', margin, yPos);
  yPos += 10;

  // Two columns for name and title
  doc.setFontSize(10);
  doc.text('Name:', margin, yPos);
  doc.text('Title:', margin + 90, yPos);

  const nameY = yPos + 6;
  doc.line(margin, nameY, margin + 70, nameY);
  doc.line(margin + 90, nameY, margin + 160, nameY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 38, 38);
  doc.text(contractData.auth_rep_name, margin + 2, nameY - 1);
  doc.text(contractData.auth_rep_title, margin + 92, nameY - 1);
  doc.setTextColor(0, 0, 0);

  yPos = nameY + 10;

  yPos = addFormField('Address:', contractData.auth_rep_address, margin, yPos, contentWidth, true);
  yPos = addFormField('Telephone:', contractData.auth_rep_phone, margin, yPos, 80, true);

  yPos += 5;

  // Section IV - Insurance
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 25;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. INSURANCE REQUIREMENTS:', margin, yPos);
  yPos += 10;

  yPos = addFormField('Insurance Certificate Holder:', contractData.insurance_cert_holder, margin, yPos, contentWidth, true);

  yPos += 5;

  // Section V - Signature
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 25;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('V. SUBMITTER INFORMATION AND SIGNATURE:', margin, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('I certify that the information provided in this Master Contract submission is accurate and complete.', margin, yPos);
  yPos += 8;

  // Signature section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', margin, yPos);
  doc.text('Title:', margin + 90, yPos);

  const sigNameY = yPos + 6;
  doc.line(margin, sigNameY, margin + 70, sigNameY);
  doc.line(margin + 90, sigNameY, margin + 160, sigNameY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 38, 38);
  doc.text(contractData.submitter_name, margin + 2, sigNameY - 1);
  doc.text(contractData.submitter_title, margin + 92, sigNameY - 1);
  doc.setTextColor(0, 0, 0);

  yPos = sigNameY + 12;

  doc.setFont('helvetica', 'bold');
  doc.text('Signature:', margin, yPos);
  doc.text('Date:', margin + 90, yPos);

  const sigLineY = yPos + 6;
  doc.line(margin, sigLineY, margin + 70, sigLineY);
  doc.line(margin + 90, sigLineY, margin + 160, sigLineY);

  doc.setFont('helvetica', 'italic');
  doc.setTextColor(220, 38, 38);
  doc.text(contractData.submitter_signature || '/s/ Electronic Signature', margin + 2, sigLineY - 1);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(contractData.submission_date), margin + 92, sigLineY - 1);
  doc.setTextColor(0, 0, 0);

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Contract ID: ${contractId}`, margin, footerY);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, pageWidth - margin, footerY, { align: 'right' });

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
