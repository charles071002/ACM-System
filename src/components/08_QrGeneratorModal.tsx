import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  Download,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Professor, QrRecord } from '../types';
import { StorageService } from '../lib/storage';

interface QrGeneratorModalProps {
  professor: Professor;
  onClose: () => void;
  initialRecord?: QrRecord;
}

const QrGeneratorModal: React.FC<QrGeneratorModalProps> = ({ professor, onClose, initialRecord }) => {
  const [qrName, setQrName] = useState(initialRecord?.name || '');

  // Separate Date and Time state for Start
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');

  // Separate Date and Time state for Expiry
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * INITIAL POPULATION
   * Recommends start time based on most recent log or current time.
   */
  useEffect(() => {
    if (initialRecord) {
      const s = new Date(initialRecord.startsAt);
      if (!isNaN(s.getTime())) {
        setStartDate(formatDate(s));
        setStartTime(formatTime(s));
      }

      const e = new Date(initialRecord.expiresAt);
      if (!isNaN(e.getTime())) {
        setExpiryDate(formatDate(e));
        setExpiryTime(formatTime(e));
      }
    } else {
      const existingRecords = StorageService.getQrRecords(professor.id);
      let start: Date;

      if (existingRecords.length > 0) {
        // Recommend start time to be the expiry time of the most recently generated QR code
        start = new Date(existingRecords[0].expiresAt);
      } else {
        // Default to current time for first QR
        start = new Date();
      }

      const recommendedExpiry = new Date(start.getTime() + 60 * 60 * 1000);

      setStartDate(formatDate(start));
      setStartTime(formatTime(start));
      setExpiryDate(formatDate(recommendedExpiry));
      setExpiryTime(formatTime(recommendedExpiry));
    }
  }, [initialRecord, professor.id]);

  /**
   * REACTIVE RECOMMENDATION
   * Automatically updates expiry time to 1 hour after the selected start time.
   */
  useEffect(() => {
    if (!initialRecord && startDate && startTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      if (!isNaN(startDateTime.getTime())) {
        const recommendedExpiry = new Date(startDateTime.getTime() + 60 * 60 * 1000);
        setExpiryDate(formatDate(recommendedExpiry));
        setExpiryTime(formatTime(recommendedExpiry));
      }
    }
  }, [startDate, startTime, initialRecord]);

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * GENERATION LOGIC WITH OVERLAP VALIDATION
   * Validates dates and ensures no overlapping time intervals exist in the logs.
   */
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrName || !startDate || !startTime || !expiryDate || !expiryTime) return;

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(expiryDateTime.getTime())) {
      setValidationError('Invalid date or time entered.');
      return;
    }

    if (expiryDateTime <= startDateTime) {
      setValidationError('Expiration must be after Start time.');
      return;
    }

    // OVERLAP CHECK: Disallow multiple QR codes for the same interval
    const existingRecords = StorageService.getQrRecords(professor.id);
    const hasOverlap = existingRecords.some((record) => {
      // If editing, ignore the original version of this record
      if (initialRecord && record.id === initialRecord.id) return false;

      const existingStart = new Date(record.startsAt);
      const existingEnd = new Date(record.expiresAt);

      // standard interval overlap formula: (StartA < EndB) and (EndA > StartB)
      return startDateTime < existingEnd && expiryDateTime > existingStart;
    });

    if (hasOverlap) {
      setValidationError('Time Conflict: An active QR Code already exists for this interval.');
      return;
    }

    setValidationError(null);
    const encodedData = encodeURIComponent(
      `ACM_SYNC:${qrName}:${startDateTime.toISOString()}:${expiryDateTime.toISOString()}`,
    );
    setGeneratedUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`,
    );
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

  const handleDownload = async (type: 'PDF' | 'IMAGE') => {
    if (!generatedUrl) return;

    const safeName = qrName.replace(/\s+/g, '_') || 'ACM_QR';

    if (type === 'IMAGE') {
      await downloadQrImage(generatedUrl, `${safeName}.png`);
    } else {
      openPrintWindow(`
        <html>
          <head><title>ACM QR - ${qrName}</title></head>
          <body style="margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#f9fafb;">
            <div style="text-align:center; padding:50px; border:8px solid #1e3a8a; border-radius:50px; background:white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
              <h1 style="color:#1e3a8a; margin:0; font-size:2.5rem; font-weight:900;">ACM SYSTEM</h1>
              <p style="color:#ca8a04; font-weight:bold; letter-spacing:0.1em; margin-bottom:30px; text-transform:uppercase;">${qrName}</p>
              <img src="${generatedUrl}" style="width:300px; height:300px; padding:10px; border:2px solid #e5e7eb; border-radius:20px;" />
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
  };

  const handleDone = () => {
    if (generatedUrl) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);

      if (isNaN(startDateTime.getTime()) || isNaN(expiryDateTime.getTime())) {
        alert('Error saving: Invalid date value.');
        return;
      }

      const startIso = startDateTime.toISOString();
      const expiryIso = expiryDateTime.toISOString();

      if (initialRecord) {
        StorageService.updateQrRecord(professor.id, {
          ...initialRecord,
          name: qrName,
          startsAt: startIso,
          expiresAt: expiryIso,
        });
      } else {
        StorageService.saveQrRecord(professor.id, qrName, startIso, expiryIso);
      }
    }
    onClose();
  };

  const inputClasses =
    'w-full bg-gray-50 border-2 border-blue-50 rounded-2xl py-4 px-4 text-center text-sm font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner';
  const labelClasses =
    'block text-[10px] font-black text-blue-900 uppercase tracking-widest text-center';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up border-4 border-yellow-500">
        <div className="bg-blue-900 p-8 flex flex-col items-center text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-yellow-500/70 hover:text-yellow-400"
          >
            <X size={28} />
          </button>

          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white/20">
            <QrCode size={32} className="text-blue-900" />
          </div>

          <h3 className="text-xl font-black tracking-tight text-yellow-400 uppercase">
            {initialRecord ? 'Edit Survey' : 'Generate QR Code'}
          </h3>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {!generatedUrl ? (
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <div className="space-y-1">
                <label className={labelClasses}>ENTER QR CODE ID</label>
                <input
                  type="text"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-blue-50 rounded-2xl py-4 text-center text-sm font-bold text-blue-900 focus:outline-none focus:border-yellow-500 transition-all shadow-inner px-4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClasses}>Start Date</label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Start Time</label>
                  <div className="relative group">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClasses}>Expiry Date</label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Expiry Time</label>
                  <div className="relative group">
                    <input
                      type="time"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </div>

              {validationError && (
                <p className="text-red-500 text-[10px] flex items-center justify-center gap-1 font-black">
                  <AlertCircle size={12} /> {validationError}
                </p>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-4 bg-blue-900 text-yellow-400 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-blue-800 transition-all border-b-4 border-yellow-600"
              >
                Generate Code
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-scale-up">
              <div className="p-4 bg-white border-4 border-blue-50 rounded-[2rem] shadow-inner">
                <img src={generatedUrl} alt="QR Code" className="w-40 h-40" />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2 relative">
                  <div className="w-full flex flex-col">
                    <button
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="w-full py-3 bg-blue-50 text-blue-900 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border-2 border-blue-100 active:scale-95 transition-transform"
                    >
                      <Download size={14} /> Download
                    </button>

                    {showDownloadMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-full bg-white border-2 border-blue-100 rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden animate-slide-up">
                        <button
                          onClick={() => {
                            handleDownload('IMAGE');
                            setShowDownloadMenu(false);
                          }}
                          className="px-4 py-3 text-[9px] font-black text-blue-900 uppercase hover:bg-blue-50 border-b border-blue-50 flex items-center justify-between"
                        >
                          Save as Image <ImageIcon size={12} className="text-yellow-600" />
                        </button>
                        <button
                          onClick={() => {
                            handleDownload('PDF');
                            setShowDownloadMenu(false);
                          }}
                          className="px-4 py-3 text-[9px] font-black text-blue-900 uppercase hover:bg-blue-50 flex items-center justify-between"
                        >
                          Save as PDF <FileText size={12} className="text-yellow-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDone}
                  className="w-full mt-2 py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-green-700 transition-all border-b-4 border-green-800 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Finish & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrGeneratorModal;

