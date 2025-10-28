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
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.35));
  };

  const checkPageBreak = (currentY: number, neededSpace: number = 30): number => {
    if (currentY + neededSpace > doc.internal.pageSize.height - 20) {
      doc.addPage();
      return 20;
    }
    return currentY;
  };

  const addFieldWithValue = (label: string, value: string, currentY: number): number => {
    let y = checkPageBreak(currentY);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 77, 46);
    doc.text(label, margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    y = addWrappedText(value || 'Not provided', margin + 5, y, contentWidth - 5);
    return y + 8;
  };

  doc.setFillColor(26, 77, 46);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MASTER CONTRACT PRE-QUALIFICATION', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('State of Minnesota - Master Services Agreement', pageWidth / 2, 25, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('I. VENDOR INFORMATION', margin, yPosition);
  yPosition += 12;

  yPosition = addFieldWithValue('Contractor Name (Vendor Name):', contractData.vendor_name, yPosition);
  yPosition = addFieldWithValue('Contractor Business Address:', contractData.vendor_address, yPosition);

  yPosition = checkPageBreak(yPosition, 40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('II. SOLICITATION INFORMATION', margin, yPosition);
  yPosition += 12;

  if (contractData.solicitation) {
    yPosition = addFieldWithValue('Solicitation Identification:', contractData.solicitation.solicitation_id, yPosition);
    yPosition = addFieldWithValue('SWIFT Event Number:', contractData.solicitation.swift_event_no, yPosition);
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('Solicitation Date:', margin, yPosition);
  doc.text('Effective Date:', margin + 85, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(formatDate(contractData.solicitation_date), margin + 5, yPosition);
  doc.text(formatDate(contractData.effective_date), margin + 90, yPosition);
  yPosition += 15;

  yPosition = checkPageBreak(yPosition, 40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('III. AUTHORIZED REPRESENTATIVE', margin, yPosition);
  yPosition += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('Name:', margin, yPosition);
  doc.text('Title:', margin + 85, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(contractData.auth_rep_name, margin + 5, yPosition);
  doc.text(contractData.auth_rep_title, margin + 90, yPosition);
  yPosition += 12;

  yPosition = addFieldWithValue('Address:', contractData.auth_rep_address, yPosition);
  yPosition = addFieldWithValue('Telephone:', contractData.auth_rep_phone, yPosition);

  yPosition = checkPageBreak(yPosition, 50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('IV. SUBMITTER INFORMATION', margin, yPosition);
  yPosition += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('Name:', margin, yPosition);
  doc.text('Title:', margin + 85, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(contractData.submitter_name, margin + 5, yPosition);
  doc.text(contractData.submitter_title, margin + 90, yPosition);
  yPosition += 15;

  yPosition = addFieldWithValue('Digital Signature:', contractData.submitter_signature || 'Not provided', yPosition);
  yPosition = addFieldWithValue('Submission Date:', formatDate(contractData.submission_date), yPosition);

  yPosition = checkPageBreak(yPosition, 40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('V. INSURANCE INFORMATION', margin, yPosition);
  yPosition += 12;

  yPosition = addFieldWithValue('Insurance Certificate Holder:', contractData.insurance_cert_holder, yPosition);

  yPosition = checkPageBreak(yPosition, 30);
  yPosition = doc.internal.pageSize.height - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Contract ID: ${contractId}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text(`Document Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('This document is generated from the submitted master contract pre-qualification form.', pageWidth / 2, yPosition, { align: 'center' });

  return doc.output('blob');
};

export const downloadMasterContractPDF = (contractData: MasterContractData, contractId: string): void => {
  const doc = new jsPDF();
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
