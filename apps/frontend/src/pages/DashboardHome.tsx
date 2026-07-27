import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, Wallet, Store, ArrowRight } from 'lucide-react';

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

      {/* Lien boutique publique */}
      <a
        href={shopLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between bg-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4 hover:bg-emerald-600/20 transition"
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
        <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
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