import React, { useState, useRef, useEffect } from 'react';
import { Professor } from '../types';
import { StorageService } from '../lib/storage';
import ChangePinModal from './10_ChangePinModal';
import { updateProfessorCompartmentQrViaApi, updateProfessorNameViaApi } from '../lib/api';
import ChangeDevPasswordModal from './11_ChangeDevPasswordModal';
import {
  ChevronLeft,
  Shield,
  Edit3,
  RotateCcw,
  Save,
  X,
  GraduationCap,
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
  const topMenuRef = useRef<HTMLDivElement>(null);

  // State for shared Change PIN modal
  const [changePinTarget, setChangePinTarget] = useState<{ id: string; name: string } | null>(null);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // State for compartment QR editing
  const [editingCompartment, setEditingCompartment] = useState<{ id: string; name: string; data: string } | null>(null);
  const [tempCompartmentData, setTempCompartmentData] = useState('');

  const handleStartEdit = (prof: Professor) => {
    setEditingId(prof.id);
    setTempName(prof.name);
    setOpenMenuId(null);
  };

  const handleSaveName = async (id: string) => {
    const trimmedName = tempName.trim();
    if (!trimmedName) return;

    try {
      const updated = await updateProfessorNameViaApi(id, trimmedName);
      if (!updated) {
        alert('FAILED TO UPDATE PROFESSOR NAME IN DATABASE');
        return;
      }

      setProfs((prev) => prev.map((prof) => (prof.id === id ? { ...prof, name: trimmedName } : prof)));
      setEditingId(null);
    } catch {
      alert('DATABASE CONNECTION FAILED');
    }
  };

  const openChangePin = (id: string, name: string) => {
    setChangePinTarget({ id, name });
    setOpenMenuId(null);
  };

  const handleStartEditCompartment = (prof: Professor) => {
    const currentData = StorageService.getCompartmentData(prof.id, prof.name);
    setEditingCompartment({ id: prof.id, name: prof.name, data: currentData });
    setTempCompartmentData(currentData);
    setOpenMenuId(null);
  };

  const handleSaveCompartment = async () => {
    if (editingCompartment) {
      try {
        const ok = await updateProfessorCompartmentQrViaApi(editingCompartment.id, tempCompartmentData);
        if (!ok) {
          alert('FAILED TO UPDATE COMPARTMENT QR IN DATABASE');
          return;
        }
        StorageService.setCompartmentData(editingCompartment.id, tempCompartmentData);
        setEditingCompartment(null);
        alert('Compartment QR Data Updated.');
      } catch {
        alert('DATABASE CONNECTION FAILED');
      }
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
      if (topMenuRef.current && !topMenuRef.current.contains(event.target as Node)) {
        setIsTopMenuOpen(false);
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
          <div className="flex items-center justify-between gap-4 mb-4 px-1 relative z-20">
            <button
              onClick={onBack}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-blue-900 font-bold"
            >
              <ChevronLeft size={20} className="text-yellow-600" />
              Back
            </button>

            <div className="relative" ref={topMenuRef}>
              <button
                onClick={() => setIsTopMenuOpen((v) => !v)}
                className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-full transition-colors flex items-center justify-center"
                aria-label="Developer menu"
              >
                <span className="text-2xl" role="img" aria-label="menu">
                  ☰
                </span>
              </button>

              {isTopMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-64 bg-white border-2 border-yellow-500 rounded-2xl shadow-2xl overflow-hidden animate-scale-up z-50">
                  <button
                    onClick={() => {
                      setIsChangePasswordOpen(true);
                      setIsTopMenuOpen(false);
                    }}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors"
                  >
                    <Shield size={18} className="text-yellow-600" />
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Change Password</span>
                  </button>
                </div>
              )}
            </div>
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
                            onClick={() => {
                              void handleSaveName(prof.id);
                            }}
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
                          <span className="text-[10px] font-bold text-yellow-600 mt-1 uppercase tracking-widest">
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
                              onClick={() => openChangePin(prof.id, prof.name)}
                              className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                            >
                              <RotateCcw size={16} className="text-blue-900" />
                              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Change PIN Code</span>
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

      {changePinTarget && (
        <ChangePinModal
          profId={changePinTarget.id}
          onClose={() => setChangePinTarget(null)}
          onSuccess={() => {
            alert(`PIN CODE UPDATED SUCCESSFULLY FOR ${changePinTarget.name.toUpperCase()}`);
            setChangePinTarget(null);
          }}
        />
      )}

      {isChangePasswordOpen && (
        <ChangeDevPasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={() => {
            alert('DEVELOPER PASSWORD UPDATED SUCCESSFULLY');
            setIsChangePasswordOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default DevDashboard;

