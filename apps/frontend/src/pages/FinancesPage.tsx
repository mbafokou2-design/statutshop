import React, { useEffect, useState } from 'react';
import type { FinanceSummary, FinancePeriod } from '../types';
import { fetchFinanceSummary } from '../services/finance.service';
import { formatCurrency } from '../utils';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { OfflineState } from '../components/ui/OfflineState';
import {
  TrendingUp, DollarSign, PackageCheck, Truck, Wallet,
  Calendar, PieChart, ShieldCheck, Download
} from 'lucide-react';

const PERIODS: { value: FinancePeriod; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];

export const FinancesPage: React.FC = () => {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  const load = async (p: FinancePeriod) => {
    setStatus('loading');
    try {
      const res = await fetchFinanceSummary(p);
      setData(res);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(period); }, [period]);

  const handleExportCsv = () => {
    if (!data) return;
    const header = 'Commande,Client,Produit,Prix Client,Grossiste,Livraison,Profit Net\n';
    const rows = data.ledger.map((e) =>
      `${e.orderNumber},${e.customerName},"${e.productTitle}",${e.totalAmount},${e.wholesaleCost},${e.deliveryFee},${e.netProfit}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilan-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading' && !data) return <LoadingSpinner label="Calcul de votre bilan..." />;
  if (status === 'error') return <OfflineState onRetry={() => load(period)} />;
  if (!data) return null;

  const { totalCA, totalWholesale, totalDeliveryFees, netProfitInPocket, profitMarginPercent, ledger } = data;

  return (
    <div className="p-3 sm:p-6 space-y-4 pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Bilan & Finances
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Votre bénéfice net réel, calculé automatiquement</p>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mt-3 overflow-x-auto">
          <Calendar className="w-4 h-4 text-slate-500 ml-1.5 shrink-0" />
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                period === p.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes clés */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Chiffre d'Affaires</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-white tracking-tight">{formatCurrency(totalCA)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-sky-400">Coût Grossiste</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-sky-300 tracking-tight">-{formatCurrency(totalWholesale)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-amber-400">Frais Livraison</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-300 tracking-tight">-{formatCurrency(totalDeliveryFees)}</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border-2 border-emerald-500 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1">
              <Wallet className="w-3 h-3 text-emerald-400" /> Net Poche
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
              +{profitMarginPercent}%
            </span>
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">+{formatCurrency(netProfitInPocket)}</div>
        </div>
      </div>

      {/* Barre de répartition */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" /> Répartition du Chiffre d'Affaires
        </h3>

        <div className="h-6 w-full bg-slate-950 rounded-xl overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${totalCA > 0 ? (totalWholesale / totalCA) * 100 : 0}%` }}
            className="bg-sky-500 transition"
            title={`Grossiste: ${formatCurrency(totalWholesale)}`}
          />
          <div
            style={{ width: `${totalCA > 0 ? (totalDeliveryFees / totalCA) * 100 : 0}%` }}
            className="bg-amber-500 transition"
            title={`Livraison: ${formatCurrency(totalDeliveryFees)}`}
          />
          <div
            style={{ width: `${totalCA > 0 ? (netProfitInPocket / totalCA) * 100 : 0}%` }}
            className="bg-emerald-500 transition"
            title={`Bénéfice Net: ${formatCurrency(netProfitInPocket)}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-500" /> Grossiste</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> Livraison</span>
          <span className="flex items-center gap-1 font-bold text-emerald-400"><span className="w-2 h-2 rounded bg-emerald-500" /> Net</span>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white">Historique des Ventes Livrées</h4>
          <button
            onClick={handleExportCsv}
            disabled={ledger.length === 0}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> CSV
          </button>
        </div>

        {ledger.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Aucune vente livrée sur cette période.</p>
        ) : (
          <div className="space-y-2">
            {ledger.map((entry) => (
              <div key={entry.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">#{entry.orderNumber}</span>
                    <span className="text-[10px] text-slate-500">{new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{entry.productTitle}</p>
                  <p className="text-[10px] text-slate-400 truncate">{entry.customerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">{formatCurrency(entry.totalAmount)}</p>
                  <p className="text-[11px] font-bold text-emerald-400">+{formatCurrency(entry.netProfit)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Conseils de Gestion
        </h3>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="font-bold text-white text-[11px]">💡 Intégrez la livraison dans le prix</div>
          <p className="text-[11px] text-slate-400">
            Si vous offrez souvent la livraison, augmentez légèrement le prix de vente pour préserver votre marge.
          </p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="font-bold text-white text-[11px]">📦 Négociez auprès de votre grossiste</div>
          <p className="text-[11px] text-slate-400">
            Vous avez réalisé {data.deliveredOrdersCount} vente(s) livrée(s) sur cette période. Un bon argument pour négocier des tarifs de gros.
          </p>
        </div>
      </div>
    </div>
  );
};