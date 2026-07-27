import React, { useState } from 'react';
import { X, Lock, Save } from 'lucide-react';
import { changePassword } from '../../services/settings.service';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasExistingPassword: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen, onClose, hasExistingPassword, onSuccess, onError,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onError('Les mots de passe ne correspondent pas');
      return;
    }
    setIsSaving(true);
    try {
      await changePassword(hasExistingPassword ? currentPassword : undefined, newPassword);
      onSuccess('Mot de passe mis à jour');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      onError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Changer le mot de passe
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {hasExistingPassword && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe actuel</label>
              <input
                type="password" required value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nouveau mot de passe</label>
            <input
              type="password" required minLength={6} value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password" required minLength={6} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          <button
            type="submit" disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition disabled:opacity-60 mt-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Mettre à jour'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};