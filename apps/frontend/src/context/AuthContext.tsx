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
    const restoreSession = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsRestoring(false);
      }
    };
    restoreSession();
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