import React, { useState } from 'react';
import { Professor } from '../types';
import {
  Key,
  ChevronLeft,
  QrCode,
  FileText,
  Download,
  X,
  Image as ImageIcon,
  Box,
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import ChangePinModal from './10_ChangePinModal';
import QrGeneratorModal from './08_QrGeneratorModal';

interface DashboardProps {
  professor: Professor;
  onBack: () => void;
  onOpenManual: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ professor, onBack, onOpenManual }) => {
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const [isCompartmentQrOpen, setIsCompartmentQrOpen] = useState(false);
  const [showCompartmentDownloadMenu, setShowCompartmentDownloadMenu] = useState(false);

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
                <p style="margin-top:30px; font-size:1.2rem; font-weight:bold; color:#1e3a8a;">${professor.name}</p>
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

  const assignedCabinetNo = StorageService.cabinetNoForProfessor(professor.id, professor.compartmentQr);
  const compartmentData = StorageService.compartmentPayloadForProfessor(professor.id, professor.compartmentQr);
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

            <button
              onClick={onOpenManual}
              className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-full transition-colors flex items-center justify-center"
              aria-label="Manual Access"
            >
              <span className="text-2xl" role="img" aria-label="info">
                ☰
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4 mb-4 w-full">
            <div className="flex flex-col gap-0 min-w-0 flex-1 px-1">
              <h2 className="text-[25px] font-black text-blue-900 tracking-wide uppercase">Professor dashboard</h2>
              <div className="flex flex-col gap-0">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-yellow-400 font-black text-sm border border-yellow-500 shrink-0">
                    {assignedCabinetNo}
                  </span>
                  <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                    <span className="font-black text-yellow-600 uppercase tracking-widest text-[16px] sm:text-[18px]">
                      {professor.name}
                    </span>
                    <span className="text-blue-900 font-bold text-[11px] sm:text-[12px] uppercase tracking-wider opacity-90 whitespace-nowrap">
                      {professor.department} DEPARTMENT
                    </span>
                  </div>
                </div>
                <div className="w-full border-t border-blue-900/10 mt-2" />
                <button
                  onClick={() => {
                    setIsCompartmentQrOpen(true);
                  }}
                  className="self-start flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 hover:text-blue-900 transition-colors p-4 mt-0"
                >
                  <Box size={16} className="text-yellow-600 shrink-0" /> COMPARTMENT QR
                </button>
                <div className="w-full border-t border-blue-900/10" />
                <button
                  onClick={() => {
                    setIsChangePinOpen(true);
                  }}
                  className="self-start flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 hover:text-blue-900 transition-colors p-4 mt-0"
                >
                  <Key size={16} className="text-yellow-600 shrink-0" /> CHANGE PIN CODE
                </button>
                <div className="w-full border-t border-blue-900/10" />
              </div>
            </div>
          </div>

          <div className="w-full mb-6">
            <button
              onClick={() => {
                setIsQrGeneratorOpen(true);
              }}
              className="w-full min-w-0 py-3.5 bg-white border-[3px] border-blue-900 text-blue-900 rounded-xl font-black transition-all flex items-center justify-center gap-2 hover:bg-blue-50 text-[10px] uppercase tracking-widest shadow-sm active:translate-y-0.5"
            >
              <QrCode size={16} className="text-yellow-600 shrink-0" /> VIEW AVAILABLE QR CODE
            </button>
          </div>
        </div>
      </main>

      {/* Compartment QR Modal */}
      {isCompartmentQrOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-yellow-500 animate-scale-up">
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
              <p className="text-sm font-black uppercase text-yellow-400 tracking-widest text-center">
                COMPARTMENT NUMBER - {assignedCabinetNo}
              </p>
            </div>
            <div className="p-7 sm:p-9 flex flex-col items-center gap-4 sm:gap-5">
              <div className="p-2.5 sm:p-3 bg-white border-4 border-blue-50 rounded-[2.5rem] shadow-inner">
                <img src={compartmentQrUrl} alt="Compartment QR" className="w-32 h-32 sm:w-36 sm:h-36" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned to</p>
                <p className="text-lg font-black text-blue-900 uppercase">{professor.name}</p>
              </div>

              <div className="relative w-full">
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
                      Download as Image <ImageIcon size={14} className="text-yellow-600" />
                    </button>
                    <button
                      onClick={() => handleDownloadCompartmentQr('PDF')}
                      className="px-4 py-3 text-[10px] font-black text-blue-900 uppercase hover:bg-blue-50 flex items-center justify-between"
                    >
                      Download as PDF <FileText size={14} className="text-yellow-600" />
                    </button>
                  </div>
                )}
              </div>
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
          view="floor"
          onClose={() => {
            setIsQrGeneratorOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

