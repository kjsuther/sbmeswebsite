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
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.35));
  };

  const checkPageBreak = (currentY: number, neededSpace: number = 40): number => {
    if (currentY + neededSpace > pageHeight - 30) {
      doc.addPage();
      addPageHeader();
      addPageFooter();
      return 60;
    }
    return currentY;
  };

  const addPageHeader = () => {
    // Minnesota State Logo placeholder (top left)
    doc.setFillColor(26, 77, 46);
    doc.rect(margin, 10, 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MN', margin + 15, 19, { align: 'center' });

    // Header title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('STATE OF MINNESOTA', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('MASTER CONTRACT SUBMISSION', pageWidth / 2, 26, { align: 'center' });

    // Header line
    doc.setDrawColor(26, 77, 46);
    doc.setLineWidth(0.5);
    doc.line(margin, 32, pageWidth - margin, 32);
  };

  const addPageFooter = () => {
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Contract ID: ${contractId}`, margin, footerY);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin, footerY, { align: 'right' });
  };

  // Add first page header and footer
  addPageHeader();
  addPageFooter();

  yPosition = 45;

  // SECTION 1: VENDOR INFORMATION
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 1: VENDOR/CONTRACTOR INFORMATION', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition = addWrappedText('This Master Contract is entered into by and between the State of Minnesota, acting through its authorized representatives, and the Contractor identified below.', margin, yPosition, contentWidth, 10);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Contractor Name:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(contractData.vendor_name, margin + 5, yPosition, contentWidth - 5);
  yPosition += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Contractor Business Address:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(contractData.vendor_address, margin + 5, yPosition, contentWidth - 5);
  yPosition += 10;

  // SECTION 2: SOLICITATION INFORMATION
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 2: SOLICITATION INFORMATION', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  if (contractData.solicitation) {
    doc.setFont('helvetica', 'bold');
    doc.text('Solicitation Identification:', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(contractData.solicitation.solicitation_id, margin + 5, yPosition, contentWidth - 5);
    yPosition += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('SWIFT Event Number:', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(contractData.solicitation.swift_event_no, margin + 5, yPosition, contentWidth - 5);
    yPosition += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Description:', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(contractData.solicitation.description, margin + 5, yPosition, contentWidth - 5);
    yPosition += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Solicitation Date:', margin, yPosition);
  doc.text('Effective Date:', margin + 90, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(contractData.solicitation_date), margin + 5, yPosition);
  doc.text(formatDate(contractData.effective_date), margin + 95, yPosition);
  yPosition += 12;

  // SECTION 3: CONTRACT TERMS AND CONDITIONS
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 3: TERMS AND CONDITIONS', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('3.1 Contract Period', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('This Master Contract shall be effective from the Effective Date specified above and shall remain in effect for a period of one (1) year, unless terminated earlier in accordance with the terms herein or extended by mutual written agreement of the parties.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('3.2 Contract Renewal', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The State may, at its sole discretion, renew this Master Contract for up to four (4) additional one-year periods upon written notice to the Contractor at least thirty (30) days prior to the expiration of the current term.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('3.3 Payment Terms', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('Payment shall be made in accordance with Minnesota Statutes §16A.124 and §471.425. The State will make payment within thirty (30) days of receipt of an accurate invoice and acceptance of the goods or services provided. All invoices shall reference the applicable purchase order number and contract number.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('3.4 Termination', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The State reserves the right to terminate this Master Contract at any time, with or without cause, upon thirty (30) days written notice to the Contractor. In the event of termination, the Contractor shall be entitled to payment for services satisfactorily performed up to the effective date of termination.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 10;

  // SECTION 4: INSURANCE REQUIREMENTS
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 4: INSURANCE REQUIREMENTS', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition = addWrappedText('The Contractor shall maintain insurance coverage as required by the State and as specified in the solicitation documents. All insurance policies shall name the State of Minnesota as an additional insured.', margin, yPosition, contentWidth, 10);
  yPosition += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Insurance Certificate Holder:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(contractData.insurance_cert_holder, margin + 5, yPosition, contentWidth - 5);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('4.1 General Liability Insurance', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The Contractor shall maintain commercial general liability insurance with minimum limits of $2,000,000 per occurrence and $2,000,000 aggregate for bodily injury and property damage.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('4.2 Professional Liability Insurance', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('If applicable, the Contractor shall maintain professional liability insurance with minimum limits of $2,000,000 per claim and $2,000,000 aggregate.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('4.3 Workers Compensation Insurance', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The Contractor shall maintain workers compensation insurance as required by Minnesota law, covering all employees engaged in the performance of this contract.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 10;

  // SECTION 5: COMPLIANCE AND CERTIFICATIONS
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 5: COMPLIANCE AND CERTIFICATIONS', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('5.1 Data Practices Act Compliance', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The Contractor agrees to comply with the Minnesota Government Data Practices Act (Minnesota Statutes Chapter 13) and all other applicable state and federal laws regarding data privacy and security.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('5.2 Equal Opportunity', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The Contractor agrees to comply with all applicable federal and state laws and regulations regarding equal employment opportunity and non-discrimination, including the Minnesota Human Rights Act (Minnesota Statutes Chapter 363A).', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('5.3 Background Checks', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('If required by the solicitation or State policy, the Contractor shall ensure that all personnel performing services under this contract have successfully completed background checks as specified by the State.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('5.4 Conflict of Interest', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText('The Contractor certifies that no employee, board member, or agent of the Contractor has a conflict of interest, financial or otherwise, in the performance of this contract. The Contractor shall immediately notify the State of any potential conflicts of interest that may arise during the term of this contract.', margin + 5, yPosition, contentWidth - 5, 10);
  yPosition += 10;

  // SECTION 6: INTELLECTUAL PROPERTY
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 6: INTELLECTUAL PROPERTY', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition = addWrappedText('All work product, including but not limited to documents, reports, data, software, and other materials created or developed by the Contractor in the performance of this contract shall be the exclusive property of the State of Minnesota. The Contractor hereby assigns to the State all rights, title, and interest in such work product.', margin, yPosition, contentWidth, 10);
  yPosition += 12;

  // SECTION 7: AUTHORIZED REPRESENTATIVE
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 7: AUTHORIZED REPRESENTATIVE', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition = addWrappedText('The Contractor designates the following individual as the authorized representative with full authority to bind the Contractor and to act on behalf of the Contractor in all matters related to this Master Contract.', margin, yPosition, contentWidth, 10);
  yPosition += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Name:', margin, yPosition);
  doc.text('Title:', margin + 90, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(contractData.auth_rep_name, margin + 5, yPosition);
  doc.text(contractData.auth_rep_title, margin + 95, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Address:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(contractData.auth_rep_address, margin + 5, yPosition, contentWidth - 5);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Telephone:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(contractData.auth_rep_phone, margin + 5, yPosition);
  yPosition += 12;

  // SECTION 8: SIGNATURES
  yPosition = checkPageBreak(yPosition, 70);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('SECTION 8: CONTRACTOR SIGNATURE', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition = addWrappedText('By signing below, the undersigned certifies that they are authorized to bind the Contractor and that all information provided in this Master Contract submission is true, accurate, and complete to the best of their knowledge.', margin, yPosition, contentWidth, 10);
  yPosition += 12;

  // Signature box
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, contentWidth / 2 - 5, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Signature:', margin + 2, yPosition + 5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(12);
  doc.text(contractData.submitter_signature || '/s/ Electronic Signature', margin + 2, yPosition + 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(contractData.submission_date)}`, margin + 2, yPosition + 22);

  // Name and Title box
  doc.rect(margin + contentWidth / 2 + 5, yPosition, contentWidth / 2 - 5, 25);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Printed Name:', margin + contentWidth / 2 + 7, yPosition + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(contractData.submitter_name, margin + contentWidth / 2 + 7, yPosition + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Title:', margin + contentWidth / 2 + 7, yPosition + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(contractData.submitter_title, margin + contentWidth / 2 + 7, yPosition + 22);

  yPosition += 35;

  // FINAL CERTIFICATIONS
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  doc.text('CONTRACTOR CERTIFICATIONS', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const certifications = [
    'The Contractor certifies that it has read and understands all terms and conditions of this Master Contract.',
    'The Contractor certifies that it is in compliance with all applicable federal, state, and local laws and regulations.',
    'The Contractor certifies that it has the necessary resources, expertise, and qualifications to perform the services outlined in this contract.',
    'The Contractor certifies that all information provided in this submission is true and accurate.',
    'The Contractor agrees to maintain all required insurance coverage throughout the term of this contract.',
    'The Contractor agrees to comply with the Minnesota Government Data Practices Act and all other applicable data privacy laws.',
  ];

  certifications.forEach((cert, index) => {
    yPosition = checkPageBreak(yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}.`, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(cert, margin + 5, yPosition, contentWidth - 5, 10);
    yPosition += 6;
  });

  yPosition += 10;

  // Footer disclaimer
  yPosition = checkPageBreak(yPosition, 50);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 35, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 77, 46);
  yPosition += 5;
  doc.text('NOTICE TO CONTRACTOR', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  yPosition = addWrappedText('This Master Contract submission does not constitute a binding agreement until it has been reviewed, approved, and executed by an authorized representative of the State of Minnesota. The State reserves the right to reject any submission that does not meet the requirements specified in the solicitation documents.', margin + 2, yPosition, contentWidth - 4, 9);

  yPosition += 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Document Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}`, pageWidth / 2, yPosition, { align: 'center' });

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
