import { useAuth } from '../context/AuthContext';

export const DashboardPlaceholder = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">🎉 Connexion réussie</h1>
        <p className="text-slate-400 text-sm">
          Bienvenue, {user?.storeName || 'Vendeur'} ({user?.phone})
        </p>
      </div>
    </div>
  );
};