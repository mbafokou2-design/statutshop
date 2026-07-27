import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientStorefront } from './ClientStorefront';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';
import { ToastContainer } from '../../components/ToastContainer';
import type { ToastMessage } from '../../components/ToastContainer';
import type { Product, StoreSettings } from '../../types';
import { fetchPublicStore, submitPublicOrder } from '../../services/publicShop.service';

export const PublicStorePage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
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

  useEffect(() => { load(); }, [storeSlug]);

  if (status === 'loading') return <LoadingSpinner label="Chargement de la boutique..." />;
  if (status === 'error') return <OfflineState onRetry={load} />;
  if (status === 'notfound' || !vendeur) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
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
              productId: product.id, customerName: clientName, customerPhone: clientPhone,
              deliveryAddress: address, quantity,
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