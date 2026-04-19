import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Professor } from '../types';
import { StorageService } from '../lib/storage';
import ChangePinModal from './10_ChangePinModal';
import { updateProfessorCompartmentQrViaApi, updateProfessorNameViaApi } from '../lib/api';
import ChangeDevPasswordModal from './11_ChangeDevPasswordModal';
import DeveloperManualModal from './07_DeveloperManualModal';
import {
  BookOpen,
  ChevronLeft,
  Shield,
  Edit3,
  RotateCcw,
  Save,
  X,
  GraduationCap,
  Menu as MenuIcon,
  Box,
} from 'lucide-react';

interface DevDashboardProps {
  initialProfessors: Professor[];
  onBack: () => void;
  onProfessorsUpdated?: () => Promise<void>;
}

const DevDashboard: React.FC<DevDashboardProps> = ({ initialProfessors, onBack, onProfessorsUpdated }) => {
  const [profs, setProfs] = useState<Professor[]>(initialProfessors);

  useEffect(() => {
    setProfs(initialProfessors);
  }, [initialProfessors]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const topMenuRef = useRef<HTMLDivElement>(null);

  // State for shared Change PIN modal
  const [changePinTarget, setChangePinTarget] = useState<{ id: string; name: string } | null>(null);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeveloperManualOpen, setIsDeveloperManualOpen] = useState(false);

  // Compartment numbers follow DB `compartment_qr` (synced across devices).
  const [editingCompartmentNo, setEditingCompartmentNo] = useState<{ id: string; name: string; value: string } | null>(
    null
  );
  const [compartmentNoNotice, setCompartmentNoNotice] = useState<{ kind: 'error'; text: string } | null>(null);
  const [selectedSwapProfId, setSelectedSwapProfId] = useState<string | null>(null);
  const [isConfirmSwapOpen, setIsConfirmSwapOpen] = useState(false);

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

  const handleStartEditCompartmentNo = (prof: Professor) => {
    const currentNo = StorageService.cabinetNoForProfessor(prof.id, prof.compartmentQr);
    setEditingCompartmentNo({ id: prof.id, name: prof.name, value: currentNo });
    setCompartmentNoNotice(null);
    setSelectedSwapProfId(null);
    setOpenMenuId(null);
  };

  const performSwap = async (): Promise<boolean> => {
    if (!editingCompartmentNo) return false;
    const profAId = editingCompartmentNo.id;
    if (!selectedSwapProfId) {
      setCompartmentNoNotice({ kind: 'error', text: 'PLEASE SELECT A PROFESSOR TO SWAP WITH.' });
      return false;
    }

    const targetProf = profs.find((p) => p.id === selectedSwapProfId);
    if (!targetProf) {
      setCompartmentNoNotice({ kind: 'error', text: 'SELECTED PROFESSOR NOT FOUND.' });
      return false;
    }

    const profBId = targetProf.id;
    const profA = profs.find((p) => p.id === profAId);
    const profB = profs.find((p) => p.id === profBId);
    if (!profA || !profB) {
      setCompartmentNoNotice({ kind: 'error', text: 'PROFESSOR NOT FOUND.' });
      return false;
    }

    const currentNormalized = StorageService.cabinetNoForProfessor(profAId, profA.compartmentQr);
    const targetNormalized = StorageService.cabinetNoForProfessor(profBId, profB.compartmentQr);
    if (profBId === profAId) {
      setCompartmentNoNotice({ kind: 'error', text: 'CANNOT SWAP WITH THE SAME PROFESSOR.' });
      return false;
    }

    const nextQrA = StorageService.compartmentQrPayloadFromCabinetNo(targetNormalized);
    const nextQrB = StorageService.compartmentQrPayloadFromCabinetNo(currentNormalized);

    try {
      const [okA, okB] = await Promise.all([
        updateProfessorCompartmentQrViaApi(profAId, nextQrA),
        updateProfessorCompartmentQrViaApi(profBId, nextQrB),
      ]);
      if (!okA || !okB) {
        throw new Error('compartment_qr update failed');
      }
      setProfs((prev) =>
        prev.map((p) => {
          if (p.id === profAId) return { ...p, compartmentQr: nextQrA };
          if (p.id === profBId) return { ...p, compartmentQr: nextQrB };
          return p;
        })
      );
      await onProfessorsUpdated?.();
      setCompartmentNoNotice(null);
      return true;
    } catch {
      alert('FAILED TO UPDATE COMPARTMENT QR IN DATABASE. SWAP WAS NOT APPLIED.');
      return false;
    }
  };

  const handleSaveCompartmentNo = () => {
    if (!editingCompartmentNo) return;
    if (!selectedSwapProfId) {
      setCompartmentNoNotice({ kind: 'error', text: 'PLEASE SELECT A PROFESSOR TO SWAP WITH.' });
      return;
    }
    setIsConfirmSwapOpen(true);
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

  const sortedProfs = useMemo(() => {
    const getCabinetNo = (p: Professor) => {
      const raw = StorageService.cabinetNoForProfessor(p.id, p.compartmentQr);
      const n = Number.parseInt(raw, 10);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };

    return [...profs].sort((a, b) => {
      const aNo = getCabinetNo(a);
      const bNo = getCabinetNo(b);
      if (aNo !== bNo) return aNo - bNo;
      return a.name.localeCompare(b.name);
    });
  }, [profs]);

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
                    type="button"
                    onClick={() => {
                      setIsChangePasswordOpen(true);
                      setIsTopMenuOpen(false);
                    }}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    <Shield size={18} className="text-yellow-600" />
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Change Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeveloperManualOpen(true);
                      setIsTopMenuOpen(false);
                    }}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors"
                  >
                    <BookOpen size={18} className="text-yellow-600" />
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Developer Manual</span>
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
              {sortedProfs.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-4 shadow-sm animate-fade-in flex flex-col gap-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-yellow-400 font-black text-xs border border-yellow-500 flex-shrink-0">
                        {StorageService.cabinetNoForProfessor(prof.id, prof.compartmentQr)}
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
                          <div className="absolute right-0 top-12 w-72 bg-white border-2 border-yellow-500 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-up">
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
                              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Edit PIN Code</span>
                            </button>
                            <button
                              onClick={() => handleStartEditCompartmentNo(prof)}
                              className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors"
                            >
                              <Box size={16} className="text-blue-900" />
                              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                                Edit Compartment Number
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Compartment Number Modal (frontend-only) */}
      {editingCompartmentNo && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-y-auto shadow-2xl animate-scale-up border-4 border-yellow-500 min-h-[560px] max-h-[90vh]">
            <div className="bg-blue-900 p-6 flex flex-col items-center text-white text-center relative">
              <button
                onClick={() => {
                  setEditingCompartmentNo(null);
                  setCompartmentNoNotice(null);
                  setSelectedSwapProfId(null);
                  setIsConfirmSwapOpen(false);
                }}
                className="absolute top-3 right-3 text-white/70 hover:text-white"
              >
                <X size={22} />
              </button>

              <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-white/20">
                <Box size={28} className="text-blue-900" />
              </div>

              <h3 className="text-lg font-black tracking-tight uppercase leading-none">
                Compartment Number {editingCompartmentNo.value}
              </h3>
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-1">{editingCompartmentNo.name}</p>
            </div>

            <div className="p-8">
              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 px-1">
                Swap With:
              </label>
              <div className="mb-6">
                <div className="mb-3">
                  <div className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-4 text-[10px] font-black text-blue-900 uppercase tracking-wider text-center shadow-inner">
                    {(() => {
                      if (!selectedSwapProfId) return 'NONE';
                      const selected = profs.find((p) => p.id === selectedSwapProfId);
                      if (!selected) return 'NONE';
                      const selectedNo = StorageService.cabinetNoForProfessor(selected.id, selected.compartmentQr);
                      return `${selectedNo} - ${selected.name}`;
                    })()}
                  </div>
                </div>
                <div className="bg-white border-2 border-yellow-500 rounded-2xl shadow-inner overflow-hidden">
                  {profs
                    .filter((p) => p.id !== editingCompartmentNo.id)
                    .map((p) => {
                      const pNo = StorageService.cabinetNoForProfessor(p.id, p.compartmentQr);
                      const isSelected = selectedSwapProfId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedSwapProfId(p.id);
                            setCompartmentNoNotice(null);
                          }}
                          className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between gap-3 border-b border-gray-100 last:border-b-0 ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-blue-50'
                          }`}
                        >
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              isSelected ? 'text-blue-900' : 'text-gray-600'
                            }`}
                          >
                            {pNo} - {p.name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {compartmentNoNotice?.kind === 'error' && (
                <div
                  className="-mt-4 mb-6 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border bg-red-50 text-red-700 border-red-200"
                >
                  {compartmentNoNotice.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setEditingCompartmentNo(null);
                    setCompartmentNoNotice(null);
                    setSelectedSwapProfId(null);
                    setIsConfirmSwapOpen(false);
                  }}
                  className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCompartmentNo}
                  className="py-4 bg-blue-900 text-yellow-400 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 border-b-4 border-yellow-600 flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Swap Dialog */}
      {editingCompartmentNo && isConfirmSwapOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up border-4 border-yellow-500">
            <div className="bg-blue-900 p-6 flex flex-col items-center text-white text-center relative">
              <button
                onClick={() => setIsConfirmSwapOpen(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-white"
                aria-label="Close confirmation"
              >
                <X size={22} />
              </button>
              <h3 className="text-lg font-black tracking-tight uppercase leading-none">Confirm Change</h3>
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-1">Are you sure you want to swap?</p>
            </div>

            <div className="p-8">
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl px-4 py-4 text-center shadow-inner">
                {(() => {
                  const fromProf = profs.find((p) => p.id === editingCompartmentNo.id);
                  const fromNo = fromProf
                    ? StorageService.cabinetNoForProfessor(fromProf.id, fromProf.compartmentQr)
                    : editingCompartmentNo.value;
                  const toProf = profs.find((p) => p.id === selectedSwapProfId);
                  if (!toProf) {
                    return (
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-wider">PLEASE SELECT A PROFESSOR.</p>
                    );
                  }
                  const toNo = StorageService.cabinetNoForProfessor(toProf.id, toProf.compartmentQr);

                  return (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider text-center">
                        {fromNo} - {editingCompartmentNo.name}
                      </p>
                      <p className="text-[12px] font-black text-blue-900/70 leading-none" aria-hidden="true">
                        ↓
                      </p>
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider text-center">
                        {toNo} - {toProf.name}
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => setIsConfirmSwapOpen(false)}
                  className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    void (async () => {
                      const ok = await performSwap();
                      setIsConfirmSwapOpen(false);
                      if (ok) {
                        setEditingCompartmentNo(null);
                        setCompartmentNoNotice(null);
                        setSelectedSwapProfId(null);
                      }
                    })();
                  }}
                  className="py-4 bg-blue-900 text-yellow-400 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 border-b-4 border-yellow-600 flex items-center justify-center gap-2"
                >
                  Yes
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

      {isDeveloperManualOpen && <DeveloperManualModal onClose={() => setIsDeveloperManualOpen(false)} />}
    </div>
  );
};

export default DevDashboard;

