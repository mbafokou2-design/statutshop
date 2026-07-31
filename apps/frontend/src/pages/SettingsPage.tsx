import { useEffect, useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StoreSettings, TelegramStatus } from '../types';
import { fetchSettings, updateSettings, fetchTelegramStatus } from '../services/settings.service';
import type { SettingsFormData } from '../services/settings.service';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { OfflineState } from '../components/ui/OfflineState';
import { ToastContainer } from '../components/ToastContainer';
import type { ToastMessage } from '../components/ToastContainer';
import { LogoutModal } from '../components/ui/LogoutModal';
import { ChangePasswordModal } from '../components/settings/ChangePasswordModal';
import { ConnectWhatsAppSection } from '../components/settings/ConnectWhatsAppSection';

import {
  Store,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  Lock,
  Send,
  Save,
  Camera,
  ImagePlus,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  LogOut,
  Truck,
  Mail,
} from 'lucide-react';

export interface WhatsAppStatus {
  linked: boolean;
  phoneNumber?: string | null;
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [form, setForm] = useState({
    storeName: '',
    whatsappBusinessNum: '',
    city: '',
    neighborhood: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = async () => {
    setStatus('loading');
    try {
      const [settingsData, telegramData, whatsappRes] = await Promise.all([
        fetchSettings(),
        fetchTelegramStatus(),
        api.get<WhatsAppStatus>('/auth/whatsapp-status'),
      ]);

      setSettings(settingsData);
      setTelegramStatus(telegramData);
      setWhatsAppStatus(whatsappRes.data);

      setForm({
        storeName: settingsData.storeName || '',
        whatsappBusinessNum: settingsData.whatsappBusinessNum || '',
        city: settingsData.city || '',
        neighborhood: settingsData.neighborhood || '',
        description: settingsData.description || '',
      });
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data: SettingsFormData = { ...form, logoFile, coverFile };
      const updated = await updateSettings(data);
      setSettings(updated);
      setLogoFile(null);
      setCoverFile(null);
      setLogoPreview(null);
      setCoverPreview(null);
      if (user) setUser({ ...user, storeName: updated.storeName });
      pushToast('success', 'Boutique mise à jour avec succès');
    } catch (err: any) {
      pushToast('error', err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      navigate('/auth');
    }
  };

  if (status === 'loading') return <LoadingSpinner label="Chargement des paramètres..." />;
  if (status === 'error' || !settings) return <OfflineState onRetry={load} />;

  const inputCls = 'w-full bg-slate-950/80 border border-slate-850 focus:border-whatsapp focus:ring-1 focus:ring-whatsapp/25 rounded-xl px-3.5 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition';
  const labelCls = 'block text-xs font-semibold text-slate-350 mb-1.5';

  return (
    <div className="p-2 sm:p-4 space-y-6 pb-10">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">Paramètres</h1>
        <p className="text-xs text-slate-400">Gérez votre boutique et votre compte</p>
      </div>

      {/* Aperçu boutique */}
      <div className="card-border rounded-3xl overflow-hidden shadow-panel backdrop-blur-xl">
        <div className="relative h-28 sm:h-40 bg-slate-950">
          <img
            src={coverPreview || settings.coverUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop'}
            alt="Couverture"
            className="w-full h-full object-cover opacity-60"
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-950 transition"
          >
            <Camera className="w-3.5 h-3.5 text-whatsapp" />
            <span>Changer</span>
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </div>

        <div className="p-4 -mt-10 relative z-10 flex items-end gap-3.5 pointer-events-none">
          <div className="relative pointer-events-auto shrink-0">
            <img
              src={logoPreview || settings.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=150&auto=format&fit=crop'}
              alt="Logo"
              className="w-18 h-18 rounded-2xl object-cover ring-4 ring-ink-950 bg-slate-900 shadow-lg"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-whatsapp hover:bg-[#2ee071] text-ink-950 p-1.5 rounded-full ring-2 ring-ink-950 cursor-pointer transition shadow-md"
            >
              <ImagePlus className="w-3.5 h-3.5" />
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </div>
          <div className="pb-1 min-w-0 pointer-events-auto">
            <p className="text-sm font-semibold text-white truncate">{settings.storeName}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">/shop/{settings.storeSlug}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.open(`/shop/${settings.storeSlug}`, '_blank')}
        className="w-full flex items-center justify-center gap-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 text-slate-200 font-semibold text-xs py-3.5 rounded-xl transition cursor-pointer active:translate-y-px"
      >
        <Eye className="w-4 h-4 text-whatsapp" />
        <span>Lien de ma boutique StatutShop en direct</span>
      </button>

      {/* Formulaire infos boutique */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-panel backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
            <Store className="w-4.5 h-4.5 text-whatsapp" /> Informations de la boutique
          </h3>

          <div>
            <label className={labelCls}>Nom de la boutique</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={`${labelCls} flex items-center gap-1.5`}>
              <Phone className="w-4 h-4 text-whatsapp" /> Numéro WhatsApp
            </label>
            <input
              type="text"
              value={form.whatsappBusinessNum}
              onChange={(e) => setForm({ ...form, whatsappBusinessNum: e.target.value })}
              className={`${inputCls} font-mono`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`${labelCls} flex items-center gap-1.5`}>
                <MapPin className="w-4 h-4 text-amber-405" /> Ville
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Quartier</label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={`${labelCls} flex items-center gap-1.5`}>
              <FileText className="w-4 h-4 text-slate-500" /> Description
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-bold text-xs py-3.5 rounded-xl transition cursor-pointer disabled:opacity-60 active:translate-y-px"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la boutique'}</span>
          </button>
        </div>
      </form>

      {/* Intégration du composant WhatsApp */}
      <ConnectWhatsAppSection
        onSuccess={(msg) => pushToast('success', msg)}
        onError={(msg) => pushToast('error', msg)}
      />

      {/* Compte */}
      <div className="card-border rounded-3xl p-5 shadow-panel backdrop-blur-xl space-y-3.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Mon compte</h3>

        {/* Adresse E-mail */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Adresse E-mail</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {user?.email || 'Non renseignée'}
              </p>
            </div>
          </div>
          {user?.email ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-whatsapp">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
              Non défini
            </span>
          )}
        </div>

        {/* Statut WhatsApp */}
        <div className="flex items-center justify-between py-1 border-t border-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-whatsapp/15 text-whatsapp flex items-center justify-center shrink-0">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Compte WhatsApp</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {whatsAppStatus?.phoneNumber || user?.phone}
              </p>
            </div>
          </div>
          {whatsAppStatus?.linked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-whatsapp">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
              <XCircle className="w-3.5 h-3.5" /> Non lié
            </span>
          )}
        </div>

        {/* Statut Telegram */}
        <div className="flex items-center justify-between py-1 border-t border-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <Send className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Compte Telegram</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user?.phone}</p>
            </div>
          </div>
          {telegramStatus?.linked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-whatsapp">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
              <XCircle className="w-3.5 h-3.5" /> Non lié
            </span>
          )}
        </div>

        {/* Changement de mot de passe */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between py-2.5 border-t border-slate-850 cursor-pointer hover:bg-slate-950/20 rounded-xl transition duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-350 flex items-center justify-center shrink-0">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold text-white">Changer le mot de passe</span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-slate-500" />
        </button>

        {/* Déconnexion */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-between py-2.5 border-t border-slate-850 cursor-pointer hover:bg-slate-950/20 rounded-xl transition duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-900/20 text-rose-400 flex items-center justify-center shrink-0">
              <LogOut className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold text-rose-400">Se déconnecter</span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-slate-500" />
        </button>
      </div>

      {/* Bouton livreurs */}
      <button
        onClick={() => navigate('/dashboard/delivery-partners')}
        className="w-full flex items-center justify-between bg-whatsapp/5 border border-whatsapp/20 hover:bg-whatsapp/10 rounded-3xl p-5 shadow-panel transition duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-whatsapp/15 text-whatsapp flex items-center justify-center shrink-0">
            <Truck className="w-5.5 h-5.5" />
          </div>
          <div className="text-left space-y-0.5">
            <p className="text-xs font-semibold text-white">Vous avez besoin de livreurs ?</p>
            <p className="text-[11px] text-whatsapp/80 font-medium">Visitez notre réseau de livreurs certifiés</p>
          </div>
        </div>
        <ChevronRight className="w-4.5 h-4.5 text-whatsapp shrink-0" />
      </button>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        hasExistingPassword={Boolean(settings)}
        onSuccess={(msg) => pushToast('success', msg)}
        onError={(msg) => pushToast('error', msg)}
      />
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
};