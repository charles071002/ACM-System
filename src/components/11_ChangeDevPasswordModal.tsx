import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { devChangePasswordViaApi } from '../lib/api';

interface ChangeDevPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ChangeDevPasswordModal: React.FC<ChangeDevPasswordModalProps> = ({ onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('ALL FIELDS ARE REQUIRED');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      setConfirmPassword('');
      return;
    }

    try {
      const ok = await devChangePasswordViaApi('developer', currentPassword, newPassword);
      if (!ok) {
        setError('FAILED TO CHANGE PASSWORD');
        return;
      }
      onSuccess();
    } catch {
      setError('DATABASE CONNECTION FAILED');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border-4 border-yellow-500">
        <div className="bg-blue-900 p-8 flex flex-col items-center text-white text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-yellow-500/70 hover:text-yellow-400">
            <X size={28} />
          </button>

          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white/20">
            <Lock size={32} className="text-blue-900" />
          </div>

          <h3 className="text-xl font-black tracking-tight text-yellow-400 uppercase">Change Password</h3>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest pl-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                autoFocus
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••"
                className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-6 text-sm font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest pl-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••"
                className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-6 text-sm font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest pl-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••"
                className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-6 text-sm font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner"
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] flex items-center justify-center gap-2 font-black">
                <AlertCircle size={14} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 ${
                !currentPassword || !newPassword || !confirmPassword
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-900 text-yellow-400 hover:bg-blue-800 active:scale-95 border-b-4 border-yellow-600'
              }`}
            >
              <CheckCircle2 size={20} />
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeDevPasswordModal;

