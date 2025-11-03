import type { StaticFileType, FileWithPreview } from '@/types';

const STORAGE_PREFIX = 'static_files_';
const MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Chiavi localStorage per ogni tipo di file statico
const getStorageKey = (type: StaticFileType): string => {
  return `${STORAGE_PREFIX}${type}`;
};

/**
 * Converte un File in base64 string per il salvataggio
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Converte base64 string in File object
 */
export const base64ToFile = (
  base64: string,
  filename: string,
  mimeType: string
): File => {
  const arr = base64.split(',');
  const bstr = atob(arr[1] || arr[0]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
};

/**
 * Salva un file statico in localStorage
 */
export const saveStaticFile = async (
  type: StaticFileType,
  file: FileWithPreview
): Promise<void> => {
  try {
    const dataUrl = file.dataUrl || file.preview;
    if (!dataUrl) {
      throw new Error('File data non disponibile');
    }

    // Prepara i dati per il salvataggio
    const dataToSave = {
      filename: file.file.name,
      mimeType: file.file.type,
      dataUrl: dataUrl,
      size: file.file.size,
    };

    const key = getStorageKey(type);
    const jsonString = JSON.stringify(dataToSave);

    // Verifica dimensione prima di salvare
    const currentSize = localStorage.getItem(key)?.length || 0;
    const newSize = jsonString.length;

    // Stima spazio disponibile (approssimativo)
    const estimatedStorage = estimateLocalStorageSize();
    if (estimatedStorage + newSize - currentSize > MAX_STORAGE_SIZE) {
      throw new Error('Spazio localStorage insufficiente');
    }

    localStorage.setItem(key, jsonString);
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      throw new Error('Quota localStorage esaurita. Rimuovi altri dati o usa un browser diverso.');
    }
    throw error;
  }
};

/**
 * Carica un file statico da localStorage
 */
export const loadStaticFile = (type: StaticFileType): FileWithPreview | null => {
  try {
    const key = getStorageKey(type);
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);
    const file = base64ToFile(data.dataUrl, data.filename, data.mimeType);

    // Crea FileWithPreview
    const fileWithPreview: FileWithPreview = {
      file: file,
      preview: data.dataUrl,
      dataUrl: data.dataUrl,
    };

    return fileWithPreview;
  } catch (error) {
    console.error(`Errore nel caricamento file ${type}:`, error);
    return null;
  }
};

/**
 * Rimuove un file statico da localStorage
 */
export const removeStaticFile = (type: StaticFileType): void => {
  const key = getStorageKey(type);
  localStorage.removeItem(key);
};

/**
 * Verifica se un file statico è salvato
 */
export const hasStaticFile = (type: StaticFileType): boolean => {
  const key = getStorageKey(type);
  return localStorage.getItem(key) !== null;
};

/**
 * Carica tutti i file statici salvati
 */
export const loadAllStaticFiles = (): Record<StaticFileType, FileWithPreview | null> => {
  return {
    logo: loadStaticFile('logo'),
    coupon: loadStaticFile('coupon'),
  };
};

/**
 * Stima la dimensione totale utilizzata da localStorage
 */
const estimateLocalStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

/**
 * Verifica se il setup è completo (tutti i 2 file statici presenti: logo e coupon)
 */
export const isSetupComplete = (): boolean => {
  return (
    hasStaticFile('logo') &&
    hasStaticFile('coupon')
  );
};

/**
 * Pulisce i vecchi file statici (feedback e social) dal localStorage
 * Utile per la migrazione dopo la rimozione di questi file
 */
export const cleanupOldStaticFiles = (): void => {
  if (typeof window === 'undefined') return; // Server-side check
  
  const oldKeys = ['feedback', 'social'];
  oldKeys.forEach((key) => {
    // Usa direttamente il prefisso + key invece di getStorageKey per evitare errori di tipo
    const storageKey = `${STORAGE_PREFIX}${key}`;
    if (localStorage.getItem(storageKey) !== null) {
      localStorage.removeItem(storageKey);
      console.log(`Rimosso vecchio file statico: ${key}`);
    }
  });
};

