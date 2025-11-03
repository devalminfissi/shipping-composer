export type StaticFileType = 'logo' | 'coupon' | 'feedback' | 'social';

export interface FileWithPreview {
  file: File;
  preview: string;
  dataUrl?: string; // base64 per localStorage
}

export interface StaticFile {
  type: StaticFileType;
  file: FileWithPreview | null;
}

export interface DynamicFile {
  type: 'order' | 'shipping';
  file: FileWithPreview | null;
}

export interface AppState {
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
  setupComplete: boolean;
}

export interface AppContextType {
  state: AppState;
  setStaticFile: (type: StaticFileType, file: FileWithPreview | null) => void;
  setDynamicFile: (type: 'order' | 'shipping', file: FileWithPreview | null) => void;
  clearDynamicFiles: () => void;
  checkSetupComplete: () => boolean;
  initializeFromStorage: () => void;
}

