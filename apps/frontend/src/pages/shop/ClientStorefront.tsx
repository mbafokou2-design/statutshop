import React, { useState } from 'react';
import type { Product, StoreSettings } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { formatCurrency } from '../../utils';
import { ProductDetailModal } from './ProductDetailModal';
import { MessageSquare, Search, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react';

interface ClientStorefrontProps {
  storeSettings: StoreSettings;
  products: Product[];
  onNewOrderFromClient: (
    product: Product, clientName: string, clientPhone: string,
    address: string, quantity: number, deliveryOption: string
  ) => Promise<void>;
}

export const ClientStorefront: React.FC<ClientStorefrontProps> = ({ storeSettings, products, onNewOrderFromClient }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['Toutes', ...Array.from(new Set(products.map((p) => CATEGORY_LABELS[p.category])))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'Toutes' || CATEGORY_LABELS[p.category] === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenDirectWhatsAppStore = () => {
    const cleanPhone = storeSettings.whatsappBusinessNum?.replace(/[^0-9]/g, '') || '';
    const text = `Bonjour *${storeSettings.storeName}* ! Je visite votre boutique en ligne et souhaite me renseigner sur vos articles.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="relative h-40 sm:h-64 w-full bg-slate-900 overflow-hidden">
        <img src={storeSettings.coverUrl || 'https://placehold.co/1200x400/0f172a/334155?text=StatutShop'} alt={storeSettings.storeName} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 -mt-14 sm:-mt-20 relative z-10 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={storeSettings.logoUrl || 'https://placehold.co/200x200/059669/ffffff?text=Logo'} alt={storeSettings.storeName}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-500/40 shadow-xl shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-2xl font-black text-white tracking-tight truncate">{storeSettings.storeName}</h1>
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              </div>
              {(storeSettings.neighborhood || storeSettings.city) && (
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {[storeSettings.neighborhood, storeSettings.city].filter(Boolean).join(', ')}
                </p>
              )}
              {storeSettings.description && (
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">{storeSettings.description}</p>
              )}
            </div>
          </div>

          <button onClick={handleOpenDirectWhatsAppStore}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-950 shrink-0">
            <MessageSquare className="w-4 h-4" />
            <span>Discuter sur WhatsApp</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input type="text" placeholder="Rechercher un produit..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  selectedCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Aucun article trouvé</h3>
            <p className="text-xs text-slate-400">Essayez une autre catégorie ou recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg transition-all flex flex-col justify-between">
                <div className="relative h-32 sm:h-56 bg-slate-950 overflow-hidden">
                  <img src={product.imageUrl || 'https://placehold.co/400x400/1e293b/64748b?text=Photo'} alt={product.title} className="w-full h-full object-cover" />
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full">Rupture</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-slate-950/80 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                </div>

                <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">{product.title}</h3>
                    {product.description && <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{product.description}</p>}
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-black text-emerald-400">{formatCurrency(product.priceSelling)}</span>
                    <button onClick={() => setSelectedProduct(product)} disabled={!product.isAvailable}
                      className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] font-bold transition shadow-md shrink-0 ${
                        product.isAvailable ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Commander</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        storeSettings={storeSettings}
        onOrderSubmitted={async (clientName, clientPhone, address, quantity, deliveryOption) => {
          if (selectedProduct) {
            await onNewOrderFromClient(selectedProduct, clientName, clientPhone, address, quantity, deliveryOption);
          }
        }}
      />
    </div>
  );
};