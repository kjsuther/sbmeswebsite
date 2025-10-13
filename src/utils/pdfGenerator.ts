import jsPDF from 'jspdf';

interface SliceRFPFormData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  sliceFocus: string;
  customSliceFocus: string;
  cakeSolution: string;
  ingredientsNeeded: string;
  dependencies: string;
  teamDescription: string;
  resume1: File | null;
  resume2: File | null;
  resume3: File | null;
  firstSliceCost: string;
  cakeBatterScaleCost: string;
  monthlyTeamCost: string;
}

export const generateSliceRFPPDF = (formData: SliceRFPFormData) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.35)); // Approximate line height
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (currentY: number, neededSpace: number = 30): number => {
    if (currentY + neededSpace > doc.internal.pageSize.height - 20) {
      doc.addPage();
      return 20;
    }
    return currentY;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MES Modernization Slice RFP Response', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // SECTION 1: EVALUATION INFORMATION
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EVALUATION INFORMATION', margin, yPosition);
  yPosition += 15;

  // Company Information
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Information', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Company Name:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.companyName || 'Not provided', margin + 35, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Contact Name:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.contactName || 'Not provided', margin + 35, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Contact Email:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.contactEmail || 'Not provided', margin + 35, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Contact Phone:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.contactPhone || 'Not provided', margin + 35, yPosition);
  yPosition += 15;

  // Slice Focus
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Slice Focus', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Selected Slice:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(formData.sliceFocus || 'Not provided', margin, yPosition, contentWidth);
  yPosition += 5;

  // Custom slice focus if applicable
  if (formData.sliceFocus === 'Custom/Other (specify below)' && formData.customSliceFocus) {
    doc.setFont('helvetica', 'bold');
    doc.text('Custom Slice Description:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(formData.customSliceFocus, margin, yPosition, contentWidth);
    yPosition += 5;
  }
  yPosition += 10;

  // Cake Solution
  yPosition = checkPageBreak(yPosition, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cake Solution Proposal', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Solution Overview:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(formData.cakeSolution || 'Not provided', margin, yPosition, contentWidth);
  yPosition += 10;

  yPosition = checkPageBreak(yPosition, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Ingredients Needed:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(formData.ingredientsNeeded || 'Not provided', margin, yPosition, contentWidth);
  yPosition += 10;

  yPosition = checkPageBreak(yPosition, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Dependencies and Support Required:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(formData.dependencies || 'Not provided', margin, yPosition, contentWidth);
  yPosition += 15;

  // Baker Team
  yPosition = checkPageBreak(yPosition, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Baker Team Details', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Team Description:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(formData.teamDescription || 'Not provided', margin, yPosition, contentWidth);
  yPosition += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Submitted Resumes:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');

  if (formData.resume1) {
    doc.text(`• Resume 1: ${formData.resume1.name}`, margin, yPosition);
    yPosition += 6;
  }
  if (formData.resume2) {
    doc.text(`• Resume 2: ${formData.resume2.name}`, margin, yPosition);
    yPosition += 6;
  }
  if (formData.resume3) {
    doc.text(`• Resume 3: ${formData.resume3.name}`, margin, yPosition);
    yPosition += 6;
  }
  if (!formData.resume1 && !formData.resume2 && !formData.resume3) {
    doc.text('No resumes submitted', margin, yPosition);
    yPosition += 6;
  }
  
  if (formData.resume1 || formData.resume2 || formData.resume3) {
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Note: Resume files are attached separately and not embedded in this PDF.', margin, yPosition);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
  }
  yPosition += 10;

  // Cost Information
  yPosition = checkPageBreak(yPosition);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Breakdown', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost of First Slice:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${formData.firstSliceCost || '0'}`, margin + 50, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Estimated Cost at Scale:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${formData.cakeBatterScaleCost || '0'}`, margin + 60, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Team Cost:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${formData.monthlyTeamCost || '0'}`, margin + 50, yPosition);
  yPosition += 20;

  // SECTION 2: CONTRACT PLACEHOLDER
  yPosition = checkPageBreak(yPosition, 50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL CONTRACT', margin, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text('[Contract terms and conditions will be generated here]', margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.text('This section will include:', margin, yPosition);
  yPosition += 8;
  doc.text('• Contract terms and conditions', margin + 5, yPosition);
  yPosition += 6;
  doc.text('• Payment schedules', margin + 5, yPosition);
  yPosition += 6;
  doc.text('• Deliverable requirements', margin + 5, yPosition);
  yPosition += 6;
  doc.text('• Performance metrics', margin + 5, yPosition);
  yPosition += 6;
  doc.text('• Legal obligations', margin + 5, yPosition);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Slice_RFP_Response_${formData.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown'}_${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);
};