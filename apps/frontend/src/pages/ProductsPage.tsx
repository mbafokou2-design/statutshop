import React, { useEffect, useState } from 'react';
import { ProductCatalog } from '../components/products/ProductCatalog';
import { ToastContainer, type ToastMessage } from '../components/ToastContainer';
import type { Product } from '../types';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProductApi, 
  type ProductFormData 
} from '../services/product.service';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch {
      pushToast('error', 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      const product = await createProduct(data);
      setProducts((prev) => [product, ...prev]);
      pushToast('success', 'Produit ajouté avec succès');
    } catch (err: any) {
      pushToast('error', err.response?.data?.error || "Erreur lors de l'ajout");
    }
  };

  const handleEditProduct = async (data: ProductFormData, id: string) => {
    try {
      const product = await updateProduct(id, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
      pushToast('success', 'Produit modifié');
    } catch (err: any) {
      pushToast('error', err.response?.data?.error || 'Erreur lors de la modification');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    try {
      await deleteProductApi(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      pushToast('success', 'Produit supprimé');
    } catch {
      pushToast('error', 'Erreur lors de la suppression');
    }
  };

  const handleToggleAvailability = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    try {
      const updated = await updateProduct(id, { isAvailable: !product.isAvailable });
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      pushToast('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleToggleHide = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    try {
      const updated = await updateProduct(id, { isActive: !product.isActive });
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      pushToast('error', 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Chargement de vos produits..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-3 sm:p-6">
      <ProductCatalog
        products={products}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleAvailability={handleToggleAvailability}
        onToggleHide={handleToggleHide}
      />
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
};