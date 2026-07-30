import { useEffect, useState } from 'react';
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

export const FinancesPage = () => {
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
    <div className="p-2 sm:p-4 space-y-5 pb-10">
      <div className="card-border rounded-3xl p-5 shadow-panel backdrop-blur-xl relative overflow-hidden">
        <div className="dotted-grid absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <h1 className="text-lg sm:text-xl font-display font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5.5 h-5.5 text-whatsapp" /> Bilan & Finances
          </h1>
          <p className="text-xs text-slate-400">Votre bénéfice net réel, calculé automatiquement</p>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-850 mt-3 overflow-x-auto">
            <Calendar className="w-4 h-4 text-slate-500 ml-1.5 shrink-0" />
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition duration-200 whitespace-nowrap cursor-pointer ${
                  period === p.value
                    ? 'bg-whatsapp text-ink-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartes clés */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-border rounded-3xl p-4 sm:p-5 shadow-panel backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wider font-mono">Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight">{formatCurrency(totalCA)}</div>
        </div>

        <div className="card-border rounded-3xl p-4 sm:p-5 shadow-panel backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-mono">Coût Grossiste</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-sky-305 tracking-tight">-{formatCurrency(totalWholesale)}</div>
        </div>

        <div className="card-border rounded-3xl p-4 sm:p-5 shadow-panel backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold text-amber-450 uppercase tracking-wider font-mono">Frais Livraison</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-450 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-amber-305 tracking-tight">-{formatCurrency(totalDeliveryFees)}</div>
        </div>

        <div className="bg-gradient-to-br from-whatsapp/10 via-ink-900/60 to-ink-900 border-2 border-whatsapp/40 rounded-3xl p-4 sm:p-5 shadow-panel">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold text-whatsapp uppercase tracking-wider flex items-center gap-1 font-mono">
              <Wallet className="w-3.5 h-3.5" /> Net Poche
            </span>
            <span className="text-[9px] bg-whatsapp/20 text-whatsapp font-bold px-2 py-0.5 rounded-full border border-whatsapp/30 shrink-0 font-mono">
              +{profitMarginPercent}%
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-whatsapp tracking-tight">+{formatCurrency(netProfitInPocket)}</div>
        </div>
      </div>

      {/* Barre de répartition */}
      <div className="card-border rounded-3xl p-5 shadow-panel backdrop-blur-xl space-y-4">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono">
          <PieChart className="w-4.5 h-4.5 text-whatsapp" /> Répartition du Chiffre d'Affaires
        </h3>

        <div className="h-6 w-full bg-slate-950/80 rounded-xl overflow-hidden flex border border-slate-855">
          <div
            style={{ width: `${totalCA > 0 ? (totalWholesale / totalCA) * 100 : 0}%` }}
            className="bg-sky-500 transition-all duration-300"
            title={`Grossiste: ${formatCurrency(totalWholesale)}`}
          />
          <div
            style={{ width: `${totalCA > 0 ? (totalDeliveryFees / totalCA) * 100 : 0}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Livraison: ${formatCurrency(totalDeliveryFees)}`}
          />
          <div
            style={{ width: `${totalCA > 0 ? (netProfitInPocket / totalCA) * 100 : 0}%` }}
            className="bg-whatsapp transition-all duration-300"
            title={`Bénéfice Net: ${formatCurrency(netProfitInPocket)}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sky-500" /> Grossiste</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Livraison</span>
          <span className="flex items-center gap-1.5 font-bold text-whatsapp"><span className="w-2.5 h-2.5 rounded bg-whatsapp" /> Net</span>
        </div>
      </div>

      {/* Historique */}
      <div className="card-border rounded-3xl p-5 shadow-panel backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Historique des Ventes Livrées</h4>
          <button
            onClick={handleExportCsv}
            disabled={ledger.length === 0}
            className="flex items-center gap-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-205 text-[11px] font-bold px-3 py-2 rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-whatsapp" /> CSV
          </button>
        </div>

        {ledger.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Aucune vente livrée sur cette période.</p>
        ) : (
          <div className="space-y-3">
            {ledger.map((entry) => (
              <div key={entry.id} className="bg-slate-950/70 border border-slate-850 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-inner">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-450">#{entry.orderNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate mt-1">{entry.productTitle}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{entry.customerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">{formatCurrency(entry.totalAmount)}</p>
                  <p className="text-xs font-bold text-whatsapp mt-0.5">+{formatCurrency(entry.netProfit)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="card-border rounded-3xl p-5 shadow-panel backdrop-blur-xl space-y-4">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono">
          <ShieldCheck className="w-4.5 h-4.5 text-whatsapp" /> Conseils de Gestion
        </h3>
        <div className="bg-slate-955/60 p-4 rounded-2xl border border-slate-850 space-y-1.5 shadow-inner">
          <div className="font-bold text-white text-xs">💡 Intégrez la livraison dans le prix</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Si vous offrez souvent la livraison, augmentez légèrement le prix de vente pour préserver votre marge.
          </p>
        </div>
        <div className="bg-slate-955/60 p-4 rounded-2xl border border-slate-850 space-y-1.5 shadow-inner">
          <div className="font-bold text-white text-xs">📦 Négociez auprès de votre grossiste</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vous avez réalisé {data.deliveredOrdersCount} vente(s) livrée(s) sur cette période. Un bon argument pour négocier des tarifs de gros.
          </p>
        </div>
      </div>
    </div>
  );
};