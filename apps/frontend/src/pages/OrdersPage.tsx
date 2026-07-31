import { useEffect, useState } from 'react';
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
    PENDING: { icon: Clock, label: 'En attente', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
    CONFIRMED: { icon: CheckCircle2, label: 'Confirmée', cls: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
    DELIVERED: { icon: CheckCircle2, label: 'Livrée', cls: 'bg-whatsapp/15 text-whatsapp border-whatsapp/20' },
    CANCELLED: { icon: XCircle, label: 'Annulée', cls: 'bg-rose-500/10 text-rose-455 border-rose-500/20' },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 font-mono ${map.cls}`}>
      <Icon className="w-3 h-3" /> {map.label}
    </span>
  );
}

export const OrdersPage = () => {
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

  // Lock body scroll using position fixed when the order detail modal is open
  useEffect(() => {
    if (selectedOrder) {
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
  }, [selectedOrder]);

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
    <div className="p-2 sm:p-4 space-y-5 pb-10">
      <div className="card-border rounded-3xl p-5 shadow-panel backdrop-blur-xl relative overflow-hidden">
        <div className="dotted-grid absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <h1 className="text-lg sm:text-xl font-display font-semibold text-white flex items-center gap-2">
            <ShoppingBag className="w-5.5 h-5.5 text-whatsapp" /> Commandes
          </h1>
          <p className="text-xs text-slate-400">Suivez et mettez à jour vos commandes clients</p>

          <div className="flex items-center gap-2.5 mt-3 text-[11px]">
            <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-305 font-medium font-mono">
              En attente: <span className="font-bold text-white">{pendingCount}</span>
            </div>
            <div className="bg-whatsapp/10 border border-whatsapp/20 px-3 py-1.5 rounded-xl text-whatsapp font-medium font-mono">
              Livrées: <span className="font-bold text-white">{deliveredCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-505 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Nom client, produit, adresse..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-850 focus:border-whatsapp focus:ring-1 focus:ring-whatsapp/25 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
              activeTab === tab.value
                ? 'bg-whatsapp text-ink-950 shadow-md font-bold'
                : 'bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-650 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Aucune commande trouvée</h3>
          <p className="text-xs text-slate-500">Aucune commande ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const firstItem = order.items[0];
            const totalWholesale = order.items.reduce((sum, i) => sum + i.quantity * Number(i.product.priceWholesale), 0);
            const netProfit = Number(order.totalAmount) - totalWholesale;
            const orderNumber = order.id.slice(0, 8).toUpperCase();
            const createdDate = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={order.id} className="card-border rounded-3xl p-4 sm:p-5 space-y-4 shadow-panel backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <img
                    src={firstItem?.product.imageUrl || 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=100&auto=format&fit=crop'}
                    alt={firstItem?.product.title}
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-405">#{orderNumber}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {firstItem?.product.title}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{createdDate}</p>
                  </div>
                </div>

                <div className="bg-slate-950/65 p-3 rounded-2xl border border-slate-850 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-205">
                    <span className="font-bold">👤 {order.customerName}</span>
                    <button
                      onClick={() => handleWhatsApp(order)}
                      className="flex items-center gap-1 text-whatsapp font-mono font-bold hover:underline cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                    </button>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-450 shrink-0" /> {order.deliveryAddress}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total / Profit</span>
                    <span className="text-base font-bold text-white">
                      {formatCurrency(Number(order.totalAmount))}
                      <span className="text-xs text-whatsapp font-bold ml-1.5">(+{formatCurrency(netProfit)})</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleWhatsApp(order)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-whatsapp/10 hover:bg-whatsapp/20 border border-whatsapp/20 text-whatsapp py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 px-3 py-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Détails
                  </button>
                </div>

                {order.status === 'PENDING' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-60 active:translate-y-px"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirmer
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900/60 hover:bg-rose-950/40 border border-rose-900/20 text-rose-405 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-60 active:translate-y-px"
                    >
                      <XCircle className="w-4 h-4" /> Annuler
                    </button>
                  </div>
                )}

                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                    disabled={updatingId === order.id}
                    className="w-full flex items-center justify-center gap-1.5 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-60 active:translate-y-px"
                  >
                    <Truck className="w-4 h-4" /> Marquer comme livrée
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

{/* Modal détails */}
{selectedOrder && (
  <div
    onClick={() => setSelectedOrder(null)}
    className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-950/85 backdrop-blur-md animate-fade-in"
  >
    <div
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
      className="card-border rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-panel max-h-[85dvh] sm:max-h-[90dvh] overflow-y-auto overscroll-contain relative animate-slide-up sm:animate-none"
    >
      <div className="dotted-grid absolute inset-0 opacity-10 pointer-events-none" />

      {/* petite poignée visuelle pour indiquer que c'est un bottom sheet (mobile only) */}
      <div className="sm:hidden flex justify-center pt-2.5 pb-1">
        <div className="w-10 h-1 rounded-full bg-slate-700" />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/80 px-5 py-4 bg-ink-900/95 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white">
          Commande #{selectedOrder.id.slice(0, 8).toUpperCase()}
        </h3>
        <button
          onClick={() => setSelectedOrder(null)}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-3.5 relative z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {selectedOrder.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <img src={item.product.imageUrl || 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=100&auto=format&fit=crop'} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <div className="font-bold text-white">{item.product.title}</div>
              <div className="text-slate-405 mt-0.5">Quantité: {item.quantity} × {formatCurrency(Number(item.unitPrice))}</div>
            </div>
          </div>
        ))}

        <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
          <div className="text-[10px] font-bold text-whatsapp uppercase tracking-wider font-mono">Informations Client</div>
          <div className="text-slate-205">Nom: <strong className="text-white">{selectedOrder.customerName}</strong></div>
          <div className="text-slate-205">Téléphone: <strong className="text-white">{selectedOrder.customerPhone}</strong></div>
          {selectedOrder.deliveryAddress && (
            <div className="text-slate-205">Adresse: <strong className="text-white">{selectedOrder.deliveryAddress}</strong></div>
          )}
        </div>

        <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
          <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider font-mono">Récapitulatif Financier</div>
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
          <div className="border-t border-slate-800/80 pt-2.5 flex justify-between text-sm font-bold text-whatsapp">
            <span>Bénéfice Net:</span>
            <span>
              +{formatCurrency(Number(selectedOrder.totalAmount) - selectedOrder.items.reduce((s, i) => s + i.quantity * Number(i.product.priceWholesale), 0))}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSelectedOrder(null)}
          className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 rounded-xl text-xs cursor-pointer duration-200"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
)}

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
};