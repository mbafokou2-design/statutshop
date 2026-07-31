import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Product, ProductCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import type { ProductFormData } from '../../services/product.service';
import { formatCurrency } from '../../utils';
import { X, Save, Sparkles, ImagePlus } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (data: ProductFormData, editId?: string) => Promise<void> | void;
  editingProduct?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  editingProduct,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceSelling, setPriceSelling] = useState<number>(15000);
  const [priceWholesale, setPriceWholesale] = useState<number>(8000);
  const [stockQty, setStockQty] = useState<number>(10);
  const [category, setCategory] = useState<ProductCategory>('VETEMENTS');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setDescription(editingProduct.description || '');
      setPriceSelling(editingProduct.priceSelling);
      setPriceWholesale(editingProduct.priceWholesale);
      setStockQty(editingProduct.stockQty);
      setCategory(editingProduct.category);
      setIsAvailable(editingProduct.isAvailable);
      setPreviewUrl(editingProduct.imageUrl);
      setImageFile(null);
    } else {
      setTitle('');
      setDescription('');
      setPriceSelling(15000);
      setPriceWholesale(8000);
      setStockQty(10);
      setCategory('VETEMENTS');
      setIsAvailable(true);
      setImageFile(null);
      setPreviewUrl(null);
    }
  }, [editingProduct, isOpen]);

  // Lock body scroll using position fixed while modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calculatedMargin = priceSelling - priceWholesale;
  const marginPercentage = priceWholesale > 0 ? Math.round((calculatedMargin / priceWholesale) * 100) : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSaveProduct(
        {
          title,
          description: description || '',
          category,
          priceSelling: Number(priceSelling),
          priceWholesale: Number(priceWholesale),
          stockQty: Number(stockQty),
          isAvailable,
          imageFile,
        },
        editingProduct ? editingProduct.id : undefined
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        style={{ touchAction: 'pan-y' }}
        className="relative bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl max-h-[88dvh] sm:max-h-[92dvh] overflow-y-auto overscroll-contain sm:my-8"
      >

        {/* Sticky header — works inside overflow-y-auto without flex-col */}
        <div className="sticky top-0 z-10 bg-slate-900 px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
            </h3>
            <p className="text-[11px] text-slate-400">Marge calculée automatiquement</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Photo du produit</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-emerald-500/50 shrink-0 bg-slate-950 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="text-xs bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl px-3 py-2.5 text-slate-300 text-center transition">
                  Choisir une photo depuis le téléphone
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du produit *</label>
            <input
              type="text"
              required
              placeholder="ex: Robe de soirée satinée..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Prix de Vente *</label>
              <div className="relative">
                <input
                  type="number" required min="0"
                  value={priceSelling}
                  onChange={(e) => setPriceSelling(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none pr-12"
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 font-bold">FCFA</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-sky-400 mb-1">Prix Grossiste *</label>
              <div className="relative">
                <input
                  type="number" required min="0"
                  value={priceWholesale}
                  onChange={(e) => setPriceWholesale(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none pr-12"
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 font-bold">FCFA</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quantité en stock</label>
            <input
              type="number" required min="0"
              value={stockQty}
              onChange={(e) => setStockQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Marge par unité :</span>
              <span className="text-emerald-300 font-black text-sm">+{formatCurrency(calculatedMargin)}</span>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px] font-bold">
              +{marginPercentage}%
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Tailles, couleurs disponibles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-slate-300">Statut :</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className={`text-xs font-semibold ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isAvailable ? 'En Stock' : 'Rupture'}
              </span>
              <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="sr-only" />
              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${isAvailable ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-400 hover:text-white transition">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-950 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement...' : editingProduct ? 'Enregistrer' : 'Ajouter au Catalogue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};