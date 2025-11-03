'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppContextType, AppState, FileWithPreview, StaticFileType } from '@/types';
import { loadPublicFile } from '@/lib/fileUtils';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    staticFiles: {
      logo: null,
      coupon: null,
    },
    dynamicFiles: {
      order: null,
      shipping: null,
    },
    setupComplete: false,
  });

  // Carica i file statici dalla cartella public al mount
  useEffect(() => {
    initializeFromPublic();
  }, []);

  // Aggiorna setupComplete quando cambiano i file statici
  useEffect(() => {
    const complete = checkSetupComplete();
    setState((prev) => ({ ...prev, setupComplete: complete }));
  }, [state.staticFiles]);

  const initializeFromPublic = useCallback(async () => {
    try {
      // Carica i file dalla cartella public
      // Prova vari nomi comuni per il logo
      const logoFiles = ['ALM-Infissi-logo.jpg', 'logo.jpg', 'logo.png', 'Logo.jpg', 'Logo.png'];
      let logo: FileWithPreview | null = null;
      
      for (const filename of logoFiles) {
        logo = await loadPublicFile(filename);
        if (logo) {
          console.log(`Logo caricato: ${filename}`);
          break;
        }
      }
      
      if (!logo) {
        console.warn('Logo non trovato nella cartella public. Assicurati che esista logo.jpg o logo.png');
      }
      
      // Carica il coupon
      const coupon = await loadPublicFile('Coupon.jpg');
      if (!coupon) {
        console.warn('Coupon.jpg non trovato nella cartella public');
      }
      
      const staticFiles = {
        logo,
        coupon,
      };
      
      const setupComplete = logo !== null && coupon !== null;
      
      setState({
        staticFiles,
        dynamicFiles: {
          order: null,
          shipping: null,
        },
        setupComplete,
      });
    } catch (error) {
      console.error('Errore nell\'inizializzazione dai file public:', error);
    }
  }, []);

  const setStaticFile = useCallback(
    (type: StaticFileType, file: FileWithPreview | null) => {
      setState((prev) => ({
        ...prev,
        staticFiles: {
          ...prev.staticFiles,
          [type]: file,
        },
      }));
    },
    []
  );

  const setDynamicFile = useCallback(
    (type: 'order' | 'shipping', file: FileWithPreview | null) => {
      setState((prev) => ({
        ...prev,
        dynamicFiles: {
          ...prev.dynamicFiles,
          [type]: file,
        },
      }));
    },
    []
  );

  const clearDynamicFiles = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dynamicFiles: {
        order: null,
        shipping: null,
      },
    }));
  }, []);

  const checkSetupComplete = useCallback((): boolean => {
    return (
      state.staticFiles.logo !== null &&
      state.staticFiles.coupon !== null
    );
  }, [state.staticFiles]);

  const value: AppContextType = {
    state,
    setStaticFile,
    setDynamicFile,
    clearDynamicFiles,
    checkSetupComplete,
    initializeFromStorage: initializeFromPublic,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

