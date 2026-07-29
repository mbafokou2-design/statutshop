import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { LogoutModal } from '../ui/LogoutModal';
import {
  ShieldAlert, BarChart2, Store, Truck, Eye, Menu, X, LogOut, Lock
} from 'lucide-react';

const navItems = [
  { path: '/admin', icon: BarChart2, label: "Vue d'ensemble" },
  { path: '/admin/shops', icon: Store, label: 'Boutiques' },
  { path: '/admin/delivery-partners', icon: Truck, label: 'Livreurs' },
  { path: '/admin/traffic', icon: Eye, label: 'Trafic du site' },
];

export const AdminLayout: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      navigate('/auth');
    }
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              isActive
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Super Admin</p>
            <p className="text-[10px] text-slate-500">{user?.phone}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavLinks />
        </nav>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </aside>

      {/* Sidebar mobile (overlay) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col h-full">
            <div className="flex items-center justify-between px-2 py-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-white">Super Admin</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              <NavLinks />
            </nav>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
          <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        {/* Top bar mobile */}
        <div className="lg:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-300 bg-slate-800 rounded-lg">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-black text-white">Super Admin</span>
          </div>
          <div className="w-8" />
        </div>

        <Outlet />
      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} isLoggingOut={isLoggingOut} />
    </div>
  );
};