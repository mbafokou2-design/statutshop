import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthScreen, OtpChannel } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  ShieldCheck,
  Lock,
  Phone,
  Store,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Send,
  ExternalLink,
  ChevronLeft,
  RefreshCw,
  Bot,
  AlertCircle,
  X,
  KeyRound
} from 'lucide-react';

type RegisterStep = 'form' | 'telegram_link' | 'otp_verify';
type ResetStep = 'request' | 'verify';

type ScreenType = AuthScreen | 'reset_password';

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'StatutShopBot';

export const AuthPages: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [screen, setScreen] = useState<ScreenType>('login');
  // 🟢 WhatsApp par défaut
  const [otpChannel, setOtpChannel] = useState<OtpChannel>('whatsapp');

  // States Formulaires
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [storeName, setStoreName] = useState('');

  // States Inscription
  const [registerStep, setRegisterStep] = useState<RegisterStep>('form');

  // States Reset Password
  const [resetStep, setResetStep] = useState<ResetStep>('request');

  // Common States
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [telegramLinkFromApi, setTelegramLinkFromApi] = useState<string | null>(null);

  const getFullPhone = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `+237${cleanPhone}`;
  };

  const triggerToastError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 5000);
  };

  const resetFlow = () => {
    setRegisterStep('form');
    setResetStep('request');
    setEnteredOtp('');
    setToastError(null);
    setPassword('');
    setNewPassword('');
  };

