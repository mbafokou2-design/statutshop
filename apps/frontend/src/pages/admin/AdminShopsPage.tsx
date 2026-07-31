import React, { useEffect, useState } from 'react';
import type { AdminShop } from '../../types';
import { fetchAllShops, updateShopStatus, deleteShop } from '../../services/admin.service';
import { formatCurrency } from '../../utils';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';
import { ToastContainer } from '../../components/ToastContainer';
import type { ToastMessage } from '../../components/ToastContainer';
import {
  Store, Search, MapPin, Ban, CheckCircle, Trash2, AlertTriangle, Eye, Mail, Phone
} from 'lucide-react';

export const AdminShopsPage: React.FC = () => {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [shopToDelete, setShopToDelete] = useState<AdminShop | null>(null);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = async () => {
    setStatus('loading');
    try {
      setShops(await fetchAllShops());
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  const filteredShops = shops.filter((s) =>
    s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleStatus = async (shop: AdminShop) => {
    try {
      const updated = await updateShopStatus(shop.id, !shop.isActive);
      setShops((prev) => prev.map((s) => (s.id === shop.id ? updated : s)));
      pushToast('success', updated.isActive ? 'Boutique réactivée' : 'Boutique suspendue');
    } catch {
      pushToast('error', 'Erreur lors de la mise à jour');
    }
  };

  const confirmDelete = async () => {
    if (!shopToDelete) return;
    try {
      await deleteShop(shopToDelete.id);
      setShops((prev) => prev.filter((s) => s.id !== shopToDelete.id));
      pushToast('success', 'Boutique supprimée');
    } catch {
      pushToast('error', 'Erreur lors de la suppression');
    } finally {
      setShopToDelete(null);
    }
  };

  if (status === 'loading') return <LoadingSpinner label="Chargement des boutiques..." />;
  if (status === 'error') return <OfflineState onRetry={load} />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-rose-400" /> Boutiques & Vendeurs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{shops.length} boutique(s) enregistrée(s)</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom de boutique, téléphone ou e-mail..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {filteredShops.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <Store className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">Aucune boutique trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((shop) => (
            <div key={shop.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{shop.storeName}</h3>
                  <div className="space-y-0.5 mt-1">
                    <p className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-whatsapp shrink-0" /> {shop.phone}
                    </p>
                    {shop.email && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono truncate">
                        <Mail className="w-3 h-3 text-sky-400 shrink-0" /> {shop.email}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" /> {shop.city || 'Non spécifiée'}{shop.neighborhood ? `, ${shop.neighborhood}` : ''}
                    </p>
                  </div>
                </div>
                {shop.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                    <Ban className="w-3 h-3" /> Suspendue
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Visites</span>
                  <span className="font-bold text-indigo-400 font-mono flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-indigo-400" />
                    {shop.visitCount ?? 0}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Commandes</span>
                  <span className="font-bold text-white font-mono">{shop.ordersCount}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">C.A</span>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">{formatCurrency(shop.totalRevenue)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {shop.isActive ? (
                  <button
                    onClick={() => handleToggleStatus(shop)}
                    className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspendre
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(shop)}
                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Réactiver
                  </button>
                )}
                <button
                  onClick={() => setShopToDelete(shop)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {shopToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600/80 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 w-fit">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-white">Supprimer cette boutique ?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vous allez supprimer définitivement <span className="font-bold text-rose-400">"{shopToDelete.storeName}"</span>. Cette action efface son catalogue et son historique. Irréversible.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShopToDelete(null)} className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-xl">
                Annuler
              </button>
              <button onClick={confirmDelete} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl">
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
};