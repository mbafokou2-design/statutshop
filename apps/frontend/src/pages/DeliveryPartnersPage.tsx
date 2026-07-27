import React, { useEffect, useState } from 'react';
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

export const DeliveryPartnersPage: React.FC = () => {
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
    <div className="p-3 sm:p-6 space-y-4 pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" /> Réseau de Livreurs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Livreurs certifiés, contactez-les directement sur WhatsApp</p>
        </div>
      </div>

      {/* Filtre ville */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCity('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
            selectedCity === '' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Toutes les villes
        </button>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
              selectedCity === city ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {partners.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Aucun livreur disponible</h3>
          <p className="text-xs text-slate-400">Aucun livreur certifié dans cette zone pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {partners.map((partner) => {
            const VehicleIcon = vehicleIcon(partner.vehicleType);
            const displayRating = hoveredRating?.id === partner.id ? hoveredRating.value : Math.round(partner.rating);

            return (
              <div key={partner.id} className="bg-slate-900 border border-emerald-500/20 ring-1 ring-emerald-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={partner.avatarUrl || 'https://placehold.co/100x100/1e293b/64748b?text=👤'}
                    alt={partner.fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-sm truncate">{partner.fullName}</h3>
                      <span title="Certifié" className="inline-flex">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" /> {partner.city}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <VehicleIcon className="w-3 h-3" /> {VEHICLE_LABELS[partner.vehicleType]} • {partner.totalDeliveries} courses
                    </p>
                  </div>
                </div>

                {partner.coveredZones.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    {partner.coveredZones.map((zone, i) => (
                      <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                        {zone}
                      </span>
                    ))}
                  </div>
                )}

                {partner.basePrice && (
                  <div className="text-xs">
                    <span className="text-slate-500">Tarif indicatif : </span>
                    <span className="text-white font-bold">{partner.basePrice}</span>
                  </div>
                )}

                {/* Notation par étoiles */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div
                    className="flex items-center gap-0.5"
                    onMouseLeave={() => setHoveredRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating({ id: partner.id, value: star })}
                        onClick={() => handleRate(partner.id, star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-4 h-4 transition ${
                            star <= displayRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[11px] text-slate-400 ml-1 font-mono">{partner.rating.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleContact(partner)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs py-2.5 rounded-xl transition"
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