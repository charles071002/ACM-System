
import React, { useEffect, useState } from 'react';
import { Professor } from '../types';
import { X, History as HistoryIcon, Trash2, Calendar, FileText } from 'lucide-react';
import { StorageService } from '../lib/storage';

interface HistoryRecord {
  id: string;
  count: number;
  clearedAt: string;
  qrName?: string;
}

interface HistoryModalProps {
  professor: Professor;
  onClose: () => void;
}

/**
 * HISTORY MODAL
 * Displays archived data logs for the selected professor.
 */
const HistoryModal: React.FC<HistoryModalProps> = ({ professor, onClose }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, [professor.id]);

  /** Synchronizes local state with storage service */
  const loadHistory = () => {
    const saved = StorageService.getHistory(professor.id);
    const sorted = saved.sort((a: HistoryRecord, b: HistoryRecord) => 
      new Date(b.clearedAt).getTime() - new Date(a.clearedAt).getTime()
    );
    setHistory(sorted);
  };

  const handleClearAll = () => {
    if (confirm("Wipe all history logs permanently?")) {
      StorageService.clearHistory(professor.id);
      setHistory([]);
    }
  };

  const handleDeleteItem = (id: string) => {
    StorageService.deleteHistoryItem(professor.id, id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border-4 border-yellow-500 flex flex-col max-h-[85vh]">
        {/* MODAL HEADER */}
        <div className="bg-[#1a3683] p-8 flex flex-col items-center text-white text-center relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-[#eab308] rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-blue-900/10">
            <HistoryIcon size={32} className="text-[#1a3683]" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-[#eab308] uppercase leading-none">Submission History</h3>
          <p className="text-[10px] font-bold opacity-90 uppercase tracking-[0.1em] mt-2">{professor.name}</p>
        </div>

        {/* LOG LIST AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {history.length > 0 ? (
            history.map((record, index) => (
              <div key={record.id} className="bg-[#f0f7ff] border-2 border-[#dbeafe] rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="bg-[#2a438e] text-white w-12 h-11 rounded-xl flex items-center justify-center font-black text-xl shadow-md">
                    {record.count}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-[#1a3683] uppercase tracking-widest flex items-center gap-2 mb-0.5">
                      <FileText size={12} className="text-[#eab308]" /> {record.qrName || "Units Cleared"}
                    </p>
                    <p className="text-[11px] font-bold text-blue-800/80 flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#1a3683]/40" />
                      {new Date(record.clearedAt).toLocaleDateString()} at {new Date(record.clearedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDeleteItem(record.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full transition-all active:scale-90 hover:bg-red-100">
                  <Trash2 size={20} strokeWidth={2.5} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-30">
              <HistoryIcon size={48} className="text-[#1a3683] mb-3" />
              <p className="text-[#1a3683] font-black uppercase text-xs tracking-widest">Database Empty</p>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 bg-white border-t border-gray-100 flex-shrink-0">
          <button onClick={handleClearAll} disabled={history.length === 0} className={`w-full py-3.5 border-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95 ${history.length === 0 ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' : 'bg-white border-red-500 text-red-600 hover:bg-red-50'}`}>
            <Trash2 size={18} /> Clear All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
