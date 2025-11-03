'use client';

import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { OrderProcessor } from '@/components/OrderProcessor';
import { Button } from '@/components/ui/button';
import { generateCombinedPDF, downloadPDF } from '@/lib/pdfUtils';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

function MainContent() {
  const { state, clearDynamicFiles } = useApp();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    if (!state.dynamicFiles.order) {
      toast.error('Carica almeno il foglio d\'ordine per generare il PDF');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdfBytes = await generateCombinedPDF({
        staticFiles: state.staticFiles,
        dynamicFiles: state.dynamicFiles,
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `documento-personalizzato-${timestamp}.pdf`;
      
      downloadPDF(pdfBytes, filename);
      toast.success('PDF generato e scaricato con successo!');
      
      // Opzionale: pulisci i file dinamici dopo il download
      // clearDynamicFiles();
    } catch (error: any) {
      console.error('Errore nella generazione PDF:', error);
      toast.error(error.message || 'Errore nella generazione del PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Workspace principale
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Personalizzazione Documenti
        </h1>
        <p className="text-muted-foreground">
          Carica i file d'ordine e genera il documento personalizzato
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar con preview file statici */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">File Statici Configurati</h3>
              <div className="space-y-3">
                {state.staticFiles.logo && (
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <img
                      src={state.staticFiles.logo.preview}
                      alt="Logo"
                      className="h-10 w-10 object-contain"
                    />
                    <span className="text-sm flex-1">Logo</span>
                  </div>
                )}
                {state.staticFiles.coupon && (
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <img
                      src={state.staticFiles.coupon.preview}
                      alt="Coupon"
                      className="h-10 w-10 object-contain"
                    />
                    <span className="text-sm flex-1">Coupon</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Area centrale */}
        <div className="lg:col-span-2 space-y-6">
          <OrderProcessor />
          
          {/* Pulsante Genera PDF */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF || !state.dynamicFiles.order}
                className="w-full"
                size="lg"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Genera e Scarica PDF
                  </>
                )}
              </Button>
              {!state.dynamicFiles.order && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Carica almeno il foglio d'ordine per abilitare la generazione
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
