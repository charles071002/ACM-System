import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, ChevronLeft } from 'lucide-react';

interface DevLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const DevLogin: React.FC<DevLoginProps> = ({ onSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  /**
   * Validates the credentials based on strict requirements:
   * 1. Username matches "DEVELOPER" (case-insensitive check for input flexibility)
   * 2. Password accepts alphanumeric input with no fixed length limit
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Authentication check: username is case-insensitive for input, target is 'DEVELOPER'
    // Password target is '111111'
    if (username.toUpperCase() === 'DEVELOPER' && password === '111111') {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  /**
   * Filters password input to only allow letters and numbers
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Regex allows empty string (for deletion) or alphanumeric characters only
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      setPassword(value);
      setError(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white animate-fade-in">
      <main className="flex-1 overflow-y-auto w-full p-6 relative flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl mx-auto relative pt-4 flex flex-col items-center">
          <div className="absolute top-0 left-0 z-20">
            <button
              onClick={onBack}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-blue-900 font-bold"
            >
              <ChevronLeft size={20} className="text-yellow-600" />
              Back
            </button>
          </div>

          <div className="w-full max-w-sm flex flex-col items-center mt-4">
            <div className="w-20 h-20 bg-blue-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl border-4 border-yellow-500">
              <Shield size={36} className="text-yellow-400" />
            </div>

            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter text-center mb-2">
              Developer Login
            </h2>
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-[0.2em] mb-10">
              Authorized Personnel Only
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest pl-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter Developer ID"
                  className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-6 text-sm font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest pl-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••"
                  className={`w-full bg-blue-50 border-2 ${error ? 'border-red-500' : 'border-blue-100'} rounded-2xl py-4 px-6 text-sm font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner`}
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <AlertCircle size={14} /> Invalid Credentials
                </div>
              )}

              <button
                type="submit"
                disabled={password.length === 0}
                className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
                  password.length > 0
                    ? 'bg-blue-900 text-yellow-400 active:scale-95 border-b-4 border-yellow-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border-b-4 border-gray-300'
                }`}
              >
                <Lock size={18} /> Authenticate
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DevLogin;

