import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { LogoutModal } from '../ui/LogoutModal';
import { OfflineState } from '../ui/OfflineState';
import { Home, Package, ShoppingBag, Wallet, Settings, LogOut } from 'lucide-react';

function getInitials(name?: string): string {
  if (!name) return '??';
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

export const DashboardLayout: React.FC = () => {
  const { user, setUser } = useAuth();
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

  // Vérification en cours -> spinner plein écran
  if (isOnline === null) {
    return <LoadingSpinner label="Connexion à StatutShop..." />;
  }

  // Backend injoignable -> état hors ligne avec bouton réessayer
  if (isOnline === false) {
    return <OfflineState onRetry={retry} isRetrying={isChecking} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20 sm:pb-0">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 ring-2 ring-emerald-500/30">
              {getInitials(user?.storeName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.storeName || 'Ma Boutique'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.phone}</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-800/70 rounded-lg transition shrink-0"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <nav className="hidden sm:flex max-w-5xl mx-auto px-4 gap-1 border-t border-slate-800/60">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  isActive ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto">
        <Outlet />
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
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