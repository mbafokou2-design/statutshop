import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, Wallet, Store, ArrowRight, Eye, TrendingUp } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const shortcuts = [
    {
      path: '/dashboard/products',
      icon: Package,
      label: 'Mes Produits',
      desc: 'Gérer votre catalogue',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
    },
    {
      path: '/dashboard/orders',
      icon: ShoppingBag,
      label: 'Commandes',
      desc: 'Suivre vos ventes',
      bg: 'bg-sky-500/20',
      text: 'text-sky-400',
    },
    {
      path: '/dashboard/finance',
      icon: Wallet,
      label: 'Finances',
      desc: 'Votre marge nette',
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
    },
  ];

  const shopLink = user?.storeSlug ? `/shop/${user.storeSlug}` : '#';

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-white">
          Bonjour, {user?.storeName?.split(' ')[0] || 'Vendeur'} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Voici un aperçu de votre boutique</p>
      </div>

      {/* Carte Lumineuse du Nombre de Visiteurs */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-lg shadow-indigo-950/50">
        {/* Glow effet d'arrière-plan */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">
                Visites Totales
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            
            <div className="flex items-baseline gap-3">
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {(user as any)?.visitCount ?? 0}
              </p>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> En direct
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nombre de personnes ayant consulté votre vitrine
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Lien boutique publique */}
      <a
        href={shopLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between bg-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4 hover:bg-emerald-600/20 transition group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Voir ma boutique publique</p>
            <p className="text-[11px] text-emerald-300/80 truncate">/shop/{user?.storeSlug}</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 group-hover:translate-x-1 transition-transform" />
      </a>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{s.label}</p>
                <p className="text-[11px] text-slate-400">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};