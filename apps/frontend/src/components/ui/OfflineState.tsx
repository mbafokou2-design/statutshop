import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export const OfflineState: React.FC<OfflineStateProps> = ({ onRetry, isRetrying }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-xs space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <WifiOff className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Vous êtes hors ligne</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Impossible de contacter le serveur StatutShop. Vérifiez votre connexion internet et réessayez.
          </p>
        </div>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/60 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Nouvelle tentative...' : 'Réessayer'}</span>
        </button>
      </div>
    </div>
  );
};