import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product, StoreSettings } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { formatCurrency, generateWhatsAppLink, updateMetaTags } from '../../utils';
import { fetchPublicProduct, submitPublicOrder } from '../../services/publicShop.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';
import type { ToastMessage } from '../../components/ToastContainer';
import { ToastContainer } from '../../components/ToastContainer';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Store,  MapPin, User, Phone, Truck, ShieldCheck, Sparkles, ArrowLeft, PackageX
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/ui/WhatsAppIcon';

const DELIVERY_OPTIONS = [
  { value: 'Client paye le taxi à la livraison', label: "🚕 Je paierai les frais de taxi à l'arrivée" },
  { value: 'Livraison gratuite à négocier', label: '🎁 Demander la livraison gratuite' },
  { value: 'Récupération en boutique', label: '📍 Récupération directe en boutique' },
];

export const SingleProductPage = () => {
  const { storeSlug, productSlug } = useParams<{ storeSlug: string; productSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Définir dynamiquement les balises Meta SEO / Open Graph Produit (Aperçu WhatsApp & Telegram)
  useEffect(() => {
    if (product && vendeur) {
      updateMetaTags({
        title: `${product.title} (${formatCurrency(product.priceSelling)}) • ${vendeur.storeName}`,
        description: product.description || `Achetez ${product.title} à ${formatCurrency(product.priceSelling)} chez ${vendeur.storeName} sur StatutShop.`,
        image: product.imageUrl || vendeur.logoUrl,
        url: window.location.href,
      });
    }
  }, [product, vendeur]);

  // Enregistrement de la visite de boutique
  useEffect(() => {
    if (!storeSlug) return;

    if (user && user.storeSlug === storeSlug) {
      return;
    }

    const storageKey = `visited_shop_${storeSlug}`;
    const hasVisited = localStorage.getItem(storageKey);

    if (!hasVisited) {
      localStorage.setItem(storageKey, new Date().toISOString());

      api.post(`/analytics/shop/${storeSlug}/visit`).catch(() => {
        localStorage.removeItem(storageKey);
      });
    }
  }, [storeSlug, user]);

  const handleOrderWhatsApp = async (e: FormEvent) => {
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
      <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 text-slate-200">
        <div className="text-center max-w-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <PackageX className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Produit introuvable</h2>
            <p className="text-xs text-slate-450 mt-1.5">Ce produit n'existe plus ou a été retiré du catalogue.</p>
          </div>
          {storeSlug && (
            <button
              onClick={() => navigate(`/shop/${storeSlug}`)}
              className="inline-flex items-center gap-2 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
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
    <div className="min-h-screen bg-ink-950 text-slate-200 pb-10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="hairline-grid pointer-events-none absolute inset-0 h-[400px] w-full [mask-image:radial-gradient(50%_40%_at_50%_0%,#000,transparent)] opacity-40" />

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-ink-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-lg transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(`/shop/${storeSlug}`)}
          className="flex items-center gap-1.5 bg-whatsapp/15 border border-whatsapp/20 hover:bg-whatsapp/25 text-whatsapp text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Visiter la boutique</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10 pt-4">
        {/* Photo produit */}
        <div className="relative h-64 sm:h-80 bg-slate-950 rounded-3xl overflow-hidden border border-slate-850">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end gap-2.5 z-10">
            <div className="min-w-0">
              <span className="inline-block bg-whatsapp text-ink-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                {CATEGORY_LABELS[product.category]}
              </span>
              <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">{product.title}</h1>
            </div>
            <div className="text-right bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
              <span className="text-[10px] text-slate-450 block uppercase font-semibold">Prix</span>
              <span className="text-base sm:text-lg font-bold text-whatsapp">
                {formatCurrency(product.priceSelling)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Boutique badge */}
          <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-850 rounded-2xl p-4 backdrop-blur-md">
            <img
              src={vendeur.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=100&auto=format&fit=crop'}
              alt={vendeur.storeName}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-whatsapp/20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{vendeur.storeName}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {vendeur.neighborhood}, {vendeur.city}
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-whatsapp shrink-0" />
          </div>

          {!product.isAvailable && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <PackageX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-300">Produit en rupture de stock</p>
                <p className="text-xs text-rose-300/70 mt-1">
                  Veuillez contacter la boutique pour connaître la disponibilité.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href={`https://wa.me/${vendeur.whatsappBusinessNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${vendeur.storeName}, le produit "${product.title}" est-il bientôt disponible ?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-whatsapp hover:bg-[#2ee071] text-ink-950 text-xs font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Contacter sur WhatsApp</span>
                </a>
                <button
                  onClick={() => navigate(`/shop/${storeSlug}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Visiter la boutique</span>
                </button>
              </div>
            </div>
          )}

          {product.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-905 p-4 rounded-2xl border border-slate-800/80">
              {product.description}
            </p>
          )}

          {/* Formulaire commande */}
          <form onSubmit={handleOrderWhatsApp} className="space-y-4">
            <div className="border-t border-slate-800/60 pt-4">
              <h3 className="text-xs font-bold text-whatsapp uppercase tracking-wider flex items-center gap-1.5 mb-4 font-mono">
                <Sparkles className="w-4 h-4" /> Vos Coordonnées pour la Livraison
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-350 mb-1.5">Nom & Prénom *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text" required placeholder="ex: Amina Bella" value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-whatsapp focus:ring-1 focus:ring-whatsapp/25 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-350 mb-1.5">Numéro WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-whatsapp absolute left-3 top-3.5" />
                    <input
                      type="tel" required placeholder="+237 6XX XX XX XX" value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-whatsapp focus:ring-1 focus:ring-whatsapp/25 rounded-xl pl-9 pr-3 py-3 text-sm text-white font-mono placeholder-slate-650 outline-none transition"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-350 mb-1.5">Quartier & Ville *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                    <input
                      type="text" required placeholder="ex: Bastos, Yaoundé" value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-whatsapp focus:ring-1 focus:ring-whatsapp/25 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-350 mb-1.5">Quantité *</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-white px-3">{quantity}</span>
                    <button
                      type="button" onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-350 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-400" /> Mode de Livraison
              </label>
              <select
                value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-whatsapp focus:ring-1 focus:ring-whatsapp/25 rounded-xl px-3.5 py-3 text-sm text-white outline-none transition cursor-pointer"
              >
                {DELIVERY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">Total :</span>
                <span className="text-xl font-display font-semibold text-white">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-whatsapp font-bold">
                <ShieldCheck className="w-4 h-4" /> Paiement à la livraison
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !product.isAvailable}
              className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-emerald-950/60 cursor-pointer active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>
                {isSubmitting ? 'Envoi...' : !product.isAvailable ? 'Produit indisponible' : 'Commander via WhatsApp'}
              </span>
            </button>
          </form>

          {/* Bouton visiter la boutique (bas de page, secondaire) */}
          <button
            onClick={() => navigate(`/shop/${storeSlug}`)}
            className="w-full flex items-center justify-center gap-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 text-slate-300 font-bold text-xs py-3 rounded-2xl transition cursor-pointer"
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