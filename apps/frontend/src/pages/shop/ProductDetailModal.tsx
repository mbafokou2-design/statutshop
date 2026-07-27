import React, { useState } from 'react';
import type { Product, StoreSettings } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { formatCurrency, generateWhatsAppLink } from '../../utils';
import { X, MessageSquare, MapPin, User, Phone, Truck, ShieldCheck, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  onOrderSubmitted: (
    clientName: string,
    clientPhone: string,
    address: string,
    quantity: number,
    deliveryOption: string
  ) => Promise<void>;
}

const DELIVERY_OPTIONS = [
  { value: 'Client paye le taxi à la livraison', label: "🚕 Je paierai les frais de taxi à l'arrivée" },
  { value: 'Livraison gratuite à négocier', label: '🎁 Demander la livraison gratuite' },
  { value: 'Récupération en boutique', label: '📍 Récupération directe en boutique' },
];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product, isOpen, onClose, storeSettings, onOrderSubmitted,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState(DELIVERY_OPTIONS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleOrderWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !address.trim()) return;

    setIsSubmitting(true);
    try {
      await onOrderSubmitted(clientName, clientPhone, address, quantity, deliveryOption);

      const waUrl = generateWhatsAppLink(
        storeSettings.whatsappBusinessNum, clientName, clientPhone, address,
        product.title, product.priceSelling, quantity, deliveryOption
      );
      window.open(waUrl, '_blank');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = product.priceSelling * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-0 sm:my-6 max-h-[95vh] overflow-y-auto">
        <div className="relative h-56 sm:h-72 bg-slate-950 overflow-hidden">
          <img
            src={product.imageUrl || 'https://placehold.co/600x400/1e293b/64748b?text=Photo'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white bg-slate-950/60 hover:bg-slate-900 rounded-full border border-white/20 transition backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end gap-2">
            <div className="min-w-0">
              <span className="inline-block bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                {CATEGORY_LABELS[product.category]}
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">{product.title}</h2>
            </div>
            <div className="text-right bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Prix Uni.</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">{formatCurrency(product.priceSelling)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {product.description && (
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
              {product.description}
            </p>
          )}

          <form onSubmit={handleOrderWhatsApp} className="space-y-4">
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4" /> Vos Coordonnées pour la Livraison
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nom & Prénom *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input type="text" required placeholder="ex: Amina Bella" value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Numéro WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
                    <input type="tel" required placeholder="+237 6XX XX XX XX" value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none transition" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Quartier & Ville *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                    <input type="text" required placeholder="ex: Bastos, Yaoundé" value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Quantité *</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800">-</button>
                    <span className="text-xs font-bold text-white px-3">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-sky-400" /> Mode de Livraison
              </label>
              <select value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition">
                {DELIVERY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total :</span>
                <span className="text-lg sm:text-xl font-black text-white">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> Paiement à la livraison
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm py-3.5 rounded-2xl transition shadow-xl shadow-emerald-950 disabled:opacity-60">
              <MessageSquare className="w-5 h-5" />
              <span>{isSubmitting ? 'Envoi...' : 'Commander via WhatsApp'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};