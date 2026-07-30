import { useState } from 'react';
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

export const ClientStorefront = ({ storeSettings, products, onNewOrderFromClient }: ClientStorefrontProps) => {
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
    <div className="min-h-screen bg-ink-950 text-slate-200 pb-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="hairline-grid pointer-events-none absolute inset-0 h-[400px] w-full [mask-image:radial-gradient(50%_40%_at_50%_0%,#000,transparent)] opacity-40" />

      <div className="relative h-44 sm:h-64 w-full bg-slate-950 overflow-hidden">
        <img
          src={storeSettings.coverUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop'}
          alt={storeSettings.storeName}
          className="w-full h-full object-cover opacity-40 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 -mt-16 sm:-mt-24 relative z-10 space-y-6">
        <div className="card-border rounded-3xl p-5 sm:p-7 shadow-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <img
              src={storeSettings.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=200&auto=format&fit=crop'}
              alt={storeSettings.storeName}
              className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-whatsapp/20 shadow-lg shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-display font-semibold text-white tracking-tight truncate">
                  {storeSettings.storeName}
                </h1>
                <ShieldCheck className="w-5 h-5 text-whatsapp shrink-0" />
              </div>
              {(storeSettings.neighborhood || storeSettings.city) && (
                <p className="text-xs text-slate-350 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {[storeSettings.neighborhood, storeSettings.city].filter(Boolean).join(', ')}
                </p>
              )}
              {storeSettings.description && (
                <p className="text-xs text-slate-400 mt-1.5 max-w-xl line-clamp-2 leading-relaxed">
                  {storeSettings.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleOpenDirectWhatsAppStore}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-950/60 shrink-0 cursor-pointer active:translate-y-px"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discuter sur WhatsApp</span>
          </button>
        </div>

        <div className="flex flex-col gap-3.5 pt-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800/80 focus:border-whatsapp focus:ring-1 focus:ring-whatsapp/25 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-whatsapp text-ink-950 shadow-md font-bold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Aucun article trouvé</h3>
            <p className="text-xs text-slate-500">Essayez une autre catégorie ou recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 pt-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-700/70 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg transition-all duration-205 flex flex-col justify-between"
              >
                <div className="relative h-32 sm:h-56 bg-slate-950 overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-103"
                  />
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Rupture
                      </span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-slate-950/80 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                </div>

                <div className="p-3 sm:p-4.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                      {product.title}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-whatsapp">
                      {formatCurrency(product.priceSelling)}
                    </span>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      disabled={!product.isAvailable}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition duration-200 shadow-md shrink-0 cursor-pointer ${
                        product.isAvailable
                          ? 'bg-whatsapp hover:bg-[#2ee071] text-ink-950 shadow-emerald-950/40 active:translate-y-px'
                          : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                      }`}
                    >
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