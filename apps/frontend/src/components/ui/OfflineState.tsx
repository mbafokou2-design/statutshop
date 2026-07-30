import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export const OfflineState = ({ onRetry, isRetrying }: OfflineStateProps) => {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-200">
      {/* Background decorations */}
      <div className="hairline-grid pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(50%_50%_at_50%_50%,#000,transparent)] opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-rose-500/5 blur-[140px]" />

      <div className="w-full max-w-sm card-border rounded-3xl p-6 sm:p-8 text-center shadow-panel space-y-6 backdrop-blur-xl relative z-10">
        <div className="dotted-grid absolute inset-0 opacity-20 pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-405 flex items-center justify-center mx-auto shadow-md">
          <WifiOff className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-white">Vous êtes hors ligne</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Impossible de contacter le serveur StatutShop. Vérifiez votre connexion internet et réessayez.
          </p>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-bold text-xs py-3 px-5 rounded-xl transition shadow-lg shadow-emerald-950/60 disabled:opacity-60 cursor-pointer active:translate-y-px"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Nouvelle tentative...' : 'Réessayer'}</span>
        </button>
      </div>
    </div>
  );
};