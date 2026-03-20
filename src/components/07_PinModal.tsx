import React, { useState } from 'react';
import { Professor } from '../types';
import { INITIAL_PIN } from '../constants';
import { StorageService } from '../lib/storage';
import { X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface PinModalProps {
  professor: Professor;
  onVerify: () => void;
  onClose: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ professor, onVerify, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = StorageService.getPin(professor.id, INITIAL_PIN);
    if (pin === storedPin) {
      setError(false);
      onVerify();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border-4 border-yellow-500">
        <div className="bg-blue-900 p-10 flex flex-col items-center text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-yellow-500/70 hover:text-yellow-400"
          >
            <X size={28} />
          </button>

          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white/20">
            <Lock size={36} className="text-blue-900" />
          </div>

          <h3 className="text-2xl font-black tracking-tight text-yellow-400">SECURE ACCESS</h3>
          <p className="text-sm font-bold opacity-80 mt-1 uppercase tracking-widest">{professor.name}</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-black text-blue-900 uppercase tracking-widest text-center">
                Enter 6-Digit PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                autoFocus
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="••••••"
                className={`w-full bg-gray-50 border-4 ${error ? 'border-red-500' : 'border-blue-50'} rounded-3xl py-6 text-center text-4xl font-black tracking-[0.8em] text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner`}
              />
              {error && (
                <p className="text-red-500 text-xs mt-2 flex items-center justify-center gap-2 font-black">
                  <AlertCircle size={16} />
                  INVALID PIN CODE
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pin.length < 6}
              className={`w-full py-5 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${pin.length < 6 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-900 text-yellow-400 hover:bg-blue-800 active:scale-95 border-b-4 border-yellow-600'}`}
            >
              <CheckCircle2 size={24} />
              Verify
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-8 italic font-bold">Please check with Admin if forgotten.</p>
        </div>
      </div>
    </div>
  );
};

export default PinModal;

