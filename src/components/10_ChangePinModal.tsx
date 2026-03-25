import React, { useState } from 'react';
import { updateProfessorPinViaApi } from '../lib/api';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChangePinModalProps {
  profId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePinModal: React.FC<ChangePinModalProps> = ({ profId, onClose, onSuccess }) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(newPin)) {
      setError('PIN MUST BE EXACTLY 6 DIGITS');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PIN CODES DO NOT MATCH');
      setConfirmPin('');
      return;
    }

    try {
      const updated = await updateProfessorPinViaApi(profId, newPin);
      if (!updated) {
        setError('FAILED TO UPDATE PIN IN DATABASE');
        return;
      }
    } catch {
      setError('DATABASE CONNECTION FAILED');
      return;
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up border-4 border-yellow-500">
        <div className="bg-blue-900 p-6 sm:p-8 flex flex-col items-center text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-yellow-500/70 hover:text-yellow-400"
          >
            <X size={28} />
          </button>

          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white/20">
            <ShieldCheck size={32} className="text-blue-900" />
          </div>

          <h3 className="text-xl font-black tracking-tight text-yellow-400 uppercase">Update Pin Code</h3>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest text-center">
                New PIN Code
              </label>
              <input
                type="password"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={newPin}
                autoFocus
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  setNewPin(digitsOnly);
                  setError(null);
                }}
                placeholder="••••••"
                className="w-full bg-gray-50 border-2 border-blue-50 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.6em] text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest text-center">
                Re-enter PIN Code
              </label>
              <input
                type="password"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={confirmPin}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  setConfirmPin(digitsOnly);
                  setError(null);
                }}
                placeholder="••••••"
                className="w-full bg-gray-50 border-2 border-blue-50 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.6em] text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner"
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
              disabled={newPin.length < 6 || confirmPin.length < 6}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 ${
                newPin.length < 6 || confirmPin.length < 6
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-900 text-yellow-400 hover:bg-blue-800 active:scale-95 border-b-4 border-yellow-600'
              }`}
            >
              <CheckCircle2 size={20} />
              Update PIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePinModal;

