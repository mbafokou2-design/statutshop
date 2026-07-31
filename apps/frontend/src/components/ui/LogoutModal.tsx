import { LogOut, X } from 'lucide-react';
import { useEffect } from 'react';
import { ModalPortal } from './ModalPortal';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export const LogoutModal = ({ isOpen, onClose, onConfirm, isLoggingOut }: LogoutModalProps) => {
  // Lock body scroll using position fixed while modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-950/85 backdrop-blur-md">
      <div style={{ touchAction: 'pan-y' }} className="card-border rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-panel overflow-hidden relative">
        <div className="dotted-grid absolute inset-0 opacity-15 pointer-events-none" />

        <div className="px-5.5 py-4.5 border-b border-slate-800/80 flex items-center justify-between relative z-10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Déconnexion</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-450 hover:text-white bg-slate-900/60 border border-slate-800/80 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5.5 space-y-5 relative z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-405 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Voulez-vous vraiment vous déconnecter de votre espace vendeur ?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2.5">
            <button
              onClick={onClose}
              disabled={isLoggingOut}
              className="w-full sm:flex-1 px-4 py-3 text-xs font-bold text-slate-350 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 rounded-xl transition duration-200 cursor-pointer disabled:opacity-60"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="w-full sm:flex-1 px-4 py-3 text-xs font-bold text-white bg-rose-500 hover:bg-rose-455 rounded-xl transition duration-200 shadow-lg shadow-rose-950/60 disabled:opacity-60 cursor-pointer active:translate-y-px"
            >
              {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
      </ModalPortal>
  );
};