import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeliveryPartner } from '../types';
import { VEHICLE_LABELS } from '../types';
import { fetchDeliveryPartners, fetchDeliveryPartnerCities, rateDeliveryPartner } from '../services/deliveryPartner.service';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { OfflineState } from '../components/ui/OfflineState';
import { ToastContainer } from '../components/ToastContainer';
import type { ToastMessage } from '../components/ToastContainer';
import {
  ArrowLeft, Truck, ShieldCheck, MapPin, MessageSquare, Star, Bike, Car, PersonStanding, Package
} from 'lucide-react';

function vehicleIcon(type: DeliveryPartner['vehicleType']) {
  if (type === 'MOTO' || type === 'BICYCLE') return Bike;
  if (type === 'CAR') return Car;
  return PersonStanding;
}

export const DeliveryPartnersPage = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hoveredRating, setHoveredRating] = useState<{ id: string; value: number } | null>(null);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = async () => {
    setStatus('loading');
    try {
      const [partnersData, citiesData] = await Promise.all([
        fetchDeliveryPartners(selectedCity || undefined),
        fetchDeliveryPartnerCities(),
      ]);
      setPartners(partnersData);
      setCities(citiesData);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, [selectedCity]);

  const handleContact = (partner: DeliveryPartner) => {
    const cleanPhone = partner.whatsappNum.replace(/[^0-9]/g, '');
    const text = `Bonjour ${partner.fullName}, je vous contacte via StatutShop. J'ai une livraison à vous confier, êtes-vous disponible ?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRate = async (partnerId: string, rating: number) => {
    try {
      const updated = await rateDeliveryPartner(partnerId, rating);
      setPartners((prev) => prev.map((p) => (p.id === partnerId ? updated : p)));
      pushToast('success', 'Merci pour votre évaluation !');
    } catch {
      pushToast('error', "Erreur lors de l'envoi de la note");
    }
  };

  if (status === 'loading') return <LoadingSpinner label="Chargement des livreurs..." />;
  if (status === 'error') return <OfflineState onRetry={load} />;

  return (
    <div className="p-2 sm:p-4 space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 rounded-lg transition shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-display font-semibold text-white flex items-center gap-2">
            <Truck className="w-5.5 h-5.5 text-whatsapp" /> Réseau de Livreurs
          </h1>
          <p className="text-xs text-slate-400">Livreurs certifiés, contactez-les directement sur WhatsApp</p>
        </div>
      </div>

      {/* Filtre ville */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCity('')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
            selectedCity === ''
              ? 'bg-whatsapp text-ink-950 font-bold shadow-md'
              : 'bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white'
          }`}
        >
          Toutes les villes
        </button>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
              selectedCity === city
                ? 'bg-whatsapp text-ink-950 font-bold shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {partners.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-650 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Aucun livreur disponible</h3>
          <p className="text-xs text-slate-500">Aucun livreur certifié dans cette zone pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {partners.map((partner) => {
            const VehicleIcon = vehicleIcon(partner.vehicleType);
            const displayRating = hoveredRating?.id === partner.id ? hoveredRating.value : Math.round(partner.rating);

            return (
              <div
                key={partner.id}
                className="card-border hover:border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-panel backdrop-blur-xl transition duration-200"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={partner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'}
                    alt={partner.fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-white text-sm truncate">{partner.fullName}</h3>
                      <span title="Certifié" className="inline-flex">
                        <ShieldCheck className="w-4 h-4 text-whatsapp shrink-0" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-405 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-450" /> {partner.city}
                    </p>
                    <p className="text-xs text-slate-450 flex items-center gap-1 mt-1">
                      <VehicleIcon className="w-3.5 h-3.5" /> {VEHICLE_LABELS[partner.vehicleType]} • {partner.totalDeliveries} courses
                    </p>
                  </div>
                </div>

                {partner.coveredZones.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                    {partner.coveredZones.map((zone, i) => (
                      <span key={i} className="bg-slate-950 border border-slate-850 text-slate-350 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
                        {zone}
                      </span>
                    ))}
                  </div>
                )}

                {partner.basePrice && (
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium">Tarif indicatif : </span>
                    <span className="text-white font-bold">{partner.basePrice}</span>
                  </div>
                )}

                {/* Notation par étoiles */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                  <div
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoveredRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating({ id: partner.id, value: star })}
                        onClick={() => handleRate(partner.id, star)}
                        className="p-0.5 cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 transition ${
                            star <= displayRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-slate-400 ml-1.5 font-mono">{partner.rating.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleContact(partner)}
                  className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-bold text-xs py-3 rounded-xl transition cursor-pointer active:translate-y-px"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contacter sur WhatsApp</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
};