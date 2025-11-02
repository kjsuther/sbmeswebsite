import jsPDF from 'jspdf';

interface SliceEvaluationPackageData {
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
  deliveryContactName: string;
  deliveryContactEmail: string;
  deliveryContactPhone: string;
  firstSliceCost: string;
  monthlyTeamCost: string;
  resume1: File | null;
  resume2: File | null;
  resume3: File | null;
  selectedSliceData?: {
    slice_code?: string;
    slice_description?: string;
    customer_journey?: string;
    expected_result?: string;
    persona_definition?: string;
    slice_focus?: string;
    outcomes?: string;
    state_project_manager?: string;
  } | null;
}

const loadMNLogo = async (): Promise<string> => {
  try {
    const response = await fetch('/primary-logo-example_tcm1077-265307.jpg');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load MN logo:', error);
    return '';
  }
};

export const generateSliceEvaluationPackage = async (
  formData: SliceEvaluationPackageData
): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = 20;

  const logoDataUrl = await loadMNLogo();
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'JPEG', margin, yPosition, 40, 15);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  yPosition += 25;

  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10
  ): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * (fontSize * 0.4);
  };

  const checkPageBreak = (currentY: number, neededSpace: number = 30): number => {
    if (currentY + neededSpace > pageHeight - 20) {
      doc.addPage();
      return 20;
    }
    return currentY;
  };

  const addSectionHeader = (title: string, y: number): number => {
    doc.setFillColor(0, 56, 101);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, y + 7);
    doc.setTextColor(0, 0, 0);
    return y + 15;
  };

  const addFieldLabel = (label: string, y: number): number => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 56, 101);
    doc.text(label, margin, y);
    doc.setTextColor(0, 0, 0);
    return y + 5;
  };

  const addFieldValue = (value: string, y: number, maxWidth: number = contentWidth): number => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const result = addWrappedText(value || 'Not provided', margin, y, maxWidth);
    doc.setTextColor(0, 0, 0);
    return result + 3;
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 56, 101);
  doc.text('Slice RFP Response', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Evaluation Package', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, yPosition, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  yPosition = checkPageBreak(yPosition);
  yPosition = addSectionHeader('COMPANY INFORMATION', yPosition);

  yPosition = addFieldLabel('Company Name:', yPosition);
  yPosition = addFieldValue(formData.companyName, yPosition);
  yPosition += 2;

  yPosition = addFieldLabel('Primary Contact:', yPosition);
  yPosition = addFieldValue(formData.contactName, yPosition);
  yPosition += 2;

  yPosition = addFieldLabel('Contact Email:', yPosition);
  yPosition = addFieldValue(formData.contactEmail, yPosition);
  yPosition += 2;

  yPosition = addFieldLabel('Contact Phone:', yPosition);
  yPosition = addFieldValue(formData.contactPhone || 'Not provided', yPosition);
  yPosition += 8;

  yPosition = checkPageBreak(yPosition, 50);
  yPosition = addSectionHeader('SLICE FOCUS', yPosition);

  yPosition = addFieldLabel('Selected Slice:', yPosition);
  yPosition = addFieldValue(formData.sliceFocus, yPosition);
  yPosition += 2;

  if (formData.customSliceFocus && formData.sliceFocus === 'Custom/Other (specify below)') {
    yPosition = addFieldLabel('Custom Slice Description:', yPosition);
    yPosition = addFieldValue(formData.customSliceFocus, yPosition);
    yPosition += 2;
  }

  if (formData.selectedSliceData) {
    yPosition += 3;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 56, 101);
    doc.text('Slice Details:', margin, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;

    if (formData.selectedSliceData.customer_journey) {
      yPosition = checkPageBreak(yPosition, 30);
      yPosition = addFieldLabel('Customer Journey:', yPosition);
      yPosition = addFieldValue(formData.selectedSliceData.customer_journey, yPosition);
      yPosition += 2;
    }

    if (formData.selectedSliceData.expected_result) {
      yPosition = checkPageBreak(yPosition, 30);
      yPosition = addFieldLabel('Expected Result:', yPosition);
      yPosition = addFieldValue(formData.selectedSliceData.expected_result, yPosition);
      yPosition += 2;
    }

    if (formData.selectedSliceData.persona_definition) {
      yPosition = checkPageBreak(yPosition, 30);
      yPosition = addFieldLabel('Persona Definition:', yPosition);
      yPosition = addFieldValue(formData.selectedSliceData.persona_definition, yPosition);
      yPosition += 2;
    }

    if (formData.selectedSliceData.slice_focus) {
      yPosition = checkPageBreak(yPosition, 30);
      yPosition = addFieldLabel('Slice Focus Details:', yPosition);
      yPosition = addFieldValue(formData.selectedSliceData.slice_focus, yPosition);
      yPosition += 2;
    }

    if (formData.selectedSliceData.outcomes) {
      yPosition = checkPageBreak(yPosition, 30);
      yPosition = addFieldLabel('Outcomes:', yPosition);
      yPosition = addFieldValue(formData.selectedSliceData.outcomes, yPosition);
      yPosition += 2;
    }

    if (formData.selectedSliceData.state_project_manager) {
      yPosition = checkPageBreak(yPosition, 15);
      yPosition = addFieldLabel('State Project Manager:', yPosition);
      yPosition = addFieldValue(formData.selectedSliceData.state_project_manager, yPosition);
      yPosition += 2;
    }
  }

  yPosition += 8;

  yPosition = checkPageBreak(yPosition, 60);
  yPosition = addSectionHeader('PROPOSED SOLUTION', yPosition);

  yPosition = addFieldLabel('Cake Solution Overview:', yPosition);
  yPosition = addFieldValue(formData.cakeSolution, yPosition);
  yPosition += 4;

  yPosition = checkPageBreak(yPosition, 40);
  yPosition = addFieldLabel('Ingredients Needed:', yPosition);
  yPosition = addFieldValue(formData.ingredientsNeeded, yPosition);
  yPosition += 4;

  yPosition = checkPageBreak(yPosition, 40);
  yPosition = addFieldLabel('Dependencies and Support Required:', yPosition);
  yPosition = addFieldValue(formData.dependencies, yPosition);
  yPosition += 8;

  yPosition = checkPageBreak(yPosition, 60);
  yPosition = addSectionHeader('BAKER TEAM', yPosition);

  yPosition = addFieldLabel('Team Description:', yPosition);
  yPosition = addFieldValue(formData.teamDescription, yPosition);
  yPosition += 4;

  yPosition = checkPageBreak(yPosition, 30);
  yPosition = addFieldLabel('Submitted Resumes:', yPosition);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  const resumes = [];
  if (formData.resume1) resumes.push(`• ${formData.resume1.name}`);
  if (formData.resume2) resumes.push(`• ${formData.resume2.name}`);
  if (formData.resume3) resumes.push(`• ${formData.resume3.name}`);

  if (resumes.length > 0) {
    resumes.forEach((resume) => {
      doc.text(resume, margin, yPosition);
      yPosition += 5;
    });
  } else {
    doc.text('No resumes submitted', margin, yPosition);
    yPosition += 5;
  }

  doc.setTextColor(0, 0, 0);
  yPosition += 8;

  yPosition = checkPageBreak(yPosition, 50);
  yPosition = addSectionHeader('PRIMARY DELIVERY CONTACT', yPosition);

  yPosition = addFieldLabel('Contact Name:', yPosition);
  yPosition = addFieldValue(formData.deliveryContactName, yPosition);
  yPosition += 2;

  yPosition = addFieldLabel('Contact Email:', yPosition);
  yPosition = addFieldValue(formData.deliveryContactEmail, yPosition);
  yPosition += 2;

  yPosition = addFieldLabel('Contact Phone:', yPosition);
  yPosition = addFieldValue(formData.deliveryContactPhone, yPosition);
  yPosition += 8;

  yPosition = checkPageBreak(yPosition, 40);
  yPosition = addSectionHeader('COST INFORMATION', yPosition);

  yPosition = addFieldLabel('Cost of First Slice:', yPosition);
  yPosition = addFieldValue(
    `$${parseFloat(formData.firstSliceCost || '0').toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    yPosition
  );
  yPosition += 2;

  yPosition = addFieldLabel('Monthly Delivery Cost of Baker Team:', yPosition);
  yPosition = addFieldValue(
    `$${parseFloat(formData.monthlyTeamCost || '0').toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    yPosition
  );
  yPosition += 10;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'This evaluation package is generated for review purposes and contains the information submitted in the Slice RFP Response.',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center', maxWidth: contentWidth }
  );

  return doc.output('blob');
};
