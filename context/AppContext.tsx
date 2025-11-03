'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppContextType, AppState, FileWithPreview, StaticFileType } from '@/types';
import { loadAllStaticFiles, isSetupComplete as checkStorageSetup } from '@/lib/storageUtils';
import { saveStaticFile } from '@/lib/storageUtils';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    staticFiles: {
      logo: null,
      coupon: null,
      feedback: null,
      social: null,
    },
    dynamicFiles: {
      order: null,
      shipping: null,
    },
    setupComplete: false,
  });

  // Inizializza dallo storage al mount
  useEffect(() => {
    initializeFromStorage();
  }, []);

  // Aggiorna setupComplete quando cambiano i file statici
  useEffect(() => {
    const complete = checkSetupComplete();
    setState((prev) => ({ ...prev, setupComplete: complete }));
  }, [state.staticFiles]);

  const initializeFromStorage = useCallback(() => {
    try {
      const staticFiles = loadAllStaticFiles();
      const setupComplete = checkStorageSetup();
      
      setState({
        staticFiles,
        dynamicFiles: {
          order: null,
          shipping: null,
        },
        setupComplete,
      });
    } catch (error) {
      console.error('Errore nell\'inizializzazione dallo storage:', error);
    }
  }, []);

  const setStaticFile = useCallback(
    async (type: StaticFileType, file: FileWithPreview | null) => {
      setState((prev) => ({
        ...prev,
        staticFiles: {
          ...prev.staticFiles,
          [type]: file,
        },
      }));

      // Salva in localStorage se il file è presente
      if (file) {
        try {
          await saveStaticFile(type, file);
        } catch (error) {
          console.error(`Errore nel salvataggio file ${type}:`, error);
          throw error;
        }
      }
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
      state.staticFiles.coupon !== null &&
      state.staticFiles.feedback !== null &&
      state.staticFiles.social !== null
    );
  }, [state.staticFiles]);

  const value: AppContextType = {
    state,
    setStaticFile,
    setDynamicFile,
    clearDynamicFiles,
    checkSetupComplete,
    initializeFromStorage,
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

