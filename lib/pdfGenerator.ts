import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Generate and download a PDF of any element by ID (e.g. printable report)
 */
export async function generatePdfFromElement(
  elementId: string,
  fileName: string = "yatra-financial-report.pdf"
): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found`);
      return false;
    }

    // Capture the element as high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina)
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins on left/right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // Top margin

    // First page
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    // Multi-page handling if report is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error("Error generating PDF:", err);
    return false;
  }
}
