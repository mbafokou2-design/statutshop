import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, Wallet, Store, ArrowRight, Eye, TrendingUp } from 'lucide-react';

export const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const shortcuts = [
    {
      path: '/dashboard/products',
      icon: Package,
      label: 'Mes Produits',
      desc: 'Gérer votre catalogue',
      bg: 'bg-whatsapp/15',
      text: 'text-whatsapp',
    },
    {
      path: '/dashboard/orders',
      icon: ShoppingBag,
      label: 'Commandes',
      desc: 'Suivre vos ventes',
      bg: 'bg-sky-500/15',
      text: 'text-sky-400',
    },
    {
      path: '/dashboard/finance',
      icon: Wallet,
      label: 'Finances',
      desc: 'Votre marge nette',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
    },
  ];

  const shopLink = user?.storeSlug ? `/shop/${user.storeSlug}` : '#';

  return (
    <div className="p-2 sm:p-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
          Bonjour, {user?.storeName?.split(' ')[0] || 'Vendeur'} 👋
        </h1>
        <p className="text-xs text-slate-400">Voici un aperçu de votre boutique</p>
      </div>

      {/* Carte Lumineuse du Nombre de Visiteurs */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-ink-900/60 to-ink-900 border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-panel backdrop-blur-xl">
        {/* Glow effet d'arrière-plan */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-whatsapp/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase font-mono">
                Visites Totales
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whatsapp opacity-70"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-whatsapp"></span>
              </span>
            </div>
            
            <div className="flex items-baseline gap-3">
              <p className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                {(user as any)?.visitCount ?? 0}
              </p>
              <span className="text-[11px] font-bold text-whatsapp bg-whatsapp/10 px-2 py-0.5 rounded-full border border-whatsapp/20 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" /> En direct
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Nombre de personnes ayant consulté votre vitrine
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-405 flex items-center justify-center shrink-0 shadow-inner">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Lien boutique publique */}
      <a
        href={shopLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between bg-whatsapp/5 border border-whatsapp/20 hover:bg-whatsapp/10 rounded-3xl p-5 shadow-panel transition duration-200 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-whatsapp/15 text-whatsapp flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">Lien direct de ma boutique StatutShop sur WhatsApp</p>
            <p className="text-xs text-whatsapp/80 font-mono truncate mt-0.5">/shop/{user?.storeSlug}</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-whatsapp shrink-0 group-hover:translate-x-1 transition-transform" />
      </a>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className="flex items-center gap-4.5 card-border hover:border-slate-700/80 hover:bg-slate-900/45 rounded-3xl p-5 text-left transition duration-200 cursor-pointer shadow-panel backdrop-blur-xl"
            >
              <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">{s.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};