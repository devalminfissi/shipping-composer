import { PDFDocument, PDFPage } from 'pdf-lib';
import type { FileWithPreview } from '@/types';
import { dataURLToUint8Array, isPDF, isImage } from './fileUtils';

interface PDFGenerationOptions {
  staticFiles: {
    logo: FileWithPreview | null;
    coupon: FileWithPreview | null;
    feedback: FileWithPreview | null;
    social: FileWithPreview | null;
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
  
  // Copia le pagine dal PDF ordine
  const orderPages = await pdfDoc.copyPages(orderPdf, orderPdf.getPageIndices());
  orderPages.forEach((page) => {
    pdfDoc.addPage(page);
  });

  // Se non ci sono pagine, crea una pagina vuota
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([595, 842]); // A4
  }

  // Prepara immagini statiche con layout migliorato basato sul modello
  const images: Array<{
    imageData: { image: any; width: number; height: number };
    type: 'logo' | 'coupon' | 'feedback' | 'social';
    maxWidth: number;
    maxHeight: number;
    position?: 'top-left' | 'top-center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  }> = [];

  // Logo (in alto, preferibilmente sinistra o centro)
  if (staticFiles.logo && isImage(staticFiles.logo.file)) {
    const imageType = staticFiles.logo.file.type.includes('png') ? 'png' : 'jpeg';
    const imageData = await embedImage(pdfDoc, staticFiles.logo.preview, imageType);
    images.push({
      imageData,
      type: 'logo',
      maxWidth: 200,  // Dimensioni aumentate per migliore visibilità
      maxHeight: 100,
      position: 'top-left',
    });
  }

  // Coupon (codice coupon/offerta)
  if (staticFiles.coupon && isImage(staticFiles.coupon.file)) {
    const imageType = staticFiles.coupon.file.type.includes('png') ? 'png' : 'jpeg';
    const imageData = await embedImage(pdfDoc, staticFiles.coupon.preview, imageType);
    images.push({
      imageData,
      type: 'coupon',
      maxWidth: 180,
      maxHeight: 120,
      position: 'bottom-left',
    });
  }

  // Feedback (grazie per il tuo ordine)
  if (staticFiles.feedback && isImage(staticFiles.feedback.file)) {
    const imageType = staticFiles.feedback.file.type.includes('png') ? 'png' : 'jpeg';
    const imageData = await embedImage(pdfDoc, staticFiles.feedback.preview, imageType);
    images.push({
      imageData,
      type: 'feedback',
      maxWidth: 180,
      maxHeight: 120,
      position: 'bottom-right',
    });
  }

  // Social (seguici sui social)
  if (staticFiles.social && isImage(staticFiles.social.file)) {
    const imageType = staticFiles.social.file.type.includes('png') ? 'png' : 'jpeg';
    const imageData = await embedImage(pdfDoc, staticFiles.social.preview, imageType);
    images.push({
      imageData,
      type: 'social',
      maxWidth: 180,
      maxHeight: 120,
      position: 'bottom-center',
    });
  }

  // Aggiungi immagini alle pagine con layout migliorato
  const firstPage = pdfDoc.getPage(0);
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();

  // Margini consistenti
  const marginTop = 30;
  const marginBottom = 30;
  const marginLeft = 40;
  const marginRight = 40;
  const spacingBottom = 15; // Spaziatura tra elementi in basso

  // Logo in alto a sinistra
  const logoImage = images.find((img) => img.type === 'logo');
  if (logoImage) {
    // Calcola dimensioni effettive per posizionamento accurato
    let logoWidth = logoImage.imageData.width;
    let logoHeight = logoImage.imageData.height;
    const logoRatio = logoWidth / logoHeight;
    
    if (logoWidth > logoImage.maxWidth) {
      logoWidth = logoImage.maxWidth;
      logoHeight = logoWidth / logoRatio;
    }
    if (logoHeight > logoImage.maxHeight) {
      logoHeight = logoImage.maxHeight;
      logoWidth = logoHeight * logoRatio;
    }

    addImageToPage(
      firstPage,
      logoImage.imageData,
      marginLeft,
      pageHeight - marginTop - logoHeight,
      logoImage.maxWidth,
      logoImage.maxHeight
    );
  }

  // Elementi in basso: calcola posizionamento orizzontale
  const bottomElements = images.filter(
    (img) => img.type !== 'logo' && img.position?.startsWith('bottom')
  );
  
  // Se ci sono elementi in basso, calcola la distribuzione orizzontale
  if (bottomElements.length > 0) {
    const bottomY = marginBottom;
    let currentX = marginLeft;

    // Coupon: sinistra
    const couponImage = bottomElements.find((img) => img.type === 'coupon');
    if (couponImage) {
      const { width: couponWidth } = addImageToPage(
        firstPage,
        couponImage.imageData,
        currentX,
        bottomY,
        couponImage.maxWidth,
        couponImage.maxHeight
      );
      currentX += couponWidth + spacingBottom;
    }

    // Social: centro (se presente, calcola dopo aver visto tutti gli elementi)
    const socialImage = bottomElements.find((img) => img.type === 'social');
    const feedbackImage = bottomElements.find((img) => img.type === 'feedback');
    
    // Calcola spazio disponibile per il centro
    let rightEdge = pageWidth - marginRight;
    if (feedbackImage) {
      // Stima dimensione feedback per posizionare il centro
      const estimatedFeedbackWidth = Math.min(
        feedbackImage.imageData.width,
        feedbackImage.maxWidth
      );
      rightEdge -= estimatedFeedbackWidth + spacingBottom;
    }
    
    if (socialImage) {
      // Calcola dimensione effettiva e posiziona al centro
      const { width: socialWidth } = addImageToPage(
        firstPage,
        socialImage.imageData,
        (pageWidth - Math.min(socialImage.imageData.width, socialImage.maxWidth)) / 2,
        bottomY,
        socialImage.maxWidth,
        socialImage.maxHeight
      );
    }

    // Feedback: destra
    if (feedbackImage) {
      const { width: feedbackWidth } = addImageToPage(
        firstPage,
        feedbackImage.imageData,
        pageWidth - marginRight - Math.min(feedbackImage.imageData.width, feedbackImage.maxWidth),
        bottomY,
        feedbackImage.maxWidth,
        feedbackImage.maxHeight
      );
    }
  }

  // Gestione tagliandino spedizione
  if (dynamicFiles.shipping) {
    if (isPDF(dynamicFiles.shipping.file)) {
      // Se è un PDF, copia le pagine
      const shippingPdfBytes = dataURLToUint8Array(dynamicFiles.shipping.preview);
      const shippingPdf = await PDFDocument.load(shippingPdfBytes);
      const shippingPages = await pdfDoc.copyPages(shippingPdf, shippingPdf.getPageIndices());
      shippingPages.forEach((page) => {
        pdfDoc.addPage(page);
      });
    } else if (isImage(dynamicFiles.shipping.file)) {
      // Se è un'immagine, aggiungi come nuova pagina
      const imageType = dynamicFiles.shipping.file.type.includes('png') ? 'png' : 'jpeg';
      const imageData = await embedImage(pdfDoc, dynamicFiles.shipping.preview, imageType);
      
      // Crea nuova pagina per il tagliandino
      const shippingPage = pdfDoc.addPage([imageData.width, imageData.height]);
      shippingPage.drawImage(imageData.image, {
        x: 0,
        y: 0,
        width: imageData.width,
        height: imageData.height,
      });
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

