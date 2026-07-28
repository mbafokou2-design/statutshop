import React, { useEffect, useState } from 'react';
import type { WhatsAppStatus } from '../../types';
import { fetchWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from '../../services/whatsapp.service';
import {
  MessageCircle, CheckCircle2, XCircle, RefreshCw, Copy, Check, Phone, X, ChevronRight
} from 'lucide-react';

interface ConnectWhatsAppSectionProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

type FlowStep = 'idle' | 'enter_phone' | 'show_code' | 'connecting';

export const ConnectWhatsAppSection: React.FC<ConnectWhatsAppSectionProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<FlowStep>('enter_phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await fetchWhatsAppStatus();
      setStatus(data);
    } catch {
      setStatus({ connected: false, phoneNumber: null });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  // Poll le statut toutes les 4s pendant qu'on attend la confirmation de liaison
  useEffect(() => {
    if (step !== 'show_code') return;
    const interval = setInterval(async () => {
      const data = await fetchWhatsAppStatus();
      if (data.connected) {
        setStatus(data);
        setShowModal(false);
        setStep('enter_phone');
        setPairingCode(null);
        onSuccess('WhatsApp connecté avec succès !');
        clearInterval(interval);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [step]);

  const openModal = () => {
    setStep('enter_phone');
    setPhoneNumber('');
    setPairingCode(null);
    setShowModal(true);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await connectWhatsApp(phoneNumber);
      setPairingCode(res.pairingCode);
      setStep('show_code');
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    if (!confirm('Déconnecter votre compte WhatsApp de StatutShop ?')) return;
    setIsDisconnecting(true);
    try {
      await disconnectWhatsApp();
      setStatus({ connected: false, phoneNumber: null });
      onSuccess('WhatsApp déconnecté');
    } catch {
      onError('Erreur lors de la déconnexion');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-400" /> Relances WhatsApp automatiques
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Connectez votre compte WhatsApp pour répondre directement à vos clients qui vous ont déjà écrit, sans quitter StatutShop.
        </p>

        {isLoadingStatus ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Vérification du statut...
          </div>
        ) : status?.connected ? (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">WhatsApp Connecté</p>
                <p className="text-[10px] text-slate-400 font-mono">{status.phoneNumber}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 disabled:opacity-50"
            >
              {isDisconnecting ? '...' : 'Déconnecter'}
            </button>
          </div>
        ) : (
          <button
            onClick={openModal}
            className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Connecter mon WhatsApp</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      {/* Modal de connexion */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" /> Connecter WhatsApp
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {step === 'enter_phone' && (
                <form onSubmit={handleConnect} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Votre numéro WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        placeholder="+237 6XX XX XX XX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition disabled:opacity-60"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Obtenir mon code de liaison</span>}
                  </button>
                </form>
              )}

              {step === 'show_code' && pairingCode && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-slate-400">Votre code de liaison :</p>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-2 bg-slate-950 border border-emerald-500/40 rounded-xl px-5 py-3 text-xl font-mono font-black text-emerald-400 tracking-[0.3em] hover:border-emerald-500 transition"
                    >
                      {pairingCode}
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>En attente de la liaison...</span>
                    </div>
                  </div>

                  {/* Guide visuel en 3 étapes — images à remplacer */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Comment lier votre compte :</p>

                    <div className="flex items-start gap-3">
                      <img
                        src="https://placehold.co/120x220/1e293b/64748b?text=Etape+1"
                        alt="Étape 1"
                        className="w-16 h-28 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">1. Ouvrez WhatsApp</p>
                        <p className="text-[11px] text-slate-400">Allez dans Paramètres → Appareils liés</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <img
                        src="https://placehold.co/120x220/1e293b/64748b?text=Etape+2"
                        alt="Étape 2"
                        className="w-16 h-28 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">2. Lier un appareil</p>
                        <p className="text-[11px] text-slate-400">Appuyez sur "Lier avec le numéro de téléphone"</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <img
                        src="https://placehold.co/120x220/1e293b/64748b?text=Etape+3"
                        alt="Étape 3"
                        className="w-16 h-28 rounded-lg object-cover ring-1 ring-slate-800 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">3. Entrez le code</p>
                        <p className="text-[11px] text-slate-400">Saisissez le code affiché ci-dessus</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setStep('enter_phone'); setPairingCode(null); }}
                    className="w-full text-[11px] text-slate-400 hover:text-white transition"
                  >
                    Changer de numéro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};