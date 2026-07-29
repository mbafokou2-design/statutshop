import React, { useEffect, useState } from 'react';
import { Eye, Globe, TrendingUp, Store, ExternalLink, RefreshCw, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchAdminAnalytics } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';

interface AnalyticsData {
  summary: {
    totalVisits: number;
    totalShops: number;
    totalOrders: number;
    activeUsersGA: number | string;
    pageViewsGA: number | string;
    sessionsGA: number | string;
    gaConnected: boolean;
    gaError?: string;
  };
  shopsVisits: {
    id: string;
    storeName: string;
    storeSlug: string;
    city: string;
    visitCount: number;
  }[];
  gaRaw?: any;
}

export const AdminTrafficPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  const loadAnalytics = async () => {
    setStatus('loading');
    try {
      console.log('🔄 Chargement des analytics depuis /api/v1/analytics/admin/analytics...');
      const res = await fetchAdminAnalytics();
      console.log('✅ Analytics reçus avec succès:', res);
      setData(res);
      setStatus('ok');
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des analytics:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      setStatus('error');
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (status === 'loading') return <LoadingSpinner label="Chargement des données de trafic..." />;
  if (status === 'error' || !data) return <OfflineState onRetry={loadAnalytics} />;

  const { summary, shopsVisits } = data;

  // Formatage des données pour le graphique par boutique
  const chartData = shopsVisits.slice(0, 8).map((s) => ({
    name: s.storeName.length > 12 ? `${s.storeName.substring(0, 12)}...` : s.storeName,
    Visites: s.visitCount || 0,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white">Trafic & Audience en direct</h1>
            <p className="text-xs text-slate-400">Statistiques de consultation des boutiques et de Google Analytics</p>
          </div>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* Badge de Statut de Connexion Google Analytics */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
        summary.gaConnected
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}>
        <div className="flex items-center gap-2.5">
          {summary.gaConnected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <p className="font-bold">
              {summary.gaConnected
                ? 'Google Analytics (GA4) connecté avec succès !'
                : 'Connexion Google Analytics (GA4) en attente d\'autorisation'}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {summary.gaConnected
                ? 'La propriété G-91GKL8YM6K et le compte de service sont parfaitement synchronisés.'
                : `Pour lier GA4, ajoutez l'email du compte de service statutshop-analytics-sa-293@statutshop-e1c2a.iam.gserviceaccount.com comme Lecteur (Viewer) dans votre console Google Analytics.`}
            </p>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-indigo-300">Visites Totales BDD</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{summary.totalVisits}</p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Comptabilisées en temps réel
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Boutiques Actives</span>
            <Store className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{summary.totalShops}</p>
          <p className="text-[11px] text-slate-500">Vitrines hébergées</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Vues de Pages GA4</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{summary.pageViewsGA || '0'}</p>
          <p className="text-[11px] text-slate-500">Google Analytics (30 derniers jours)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Utilisateurs Actifs GA4</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{summary.activeUsersGA || '0'}</p>
          <p className="text-[11px] text-slate-500">Visiteurs uniques Google</p>
        </div>
      </div>

      {/* Graphique Interactif Recharts des Visites par Boutique */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Graphique des Vues par Boutique
          </h2>
          <span className="text-xs text-slate-400">Top 8 Boutiques</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Bar dataKey="Visites" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Classement du Trafic par Boutique */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Classement détaillé des Boutiques
          </h2>
          <span className="text-xs text-slate-400">{shopsVisits.length} boutique(s)</span>
        </div>

        {shopsVisits.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Aucune visite enregistrée pour le moment.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {shopsVisits.map((shop, idx) => (
              <div key={shop.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                    idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                    idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{shop.storeName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{shop.city} • /shop/{shop.storeSlug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-black text-indigo-400 font-mono text-sm block">{shop.visitCount}</span>
                    <span className="text-[10px] text-slate-500 uppercase">visite(s)</span>
                  </div>

                  <a
                    href={`/shop/${shop.storeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    title="Voir la boutique"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
