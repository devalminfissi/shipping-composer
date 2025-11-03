'use client';

import { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { StaticFilesManager } from '@/components/StaticFilesManager';
import { OrderProcessor } from '@/components/OrderProcessor';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button';
import { generateCombinedPDF, downloadPDF } from '@/lib/pdfUtils';
import { Settings, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

function MainContent() {
  const { state, setStaticFile, clearDynamicFiles } = useApp();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);

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

  // Se setup non completato, mostra solo il manager
  if (!state.setupComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Configurazione Iniziale
          </h1>
          <p className="text-muted-foreground">
            Configura i file statici che verranno utilizzati per personalizzare tutti i documenti.
          </p>
        </div>
        <StaticFilesManager />
      </div>
    );
  }

  // Workspace principale
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Personalizzazione Documenti
          </h1>
          <p className="text-muted-foreground">
            Carica i file d'ordine e genera il documento personalizzato
          </p>
        </div>
        <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifica File Statici</DialogTitle>
              <DialogDescription>
                Modifica i file statici configurati. Questi verranno utilizzati per tutti i documenti.
              </DialogDescription>
            </DialogHeader>
            <StaticFilesManager />
          </DialogContent>
        </Dialog>
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
                {state.staticFiles.feedback && (
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <img
                      src={state.staticFiles.feedback.preview}
                      alt="Feedback"
                      className="h-10 w-10 object-contain"
                    />
                    <span className="text-sm flex-1">Feedback</span>
                  </div>
                )}
                {state.staticFiles.social && (
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <img
                      src={state.staticFiles.social.preview}
                      alt="Social"
                      className="h-10 w-10 object-contain"
                    />
                    <span className="text-sm flex-1">Social</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Area centrale */}
        <div className="lg:col-span-2 space-y-6">
          <OrderProcessor />
          <DocumentPreview />
          
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
