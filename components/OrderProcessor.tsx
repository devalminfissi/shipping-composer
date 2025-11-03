'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { FileUploader } from './FileUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package } from 'lucide-react';

export function OrderProcessor() {
  const { state, setDynamicFile } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Carica File d'Ordine</h2>
        <p className="text-muted-foreground">
          Carica il foglio d'ordine/fattura e il tagliandino di spedizione per questo ordine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Foglio d'Ordine/Fattura
            </CardTitle>
            <CardDescription>
              Carica il PDF del foglio d'ordine o fattura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              onFileSelect={(file) => setDynamicFile('order', file)}
              currentFile={state.dynamicFiles.order}
              accept={{
                'application/pdf': ['.pdf'],
                'image/*': ['.jpg', '.jpeg', '.png'],
              }}
              label="Carica Foglio d'Ordine"
              description="Trascina qui il PDF o clicca per selezionare"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tagliandino Spedizione
            </CardTitle>
            <CardDescription>
              Carica il tagliandino o etichetta di spedizione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              onFileSelect={(file) => setDynamicFile('shipping', file)}
              currentFile={state.dynamicFiles.shipping}
              accept={{
                'application/pdf': ['.pdf'],
                'image/*': ['.jpg', '.jpeg', '.png'],
              }}
              label="Carica Tagliandino"
              description="Trascina qui il file o clicca per selezionare"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

