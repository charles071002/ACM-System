import React, { useState, useRef, useEffect } from 'react';
import { Professor } from '../types';
import { PROFESSORS, INITIAL_PIN } from '../constants';
import { StorageService } from '../lib/storage';
import {
  ChevronLeft,
  Shield,
  Edit3,
  RotateCcw,
  Save,
  X,
  GraduationCap,
  AlertTriangle,
  Check,
  Menu as MenuIcon,
  QrCode,
  Box,
} from 'lucide-react';

interface DevDashboardProps {
  initialProfessors: Professor[];
  onBack: () => void;
}

const DevDashboard: React.FC<DevDashboardProps> = ({ initialProfessors, onBack }) => {
  const [profs, setProfs] = useState<Professor[]>(initialProfessors);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // State for the reset confirmation modal
  const [resetConfirmId, setResetConfirmId] = useState<{ id: string; name: string } | null>(null);

  // State for compartment QR editing
  const [editingCompartment, setEditingCompartment] = useState<{ id: string; name: string; data: string } | null>(null);
  const [tempCompartmentData, setTempCompartmentData] = useState('');

  const handleStartEdit = (prof: Professor) => {
    setEditingId(prof.id);
    setTempName(prof.name);
    setOpenMenuId(null);
  };

  const handleSaveName = (id: string) => {
    if (!tempName.trim()) return;
    const updated = StorageService.updateProfessorName(PROFESSORS, id, tempName);
    setProfs(updated);
    setEditingId(null);
  };

  const initiateReset = (id: string, name: string) => {
    setResetConfirmId({ id, name });
    setOpenMenuId(null);
  };

  const confirmResetPin = () => {
    if (resetConfirmId) {
      StorageService.resetPin(resetConfirmId.id, INITIAL_PIN);
      alert(`PIN for ${resetConfirmId.name} has been reset to default.`);
      setResetConfirmId(null);
    }
  };

  const handleStartEditCompartment = (prof: Professor) => {
    const currentData = StorageService.getCompartmentData(prof.id, prof.name);
    setEditingCompartment({ id: prof.id, name: prof.name, data: currentData });
    setTempCompartmentData(currentData);
    setOpenMenuId(null);
  };

  const handleSaveCompartment = () => {
    if (editingCompartment) {
      StorageService.setCompartmentData(editingCompartment.id, tempCompartmentData);
      setEditingCompartment(null);
      alert('Compartment QR Data Updated.');
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      <header className="bg-blue-900 border-b-4 border-yellow-500 p-6 flex flex-col items-center justify-center relative flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-yellow-400" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">System Control</h2>
        </div>
        <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mt-1">
          Developer Admin Interface
        </p>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="w-full max-w-5xl mx-auto relative pt-4">
          <div className="absolute top-0 left-0 z-20">
            <button
              onClick={onBack}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-blue-900 font-bold"
            >
              <ChevronLeft size={20} className="text-yellow-600" />
              Back
            </button>
          </div>

          <div className="w-full max-w-2xl mx-auto space-y-6 mt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap className="text-yellow-600" size={18} />
                Professor Registry
              </h3>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {profs.length} Active Nodes
              </span>
            </div>

            <div className="space-y-3" ref={menuRef}>
              {profs.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-4 shadow-sm animate-fade-in flex flex-col gap-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-yellow-400 font-black text-xs border border-yellow-500 flex-shrink-0">
                        {prof.id}
                      </div>

                      {editingId === prof.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={tempName}
                            autoFocus
                            onChange={(e) => setTempName(e.target.value)}
                            className="flex-1 bg-white border-2 border-blue-200 rounded-xl px-4 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:border-yellow-500 min-w-[120px]"
                          />
                          <button
                            onClick={() => handleSaveName(prof.id)}
                            className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md transition-all active:scale-90"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 shadow-md transition-all active:scale-90"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-blue-900 uppercase leading-none">{prof.name}</span>
                          <span className="text-[9px] font-bold text-yellow-600 mt-1 uppercase tracking-wider">
                            {prof.department} DEPARTMENT
                          </span>
                        </div>
                      )}
                    </div>

                    {editingId !== prof.id && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === prof.id ? null : prof.id)}
                          className={`p-2 rounded-xl transition-all ${
                            openMenuId === prof.id ? 'bg-yellow-500 text-blue-900 shadow-inner' : 'text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          <MenuIcon size={24} />
                        </button>

                        {openMenuId === prof.id && (
                          <div className="absolute right-0 top-12 w-56 bg-white border-2 border-yellow-500 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-up">
                            <button
                              onClick={() => handleStartEdit(prof)}
                              className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                            >
                              <Edit3 size={16} className="text-blue-900" />
                              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Edit Name</span>
                            </button>
                            <button
                              onClick={() => initiateReset(prof.id, prof.name)}
                              className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                            >
                              <RotateCcw size={16} className="text-red-500" />
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Reset PIN Code</span>
                            </button>
                            <button
                              onClick={() => handleStartEditCompartment(prof)}
                              className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors"
                            >
                              <QrCode size={16} className="text-yellow-600" />
                              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Edit Compartment QR</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="py-8 text-center">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                ACM SYSTEM V2.5.0 CLOUD SYNC: DISABLED
                <br />
                SECURE REGISTRY DATABASE IS ACTIVE
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Compartment QR Modal */}
      {editingCompartment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border-4 border-yellow-500">
            <div className="bg-blue-900 p-8 flex flex-col items-center text-white text-center relative">
              <button
                onClick={() => setEditingCompartment(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white/20">
                <Box size={32} className="text-blue-900" />
              </div>

              <h3 className="text-xl font-black tracking-tight uppercase leading-none">Compartment QR</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2">{editingCompartment.name}</p>
            </div>

            <div className="p-8">
              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 px-1">
                Override Data (Default: Name)
              </label>
              <textarea
                value={tempCompartmentData}
                onChange={(e) => setTempCompartmentData(e.target.value)}
                rows={3}
                placeholder="Enter custom QR content..."
                className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-4 text-xs font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner resize-none mb-6"
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setEditingCompartment(null)}
                  className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCompartment}
                  className="py-4 bg-blue-900 text-yellow-400 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 border-b-4 border-yellow-600 flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Active QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset PIN */}
      {resetConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border-4 border-yellow-500">
            <div className="bg-red-600 p-8 flex flex-col items-center text-white text-center relative">
              <button
                onClick={() => setResetConfirmId(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <AlertTriangle size={32} className="text-red-600" />
              </div>

              <h3 className="text-xl font-black tracking-tight uppercase leading-none">Confirm Reset</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2">{resetConfirmId.name}</p>
            </div>

            <div className="p-8 text-center">
              <p className="text-blue-900 font-bold text-sm leading-relaxed mb-8">This action will reset the PIN</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setResetConfirmId(null)}
                  className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetPin}
                  className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 border-b-4 border-red-800 flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevDashboard;

