import { PDFDocument, PDFPage } from 'pdf-lib';
import type { FileWithPreview } from '@/types';
import { dataURLToUint8Array, isPDF, isImage } from './fileUtils';

interface PDFGenerationOptions {
  staticFiles: {
    logo: FileWithPreview | null;
    coupon: FileWithPreview | null;
  };
  dynamicFiles: {
    order: FileWithPreview | null;
    shipping: FileWithPreview | null;
  };
}

/**
 * Carica un'immagine in un PDF document
 */
const embedImage = async (
  pdfDoc: PDFDocument,
  imageData: string,
  type: 'jpeg' | 'png'
): Promise<{ image: any; width: number; height: number }> => {
  const imageBytes = dataURLToUint8Array(imageData);
  
  if (type === 'jpeg') {
    const image = await pdfDoc.embedJpg(imageBytes);
    return {
      image,
      width: image.width,
      height: image.height,
    };
  } else {
    const image = await pdfDoc.embedPng(imageBytes);
    return {
      image,
      width: image.width,
      height: image.height,
    };
  }
};

/**
 * Aggiunge un'immagine a una pagina PDF con dimensionamento
 * Mantiene l'aspect ratio e ridimensiona se necessario
 */
const addImageToPage = (
  page: PDFPage,
  imageData: { image: any; width: number; height: number },
  x: number,
  y: number,
  maxWidth?: number,
  maxHeight?: number
) => {
  let { width, height } = imageData;
  const aspectRatio = width / height;
  
  // Ridimensiona rispettando l'aspect ratio
  if (maxWidth && width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  page.drawImage(imageData.image, {
    x,
    y,
    width,
    height,
  });
  
  return { width, height };
};

/**
 * Genera il PDF combinato con tutti gli elementi
 */
export const generateCombinedPDF = async (
  options: PDFGenerationOptions
): Promise<Uint8Array> => {
  const { staticFiles, dynamicFiles } = options;

  // Validazione file necessari
  if (!dynamicFiles.order) {
    throw new Error('File ordine richiesto');
  }

  if (!isPDF(dynamicFiles.order.file)) {
    throw new Error('Il file ordine deve essere un PDF');
  }

  // Crea nuovo PDF document
  const pdfDoc = await PDFDocument.create();

  // Carica il PDF ordine come base
  const orderPdfBytes = dataURLToUint8Array(dynamicFiles.order.preview);
  const orderPdf = await PDFDocument.load(orderPdfBytes);
  
  // Copia le pagine dal PDF ordine (copyPages mantiene già tutto il contenuto)
  const orderPages = await pdfDoc.copyPages(orderPdf, orderPdf.getPageIndices());
  orderPages.forEach((page) => {
    pdfDoc.addPage(page);
  });

  // Se non ci sono pagine, crea una pagina vuota A4
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([595, 842]); // A4 verticale
  }

  // ===== PRIMA PAGINA: Ordine con Logo in cima =====
  const firstPage = pdfDoc.getPage(0);
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();

  // Logo in cima - per coprire logo eBay e testo ALM industry
  if (staticFiles.logo && isImage(staticFiles.logo.file)) {
    const imageType = staticFiles.logo.file.type.includes('png') ? 'png' : 'jpeg';
    const logoImageData = await embedImage(pdfDoc, staticFiles.logo.preview, imageType);
    
    // Calcola dimensioni mantenendo aspect ratio
    // Dimensioni ottimizzate per coprire il logo eBay senza essere troppo grande
    let logoWidth = Math.min(logoImageData.width, 245);
    let logoHeight = Math.min(logoImageData.height, 80);
    const logoRatio = logoImageData.width / logoImageData.height;
    
    if (logoWidth / logoRatio > logoHeight) {
      logoHeight = logoWidth / logoRatio;
      if (logoHeight > 80) {
        logoHeight = 80;
        logoWidth = logoHeight * logoRatio;
      }
    } else {
      logoWidth = logoHeight * logoRatio;
      if (logoWidth > 245) {
        logoWidth = 245;
        logoHeight = logoWidth / logoRatio;
      }
    }

    // Posizione in cima: in pdf-lib Y=0 è in basso, quindi Y alto = vicino a pageHeight
    // Margine superiore di circa 20pt, logo centrato orizzontalmente per coprire eBay
    const logoX = (pageWidth - logoWidth) / 2; // Centrato orizzontalmente
    const logoY = pageHeight - logoHeight - 20; // In alto con margine superiore

    addImageToPage(
      firstPage,
      logoImageData,
      logoX,
      logoY,
      logoWidth,
      logoHeight
    );
  }

  // ===== SECONDA PAGINA A4: Coupon (metà superiore) + Tagliandino (metà inferiore) =====
  const secondPage = pdfDoc.addPage([595, 842]); // A4 verticale
  const A4_WIDTH = 595;
  const A4_HEIGHT = 842;
  const MIDDLE_Y = A4_HEIGHT / 2; // 421pt - punto di divisione

  // Coupon nella metà superiore (Y: 421-842pt)
  if (staticFiles.coupon && isImage(staticFiles.coupon.file)) {
    const imageType = staticFiles.coupon.file.type.includes('png') ? 'png' : 'jpeg';
    const couponImageData = await embedImage(pdfDoc, staticFiles.coupon.preview, imageType);
    
    // Area disponibile: larghezza 495pt (con margini 50pt), altezza ~421pt
    const availableWidth = A4_WIDTH - 100; // 495pt
    const availableHeight = MIDDLE_Y - 20; // ~401pt (con margine top)
    
    // Calcola dimensioni mantenendo aspect ratio
    let couponWidth = couponImageData.width;
    let couponHeight = couponImageData.height;
    const couponRatio = couponWidth / couponHeight;
    
    // Adatta alla larghezza disponibile
    if (couponWidth > availableWidth) {
      couponWidth = availableWidth;
      couponHeight = couponWidth / couponRatio;
    }
    
    // Se dopo il ridimensionamento l'altezza è troppo grande, scala per l'altezza
    if (couponHeight > availableHeight) {
      couponHeight = availableHeight;
      couponWidth = couponHeight * couponRatio;
    }
    
    // Centra orizzontalmente e posiziona nella metà superiore
    const couponX = (A4_WIDTH - couponWidth) / 2;
    const couponY = MIDDLE_Y + (availableHeight - couponHeight) / 2; // Centrato verticalmente nella metà superiore
    
    addImageToPage(
      secondPage,
      couponImageData,
      couponX,
      couponY,
      couponWidth,
      couponHeight
    );
  }

  // Tagliandino spedizione nella metà inferiore (Y: 0-421pt)
  if (dynamicFiles.shipping) {
    if (isPDF(dynamicFiles.shipping.file)) {
      // Se è un PDF, copia la prima pagina e adattala alla metà inferiore
      const shippingPdfBytes = dataURLToUint8Array(dynamicFiles.shipping.preview);
      const shippingPdf = await PDFDocument.load(shippingPdfBytes);
      
      if (shippingPdf.getPageCount() > 0) {
        const shippingPage = shippingPdf.getPage(0);
        const { width: spWidth, height: spHeight } = shippingPage.getSize();
        
        // Copia la pagina
        const copiedPage = (await pdfDoc.copyPages(shippingPdf, [0]))[0];
        const embeddedPage = await pdfDoc.embedPage(copiedPage);
        
        // Calcola dimensioni ridotte per metà inferiore: margini maggiori per rendere più piccolo
        const availableWidth = A4_WIDTH - 180; // 415pt (margini più grandi)
        const bottomMargin = 40; // Margine inferiore
        const topMargin = 40; // Margine superiore per la metà inferiore
        const availableHeight = MIDDLE_Y - bottomMargin - topMargin; // ~341pt (area disponibile nella metà inferiore)
        
        // Calcola scale mantenendo aspect ratio
        const scaleWidth = availableWidth / spWidth;
        const scaleHeight = availableHeight / spHeight;
        const scale = Math.min(scaleWidth, scaleHeight) * 0.85; // Riduzione ulteriore del 15%
        
        const scaledWidth = spWidth * scale;
        const scaledHeight = spHeight * scale;
        
        // Centra orizzontalmente e posiziona nella metà inferiore (sotto MIDDLE_Y)
        const shippingX = (A4_WIDTH - scaledWidth) / 2;
        const shippingY = bottomMargin + (availableHeight - scaledHeight) / 2; // Centrato verticalmente nella metà inferiore
        
        secondPage.drawPage(embeddedPage, {
          x: shippingX,
          y: shippingY,
          xScale: scale,
          yScale: scale,
        });
      }
    } else if (isImage(dynamicFiles.shipping.file)) {
      // Se è un'immagine, aggiungi alla metà inferiore
      const imageType = dynamicFiles.shipping.file.type.includes('png') ? 'png' : 'jpeg';
      const shippingImageData = await embedImage(pdfDoc, dynamicFiles.shipping.preview, imageType);
      
      // Area disponibile ridotta: margini maggiori per rendere più piccolo
      const availableWidth = A4_WIDTH - 180; // 415pt (margini più grandi)
      const bottomMargin = 40; // Margine inferiore
      const topMargin = 40; // Margine superiore per la metà inferiore
      const availableHeight = MIDDLE_Y - bottomMargin - topMargin; // ~341pt (area disponibile nella metà inferiore)
      
      // Calcola dimensioni mantenendo aspect ratio
      let shippingWidth = shippingImageData.width;
      let shippingHeight = shippingImageData.height;
      const shippingRatio = shippingWidth / shippingHeight;
      
      // Adatta alla larghezza disponibile
      if (shippingWidth > availableWidth) {
        shippingWidth = availableWidth;
        shippingHeight = shippingWidth / shippingRatio;
      }
      
      // Se dopo il ridimensionamento l'altezza è troppo grande, scala per l'altezza
      if (shippingHeight > availableHeight) {
        shippingHeight = availableHeight;
        shippingWidth = shippingHeight * shippingRatio;
      }
      
      // Applica riduzione ulteriore del 15% per renderlo più piccolo
      shippingWidth *= 0.85;
      shippingHeight *= 0.85;
      
      // Centra orizzontalmente e posiziona nella metà inferiore (sotto MIDDLE_Y)
      const shippingX = (A4_WIDTH - shippingWidth) / 2;
      const shippingY = bottomMargin + (availableHeight - shippingHeight) / 2; // Centrato verticalmente nella metà inferiore
      
      addImageToPage(
        secondPage,
        shippingImageData,
        shippingX,
        shippingY,
        shippingWidth,
        shippingHeight
      );
    }
  }

  // Genera il PDF finale
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

/**
 * Scarica il PDF generato
 */
export const downloadPDF = (pdfBytes: Uint8Array, filename: string = 'documento-personalizzato.pdf'): void => {
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

