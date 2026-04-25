import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PdfExporterOptions {
  elementId: string;
  filename: string;
  onProgress?: (progress: number) => void;
}

export async function exportToPDF({ elementId, filename, onProgress }: PdfExporterOptions) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Preview element not found');

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.top = '-9999px';
  clone.style.left = '-9999px';
  clone.style.width = '210mm';
  document.body.appendChild(clone);

  await document.fonts.ready;

  onProgress?.(30);
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: clone.scrollWidth,
    windowHeight: clone.scrollHeight,
  });

  document.body.removeChild(clone);
  onProgress?.(70);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const scaledWidth = imgWidth * ratio;
  const scaledHeight = imgHeight * ratio;

  let heightLeft = scaledHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, scaledWidth, scaledHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - scaledHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, scaledWidth, scaledHeight);
    heightLeft -= pdfHeight;
  }

  onProgress?.(100);
  pdf.save(`${filename}.pdf`);
}
