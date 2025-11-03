'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { validateFile, createFileWithPreview, formatFileSize } from '@/lib/fileUtils';
import type { FileWithPreview } from '@/types';
import { Upload, X, FileImage, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileSelect: (file: FileWithPreview | null) => void;
  currentFile: FileWithPreview | null;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label?: string;
  description?: string;
}

export function FileUploader({
  onFileSelect,
  currentFile,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png'],
    'application/pdf': ['.pdf'],
  },
  maxFiles = 1,
  label = 'Carica file',
  description = 'Trascina qui il file o clicca per selezionare',
}: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsLoading(true);

      try {
        // Validazione
        const validation = validateFile(file);
        if (!validation.valid) {
          toast.error(validation.error);
          setIsLoading(false);
          return;
        }

        // Crea FileWithPreview
        const fileWithPreview = await createFileWithPreview(file);
        onFileSelect(fileWithPreview);
        toast.success('File caricato con successo');
      } catch (error) {
        console.error('Errore nel caricamento file:', error);
        toast.error('Errore nel caricamento del file');
      } finally {
        setIsLoading(false);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled: isLoading,
  });

  const handleRemove = () => {
    onFileSelect(null);
    toast.success('File rimosso');
  };

  if (currentFile) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
          <div className="flex-shrink-0">
            {currentFile.file.type.startsWith('image/') ? (
              <FileImage className="h-10 w-10 text-primary" />
            ) : (
              <FileText className="h-10 w-10 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentFile.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(currentFile.file.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {currentFile.file.type.startsWith('image/') && (
          <div className="mt-2 rounded-lg overflow-hidden border">
            <img
              src={currentFile.preview}
              alt="Preview"
              className="w-full h-auto max-h-48 object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
      `}
    >
      <input {...getInputProps()} />
      <Upload
        className={`h-12 w-12 mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`}
      />
      <p className="text-sm font-medium mb-2">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground mt-2">
        Formati supportati: JPG, PNG, PDF (max 10MB)
      </p>
    </div>
  );
}

