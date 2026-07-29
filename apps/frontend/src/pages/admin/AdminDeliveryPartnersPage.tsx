import React, { useEffect, useState } from 'react';
import {
  Truck, Search, Star, CheckCircle, XCircle, RefreshCw,
  MessageSquare, Clock, UserCheck, Users, Bell
} from 'lucide-react';
import { api } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';

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

interface DeliveryCandidate {
  id: string;
  fullName: string;
  phone: string;
  whatsappNum: string;
  city: string;
  coveredZones: string[];
  vehicleType: string;
  basePrice: string | null;
  cniNumber: string;
  motivation: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

type Tab = 'partners' | 'candidates';

export const AdminDeliveryPartnersPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('candidates');
  const [partners, setPartners] = useState<AdminDeliveryPartner[]>([]);
  const [candidates, setCandidates] = useState<DeliveryCandidate[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setStatus('loading');
    try {
      const [partnerRes, candidateRes] = await Promise.all([
        api.get('/admin/delivery-partners'),
        api.get('/delivery-candidates'),
      ]);
      setPartners(partnerRes.data.partners || []);
      setCandidates(candidateRes.data.candidates || []);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { fetchAll(); }, []);

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

  const handleCandidateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.put(`/delivery-candidates/${id}/status`, { status: newStatus });
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: res.data.candidate.status } : c))
      );
    } catch (err) {
      console.error('Erreur mise à jour candidature:', err);
    }
  };

  // WhatsApp direct contact
  const contactOnWhatsApp = (candidate: DeliveryCandidate) => {
    const cleanNum = (candidate.whatsappNum || candidate.phone).replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${candidate.fullName} ! 👋\n\nNous avons bien reçu votre candidature pour devenir Livreur Partenaire StatutShop.\n\nVotre profil a été examiné avec attention. Nous souhaitons vous inviter à rejoindre notre réseau.\n\nMerci de confirmer votre disponibilité pour un court entretien.\n\nL'équipe StatutShop 🚀`
    );
    window.open(`https://wa.me/${cleanNum}?text=${message}`, '_blank');
  };

  const filteredPartners = partners.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = candidates.filter((c) => c.status === 'PENDING').length;

  if (status === 'loading') return <LoadingSpinner label="Chargement des livreurs..." />;
  if (status === 'error') return <OfflineState onRetry={fetchAll} />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Gestion des Livreurs</h1>
            <p className="text-xs text-slate-400">
              {partners.length} partenaire{partners.length > 1 ? 's' : ''} actif{partners.length > 1 ? 's' : ''}
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-400 font-bold">
                  <Bell className="w-3 h-3" />
                  {pendingCount} candidature{pendingCount > 1 ? 's' : ''} en attente
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setTab('candidates')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
            tab === 'candidates' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Candidatures
          {pendingCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${tab === 'candidates' ? 'bg-slate-950/30 text-slate-950' : 'bg-amber-500/20 text-amber-400'}`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('partners')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
            tab === 'partners' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Partenaires actifs
        </button>
      </div>

      {/* ===================== ONGLET CANDIDATURES ===================== */}
      {tab === 'candidates' && (
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-10 text-center">
              <Truck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">Aucune candidature reçue</p>
              <p className="text-xs text-slate-600 mt-1">Les candidatures des livreurs apparaîtront ici</p>
            </div>
          ) : (
            candidates.map((c) => (
              <div
                key={c.id}
                className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition ${
                  c.status === 'PENDING'
                    ? 'border-amber-500/30 shadow-sm shadow-amber-950/40'
                    : c.status === 'APPROVED'
                    ? 'border-emerald-500/20'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white">{c.fullName}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-400'
                            : c.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {c.status === 'PENDING' && <><Clock className="w-3 h-3" /> En attente</>}
                        {c.status === 'APPROVED' && <><CheckCircle className="w-3 h-3" /> Approuvé</>}
                        {c.status === 'REJECTED' && <><XCircle className="w-3 h-3" /> Refusé</>}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{c.phone} · {c.city}</p>
                  </div>
                  <p className="text-[10px] text-slate-600 shrink-0">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-slate-950 rounded-xl p-2.5">
                    <p className="text-slate-500 mb-0.5">Véhicule</p>
                    <p className="text-white font-bold">{c.vehicleType}</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-2.5">
                    <p className="text-slate-500 mb-0.5">Prix base</p>
                    <p className="text-white font-bold">{c.basePrice || '—'}</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-2.5">
                    <p className="text-slate-500 mb-0.5">CNI</p>
                    <p className="text-white font-bold font-mono truncate">{c.cniNumber}</p>
                  </div>
                </div>

                {/* Zones */}
                {c.coveredZones.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.coveredZones.map((z) => (
                      <span key={z} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{z}</span>
                    ))}
                  </div>
                )}

                {/* Motivation */}
                {c.motivation && (
                  <p className="text-[11px] text-slate-400 bg-slate-950 rounded-xl p-3 leading-relaxed italic">
                    "{c.motivation}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {/* WhatsApp CTA */}
                  <button
                    onClick={() => contactOnWhatsApp(c)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950/50"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Contacter sur WhatsApp
                  </button>

                  {c.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleCandidateStatus(c.id, 'APPROVED')}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCandidateStatus(c.id, 'REJECTED')}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===================== ONGLET PARTENAIRES ===================== */}
      {tab === 'partners' && (
        <div className="space-y-4">
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
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500 text-xs">
                        Aucun livreur trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner) => (
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
        </div>
      )}
    </div>
  );
};
