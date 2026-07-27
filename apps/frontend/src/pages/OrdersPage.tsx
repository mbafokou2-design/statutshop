import React, { useEffect, useState } from 'react';
import type { OrderDisplay, BackendOrderStatus } from '../types';
import { fetchOrders, updateOrderStatus } from '../services/order.service';
import { formatCurrency } from '../utils';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { OfflineState } from '../components/ui/OfflineState';
import { ToastContainer } from '../components/ToastContainer';
import type { ToastMessage } from '../components/ToastContainer';
import {
  ShoppingBag, Search, MessageSquare, Phone, MapPin,
  CheckCircle2, XCircle, Clock, X, Truck
} from 'lucide-react';

const STATUS_TABS: { value: BackendOrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'DELIVERED', label: 'Livrées' },
  { value: 'CANCELLED', label: 'Annulées' },
];

function StatusBadge({ status }: { status: BackendOrderStatus }) {
  const map = {
    PENDING: { icon: Clock, label: 'En attente', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    CONFIRMED: { icon: CheckCircle2, label: 'Confirmée', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    DELIVERED: { icon: CheckCircle2, label: 'Livrée', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    CANCELLED: { icon: XCircle, label: 'Annulée', cls: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${map.cls}`}>
      <Icon className="w-3 h-3" /> {map.label}
    </span>
  );
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [activeTab, setActiveTab] = useState<BackendOrderStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDisplay | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = async () => {
    setStatus('loading');
    try {
      const data = await fetchOrders();
      setOrders(data);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: BackendOrderStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      pushToast('success', 'Statut mis à jour');
      setSelectedOrder(null);
    } catch (err: any) {
      pushToast('error', err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWhatsApp = (order: OrderDisplay) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const productName = order.items[0]?.product.title || 'votre commande';
    const message = `Bonjour ${order.customerName}, concernant votre commande de "${productName}"...`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = activeTab === 'ALL' || o.status === activeTab;
    const search = searchTerm.toLowerCase();
    const productName = o.items[0]?.product.title.toLowerCase() || '';
    const matchesSearch =
      o.customerName.toLowerCase().includes(search) ||
      productName.includes(search) ||
      (o.deliveryAddress || '').toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  if (status === 'loading') return <LoadingSpinner label="Chargement des commandes..." />;
  if (status === 'error') return <OfflineState onRetry={load} />;

  return (
    <div className="p-3 sm:p-6 space-y-4 pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" /> Commandes
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Suivez et mettez à jour vos commandes clients</p>

        <div className="flex items-center gap-2 mt-3 text-[11px]">
          <div className="bg-amber-950/40 border border-amber-800/40 px-2.5 py-1.5 rounded-lg text-amber-300 font-medium">
            En attente: <span className="font-bold text-white">{pendingCount}</span>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg text-emerald-300 font-medium">
            Livrées: <span className="font-bold text-white">{deliveredCount}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Nom client, produit, adresse..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === tab.value ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Aucune commande trouvée</h3>
          <p className="text-xs text-slate-400">Aucune commande ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const firstItem = order.items[0];
            const totalWholesale = order.items.reduce((sum, i) => sum + i.quantity * Number(i.product.priceWholesale), 0);
            const netProfit = Number(order.totalAmount) - totalWholesale;
            const orderNumber = order.id.slice(0, 8).toUpperCase();
            const createdDate = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={firstItem?.product.imageUrl || 'https://placehold.co/100x100/1e293b/64748b?text=📦'}
                    alt={firstItem?.product.title}
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-400">#{orderNumber}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {firstItem?.product.title}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{createdDate}</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">👤 {order.customerName}</span>
                    <button onClick={() => handleWhatsApp(order)} className="flex items-center gap-1 text-emerald-400 font-mono">
                      <Phone className="w-3 h-3" /> {order.customerPhone}
                    </button>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" /> {order.deliveryAddress}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total / Profit</span>
                    <span className="text-sm font-black text-white">
                      {formatCurrency(Number(order.totalAmount))}
                      <span className="text-[11px] text-emerald-400 font-bold ml-1.5">(+{formatCurrency(netProfit)})</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleWhatsApp(order)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                  >
                    Détails
                  </button>
                </div>

                {order.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-xl text-xs transition disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmer
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-rose-900/40 text-rose-400 font-medium py-2 rounded-xl text-xs transition disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Annuler
                    </button>
                  </div>
                )}

                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                    disabled={updatingId === order.id}
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-60"
                  >
                    <Truck className="w-3.5 h-3.5" /> Marquer comme livrée
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal détails */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Commande #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <img src={item.product.imageUrl || 'https://placehold.co/100x100'} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-white">{item.product.title}</div>
                    <div className="text-slate-400">Quantité: {item.quantity} × {formatCurrency(Number(item.unitPrice))}</div>
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-emerald-400 uppercase">Informations Client</div>
                <div className="text-slate-200">Nom: <strong className="text-white">{selectedOrder.customerName}</strong></div>
                <div className="text-slate-200">Téléphone: <strong className="text-white">{selectedOrder.customerPhone}</strong></div>
                {selectedOrder.deliveryAddress && (
                  <div className="text-slate-200">Adresse: <strong className="text-white">{selectedOrder.deliveryAddress}</strong></div>
                )}
              </div>

              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-sky-400 uppercase">Récapitulatif Financier</div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Client:</span>
                  <span className="font-bold text-white">{formatCurrency(Number(selectedOrder.totalAmount))}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Coût Grossiste:</span>
                  <span className="font-mono">
                    {formatCurrency(selectedOrder.items.reduce((s, i) => s + i.quantity * Number(i.product.priceWholesale), 0))}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-emerald-400">
                  <span>Bénéfice Net:</span>
                  <span>
                    +{formatCurrency(Number(selectedOrder.totalAmount) - selectedOrder.items.reduce((s, i) => s + i.quantity * Number(i.product.priceWholesale), 0))}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
};