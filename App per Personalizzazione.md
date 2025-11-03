# App per Personalizzazione Documenti d'Ordine - Next.js

Implementa un'applicazione per combinare automaticamente fogli d'ordine/fatture con elementi grafici aziendali.

## Contesto
- Progetto Next.js (versione più recente) già inizializzato
- Usa App Router
- Implementa con TypeScript

## Requisiti Funzionali

### File Statici (configurati una volta, riutilizzati sempre):
1. Logo aziendale
2. Immagine codice coupon
3. Immagine "Grazie per il tuo ordine - Lascia il tuo feedback"
4. Immagine invito social ("Seguici sui social")

### File Dinamici (caricati per ogni ordine):
1. Foglio d'ordine/fattura
2. Tagliandino/etichetta spedizione

## Implementazione

### Struttura Pagine:
- `/` - Pagina principale con area di lavoro
- Eventualmente `/setup` - Configurazione file statici (se preferisci separarla)

### Componenti da Creare:

1. **StaticFilesManager**
   - Upload dei 4 file statici
   - Salvataggio in localStorage (o alternative Next.js)
   - Preview miniature dei file caricati
   - Pulsante "Modifica file statici"

2. **OrderProcessor**
   - Drag & drop per foglio d'ordine e tagliandino
   - Preview in tempo reale del documento finale
   - Griglia/layout per posizionamento elementi

3. **PDFGenerator**
   - Combina tutti gli elementi in un PDF
   - Usa libreria come `pdf-lib` o `jspdf`
   - Genera e scarica il PDF finale

### Librerie da Installare:
```bash
npm install pdf-lib
# oppure
npm install jspdf
```

### Layout del Documento Finale:
Struttura suggerita (puoi modificare):
- Pagina 1: Foglio d'ordine con logo in alto
- Elementi grafici (coupon, feedback, social) disposti armoniosamente
- Tagliandino spedizione in posizione prominente

### Gestione Stato:
- Use Context API o Zustand per gestire:
  - File statici configurati
  - File dinamici correnti
  - Stato preview

### UI/UX:
- Usa Tailwind CSS (già incluso in Next.js)
- Componenti shadcn/ui se disponibili
- Design responsive e intuitivo
- Loading states durante generazione PDF
- Toast notifications per feedback utente

### Flusso Applicazione:

**Prima volta:**
1. Mostra schermata setup per caricare 4 file statici
2. Salva in localStorage/IndexedDB

**Utilizzo normale:**
1. Mostra area principale con preview file statici
2. Pulsanti upload per foglio ordine e tagliandino
3. Preview automatica documento completo
4. Pulsante "Genera PDF" → download automatico

### File Structure Suggerita:
```
app/
  page.tsx (main app)
components/
  StaticFilesManager.tsx
  OrderProcessor.tsx
  PDFGenerator.tsx
  FileUploader.tsx
  DocumentPreview.tsx
lib/
  pdfUtils.ts (funzioni per generare PDF)
  storageUtils.ts (localStorage management)
types/
  index.ts (TypeScript interfaces)
```

## Priorità Implementazione:
1. Setup UI base e componenti upload
2. Gestione localStorage per file statici
3. Preview immagini caricate
4. Generazione PDF con pdf-lib
5. Styling e refinements

## Note:
- Gestisci formati: JPG, PNG, PDF
- Valida dimensioni file (max 10MB per file)
- Aggiungi error handling robusto
- Considera server actions per processing pesante (opzionale)
