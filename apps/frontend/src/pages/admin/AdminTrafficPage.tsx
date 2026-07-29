import React from 'react';
import { Eye, BarChart2, Globe, TrendingUp } from 'lucide-react';

export const AdminTrafficPage: React.FC = () => {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-black text-white">Trafic du site</h1>
          <p className="text-xs text-slate-400">Statistiques de visites et d'audience</p>
        </div>
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Globe, label: 'Visites totales', value: '—', color: 'blue' },
          { icon: TrendingUp, label: 'Sessions actives', value: '—', color: 'emerald' },
          { icon: BarChart2, label: 'Taux de rebond', value: '—', color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Integration notice */}
      <div className="bg-slate-900 border border-slate-700 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center">
        <div className="p-3 bg-slate-800 rounded-2xl">
          <BarChart2 className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-sm font-bold text-slate-300">Intégration Google Analytics à venir</p>
        <p className="text-xs text-slate-500 max-w-xs">
          Connectez votre compte Google Analytics pour visualiser les données de trafic en temps réel
          directement dans ce tableau de bord.
        </p>
      </div>
    </div>
  );
};