// --- LOGIQUE DE CONNEXION ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastError(null);
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { phone: getFullPhone(), password });
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      triggerToastError(err.response?.data?.error || 'Identifiants incorrects ou compte inexistant.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIQUE D'INSCRIPTION ---
  const handleProceedRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtpRequest('register');
  };

  // --- LOGIQUE DEMANDE OTP RESET PASSWORD ---
  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      return triggerToastError('Veuillez entrer un numéro valide à 9 chiffres.');
    }
    await sendOtpRequest('reset_password');
  };

  const sendOtpRequest = async (mode: 'register' | 'reset_password') => {
    setIsLoading(true);
    setToastError(null);
    try {
      await api.post('/auth/request-otp', {
        phone: getFullPhone(),
        channel: otpChannel,
        mode,
        ...(mode === 'register' && { storeName, password })
      });

      if (mode === 'register') {
        setRegisterStep('otp_verify');
      } else {
        setResetStep('verify');
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (mode === 'register' && data?.telegramLink) {
        setTelegramLinkFromApi(data.telegramLink);
        setRegisterStep('telegram_link');
      } else {
        triggerToastError(data?.error || "Erreur lors de l'envoi du code OTP");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- VÉRIFICATION OTP INSCRIPTION ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastError(null);
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        phone: getFullPhone(),
        code: enteredOtp,
        mode: 'register',
        storeName,
        password
      });
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      triggerToastError(err.response?.data?.error || 'Code OTP incorrect ou expiré');
    } finally {
      setIsLoading(false);
    }
  };

  // --- VÉRIFICATION ET RÉINITIALISATION MOT DE PASSE ---
  const handleResetPasswordConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      return triggerToastError('Le nouveau mot de passe doit faire au moins 6 caractères.');
    }

    setToastError(null);
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        phone: getFullPhone(),
        code: enteredOtp,
        newPassword
      });
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      triggerToastError(err.response?.data?.error || 'Code OTP invalide ou erreur de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-slate-950 relative overflow-hidden">

      {/* Toast Notification Error */}
      {toastError && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-red-950/90 border border-red-500/50 text-red-200 text-xs px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="flex-1 font-medium">{toastError}</span>
          <button
            type="button"
            onClick={() => setToastError(null)}
            className="text-red-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden my-4">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-5 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> StatutShop • E-Commerce WhatsApp
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {screen === 'login' && 'Espace Vendeur'}
            {screen === 'register' && 'Créer ma Boutique'}
            {screen === 'reset_password' && 'Récupération de compte'}
          </h1>
          <p className="text-xs text-slate-400">
            {screen === 'login' && 'Accédez à votre tableau de bord marchand'}
            {screen === 'register' && 'Commencez à recevoir des commandes WhatsApp structurées'}
            {screen === 'reset_password' && 'Réinitialisez votre mot de passe en toute sécurité'}
          </p>
        </div>

        {/* Switch Navigation (Login / Register) */}
        {screen !== 'reset_password' && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setScreen('login'); resetFlow(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${screen === 'login' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => { setScreen('register'); resetFlow(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${screen === 'register' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Créer un Compte
            </button>
          </div>
        )}

        {/* ----------------- FORMULAIRE DE CONNEXION ----------------- */}
        {screen === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numéro WhatsApp *
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
                <span className="absolute left-9 text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">
                  +237
                </span>
                <input
                  type="tel"
                  required
                  maxLength={9}
                  placeholder="6XX XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-20 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Mot de passe *
                </label>
                <button
                  type="button"
                  onClick={() => { setScreen('reset_password'); resetFlow(); }}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-950/60 mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Accéder à mon Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ----------------- FORMULAIRE MOT DE PASSE OUBLIÉ ----------------- */}
        {screen === 'reset_password' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => { setScreen('login'); resetFlow(); }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> Retour à la connexion
            </button>

            {/* ÉTAPE 1 : DEMANDE DU CODE OTP */}
            {resetStep === 'request' && (
              <form onSubmit={handleRequestResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Votre Numéro WhatsApp lié au compte *
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
                    <span className="absolute left-9 text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">
                      +237
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={9}
                      placeholder="6XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-20 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Recevoir le code de réinitialisation via :
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => setOtpChannel('whatsapp')}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${otpChannel === 'whatsapp'
                        ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        {otpChannel === 'whatsapp' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">WhatsApp</p>
                        <p className="text-[10px] text-emerald-300/80 mt-0.5">Sur votre application</p>
                      </div>
                    </button>

                    {/* Telegram */}
                    <button
                      type="button"
                      onClick={() => setOtpChannel('telegram')}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${otpChannel === 'telegram'
                        ? 'bg-sky-950/40 border-sky-500/80 text-white ring-1 ring-sky-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                          <Send className="w-4 h-4" />
                        </div>
                        {otpChannel === 'telegram' && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Telegram</p>
                        <p className="text-[10px] text-sky-300/80 mt-0.5">Sur le Bot</p>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-950/60 disabled:opacity-60 mt-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Envoyer le Code OTP</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ÉTAPE 2 : NOUVEAU MOT DE PASSE + CONFIRMATION OTP */}
            {resetStep === 'verify' && (
              <form onSubmit={handleResetPasswordConfirm} className="space-y-4">
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-emerald-300">
                  Code OTP envoyé avec succès à <span className="font-mono font-bold text-white">+237 {phone}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Code OTP (6 chiffres) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/80 focus:border-emerald-400 rounded-xl px-3 py-2 text-center text-lg font-mono font-black text-white tracking-widest outline-none shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nouveau Mot de passe *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-950/60 disabled:opacity-60"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Changer le mot de passe & Connecter</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ----------------- FORMULAIRE D'INSCRIPTION ----------------- */}
        {screen === 'register' && (
          <div className="space-y-4">
            {registerStep === 'form' && (
              <form onSubmit={handleProceedRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom de votre boutique *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="ex: StatutShop Douala, Chic & Mode..."
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Numéro WhatsApp *
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
                    <span className="absolute left-9 text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">
                      +237
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={9}
                      placeholder="6XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-20 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Définir un Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Canal de réception du code OTP :
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option WhatsApp Direct */}
                    <button
                      type="button"
                      onClick={() => setOtpChannel('whatsapp')}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${otpChannel === 'whatsapp'
                        ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        {otpChannel === 'whatsapp' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">WhatsApp Direct</p>
                        <p className="text-[10px] text-emerald-300/80 mt-0.5">Instant & Gratuit</p>
                      </div>
                    </button>

                    {/* Option Telegram Bot */}
                    <button
                      type="button"
                      onClick={() => setOtpChannel('telegram')}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${otpChannel === 'telegram'
                        ? 'bg-sky-950/40 border-sky-500/80 text-white ring-1 ring-sky-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                          <Send className="w-4 h-4" />
                        </div>
                        {otpChannel === 'telegram' && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Telegram Bot</p>
                        <p className="text-[10px] text-sky-300/80 mt-0.5">Instant & Gratuit</p>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 font-bold text-xs py-3 rounded-xl transition shadow-lg mt-2 text-white disabled:opacity-60 ${otpChannel === 'telegram'
                    ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-950/60'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60'
                    }`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : otpChannel === 'telegram' ? (
                    <>
                      <span>Valider via Telegram Bot</span>
                      <Send className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Recevoir le code WhatsApp</span>
                      <MessageSquare className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ÉTAPE DE LIAISON TELEGRAM (Uniquement pour INSCRIPTION) */}
            {registerStep === 'telegram_link' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setRegisterStep('form')}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Modifier mes informations
                </button>

                <div className="bg-sky-950/40 border border-sky-800/50 rounded-2xl p-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-2xl mx-auto flex items-center justify-center ring-4 ring-sky-500/10">
                    <Bot className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">Étape 1/2 : Activez le Bot Telegram</h3>
                    <p className="text-xs text-sky-200/80 mt-1">
                      Liez votre numéro avec <span className="font-mono text-sky-300">@{BOT_USERNAME}</span> pour recevoir votre code OTP.
                    </p>
                  </div>

                  <a
                    href={telegramLinkFromApi || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs py-3 px-4 rounded-xl transition shadow-lg shadow-sky-950/80"
                  >
                    <Send className="w-4 h-4" />
                    <span>Lier avec @{BOT_USERNAME}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => sendOtpRequest('register')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-950/60 disabled:opacity-60"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>J'ai démarré le Bot → Obtenir mon code OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ÉTAPE VÉRIFICATION DE L'OTP INSCRIPTION */}
            {registerStep === 'otp_verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setRegisterStep(otpChannel === 'telegram' ? 'telegram_link' : 'form')}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>

                <div className={`p-4 rounded-2xl border space-y-2 ${otpChannel === 'telegram'
                  ? 'bg-sky-950/40 border-sky-800/60 text-sky-200'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  }`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    {otpChannel === 'telegram' ? (
                      <>
                        <Send className="w-4 h-4 text-sky-400" />
                        <span>Code envoyé via Telegram</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>Code envoyé sur WhatsApp</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    Entrez le code à 6 chiffres reçu pour finaliser la création de votre boutique.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 text-center">
                    Entrez le code OTP à 6 chiffres :
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/80 focus:border-emerald-400 rounded-xl px-3 py-3 text-center text-xl font-mono font-black text-white tracking-widest outline-none shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-950/60 disabled:opacity-60"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Créer mon Compte</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sécurité renforcée par Telegram Bot & SMS OTP.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Redirection directe vers votre numéro WhatsApp personnel.</span>
          </div>
        </div>
      </div>
    </div>
  );
};