import React, { useState } from 'react';
import { api } from '../../lib/api';
import {
  Truck, Phone, User, MapPin, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle2, AlertCircle, X, CreditCard, DollarSign,
  Bike, Car, Footprints, Navigation2, UploadCloud, Camera, FileText
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

interface FormDataState {
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
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState<FormDataState>({
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [cniFile, setCniFile] = useState<File | null>(null);
  const [cniPreview, setCniPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormDataState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const formatPhone = (val: string) => `+237${val.replace(/\D/g, '')}`;

  const triggerError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 5000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCniPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCniFile(file);
      setCniPreview(URL.createObjectURL(file));
    }
  };

  const goToStep2 = () => {
    if (!form.fullName.trim()) return triggerError('Entrez votre nom complet.');
    if (!form.phone || form.phone.length < 9) return triggerError('Entrez un numéro de téléphone valide (9 chiffres).');
    if (!form.city) return triggerError('Veuillez choisir votre ville d\'activité.');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cniNumber.trim()) return triggerError('Le numéro CNI est obligatoire.');

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('phone', formatPhone(form.phone));
      fd.append('whatsappNum', form.whatsappNum ? formatPhone(form.whatsappNum) : formatPhone(form.phone));
      fd.append('city', form.city);
      fd.append('vehicleType', form.vehicleType);
      fd.append('cniNumber', form.cniNumber);

      if (form.coveredZones) {
        const zonesArr = form.coveredZones.split(',').map((z) => z.trim()).filter(Boolean);
        fd.append('coveredZones', JSON.stringify(zonesArr));
      }
      if (form.basePrice) fd.append('basePrice', form.basePrice);
      if (form.motivation) fd.append('motivation', form.motivation);

      if (avatarFile) fd.append('avatar', avatarFile);
      if (cniFile) fd.append('cniPhoto', cniFile);

      await api.post('/delivery-candidates', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmitted(true);
    } catch (err: any) {
      triggerError(err.response?.data?.error || 'Erreur lors de la soumission. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition';
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
              Merci <span className="text-amber-400 font-bold">{form.fullName}</span> ! Votre dossier avec pièces justificatives a bien été transmis à l'équipe StatutShop. Nous étudierons votre demande sous <strong className="text-white">48h</strong>.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-1.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Récapitulatif</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Nom :</span> {form.fullName}</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Téléphone :</span> +237 {form.phone}</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Ville :</span> {form.city}</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">CNI :</span> {form.cniNumber}</p>
            <p className="text-xs text-slate-300"><span className="text-slate-500">Photos :</span> {avatarFile ? 'Profil ' : ''}{cniFile ? 'CNI ' : ''}</p>
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

        {/* Header navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={step === 2 ? () => setStep(1) : onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 2 ? 'Étape précédente' : 'Retour'}
          </button>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Étape {step} sur 2
          </span>
        </div>

        {/* Header title */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 text-xs font-bold">
            <Truck className="w-3.5 h-3.5" /> StatutShop • Espace Livreur
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {step === 1 ? 'Vos Informations' : 'Vos Documents & Photos'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 1 ? 'Renseignez vos coordonnées et votre moyen de transport' : 'Téléversez votre photo de profil et votre pièce d\'identité'}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-amber-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />
        </div>

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); goToStep2(); }} className="space-y-4">

          {/* ===================== STEP 1 ===================== */}
          {step === 1 && (
            <>
              {/* Nom complet */}
              <div>
                <label className={labelCls}>Nom complet *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text" required
                    placeholder="Jean Dupont"
                    value={form.fullName}
                    onChange={set('fullName')}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              {/* Téléphone & WhatsApp */}
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
                  <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
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
                  <Navigation2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
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

              {/* Prix de base */}
              <div>
                <label className={labelCls}>Prix de base (FCFA)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ex: 500 FCFA"
                    value={form.basePrice}
                    onChange={set('basePrice')}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={goToStep2}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg shadow-amber-950/60 mt-4"
              >
                <span>Suivant : Pièces & Photos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ===================== STEP 2 ===================== */}
          {step === 2 && (
            <>
              {/* Photo de Profil */}
              <div>
                <label className={labelCls}>Photo de profil / Avatar</label>
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 cursor-pointer transition">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{avatarFile ? 'Changer la photo' : 'Téléverser photo'}</span>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500">JPG, PNG jusqu'à 10Mo</p>
                  </div>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Numéro CNI */}
              <div>
                <label className={labelCls}>Numéro CNI / Carte Nationale d'Identité *</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text" required
                    placeholder="123456789"
                    value={form.cniNumber}
                    onChange={set('cniNumber')}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              {/* Photo CNI */}
              <div>
                <label className={labelCls}>Photo de la CNI (Recto ou complet)</label>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  {cniPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-40">
                      <img src={cniPreview} alt="Photo CNI" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setCniFile(null); setCniPreview(null); }}
                        className="absolute top-2 right-2 p-1 bg-red-950/80 text-red-300 rounded-full hover:bg-red-900 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition text-center space-y-1">
                      <FileText className="w-6 h-6 text-amber-400/80" />
                      <span className="text-xs font-bold text-slate-300">Cliquez pour ajouter la photo CNI</span>
                      <span className="text-[10px] text-slate-500">Document clair et lisible</span>
                      <input type="file" accept="image/*" onChange={handleCniPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className={labelCls}>Expérience & Motivation <span className="text-slate-500 font-normal">(facultatif)</span></label>
                <textarea
                  rows={2}
                  placeholder="Expliquez brièvement votre expérience en livraison…"
                  value={form.motivation}
                  onChange={set('motivation')}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Notice */}
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300/80 leading-relaxed">
                📋 Vos documents et photos sont hébergés de façon sécurisée pour validation par nos administrateurs.
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Précédent
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg shadow-amber-950/60 disabled:opacity-60"
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
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};
