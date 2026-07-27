import React from 'react';
import { MessageCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = true, label = 'Chargement...' }) => {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-emerald-400" fill="currentColor" strokeWidth={0} />
        </div>
      </div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      {content}
    </div>
  );
};