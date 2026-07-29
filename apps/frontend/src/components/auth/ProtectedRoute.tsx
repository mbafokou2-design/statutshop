import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isRestoring } = useAuth();

  if (isRestoring) return <LoadingSpinner label="Vérification de la session..." />;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isRestoring } = useAuth();

  if (isRestoring) return <LoadingSpinner label="Vérification de la session..." />;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};