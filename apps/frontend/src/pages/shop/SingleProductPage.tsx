import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product, StoreSettings } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { formatCurrency, generateWhatsAppLink } from '../../utils';
import { fetchPublicProduct, submitPublicOrder } from '../../services/publicShop.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';
import type { ToastMessage } from '../../components/ToastContainer';
import { ToastContainer } from '../../components/ToastContainer';
import {
  Store, MessageSquare, MapPin, User, Phone, Truck, ShieldCheck, Sparkles, ArrowLeft, PackageX
} from 'lucide-react';

const DELIVERY_OPTIONS = [
  { value: 'Client paye le taxi à la livraison', label: "🚕 Je paierai les frais de taxi à l'arrivée" },
  { value: 'Livraison gratuite à négocier', label: '🎁 Demander la livraison gratuite' },
  { value: 'Récupération en boutique', label: '📍 Récupération directe en boutique' },
];

export const SingleProductPage: React.FC = () => {
  const { storeSlug, productSlug } = useParams<{ storeSlug: string; productSlug: string }>();
  const navigate = useNavigate();

  const [vendeur, setVendeur] = useState<StoreSettings | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error' | 'notfound'>('loading');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState(DELIVERY_OPTIONS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = async () => {
    if (!storeSlug || !productSlug) return;
    setStatus('loading');
    try {
      const data = await fetchPublicProduct(storeSlug, productSlug);
      setVendeur(data.vendeur);
      setProduct(data.product);
      setStatus('ok');
    } catch (err: any) {
      if (err.response?.status === 404) setStatus('notfound');
      else setStatus('error');
    }
  };

  useEffect(() => { load(); }, [storeSlug, productSlug]);

  const handleOrderWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !vendeur || !clientName.trim() || !clientPhone.trim() || !address.trim()) return;

    setIsSubmitting(true);
    try {
      await submitPublicOrder(storeSlug!, {
        productId: product.id,
        customerName: clientName,
        customerPhone: clientPhone,
        deliveryAddress: address,
        quantity,
      });

      const waUrl = generateWhatsAppLink(
        vendeur.whatsappBusinessNum, clientName, clientPhone, address,
        product.title, product.priceSelling, quantity, deliveryOption
      );
      window.open(waUrl, '_blank');
      pushToast('success', 'Commande enregistrée !');
    } catch {
      pushToast('error', "Erreur lors de l'enregistrement de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') return <LoadingSpinner label="Chargement du produit..." />;
  if (status === 'error') return <OfflineState onRetry={load} />;
  if (status === 'notfound' || !product || !vendeur) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <PackageX className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Produit introuvable</h2>
            <p className="text-xs text-slate-400 mt-1.5">Ce produit n'existe plus ou a été retiré du catalogue.</p>
          </div>
          {storeSlug && (
            <button
              onClick={() => navigate(`/shop/${storeSlug}`)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              <Store className="w-4 h-4" />
              <span>Visiter la boutique</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalPrice = product.priceSelling * quantity;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-10">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(`/shop/${storeSlug}`)}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Visiter la boutique</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Photo produit */}
        <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img
            src={product.imageUrl || 'https://placehold.co/600x600/1e293b/64748b?text=Photo'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end gap-2">
            <div className="min-w-0">
              <span className="inline-block bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                {CATEGORY_LABELS[product.category]}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{product.title}</h1>
            </div>
            <div className="text-right bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Prix</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">{formatCurrency(product.priceSelling)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Boutique badge */}
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <img src={vendeur.logoUrl} alt={vendeur.storeName} className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-500/40 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{vendeur.storeName}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> {vendeur.neighborhood}, {vendeur.city}
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          {!product.isAvailable && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-3 text-center">
              <div className="w-11 h-11 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <PackageX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-300">Produit en rupture de stock</p>
                <p className="text-[11px] text-rose-300/70 mt-0.5">
                  Veuillez contacter la boutique pour connaître la disponibilité.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={`https://wa.me/${vendeur.whatsappBusinessNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${vendeur.storeName}, le produit "${product.title}" est-il bientôt disponible ?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contacter sur WhatsApp</span>
                </a>
                <button
                  onClick={() => navigate(`/shop/${storeSlug}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Visiter la boutique</span>
                </button>
              </div>
            </div>
          )}

          {product.description && (
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              {product.description}
            </p>
          )}

          {/* Formulaire commande */}
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

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total :</span>
                <span className="text-lg sm:text-xl font-black text-white">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> Paiement à la livraison
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !product.isAvailable}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm py-3.5 rounded-2xl transition shadow-xl shadow-emerald-950 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-5 h-5" />
              <span>
                {isSubmitting ? 'Envoi...' : !product.isAvailable ? 'Produit indisponible' : 'Commander via WhatsApp'}
              </span>
            </button>
          </form>

          {/* Bouton visiter la boutique (bas de page, secondaire) */}
          <button
            onClick={() => navigate(`/shop/${storeSlug}`)}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs py-3 rounded-2xl transition"
          >
            <Store className="w-4 h-4" />
            <span>Voir tous les produits de {vendeur.storeName}</span>
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
};