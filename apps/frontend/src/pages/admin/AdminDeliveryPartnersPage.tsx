import React, { useEffect, useState } from 'react';
import { Truck, Search, Star, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

interface AdminDeliveryPartner {
  id: string;
  fullName: string;
  phone: string;
  whatsappNum: string;
  city: string;
  coveredZones: string[];
  vehicleType: string;
  basePrice: string | null;
  rating: number;
  totalDeliveries: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export const AdminDeliveryPartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<AdminDeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/delivery-partners');
      setPartners(res.data.partners || []);
    } catch (err) {
      console.error('Erreur chargement livreurs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleToggleCertification = async (id: string) => {
    try {
      const res = await api.put(`/admin/delivery-partners/${id}/toggle-certification`);
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isVerified: res.data.partner.isVerified } : p))
      );
    } catch (err) {
      console.error('Erreur toggle certification:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce livreur définitivement ?')) return;
    try {
      await api.delete(`/admin/delivery-partners/${id}`);
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erreur suppression livreur:', err);
    }
  };

  const filtered = partners.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Livreurs</h1>
            <p className="text-xs text-slate-400">{partners.length} partenaires enregistrés</p>
          </div>
        </div>
        <button
          onClick={fetchPartners}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Livreur</th>
                  <th className="px-4 py-3 text-left">Ville</th>
                  <th className="px-4 py-3 text-left">Note</th>
                  <th className="px-4 py-3 text-left">Livraisons</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500 text-xs">
                      Aucun livreur trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((partner) => (
                    <tr key={partner.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-semibold text-xs">{partner.fullName}</p>
                          <p className="text-slate-500 text-[10px]">{partner.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{partner.city}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-bold">{partner.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{partner.totalDeliveries}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            partner.isVerified
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {partner.isVerified ? (
                            <><CheckCircle className="w-3 h-3" /> Certifié</>
                          ) : (
                            <><XCircle className="w-3 h-3" /> En attente</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCertification(partner.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                              partner.isVerified
                                ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            }`}
                          >
                            {partner.isVerified ? 'Révoquer' : 'Certifier'}
                          </button>
                          <button
                            onClick={() => handleDelete(partner.id)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
