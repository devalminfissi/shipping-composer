import type { FileWithPreview } from '@/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_PDF_TYPE = 'application/pdf';

export const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE];

/**
 * Valida il tipo di file
 */
export const validateFileType = (file: File): boolean => {
  return ALLOWED_TYPES.includes(file.type);
};

/**
 * Valida la dimensione del file
 */
export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

/**
 * Valida un file (tipo e dimensione)
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!validateFileType(file)) {
    return {
      valid: false,
      error: `Formato file non supportato. Usa JPG, PNG o PDF.`,
    };
  }

  if (!validateFileSize(file)) {
    return {
      valid: false,
      error: `File troppo grande. Dimensione massima: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
};

/**
 * Crea un FileWithPreview da un File
 */
export const createFileWithPreview = async (
  file: File
): Promise<FileWithPreview> => {
  const preview = await fileToDataURL(file);
  
  return {
    file,
    preview,
    dataUrl: preview,
  };
};

/**
 * Converte un File in Data URL (base64)
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Errore nella lettura del file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Converte Data URL in Uint8Array (per pdf-lib)
 */
export const dataURLToUint8Array = (dataURL: string): Uint8Array => {
  const base64 = dataURL.split(',')[1] || dataURL;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

/**
 * Verifica se un file è un'immagine
 */
export const isImage = (file: File): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
};

/**
 * Verifica se un file è un PDF
 */
export const isPDF = (file: File): boolean => {
  return file.type === ALLOWED_PDF_TYPE;
};

/**
 * Formatta la dimensione del file in formato leggibile
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

