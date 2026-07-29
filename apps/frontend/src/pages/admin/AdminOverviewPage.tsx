import React, { useEffect, useState } from 'react';
import type { AdminOverviewStats } from '../../types';
import { fetchAdminOverview } from '../../services/admin.service';
import { formatCurrency } from '../../utils';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';
import { Eye, Store, ShoppingBag, DollarSign, Truck, ShieldCheck } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  const load = async () => {
    setStatus('loading');
    try {
      setStats(await fetchAdminOverview());
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  if (status === 'loading') return <LoadingSpinner label="Chargement des statistiques..." />;
  if (status === 'error' || !stats) return <OfflineState onRetry={load} />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-white">Vue d'ensemble</h1>
        <p className="text-xs text-slate-400 mt-0.5">Supervision globale de la plateforme StatutShop</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Boutiques</span>
            <Store className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{stats.totalShops}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">{stats.activeShops} actives</span>
          {stats.suspendedShops > 0 && (
            <span className="text-[10px] text-amber-400 font-semibold block">{stats.suspendedShops} suspendue(s)</span>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Commandes</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{stats.totalOrders}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Volume plateforme</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base font-black text-emerald-400 font-mono">{formatCurrency(stats.totalRevenue)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Livreurs</span>
            <Truck className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{stats.totalDeliveryPartners}</span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> {stats.certifiedDeliveryPartners} certifiés
          </span>
        </div>

        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-indigo-300">Visites Totales</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{stats.totalVisits ?? 0}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Vues boutiques
          </span>
        </div>
      </div>
    </div>
  );
};