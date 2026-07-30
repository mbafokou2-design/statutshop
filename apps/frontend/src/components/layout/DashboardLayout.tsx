import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { LogoutModal } from '../ui/LogoutModal';
import { OfflineState } from '../ui/OfflineState';
import { Home, Package, ShoppingBag, Wallet, Settings, LogOut } from 'lucide-react';

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'SB';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Accueil' },
  { path: '/dashboard/products', icon: Package, label: 'Produits' },
  { path: '/dashboard/orders', icon: ShoppingBag, label: 'Commandes' },
  { path: '/dashboard/finance', icon: Wallet, label: 'Finances' },
  { path: '/dashboard/settings', icon: Settings, label: 'Réglages' },
];

export const DashboardLayout = () => {
  const { user, setUser, isRestoring } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, isChecking, retry } = useBackendStatus();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate('/auth');
    }
  };

  if (isRestoring || isOnline === null) {
    return <LoadingSpinner label="Connexion à StatutShop..." />;
  }

  if (isOnline === false) {
    return <OfflineState onRetry={retry} isRetrying={isChecking} />;
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-205 pb-24 sm:pb-0 relative overflow-hidden">
      {/* Background decorations */}
      <div className="hairline-grid pointer-events-none absolute inset-0 h-[450px] w-full [mask-image:radial-gradient(50%_50%_at_50%_0%,#000,transparent)] opacity-40" />

      <header className="sticky top-0 z-40 bg-ink-950/80 backdrop-blur-xl border-b border-slate-800/80 relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-whatsapp/15 text-whatsapp flex items-center justify-center font-black text-sm shrink-0 ring-1 ring-whatsapp/20">
              {getInitials(user?.storeName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-snug">{user?.storeName || 'Ma Boutique'}</p>
              <p className="text-[11px] text-slate-400 truncate leading-none mt-1 font-mono">{user?.phone}</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-lg transition duration-200 shrink-0 cursor-pointer"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <nav className="hidden sm:flex max-w-5xl mx-auto px-4 gap-1 border-t border-slate-800/40">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-200 cursor-pointer ${
                  isActive
                    ? 'border-whatsapp text-whatsapp font-bold'
                    : 'border-transparent text-slate-450 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 relative z-10">
        <Outlet />
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-950/90 backdrop-blur-xl border-t border-slate-800/80 flex items-center justify-around py-3 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition duration-200 cursor-pointer ${
                isActive ? 'text-whatsapp font-bold scale-105' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-5.5 h-5.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
};