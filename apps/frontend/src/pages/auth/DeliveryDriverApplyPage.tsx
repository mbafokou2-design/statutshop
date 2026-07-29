import React, { useState } from 'react';
import { api } from '../../lib/api';
import {
  Truck, Phone, User, MapPin, ChevronLeft, RefreshCw,
  CheckCircle2, AlertCircle, X, CreditCard, DollarSign,
  Bike, Car, Footprints, Navigation2
} from 'lucide-react';

type VehicleType = 'MOTO' | 'CAR' | 'BICYCLE' | 'WALKING';

const VEHICLE_OPTIONS: { value: VehicleType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'MOTO', label: 'Moto', icon: Bike, desc: 'Livraison rapide en ville' },
  { value: 'CAR', label: 'Voiture', icon: Car, desc: 'Pour les grandes commandes' },
  { value: 'BICYCLE', label: 'Vélo', icon: Bike, desc: 'Écologique & local' },
  { value: 'WALKING', label: 'À pied', icon: Footprints, desc: 'Quartier proche' },
];

const CAMEROON_CITIES = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Maroua',
  'Garoua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  'Limbé', 'Buéa', 'Kumba', 'Nkongsamba', 'Edéa',
];

interface FormData {
  fullName: string;
  phone: string;
  whatsappNum: string;
  city: string;
  coveredZones: string;
  vehicleType: VehicleType;
  basePrice: string;
  cniNumber: string;
  motivation: string;
}

interface DeliveryDriverApplyPageProps {
  onBack: () => void;
}

export const DeliveryDriverApplyPage: React.FC<DeliveryDriverApplyPageProps> = ({ onBack }) => {
  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    whatsappNum: '',
    city: '',
    coveredZones: '',
    vehicleType: 'MOTO',
    basePrice: '',
    cniNumber: '',
    motivation: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const formatPhone = (val: string) => `+237${val.replace(/\D/g, '')}`;

  const triggerError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || form.phone.length < 9) return triggerError('Entrez un numéro valide à 9 chiffres.');
    if (!form.cniNumber) return triggerError('Le numéro CNI est obligatoire.');

    setIsLoading(true);
    try {
      await api.post('/delivery-candidates', {
        fullName: form.fullName,
        phone: formatPhone(form.phone),
        whatsappNum: form.whatsappNum ? formatPhone(form.whatsappNum) : formatPhone(form.phone),
        city: form.city,
        coveredZones: form.coveredZones
          ? form.coveredZones.split(',').map((z) => z.trim()).filter(Boolean)
          : [],
        vehicleType: form.vehicleType,
        basePrice: form.basePrice || undefined,
        cniNumber: form.cniNumber,
        motivation: form.motivation || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      triggerError(err.response?.data?.error || 'Erreur lors de la soumission. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition';
  const labelCls = 'block text-xs font-semibold text-slate-300 mb-1';

  // ✅ Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Candidature envoyée !</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Merci <span className="text-amber-400 font-bold">{form.fullName}</span> ! Votre dossier a été
              transmis à l'équipe StatutShop. Nous vous contacterons sur WhatsApp dans les <strong className="text-white">48h</strong> pour la suite.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-1.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Récapitulatif</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Nom :</span> {form.fullName}</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Téléphone :</span> +237 {form.phone}</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Ville :</span> {form.city}</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Véhicule :</span> {form.vehicleType}</p>
          </div>
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-slate-950 relative overflow-hidden">

      {/* Toast Error */}
      {toastError && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-red-950/90 border border-red-500/50 text-red-200 text-xs px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="flex-1 font-medium">{toastError}</span>
          <button onClick={() => setToastError(null)} className="text-red-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Ambient glow */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden my-4">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-5"
        >
          <ChevronLeft className="w-4 h-4" /> Retour à la connexion
        </button>

        {/* Header */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 text-xs font-bold">
            <Truck className="w-3.5 h-3.5" /> StatutShop • Espace Livreur
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Devenir Livreur
          </h1>
          <p className="text-xs text-slate-400">
            Rejoignez notre réseau de livreurs partenaires et générez des revenus flexibles
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nom complet */}
          <div>
            <label className={labelCls}>Nom complet *</label>
            <div className="relative">
              <User className="w-4 h-4 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text" required
                placeholder="Jean Dupont"
                value={form.fullName}
                onChange={set('fullName')}
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Téléphone *</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-amber-400 absolute left-3 pointer-events-none" />
                <span className="absolute left-9 text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">+237</span>
                <input
                  type="tel" required maxLength={9}
                  placeholder="6XX XX XX"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                  className={`${inputCls} pl-[4.5rem]`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <span className="absolute left-9 text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">+237</span>
                <input
                  type="tel" maxLength={9}
                  placeholder="idem si pareil"
                  value={form.whatsappNum}
                  onChange={(e) => setForm((f) => ({ ...f, whatsappNum: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                  className={`${inputCls} pl-[4.5rem]`}
                />
              </div>
            </div>
          </div>

          {/* Ville */}
          <div>
            <label className={labelCls}>Ville d'activité *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                required
                value={form.city}
                onChange={set('city')}
                className={`${inputCls} pl-9 appearance-none`}
              >
                <option value="">Choisir une ville…</option>
                {CAMEROON_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Zones couvertes */}
          <div>
            <label className={labelCls}>
              Zones / Quartiers couverts
              <span className="text-slate-500 font-normal"> (séparés par des virgules)</span>
            </label>
            <div className="relative">
              <Navigation2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="ex: Bastos, Mvan, Essos"
                value={form.coveredZones}
                onChange={set('coveredZones')}
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>

          {/* Type de véhicule */}
          <div>
            <label className={labelCls}>Type de véhicule *</label>
            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm((f) => ({ ...f, vehicleType: value }))}
                  className={`p-3 rounded-2xl border text-left transition ${
                    form.vehicleType === value
                      ? 'bg-amber-950/40 border-amber-500/80 text-white ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${form.vehicleType === value ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-bold">{label}</p>
                  <p className="text-[10px] text-slate-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prix de base + CNI */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prix de base (FCFA)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ex: 500 FCFA"
                  value={form.basePrice}
                  onChange={set('basePrice')}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Numéro CNI *</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text" required
                  placeholder="123456789"
                  value={form.cniNumber}
                  onChange={set('cniNumber')}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div>
            <label className={labelCls}>Pourquoi rejoindre StatutShop ? <span className="text-slate-500 font-normal">(facultatif)</span></label>
            <textarea
              rows={3}
              placeholder="Décrivez votre expérience et motivation…"
              value={form.motivation}
              onChange={set('motivation')}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Notice CNI */}
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300/80 leading-relaxed">
            📋 Votre numéro CNI est requis pour vérification d'identité. Aucun paiement n'est demandé pour postuler.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg shadow-amber-950/60 mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Soumettre ma Candidature</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
