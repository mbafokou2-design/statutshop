import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientStorefront } from './ClientStorefront';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';
import { ToastContainer } from '../../components/ToastContainer';
import type { ToastMessage } from '../../components/ToastContainer';
import type { Product, StoreSettings } from '../../types';
import { fetchPublicStore, submitPublicOrder } from '../../services/publicShop.service';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

import { updateMetaTags } from '../../utils';

export const PublicStorePage = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { user } = useAuth();
  const [vendeur, setVendeur] = useState<StoreSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error' | 'notfound'>('loading');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = async () => {
    if (!storeSlug) return;
    setStatus('loading');
    try {
      const data = await fetchPublicStore(storeSlug);
      setVendeur(data.vendeur);
      setProducts(data.products);
      setStatus('ok');
    } catch (err: any) {
      if (err.response?.status === 404) setStatus('notfound');
      else setStatus('error');
    }
  };

  useEffect(() => { 
    load(); 
  }, [storeSlug]);

  // Définir dynamiquement les balises Meta SEO / Open Graph (Aperçu WhatsApp & Telegram)
  useEffect(() => {
    if (vendeur) {
      updateMetaTags({
        title: `${vendeur.storeName} • Boutique StatutShop`,
        description: vendeur.description || `Découvrez les produits de ${vendeur.storeName} et commandez directement sur WhatsApp.`,
        image: vendeur.logoUrl || vendeur.coverUrl,
        url: window.location.href,
      });
    }
  }, [vendeur]);

// Enregistrement de la visite avec filtres anti-spam
  useEffect(() => {
    if (!storeSlug) return;

    // 1. Ne pas compter si le propriétaire consulte sa propre boutique
    if (user && user.storeSlug === storeSlug) {
      return;
    }

    // 2. Vérification LocalStorage
    const storageKey = `visited_shop_${storeSlug}`;
    const hasVisited = localStorage.getItem(storageKey);

    if (!hasVisited) {
      // ⚠️ DÉFINIR IMMÉDIATEMENT le localStorage (Synchrone) pour bloquer le 2ème execution de React StrictMode
      localStorage.setItem(storageKey, new Date().toISOString());

      api.post(`/analytics/shop/${storeSlug}/visit`).catch(() => {
        // En cas d'erreur de réseau, on libère le localStorage
        localStorage.removeItem(storageKey);
      });
    }
  }, [storeSlug, user]);

  if (status === 'loading') return <LoadingSpinner label="Chargement de la boutique..." />;
  if (status === 'error') return <OfflineState onRetry={load} />;
  if (status === 'notfound' || !vendeur) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
        <p className="text-slate-400 text-sm">Boutique introuvable.</p>
      </div>
    );
  }

  return (
    <>
      <ClientStorefront
        storeSettings={vendeur}
        products={products}
        onNewOrderFromClient={async (product, clientName, clientPhone, address, quantity) => {
          try {
            await submitPublicOrder(storeSlug!, {
              productId: product.id, 
              customerName: clientName, 
              customerPhone: clientPhone,
              deliveryAddress: address, 
              quantity,
            });
            pushToast('success', 'Commande enregistrée !');
          } catch {
            pushToast('error', "Erreur lors de l'enregistrement de la commande");
          }
        }}
      />
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </>
  );
};