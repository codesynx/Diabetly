import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ResultLevel = 'low' | 'medium' | 'high';

interface AnalysisResultData {
  riskLevel: ResultLevel;
  riskScore: number;
  confidence: number;
  findings: string[];
  recommendations: Record<string, string>;
  nextCheckupRecommendation: string;
}

/**
 * Generates a PDF report from the analysis results
 * @param resultData Analysis result data
 * @param imageData Base64 encoded image data
 * @returns Promise that resolves when PDF is generated and downloaded
 */
export const generatePDF = async (
  resultData: AnalysisResultData,
  imageData: string | null
): Promise<void> => {
  // Create a new PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Register Montserrat fonts
  try {
    // Load the fonts
    const regularFontResponse = await fetch('/Montserrat-Regular.ttf');
    const boldFontResponse = await fetch('/Montserrat-Bold.ttf');
    
    const regularFont = await regularFontResponse.arrayBuffer();
    const boldFont = await boldFontResponse.arrayBuffer();
    
    // Add fonts to PDF
    pdf.addFileToVFS('Montserrat-Regular.ttf', arrayBufferToBase64(regularFont));
    pdf.addFileToVFS('Montserrat-Bold.ttf', arrayBufferToBase64(boldFont));
    
    pdf.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
    pdf.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold');
    
    console.log("Montserrat fonts loaded successfully");
  } catch (error) {
    console.error("Error loading fonts:", error);
    // Fallback to default fonts if Montserrat fails to load
  }

  // Set up PDF document
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Add header with logo
  pdf.setFillColor(25, 113, 194); // diabetly-blue
  pdf.rect(0, 0, pageWidth, 30, 'F');
  
  try {
    // Add logo to the header
    const logoPath = '/lovable-uploads/207f26bc-b839-4183-8783-e4e577d8f978.png';
    const logoWidth = 25;
    const logoHeight = 25;
    const logoX = margin;
    const logoY = 2.5;
    
    pdf.addImage(logoPath, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    // Continue without logo if it fails
  }
  
  pdf.setFont('Montserrat', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text('DIABETLY', pageWidth / 2, 17, { align: 'center' });

  // Add date
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });
  pdf.setFontSize(10);
  pdf.setFont('Montserrat', 'normal');
  pdf.text(`Дата анализа: ${currentDate}`, pageWidth - margin, 35, { align: 'right' });

  // Add title
  yPos = 40;
  pdf.setFont('Montserrat', 'bold');
  pdf.setTextColor(25, 113, 194);
  pdf.setFontSize(16);
  pdf.text('РЕЗУЛЬТАТЫ АНАЛИЗА СЕТЧАТКИ ГЛАЗА', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Add image if available
  if (imageData) {
    try {
      // Set maximum dimensions
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = 80;
      
      // Create a hidden image element to get the true dimensions
      const img = document.createElement('img');
      img.style.visibility = 'hidden';
      img.style.position = 'fixed';
      img.style.left = '-9999px';
      
      // Create a promise to get image dimensions
      const getImageDimensions = new Promise<{width: number, height: number}>((resolve) => {
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          let width, height;
          
          if (aspectRatio > 1) {
            // Landscape or square image
            width = Math.min(maxWidth, img.naturalWidth);
            height = width / aspectRatio;
            
            // Ensure height isn't too large
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          } else {
            // Portrait image
            height = Math.min(maxHeight, img.naturalHeight);
            width = height * aspectRatio;
          }
          
          resolve({ width, height });
          
          // Clean up
          document.body.removeChild(img);
        };
        
        document.body.appendChild(img);
        img.src = imageData;
      });
      
      // Wait for dimensions and add image to PDF
      const dimensions = await getImageDimensions;
      const xPos = margin + (maxWidth - dimensions.width) / 2;
      
      pdf.addImage(
        imageData, 
        'JPEG', 
        xPos, 
        yPos, 
        dimensions.width, 
        dimensions.height, 
        undefined, 
        'FAST'
      );
      
      yPos += dimensions.height + 10;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      
      // Simple fallback that preserves aspect ratio
      try {
        // Add image with original dimensions and let jsPDF scale it
        pdf.addImage(
          imageData, 
          'JPEG', 
          margin, 
          yPos, 
          pageWidth - (margin * 2), 
          undefined, 
          undefined, 
          'NONE'
        );
        
        // Estimate a reasonable height based on typical aspect ratios
        yPos += 60;
      } catch (innerError) {
        console.error('Fallback image method also failed:', innerError);
      }
    }
  }

  // Add risk level information
  let riskLevelText = '';
  let riskLevelColor: [number, number, number] = [0, 0, 0];
  
  switch(resultData.riskLevel) {
    case 'low':
      riskLevelText = 'Низкая вероятность';
      riskLevelColor = [39, 174, 96]; // green
      break;
    case 'medium':
      riskLevelText = 'Средняя вероятность';
      riskLevelColor = [243, 156, 18]; // yellow/orange
      break;
    case 'high':
      riskLevelText = 'Высокая вероятность';
      riskLevelColor = [231, 76, 60]; // red
      break;
  }

  pdf.setFillColor(riskLevelColor[0], riskLevelColor[1], riskLevelColor[2]);
  pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 20, 2, 2, 'F');
  pdf.setFont('Montserrat', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(`Диабетическая ретинопатия: ${riskLevelText} (${resultData.riskScore * 10}%)`, pageWidth / 2, yPos + 12, { align: 'center' });
  yPos += 30;

  // Add findings section
  pdf.setFont('Montserrat', 'bold');
  pdf.setTextColor(25, 113, 194);
  pdf.setFontSize(14);
  pdf.text('Выявленные признаки:', margin, yPos);
  yPos += 10;

  // Add findings
  pdf.setFont('Montserrat', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(12);
  
  resultData.findings.forEach((finding) => {
    // Check if text will overflow to next page
    if (yPos + 15 > pageHeight - margin) {
      pdf.addPage();
      yPos = margin + 15;
    }
    
    // Add bullet point
    pdf.circle(margin + 2, yPos - 2, 1, 'F');
    
    // Add wrapped text
    const lines = pdf.splitTextToSize(finding, pageWidth - (margin * 2) - 10);
    pdf.text(lines, margin + 7, yPos);
    yPos += 7 * lines.length;
  });
  
  yPos += 10;

  // Add recommendations section
  if (yPos + 20 > pageHeight - margin) {
    pdf.addPage();
    yPos = margin + 15;
  }
  
  pdf.setFont('Montserrat', 'bold');
  pdf.setTextColor(25, 113, 194);
  pdf.setFontSize(14);
  pdf.text('Рекомендации:', margin, yPos);
  yPos += 10;

  // Add recommendations
  pdf.setFont('Montserrat', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(12);
  
  Object.entries(resultData.recommendations).forEach(([key, value]) => {
    // Check if text will overflow to next page
    if (yPos + 15 > pageHeight - margin) {
      pdf.addPage();
      yPos = margin + 15;
    }
    
    pdf.setFont('Montserrat', 'bold');
    pdf.text(`• ${key}:`, margin, yPos);
    pdf.setFont('Montserrat', 'normal');
    
    const lines = pdf.splitTextToSize(value, pageWidth - (margin * 2) - 10);
    pdf.text(lines, margin + 7, yPos + 7);
    yPos += 7 * (lines.length + 1) + 3;
  });

  // Add next checkup recommendation
  if (yPos + 25 > pageHeight - margin) {
    pdf.addPage();
    yPos = margin + 15;
  }
  
  yPos += 5;
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, pageWidth - (margin * 2), 20, 'F');
  pdf.setFont('Montserrat', 'bold');
  pdf.setTextColor(25, 113, 194);
  pdf.setFontSize(12);
  pdf.text('Следующий осмотр:', margin + 5, yPos + 10);
  pdf.setFont('Montserrat', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text(resultData.nextCheckupRecommendation, margin + 50, yPos + 10);

  // Add footer with disclaimer
  pdf.setFont('Montserrat', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(8);
  
  const disclaimer = 'Отказ от ответственности: Результаты анализа не являются медицинским диагнозом и не могут заменить консультацию специалиста. При любых подозрениях на заболевание рекомендуется обратиться к офтальмологу для детального обследования.';
  const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - (margin * 2));
  
  pdf.text(disclaimerLines, pageWidth / 2, pageHeight - margin - 5, { align: 'center' });

  // Add confidentiality information
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(8);
  pdf.text('© Diabetly | Конфиденциальный медицинский документ', pageWidth / 2, pageHeight - 4, { align: 'center' });

  // Save PDF
  pdf.save(`Diabetly_Анализ_${currentDate.replace(/\s/g, '_')}.pdf`);
};

/**
 * Convert ArrayBuffer to Base64 string
 * @param buffer ArrayBuffer to convert
 * @returns Base64 string representation of the buffer
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
} 