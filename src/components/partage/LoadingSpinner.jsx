'use client';

import { Loader2 } from 'lucide-react';

/**
 * Composant de spinner de chargement
 * @param {string} message - Message à afficher (optionnel)
 * @param {boolean} fullScreen - Affiche le spinner en fullscreen (optionnel, défaut: false)
 */
export default function LoadingSpinner({ message = 'Chargement...', fullScreen = false }) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinnerContent}
    </div>
  );
}
