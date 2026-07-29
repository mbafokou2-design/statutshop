import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isRestoring: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    console.log('🔄 checkAuth démarré, token local:', localStorage.getItem('token'));
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('❌ Pas de token trouvé');
      setUser(null);
      setIsRestoring(false);
      return;
    }

    try {
      console.log('📡 Envoi de la requête /auth/me...');
      const response = await api.get('/auth/me');
      console.log('✅ Auth/me succès:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error('❌ Erreur auth/me:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsRestoring(false);
    }
  };

  checkAuth();
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isRestoring }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}