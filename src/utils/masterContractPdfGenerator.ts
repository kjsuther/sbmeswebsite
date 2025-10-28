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

export const generateMasterContractPDF = async (contractData: MasterContractData, contractId: string): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 50;
  const lineHeight = 13;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const addPageHeader = async (pageNum: number) => {
    const logoData = await loadMNLogo();
    if (logoData) {
      try {
        doc.addImage(logoData, 'JPEG', margin - 10, 30, 70, 40);
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const titleX = pageWidth - margin;
    doc.text('State of Minnesota', titleX, 45, { align: 'right' });

    doc.setFontSize(16);
    doc.text('Professional and Technical', titleX, 65, { align: 'right' });
    doc.text('Services Master Contract', titleX, 82, { align: 'right' });

    if (pageNum === 1) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SWIFT Contract Number: _______________', titleX, 110, { align: 'right' });
      doc.text('Master Contract T-Number: _______________', titleX, 125, { align: 'right' });
    }
  };

  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Rev. 07.01.2024', margin, pageHeight - 20);
    doc.text(`Page ${pageNum} of 25`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  };

  await addPageHeader(1);

  let yPos = 150;

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.setTextColor(0, 0, 0);

  const line1 = 'This Master Contract is between the State of Minnesota, acting through its Commissioner of the Department of';
  doc.text(line1, margin, yPos, { maxWidth: pageWidth - 2 * margin });
  yPos += lineHeight;

  const line2Start = 'Human Services ("State") and ';
  doc.text(line2Start, margin, yPos);
  const line2StartWidth = doc.getTextWidth(line2Start);

  doc.setTextColor(220, 38, 38);
  doc.text(`[${contractData.vendor_name}]`, margin + line2StartWidth, yPos);
  const contractorWidth = doc.getTextWidth(`[${contractData.vendor_name}]`);

  doc.setTextColor(0, 0, 0);
  const line2End = ' whose designated business address is ';
  doc.text(line2End, margin + line2StartWidth + contractorWidth, yPos);
  yPos += lineHeight;

  doc.setTextColor(220, 38, 38);
  doc.text(`[${contractData.vendor_address}]`, margin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += lineHeight;

  const line3 = '("Contractor"). State and Contractor may be referred to jointly as "Parties."';
  doc.text(line3, margin, yPos, { maxWidth: pageWidth - 2 * margin });

  yPos += 25;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recitals', margin, yPos);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

  yPos += 20;

  doc.setFontSize(10);
  doc.setFont('times', 'normal');

  const rec1Start = '1.     State issued a solicitation identified as ';
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
  yPos += lineHeight;
  doc.text('       participation in the Great MES Modernization Bake-Off ("Solicitation");', margin, yPos);

  yPos += 20;

  doc.text('2.     Contractor provided a response to the Solicitation indicating its interest in and ability to provide the goods', margin, yPos);
  yPos += lineHeight;
  doc.text('       or services requested in the Solicitation; and', margin, yPos);

  yPos += 20;

  doc.text('3.     ', margin, yPos);
  const rec3Width = doc.getTextWidth('3.     ');

  doc.setFont('times', 'underline');
  const subText = 'Subsequent';
  doc.text(subText, margin + rec3Width, yPos);
  const subWidth = doc.getTextWidth(subText);

  doc.setFont('times', 'normal');
  doc.text(' to an evaluation in accordance with the terms of the Solicitation and negotiation, the Parties', margin + rec3Width + subWidth, yPos);
  yPos += lineHeight;
  doc.text('       desire to enter into a contract.', margin, yPos);

  yPos += 20;

  doc.text('Accordingly, the Parties agree as follows:', margin, yPos);

  yPos += 25;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Contract', margin, yPos);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

  yPos += 20;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1.     Term of Contract', margin, yPos);
  yPos += 18;

  doc.setFont('times', 'normal');
  const effectiveLine = `         1.1  Effective date. `;
  doc.text(effectiveLine, margin, yPos);
  const effectiveWidth = doc.getTextWidth(effectiveLine);
  doc.setTextColor(220, 38, 38);
  doc.text(`[${formatDate(contractData.effective_date)}]`, margin + effectiveWidth, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(', or the date the State obtains all required signatures under Minn. Stat.', margin + effectiveWidth + doc.getTextWidth(`[${formatDate(contractData.effective_date)}]`) + 4, yPos);
  yPos += lineHeight;
  doc.text('               § 16C.05, subd. 2, whichever is later. The Contractor must not accept work under this Master Contract', margin, yPos);
  yPos += lineHeight;
  doc.text('               until this Master Contract is fully executed and the Contractor has been notified by the State\'s', margin, yPos);
  yPos += lineHeight;
  doc.text('               Authorized Representative that it may begin accepting Work Order Contracts.', margin, yPos);

  yPos += 18;

  doc.text('         1.2  Work Order Contracts. The term of work under Work Order contracts issued under this Master', margin, yPos);
  yPos += lineHeight;
  doc.text('               Contract may not extend beyond the expiration date of this Master Contract.', margin, yPos);

  yPos += 18;

  doc.text('         1.3  Expiration date. September 30, 2030, or until all obligations have been satisfactorily fulfilled,', margin, yPos);
  yPos += lineHeight;
  doc.text('               whichever occurs first. The contract may be extended for up to an additional 2 years in increments as', margin, yPos);
  yPos += lineHeight;
  doc.text('               determined by the State, through a duly executed amendment.', margin, yPos);

  yPos += 20;

  doc.setFont('helvetica', 'bold');
  doc.text('2.     Contractor\'s Duties', margin, yPos);
  yPos += 15;

  doc.setFont('times', 'normal');
  doc.text('The Contractor shall perform all duties described in this Master Contract to the satisfaction of the State.', margin, yPos);
  yPos += 18;

  doc.text('The Contractor, who is not a State employee, may be requested to perform any of the following services under', margin, yPos);
  yPos += lineHeight;
  doc.text('individual Work Order Contracts:', margin, yPos);

  addFooter(1);

  return doc.output('blob');
};

export const downloadMasterContractPDF = async (contractData: MasterContractData, contractId: string): Promise<void> => {
  const blob = await generateMasterContractPDF(contractData, contractId);

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
