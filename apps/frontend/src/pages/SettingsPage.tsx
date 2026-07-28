import React, { useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
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
      const [settingsData, telegramData] = await Promise.all([fetchSettings(), fetchTelegramStatus()]);
      setSettings(settingsData);
      setTelegramStatus(telegramData);
      setForm({
        storeName: settingsData.storeName,
        whatsappBusinessNum: settingsData.whatsappBusinessNum,
        city: settingsData.city,
        neighborhood: settingsData.neighborhood,
        description: settingsData.description,
      });
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pb-10">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-white">Paramètres</h1>
        <p className="text-xs text-slate-400 mt-0.5">Gérez votre boutique et votre compte</p>
      </div>

      {/* Aperçu boutique */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="relative h-28 sm:h-40 bg-slate-950">
          <img
            src={coverPreview || settings.coverUrl}
            alt="Couverture"
            className="w-full h-full object-cover opacity-70"
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur border border-slate-700 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Changer</span>
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </div>

        <div className="p-4 -mt-8 relative z-10 flex items-end gap-3 pointer-events-none">
          <div className="relative pointer-events-auto">
            <img
              src={logoPreview || settings.logoUrl}
              alt="Logo"
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-900 bg-slate-800"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-full ring-2 ring-slate-900 cursor-pointer transition"
            >
              <ImagePlus className="w-3 h-3" />
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </div>
          <div className="pb-1 min-w-0 pointer-events-auto">
            <p className="text-sm font-bold text-white truncate">{settings.storeName}</p>
            <p className="text-[11px] text-slate-400 truncate">/shop/{settings.storeSlug}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.open(`/shop/${settings.storeSlug}`, '_blank')}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs py-3 rounded-xl transition"
      >
        <Eye className="w-4 h-4 text-emerald-400" />
        <span>Voir ma boutique publique</span>
      </button>

      {/* Formulaire infos boutique */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" /> Informations de la boutique
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de la boutique</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Numéro WhatsApp
            </label>
            <input
              type="text"
              value={form.whatsappBusinessNum}
              onChange={(e) => setForm({ ...form, whatsappBusinessNum: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Ville
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quartier</label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition disabled:opacity-60"
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-white mb-1">Mon compte</h3>

        {/* Statut Telegram */}
        <div className="flex items-center justify-between py-2.5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Compte Telegram</p>
              <p className="text-[10px] text-slate-400">{user?.phone}</p>
            </div>
          </div>
          {telegramStatus?.linked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
              <XCircle className="w-3.5 h-3.5" /> Non lié
            </span>
          )}
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between py-2.5 px-1 border-t border-slate-800/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Changer le mot de passe</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-between py-2.5 px-1 border-t border-slate-800/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-rose-300">Se déconnecter</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Bouton livreurs */}
      <button
        onClick={() => navigate('/dashboard/delivery-partners')}
        className="w-full flex items-center justify-between bg-emerald-600/10 border border-emerald-500/30 hover:bg-emerald-600/20 rounded-2xl p-4 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Vous avez besoin de livreurs ?</p>
            <p className="text-[11px] text-emerald-300/80">Visitez notre réseau de livreurs certifiés</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
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