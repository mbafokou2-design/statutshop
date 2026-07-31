import React, { useEffect, useState } from 'react';
import {
  Truck, Search, Star, CheckCircle, XCircle, RefreshCw,
  MessageSquare, Clock, UserCheck, Users, Bell, Eye, X,
  FileText, ShieldCheck, MapPin, Bike, Car, Footprints, Camera
} from 'lucide-react';
import { api } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OfflineState } from '../../components/ui/OfflineState';

interface AdminDeliveryPartner {
  id: string;
  fullName: string;
  phone: string;
  whatsappNum: string;
  avatarUrl?: string | null;
  cniPhotoUrl?: string | null;
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
  avatarUrl?: string | null;
  cniPhotoUrl?: string | null;
  city: string;
  coveredZones: string[];
  vehicleType: string;
  basePrice: string | null;
  cniNumber: string;
  motivation: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

type Tab = 'candidates' | 'partners';

export const AdminDeliveryPartnersPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('candidates');
  const [partners, setPartners] = useState<AdminDeliveryPartner[]>([]);
  const [candidates, setCandidates] = useState<DeliveryCandidate[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState<DeliveryCandidate | null>(null);
  const [rejectingCandidate, setRejectingCandidate] = useState<DeliveryCandidate | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [fullImageViewUrl, setFullImageViewUrl] = useState<string | null>(null);

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

  const handleApproveCandidate = async (candidate: DeliveryCandidate) => {
    try {
      const res = await api.put(`/delivery-candidates/${candidate.id}/status`, { status: 'APPROVED' });
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? { ...c, status: res.data.candidate.status } : c))
      );
      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
      }

      // Re-fetch partners list to reflect auto-creation
      const pRes = await api.get('/admin/delivery-partners');
      setPartners(pRes.data.partners || []);

      // Auto-trigger WhatsApp notification for approval
      sendApprovalWhatsApp(candidate);
    } catch (err) {
      console.error('Erreur approbation candidature:', err);
    }
  };

  const handleRejectCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCandidate) return;

    try {
      const res = await api.put(`/delivery-candidates/${rejectingCandidate.id}/status`, { status: 'REJECTED' });
      setCandidates((prev) =>
        prev.map((c) => (c.id === rejectingCandidate.id ? { ...c, status: res.data.candidate.status } : c))
      );
      if (selectedCandidate?.id === rejectingCandidate.id) {
        setSelectedCandidate((prev) => (prev ? { ...prev, status: 'REJECTED' } : null));
      }

      // Send rejection WhatsApp message with reason
      sendRejectionWhatsApp(rejectingCandidate, cancellationReason);

      setRejectingCandidate(null);
      setCancellationReason('');
    } catch (err) {
      console.error('Erreur rejet candidature:', err);
    }
  };

  // WhatsApp helper - Approval
  const sendApprovalWhatsApp = (candidate: DeliveryCandidate) => {
    const cleanNum = (candidate.whatsappNum || candidate.phone).replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${candidate.fullName} ! 🎉\n\nFélicitations ! Votre candidature pour devenir Livreur Partenaire StatutShop a été APPROUVÉE et CERTIFIÉE par notre équipe.\n\nBienvenue dans notre réseau ! Vous pouvez dès à présent recevoir des demandes de livraison dans votre zone d'activité (${candidate.city}).\n\nL'équipe StatutShop 🚀`
    );
    window.open(`https://wa.me/${cleanNum}?text=${message}`, '_blank');
  };

  // WhatsApp helper - Rejection / Cancellation with reason
  const sendRejectionWhatsApp = (candidate: DeliveryCandidate, reason: string) => {
    const cleanNum = (candidate.whatsappNum || candidate.phone).replace(/[^0-9]/g, '');
    const reasonText = reason.trim() ? `\n\nMotif : ${reason}` : '';
    const message = encodeURIComponent(
      `Bonjour ${candidate.fullName}.\n\nNous avons examiné votre dossier de candidature StatutShop. Malheureusement, votre demande a été refusée/annulée.${reasonText}\n\nN'hésitez pas à corriger vos pièces justificatives et soumettre à nouveau votre candidature.\n\nCordialement,\nL'équipe StatutShop`
    );
    window.open(`https://wa.me/${cleanNum}?text=${message}`, '_blank');
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.cniNumber.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPartners = partners.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = candidates.filter((c) => c.status === 'PENDING').length;

  if (status === 'loading') return <LoadingSpinner label="Chargement des livreurs..." />;
  if (status === 'error') return <OfflineState onRetry={fetchAll} />;

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'MOTO': return <Bike className="w-4 h-4 text-amber-400" />;
      case 'CAR': return <Car className="w-4 h-4 text-blue-400" />;
      case 'BICYCLE': return <Bike className="w-4 h-4 text-emerald-400" />;
      case 'WALKING': return <Footprints className="w-4 h-4 text-purple-400" />;
      default: return <Truck className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Gestion des Livreurs</h1>
            <p className="text-xs text-slate-400">
              {partners.length} partenaire{partners.length > 1 ? 's' : ''} actif{partners.length > 1 ? 's' : ''}
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Bell className="w-3 h-3" />
                  {pendingCount} candidature{pendingCount > 1 ? 's' : ''} en attente
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          className="p-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setTab('candidates')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition ${
            tab === 'candidates' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Candidatures ({candidates.length})
          {pendingCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab === 'candidates' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('partners')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition ${
            tab === 'partners' ? 'bg-emerald-600 text-white shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Partenaires actifs ({partners.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, ville ou CNI…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* ===================== ONGLET CANDIDATURES (CARDS VIEW) ===================== */}
      {tab === 'candidates' && (
        <div>
          {filteredCandidates.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">Aucune candidature trouvée</p>
              <p className="text-xs text-slate-600 mt-1">Les candidatures des livreurs apparaîtront ici</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((c) => (
                <div
                  key={c.id}
                  className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between space-y-4 transition hover:border-slate-700 relative overflow-hidden ${
                    c.status === 'PENDING'
                      ? 'border-amber-500/30 shadow-lg shadow-amber-950/20'
                      : c.status === 'APPROVED'
                      ? 'border-emerald-500/30'
                      : 'border-slate-800 opacity-75'
                  }`}
                >
                  <div>
                    {/* Header profile row */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div
                        onClick={() => c.avatarUrl && setFullImageViewUrl(c.avatarUrl)}
                        className={`w-14 h-14 rounded-2xl bg-slate-950 border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer ${
                          c.avatarUrl ? 'border-amber-500/40 hover:scale-105 transition' : 'border-slate-800'
                        }`}
                      >
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-6 h-6 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-black text-white truncate">{c.fullName}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              c.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : c.status === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {c.status === 'PENDING' && <><Clock className="w-3 h-3" /> En attente</>}
                            {c.status === 'APPROVED' && <><CheckCircle className="w-3 h-3" /> Approuvé</>}
                            {c.status === 'REJECTED' && <><XCircle className="w-3 h-3" /> Refusé</>}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {c.city}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone}</p>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
                        {getVehicleIcon(c.vehicleType)}
                        <div>
                          <p className="text-[10px] text-slate-500 font-medium">Véhicule</p>
                          <p className="text-xs font-bold text-white">{c.vehicleType}</p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <p className="text-[10px] text-slate-500 font-medium">CNI N°</p>
                        <p className="text-xs font-bold text-slate-200 font-mono truncate">{c.cniNumber}</p>
                      </div>
                    </div>

                    {/* Zones */}
                    {c.coveredZones && c.coveredZones.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {c.coveredZones.map((z) => (
                          <span key={z} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                            {z}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      {/* View Modal button */}
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        Voir la fiche
                      </button>

                      {/* WhatsApp direct contact */}
                      <button
                        onClick={() => sendApprovalWhatsApp(c)}
                        title="Contacter sur WhatsApp"
                        className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Approve / Reject buttons */}
                    {c.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveCandidate(c)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Approuver & Certifier
                        </button>
                        <button
                          onClick={() => setRejectingCandidate(c)}
                          className="p-2 rounded-xl text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 transition"
                          title="Refuser avec motif"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== ONGLET PARTENAIRES ACTIFS ===================== */}
      {tab === 'partners' && (
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
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
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
                            {partner.avatarUrl ? (
                              <img src={partner.avatarUrl} alt={partner.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <Truck className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-xs">{partner.fullName}</p>
                            <p className="text-slate-500 text-[10px] font-mono">{partner.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{partner.city}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-bold">{partner.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{partner.totalDeliveries}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            partner.isVerified
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {partner.isVerified ? (
                            <><CheckCircle className="w-3 h-3" /> Certifié</>
                          ) : (
                            <><Clock className="w-3 h-3" /> En attente</>
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

      {/* ===================== MODAL DETAIL CANDIDAT ===================== */}
      {selectedCandidate && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div style={{ touchAction: 'pan-y' }} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl space-y-5 max-h-[85dvh] sm:max-h-[90dvh] overflow-y-auto overscroll-contain">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white">Dossier Candidat</h2>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Primary info */}
            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div
                onClick={() => selectedCandidate.avatarUrl && setFullImageViewUrl(selectedCandidate.avatarUrl)}
                className="w-16 h-16 rounded-2xl bg-slate-900 border border-amber-500/30 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                {selectedCandidate.avatarUrl ? (
                  <img src={selectedCandidate.avatarUrl} alt={selectedCandidate.fullName} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-7 h-7 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-white">{selectedCandidate.fullName}</h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5">{selectedCandidate.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCandidate.city}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedCandidate.status === 'PENDING'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : selectedCandidate.status === 'APPROVED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {selectedCandidate.status}
              </span>
            </div>

            {/* Details breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500 mb-1">Véhicule</p>
                <p className="text-white font-bold">{selectedCandidate.vehicleType}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500 mb-1">Numéro CNI</p>
                <p className="text-white font-bold font-mono">{selectedCandidate.cniNumber}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500 mb-1">Prix de base</p>
                <p className="text-white font-bold">{selectedCandidate.basePrice || 'Non spécifié'}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-slate-500 mb-1">Date candidature</p>
                <p className="text-slate-300 font-medium">
                  {new Date(selectedCandidate.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* CNI Document Photo Preview */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-300">Document CNI téléversé :</p>
              {selectedCandidate.cniPhotoUrl ? (
                <div
                  onClick={() => setFullImageViewUrl(selectedCandidate.cniPhotoUrl!)}
                  className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48 cursor-pointer hover:border-amber-500/50 transition group"
                >
                  <img src={selectedCandidate.cniPhotoUrl} alt="CNI Document" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                    Cliquez pour agrandir
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
                  Aucune photo CNI téléversée
                </div>
              )}
            </div>

            {/* Motivation */}
            {selectedCandidate.motivation && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">Motivation / Expérience :</p>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 italic leading-relaxed">
                  "{selectedCandidate.motivation}"
                </p>
              </div>
            )}

            {/* Actions in Modal */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => sendApprovalWhatsApp(selectedCandidate)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                Contacter WhatsApp
              </button>

              {selectedCandidate.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApproveCandidate(selectedCandidate)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                  >
                    Approuver & Certifier
                  </button>
                  <button
                    onClick={() => setRejectingCandidate(selectedCandidate)}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition"
                  >
                    Refuser
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL REJET / ANNULATION MOTIF ===================== */}
      {rejectingCandidate && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div style={{ touchAction: 'pan-y' }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl space-y-4 max-h-[85dvh] sm:max-h-[90dvh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Annuler / Refuser la candidature</h3>
              <button
                onClick={() => setRejectingCandidate(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Veuillez indiquer le motif du refus pour <strong className="text-white">{rejectingCandidate.fullName}</strong>. Ce motif lui sera transmis automatiquement sur WhatsApp.
            </p>

            <form onSubmit={handleRejectCandidateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motif de l'annulation *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="ex: Document CNI illisible, zone non couverte actuellement…"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingCandidate(null)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>Confirmer & Envoyer WhatsApp</span>
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL AGRANDISSEMENT IMAGE ===================== */}
      {fullImageViewUrl && (
        <div
          onClick={() => setFullImageViewUrl(null)}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85dvh] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <img src={fullImageViewUrl} alt="Aperçu grand format" className="w-full h-full object-contain" />
            <button
              onClick={() => setFullImageViewUrl(null)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
