import React, { useState, useEffect, useRef } from 'react';
import { Professor, QrRecord } from '../types';
import {
  Users,
  Key,
  Weight,
  ChevronLeft,
  QrCode,
  Menu,
  BookOpen,
  History,
  FileText,
  Calendar,
  Edit3,
  Download,
  X,
  Trash,
  Image as ImageIcon,
  Box,
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import ChangePinModal from './10_ChangePinModal';
import QrGeneratorModal from './08_QrGeneratorModal';
import HistoryModal from './09_HistoryModal';

interface DashboardProps {
  professor: Professor;
  onBack: () => void;
  onOpenManual: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ professor, onBack, onOpenManual }) => {
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const [isCompartmentQrOpen, setIsCompartmentQrOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<QrRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<QrRecord | null>(null);
  const [showLogDownloadMenu, setShowLogDownloadMenu] = useState(false);
  const [showCompartmentDownloadMenu, setShowCompartmentDownloadMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeQrIdAtLastCheck = useRef<string | null>(null);

  const [submissionCount, setSubmissionCount] = useState(() => StorageService.getSubmissions(professor.id));
  const [qrRecords, setQrRecords] = useState<QrRecord[]>([]);

  // Current active compartment QR data (persistent)
  const [compartmentData, setCompartmentData] = useState(() => StorageService.getCompartmentData(professor.id, professor.name));

  /**
   * Fetches latest logs from persistent storage and updates local state.
   */
  const refreshLogs = () => {
    const logs = StorageService.getQrRecords(professor.id);
    const sortedLogs = [...logs].sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
    setQrRecords(sortedLogs);
  };

  /**
   * Sync custom compartment data when modal opens
   */
  useEffect(() => {
    if (isCompartmentQrOpen) {
      setCompartmentData(StorageService.getCompartmentData(professor.id, professor.name));
    }
  }, [isCompartmentQrOpen, professor.id, professor.name]);

  /**
   * AUTOMATED EXPIRY & ARCHIVE MONITORING
   */
  useEffect(() => {
    const monitorSystem = () => {
      const now = new Date();
      const activeQr = qrRecords.find((r) => {
        const start = new Date(r.startsAt);
        const end = new Date(r.expiresAt);
        return now >= start && now <= end;
      });

      const currentActiveId = activeQr?.id || null;

      if (activeQrIdAtLastCheck.current && activeQrIdAtLastCheck.current !== currentActiveId) {
        const recentlyActiveRecord = qrRecords.find((r) => r.id === activeQrIdAtLastCheck.current);
        if (recentlyActiveRecord && now > new Date(recentlyActiveRecord.expiresAt)) {
          if (submissionCount > 0) {
            const startTimeStr = new Date(recentlyActiveRecord.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = new Date(recentlyActiveRecord.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const contextLabel = `${recentlyActiveRecord.name} (${startTimeStr} - ${endTimeStr})`;

            StorageService.saveHistoryRecord(professor.id, submissionCount, contextLabel);
            setSubmissionCount(0);
          }
        }
      }

      activeQrIdAtLastCheck.current = currentActiveId;

      const validRecords = StorageService.cleanupExpiredQrRecords(professor.id);
      const sortedValid = [...validRecords].sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

      if (sortedValid.length !== qrRecords.length) {
        setQrRecords(sortedValid);
      }

      if (!currentActiveId && submissionCount > 0 && !activeQrIdAtLastCheck.current) {
        setSubmissionCount(0);
      }
    };

    const intervalId = setInterval(monitorSystem, 1000);
    return () => clearInterval(intervalId);
  }, [professor.id, qrRecords, submissionCount]);

  useEffect(() => {
    StorageService.setSubmissions(professor.id, submissionCount);
  }, [submissionCount, professor.id]);

  useEffect(() => {
    if (!isQrGeneratorOpen) {
      refreshLogs();
    }
  }, [professor.id, isQrGeneratorOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoadCellTrigger = () => {
    const now = new Date();
    const activeQr = qrRecords.find((r) => {
      const start = new Date(r.startsAt);
      const end = new Date(r.expiresAt);
      return now >= start && now <= end;
    });

    if (!activeQr) {
      alert('TRIGGER DENIED: NO ACTIVE SESSION DETECTED. SUBMISSIONS ARE ONLY RECORDED DURING THE VALIDITY PERIOD OF A QR CODE.');
      return;
    }
    setSubmissionCount((prev) => prev + 1);
  };

  const handleClearQrRecords = () => {
    StorageService.clearQrRecords(professor.id);
    refreshLogs();
  };

  const handleDeleteLog = (id: string) => {
    StorageService.deleteQrRecord(professor.id, id);
    refreshLogs();
    setSelectedLog(null);
    setShowLogDownloadMenu(false);
  };

  const downloadQrImage = async (qrUrl: string, fileName: string) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, '_blank');
    }
  };

  const openPrintWindow = (html: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const handleDownloadLog = async (record: QrRecord, type: 'PDF' | 'IMAGE') => {
    const encodedData = encodeURIComponent(`ACM_SYNC:${record.name}:${record.startsAt}:${record.expiresAt}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
    const safeName = record.name.replace(/\s+/g, '_') || 'ACM_QR';

    if (type === 'IMAGE') {
      await downloadQrImage(qrUrl, `${safeName}.png`);
    } else {
      openPrintWindow(`
          <html>
            <head><title>ACM QR - ${record.name}</title></head>
            <body style="margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#f9fafb;">
              <div style="text-align:center; padding:50px; border:8px solid #1e3a8a; border-radius:50px; background:white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                <h1 style="color:#1e3a8a; margin:0; font-size:2.5rem; font-weight:900;">ACM SYSTEM</h1>
                <p style="color:#ca8a04; font-weight:bold; letter-spacing:0.1em; margin-bottom:30px; text-transform:uppercase;">${record.name}</p>
                <img src="${qrUrl}" style="width:300px; height:300px; padding:10px; border:2px solid #e5e7eb; border-radius:20px;" />
                <p style="margin-top:30px; font-size:0.9rem; font-weight:bold; color:#1e3a8a;">RIZAL TECHNOLOGICAL UNIVERSITY</p>
                <p style="font-size:0.7rem; color:#9ca3af; margin-top:5px;">Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
    }
    setShowLogDownloadMenu(false);
  };

  const handleDownloadCompartmentQr = async (type: 'PDF' | 'IMAGE') => {
    const safeName = professor.name.replace(/\s+/g, '_') + '_Compartment';

    if (type === 'IMAGE') {
      await downloadQrImage(compartmentQrUrl, `${safeName}.png`);
    } else {
      openPrintWindow(`
          <html>
            <head><title>Compartment QR - ${professor.name}</title></head>
            <body style="margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#f9fafb;">
              <div style="text-align:center; padding:50px; border:8px solid #1e3a8a; border-radius:50px; background:white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                <h1 style="color:#1e3a8a; margin:0; font-size:2.5rem; font-weight:900;">ACM SYSTEM</h1>
                <p style="color:#ca8a04; font-weight:bold; letter-spacing:0.1em; margin-bottom:30px; text-transform:uppercase;">COMPARTMENT IDENTITY</p>
                <img src="${compartmentQrUrl}" style="width:300px; height:300px; padding:10px; border:2px solid #e5e7eb; border-radius:20px;" />
                <p style="margin-top:30px; font-size:1.2rem; font-weight:bold; color:#1e3a8a;">Professor: ${professor.name}</p>
                <p style="margin-top:10px; font-size:0.9rem; font-weight:bold; color:#1e3a8a;">RIZAL TECHNOLOGICAL UNIVERSITY</p>
                <p style="font-size:0.7rem; color:#9ca3af; margin-top:5px;">Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
    }
    setShowCompartmentDownloadMenu(false);
  };

  const formatSafeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
  };

  const formatSafeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const compartmentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(compartmentData)}`;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="bg-white border-b-4 border-yellow-500 text-blue-900 p-6 shadow-sm relative flex flex-col items-center justify-center text-center z-10 flex-shrink-0">
        <h1 className="text-2xl font-black uppercase tracking-wider leading-none mb-1">ACM</h1>
        <p className="text-xs md:text-sm font-bold text-blue-800 tracking-wide">Automated Cabinet Management System</p>
        <p className="text-[10px] md:text-xs font-semibold text-yellow-600 uppercase tracking-wider">Rizal Technological University</p>
      </header>

      <main className="flex-1 overflow-y-auto w-full p-6 relative">
        <div className="w-full max-w-5xl mx-auto flex flex-col animate-fade-in relative pt-4 pb-10">
          {/* Top row: Back (left) + dashboard menu (right) */}
          <div className="flex items-center justify-between gap-4 mb-4 px-1 relative z-20">
            <button
              onClick={onBack}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-blue-900 font-bold"
            >
              <ChevronLeft size={20} className="text-yellow-600" />
              Back
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-full transition-colors flex items-center justify-center"
                aria-label="Open dashboard menu"
              >
                <Menu size={24} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-6 w-64 bg-white border-2 border-yellow-500 rounded-2xl shadow-2xl overflow-hidden animate-scale-up z-50">
                  <button
                    onClick={() => {
                      setIsHistoryOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    <History size={18} className="text-yellow-600" />
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">View History</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCompartmentQrOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    <Box size={18} className="text-yellow-600" />
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Compartment QR</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsChangePinOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    <Key size={18} className="text-yellow-600" />
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Change PIN Code</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenManual();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors"
                  >
                    <BookOpen size={18} className="text-yellow-600" />
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Professor Manual</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mt-4 mb-4 w-full">
            <div className="flex flex-col gap-3 min-w-0 flex-1 px-1">
              <h2 className="text-[20px] font-black text-blue-900 tracking-wide uppercase">Professor dashboard</h2>
              <div className="flex flex-col gap-1">
                <span className="font-black text-yellow-600 uppercase tracking-widest text-[14px] sm:text-[16px]">
                  {professor.name}
                </span>
                <span className="text-blue-900 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider opacity-90 whitespace-nowrap">
                  {professor.department} DEPARTMENT
                </span>
              </div>
            </div>

            <div className="bg-blue-900 rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 w-44 sm:w-48 max-w-[min(100%,12rem)] text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center border-[3px] border-yellow-500 shrink-0 self-start mt-2 sm:mt-4">
              <div className="flex items-center justify-between w-full gap-2 mb-1.5">
                <Users className="text-yellow-400 shrink-0" size={18} />
                <span className="text-[7px] sm:text-[8px] font-black uppercase bg-yellow-500 text-blue-900 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full animate-pulse text-center leading-tight">
                  Live Monitoring
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-yellow-400 drop-shadow-md tracking-tighter leading-none">{submissionCount}</div>
              <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.12em] text-white/90 mt-1.5 text-center">
                Submissions Detected
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 opacity-90"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
            <button
              onClick={() => {
                setEditingRecord(null);
                setIsQrGeneratorOpen(true);
              }}
              className="w-full sm:flex-1 min-w-0 py-3.5 bg-white border-[3px] border-blue-900 text-blue-900 rounded-xl font-black transition-all flex items-center justify-center gap-2 hover:bg-blue-50 text-[10px] uppercase tracking-widest shadow-sm active:translate-y-0.5"
            >
              <QrCode size={16} className="text-yellow-600 shrink-0" /> GENERATE QR CODE
            </button>
            <button
              onClick={handleLoadCellTrigger}
              className="w-full sm:flex-1 min-w-0 py-3.5 bg-white border-[3px] border-blue-900 text-blue-900 rounded-xl font-black transition-all flex items-center justify-center gap-2 hover:bg-blue-50 text-[10px] uppercase tracking-widest shadow-sm active:translate-y-0.5"
            >
              <Weight size={16} className="text-yellow-600 shrink-0" /> LOAD CELL TRIGGER
            </button>
          </div>

          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-blue-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-yellow-600" /> QR Code Logs
              </h3>
              {qrRecords.length > 0 && (
                <button onClick={handleClearQrRecords} className="text-[8px] font-black text-red-500 uppercase tracking-widest hover:underline">
                  Clear Logs
                </button>
              )}
            </div>

            <div className="space-y-3">
              {qrRecords.length > 0 ? (
                qrRecords.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => {
                      setSelectedLog(record);
                      setShowLogDownloadMenu(false);
                    }}
                    className="w-full text-left bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm flex items-center justify-between group animate-fade-in hover:border-yellow-500 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-900 rounded-lg group-hover:bg-blue-900 group-hover:text-yellow-400 transition-colors">
                        <QrCode size={18} />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs font-black text-blue-900 leading-tight uppercase">{record.name}</p>
                        <p className="text-[8px] font-bold text-yellow-600 uppercase tracking-tighter flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> Exp: {formatSafeDate(record.expiresAt)} @ {formatSafeTime(record.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] font-black text-gray-400 uppercase">Recorded</p>
                      <p className="text-[9px] font-bold text-blue-900">{formatSafeTime(record.generatedAt)}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
                  <FileText size={24} className="text-gray-300 mb-2" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No QR Codes generated yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Compartment QR Modal */}
      {isCompartmentQrOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border-4 border-yellow-500 animate-scale-up">
            <div className="bg-blue-900 p-8 flex flex-col items-center text-white relative">
              <button
                onClick={() => {
                  setIsCompartmentQrOpen(false);
                  setShowCompartmentDownloadMenu(false);
                }}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-3">
                <Box size={32} className="text-blue-900" />
              </div>
              <p className="text-sm font-black uppercase text-yellow-400 tracking-widest text-center">COMPARTMENT IDENTITY</p>
            </div>
            <div className="p-10 flex flex-col items-center gap-6">
              <div className="p-4 bg-white border-4 border-blue-50 rounded-[2.5rem] shadow-inner">
                <img src={compartmentQrUrl} alt="Compartment QR" className="w-48 h-48" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned to</p>
                <p className="text-lg font-black text-blue-900 uppercase">Professor: {professor.name}</p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <div className="relative">
                  <button
                    onClick={() => setShowCompartmentDownloadMenu(!showCompartmentDownloadMenu)}
                    className="w-full py-4 bg-blue-50 text-blue-900 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-blue-100 active:scale-95 transition-transform"
                  >
                    <Download size={20} /> Download
                  </button>

                  {showCompartmentDownloadMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white border-2 border-blue-100 rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden animate-slide-up">
                      <button
                        onClick={() => handleDownloadCompartmentQr('IMAGE')}
                        className="px-4 py-3 text-[10px] font-black text-blue-900 uppercase hover:bg-blue-50 border-b border-blue-50 flex items-center justify-between"
                      >
                        Save as Image <ImageIcon size={14} className="text-yellow-600" />
                      </button>
                      <button
                        onClick={() => handleDownloadCompartmentQr('PDF')}
                        className="px-4 py-3 text-[10px] font-black text-blue-900 uppercase hover:bg-blue-50 flex items-center justify-between"
                      >
                        Save as PDF <FileText size={14} className="text-yellow-600" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsCompartmentQrOpen(false);
                    setShowCompartmentDownloadMenu(false);
                  }}
                  className="w-full py-4 bg-blue-900 text-yellow-400 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-blue-800 transition-all border-b-4 border-yellow-600"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Action Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-sm overflow-hidden shadow-2xl border-4 border-yellow-500 animate-scale-up">
            <div className="bg-blue-900 p-8 flex flex-col items-center text-white relative">
              <button
                onClick={() => {
                  setSelectedLog(null);
                  setShowLogDownloadMenu(false);
                }}
                className="absolute top-6 right-6 text-white/70 hover:text-white"
              >
                <X size={28} />
              </button>
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-3">
                <QrCode size={32} className="text-blue-900" />
              </div>
              <p className="text-sm font-black uppercase text-yellow-400 tracking-widest text-center">{selectedLog.name}</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setEditingRecord(selectedLog);
                    setIsQrGeneratorOpen(true);
                    setSelectedLog(null);
                  }}
                  className="flex flex-col items-center gap-2 p-6 bg-blue-50 rounded-[2rem] hover:bg-blue-100 transition-all group active:scale-95"
                >
                  <Edit3 className="text-blue-900 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] font-black uppercase text-blue-900 tracking-tighter">Edit</span>
                </button>

                <div className="relative flex flex-col">
                  <button
                    onClick={() => setShowLogDownloadMenu(!showLogDownloadMenu)}
                    className="w-full flex flex-col items-center gap-2 p-6 bg-blue-50 rounded-[2rem] hover:bg-blue-100 transition-all group active:scale-95 h-full"
                  >
                    <Download className="text-blue-900 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-[10px] font-black uppercase text-blue-900 tracking-tighter">Download</span>
                  </button>

                  {showLogDownloadMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white border-2 border-blue-100 rounded-2xl shadow-2xl z-[110] flex flex-col overflow-hidden animate-slide-up">
                      <button
                        onClick={() => handleDownloadLog(selectedLog, 'IMAGE')}
                        className="px-4 py-3 text-[9px] font-black text-blue-900 uppercase hover:bg-blue-50 border-b border-blue-50 flex items-center justify-between"
                      >
                        Save Image <ImageIcon size={12} className="text-yellow-600" />
                      </button>
                      <button
                        onClick={() => handleDownloadLog(selectedLog, 'PDF')}
                        className="px-4 py-3 text-[9px] font-black text-blue-900 uppercase hover:bg-blue-50 flex items-center justify-between"
                      >
                        Save PDF <FileText size={12} className="text-yellow-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDeleteLog(selectedLog.id)}
                className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 rounded-[2rem] hover:bg-red-100 transition-all group active:scale-95"
              >
                <Trash className="text-red-600 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[11px] font-black uppercase text-red-600 tracking-widest">Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangePinOpen && (
        <ChangePinModal
          profId={professor.id}
          onClose={() => setIsChangePinOpen(false)}
          onSuccess={() => {
            setIsChangePinOpen(false);
            alert('PIN CODE UPDATED SUCCESSFULLY');
          }}
        />
      )}
      {isQrGeneratorOpen && (
        <QrGeneratorModal
          professor={professor}
          initialRecord={editingRecord || undefined}
          onClose={() => {
            setIsQrGeneratorOpen(false);
            setEditingRecord(null);
          }}
        />
      )}
      {isHistoryOpen && <HistoryModal professor={professor} onClose={() => setIsHistoryOpen(false)} />}
    </div>
  );
};

export default Dashboard;

