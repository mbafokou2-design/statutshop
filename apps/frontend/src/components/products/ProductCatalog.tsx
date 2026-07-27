import React, { useState } from 'react';
import type { Product } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { formatCurrency } from '../../utils';
import type { ProductFormData } from '../../services/product.service';
import { AddProductModal } from './AddProductModal';
import { useAuth } from '../../context/AuthContext';
import {
  Package, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  CheckCircle2, XCircle, Link2, Check
} from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  onAddProduct: (data: ProductFormData) => Promise<void> | void;
  onEditProduct: (data: ProductFormData, id: string) => Promise<void> | void;
  onDeleteProduct: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onToggleHide: (id: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products, onAddProduct, onEditProduct, onDeleteProduct, onToggleAvailability, onToggleHide,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Toutes', ...Object.values(CATEGORY_LABELS)];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Toutes' || CATEGORY_LABELS[p.category] === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => { setEditingProduct(null); setIsAddModalOpen(true); };
  const handleOpenEdit = (p: Product) => { setEditingProduct(p); setIsAddModalOpen(true); };

  const handleSaveModal = async (data: ProductFormData, editId?: string) => {
    if (editId) await onEditProduct(data, editId);
    else await onAddProduct(data);
  };

  const handleCopyLink = async (product: Product) => {
    if (!user?.storeSlug) return;
    const link = `${window.location.origin}/shop/${user.storeSlug}/product/${product.slug}`;
    const message = `🛍️ *${product.title}*\n💰 ${formatCurrency(product.priceSelling)}\n\n👉 Commandez ici : ${link}`;

    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(product.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback silencieux si clipboard indisponible
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Mes Produits
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{products.length} article(s) dans votre boutique</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl transition shadow-lg shadow-emerald-950"
        >
          <Plus className="w-4 h-4" /> <span>Ajouter un Produit</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Aucun produit trouvé</h3>
          <button onClick={handleOpenAdd} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition mt-2">
            <Plus className="w-4 h-4" /> Ajouter un Produit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const unitMargin = product.priceSelling - product.priceWholesale;
            return (
              <div
                key={product.id}
                className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition ${
                  !product.isActive ? 'opacity-60 bg-slate-950/40' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={product.imageUrl || 'https://placehold.co/100x100/1e293b/64748b?text=Photo'}
                      alt={product.title}
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-white text-xs sm:text-sm leading-tight truncate">{product.title}</h4>
                        {!product.isActive && (
                          <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                            Masqué
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{CATEGORY_LABELS[product.category]}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Prix Client</span>
                      <span className="font-bold text-white font-mono">{formatCurrency(product.priceSelling)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Stock</span>
                      <span className="font-mono">{product.stockQty} unité(s)</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-300 font-medium">Marge Net</span>
                      <span className="font-bold text-emerald-400 font-mono">+{formatCurrency(unitMargin)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyLink(product)}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition border ${
                    copiedId === product.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
                  }`}
                >
                  {copiedId === product.id ? (
                    <><Check className="w-3.5 h-3.5" /><span>Lien copié !</span></>
                  ) : (
                    <><Link2 className="w-3.5 h-3.5" /><span>Copier le lien pour statut WhatsApp</span></>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onToggleAvailability(product.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                      product.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {product.isAvailable ? <><CheckCircle2 className="w-3.5 h-3.5" /> Disponible</> : <><XCircle className="w-3.5 h-3.5" /> Rupture</>}
                  </button>

                  <div className="flex items-center gap-1">
                    <button onClick={() => onToggleHide(product.id)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                      {!product.isActive ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleOpenEdit(product)} className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSaveProduct={handleSaveModal} editingProduct={editingProduct} />
    </div>
  );
};