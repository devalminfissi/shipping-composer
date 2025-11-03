'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { FileUploader } from './FileUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import type { StaticFileType } from '@/types';

const STATIC_FILES_CONFIG: Array<{
  type: StaticFileType;
  label: string;
  description: string;
}> = [
  {
    type: 'logo',
    label: 'Logo Aziendale',
    description: 'Carica il logo della tua azienda',
  },
  {
    type: 'coupon',
    label: 'Immagine Codice Coupon',
    description: 'Carica l\'immagine del codice coupon',
  },
  {
    type: 'feedback',
    label: 'Grazie per il tuo ordine - Feedback',
    description: 'Carica l\'immagine per la richiesta feedback',
  },
  {
    type: 'social',
    label: 'Invito Social',
    description: 'Carica l\'immagine "Seguici sui social"',
  },
];

export function StaticFilesManager() {
  const { state, setStaticFile } = useApp();

  const handleFileSelect = async (type: StaticFileType, file: any) => {
    try {
      await setStaticFile(type, file);
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configurazione File Statici</h2>
        <p className="text-muted-foreground">
          Carica i 4 file statici che verranno utilizzati per personalizzare tutti i documenti.
          Questi file verranno salvati e riutilizzati automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STATIC_FILES_CONFIG.map((config) => {
          const file = state.staticFiles[config.type];
          const isComplete = file !== null;

          return (
            <Card key={config.type} className={isComplete ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    {config.label}
                  </CardTitle>
                </div>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader
                  onFileSelect={(file) => handleFileSelect(config.type, file)}
                  currentFile={file}
                  label={`Carica ${config.label}`}
                  description="Trascina qui il file o clicca per selezionare"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {state.setupComplete && (
        <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Tutti i file statici sono stati configurati correttamente!
          </p>
        </div>
      )}
    </div>
  );
}

