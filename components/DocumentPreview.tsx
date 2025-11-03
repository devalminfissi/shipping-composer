'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileImage, FileText, AlertCircle } from 'lucide-react';

export function DocumentPreview() {
  const { state } = useApp();

  const hasOrderFile = state.dynamicFiles.order !== null;
  const hasShippingFile = state.dynamicFiles.shipping !== null;
  const hasStaticFiles = state.setupComplete;

  if (!hasOrderFile && !hasShippingFile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anteprima Documento</CardTitle>
          <CardDescription>
            Carica i file per vedere l'anteprima del documento finale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nessun file caricato. Carica almeno il foglio d'ordine per vedere l'anteprima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Anteprima Documento</CardTitle>
        <CardDescription>
          Visualizzazione composita del documento finale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview Foglio Ordine */}
          {hasOrderFile && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Foglio d'Ordine</span>
              </div>
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {state.dynamicFiles.order!.file.type === 'application/pdf' ? (
                  <div className="aspect-[8.5/11] flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {state.dynamicFiles.order!.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF - Verrà incluso nel documento finale
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={state.dynamicFiles.order!.preview}
                    alt="Preview ordine"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* Preview File Statici */}
          {hasStaticFiles && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileImage className="h-4 w-4" />
                <span className="text-sm font-medium">Elementi Grafici</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {state.staticFiles.logo && (
                  <div className="border rounded p-2 bg-muted/50">
                    <img
                      src={state.staticFiles.logo.preview}
                      alt="Logo"
                      className="w-full h-auto max-h-20 object-contain"
                    />
                    <p className="text-xs text-center mt-1 text-muted-foreground">Logo</p>
                  </div>
                )}
                {state.staticFiles.coupon && (
                  <div className="border rounded p-2 bg-muted/50">
                    <img
                      src={state.staticFiles.coupon.preview}
                      alt="Coupon"
                      className="w-full h-auto max-h-20 object-contain"
                    />
                    <p className="text-xs text-center mt-1 text-muted-foreground">Coupon</p>
                  </div>
                )}
                {state.staticFiles.feedback && (
                  <div className="border rounded p-2 bg-muted/50">
                    <img
                      src={state.staticFiles.feedback.preview}
                      alt="Feedback"
                      className="w-full h-auto max-h-20 object-contain"
                    />
                    <p className="text-xs text-center mt-1 text-muted-foreground">Feedback</p>
                  </div>
                )}
                {state.staticFiles.social && (
                  <div className="border rounded p-2 bg-muted/50">
                    <img
                      src={state.staticFiles.social.preview}
                      alt="Social"
                      className="w-full h-auto max-h-20 object-contain"
                    />
                    <p className="text-xs text-center mt-1 text-muted-foreground">Social</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Tagliandino */}
          {hasShippingFile && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Tagliandino Spedizione</span>
              </div>
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {state.dynamicFiles.shipping!.file.type === 'application/pdf' ? (
                  <div className="aspect-[8.5/11] flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {state.dynamicFiles.shipping!.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF - Verrà aggiunto come pagina separata
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={state.dynamicFiles.shipping!.preview}
                    alt="Preview tagliandino"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* Nota Layout */}
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> L'anteprima mostra la disposizione degli elementi.
              Il PDF finale avrà il logo in alto, gli elementi grafici disposti in basso,
              e il tagliandino come pagina aggiuntiva.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

