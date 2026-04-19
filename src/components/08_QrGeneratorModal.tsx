import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  Download,
  Copy,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Professor, QrRecord } from '../types';
import { StorageService } from '../lib/storage';

/** Human-readable caption for each slot (same for every compartment). */
export const FLOOR_QR_TIME_LABELS = ['7am - 11am', '11am - 3pm', '3pm - 8pm', 'anytime'] as const;

/**
 * Segment used in QR payload ids: `floor{segment}qr1` … `qr4` (e.g. compartment "2" → `floor2qr1`).
 */
export const compartmentSegmentForFloorQr = (cabinetNo: string): string => {
  const t = cabinetNo.trim();
  if (!t) return '1';
  if (/^\d+$/.test(t)) {
    return String(parseInt(t, 10));
  }
  const slug = t.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
  return slug || '1';
};

export const floorQrIdsForCompartment = (cabinetNo: string): string[] => {
  const seg = compartmentSegmentForFloorQr(cabinetNo);
  return [1, 2, 3, 4].map((n) => `floor${seg}qr${n}`);
};

const floorQrImageUrl = (id: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(id)}`;

const downloadFloorQrPng = async (id: string) => {
  const url = floorQrImageUrl(id);
  const fileName = `${id}.png`;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank');
  }
};

const copyFloorQrImage = async (id: string) => {
  const url = floorQrImageUrl(id);
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const pngBlob =
      blob.type === 'image/png' ? blob : new Blob([await blob.arrayBuffer()], { type: 'image/png' });

    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
        return;
      } catch {
        /* fall through to text */
      }
    }

    await navigator.clipboard.writeText(id);
  } catch {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      alert('COPY FAILED — try download instead.');
    }
  }
};

interface FloorQrGalleryModalProps {
  professor: Professor;
  onClose: () => void;
}

const FloorQrGalleryModal: React.FC<FloorQrGalleryModalProps> = ({ professor, onClose }) => {
  const cabinetNo = StorageService.getCompartmentNumber(professor.id, professor.id);
  const floorQrIds = useMemo(() => floorQrIdsForCompartment(cabinetNo), [professor.id, cabinetNo]);

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up border-2 border-yellow-500">
      <div className="relative flex flex-col items-center bg-blue-900 px-6 py-4 text-center text-white sm:px-8 sm:py-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-yellow-500/70 hover:text-yellow-400 sm:right-5 sm:top-5"
        >
          <X size={22} />
        </button>

        <div className="mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-yellow-500 shadow-md sm:h-12 sm:w-12">
          <QrCode size={22} className="text-blue-900" />
        </div>

        <h3 className="text-base font-black uppercase tracking-tight text-yellow-400 sm:text-lg">
          View Available QR Code
        </h3>
      </div>

      <div className="p-6 sm:p-10">
        <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-6">
          {floorQrIds.map((id, slotIndex) => {
            const caption = FLOOR_QR_TIME_LABELS[slotIndex];
            return (
            <div
              key={id}
              className="flex w-fit max-w-full flex-row items-center gap-2 sm:gap-3"
            >
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void downloadFloorQrPng(id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-900 bg-white text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-95 sm:h-10 sm:w-10"
                  aria-label={`Download QR for ${caption}`}
                >
                  <Download size={18} className="text-blue-900" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void copyFloorQrImage(id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-900 bg-white text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-95 sm:h-10 sm:w-10"
                  aria-label={`Copy QR for ${caption}`}
                >
                  <Copy size={18} className="text-blue-900" />
                </button>
              </div>

              <div className="flex w-fit max-w-full flex-col items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-2.5 py-3 shadow-inner sm:px-3 sm:py-3.5">
                <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm sm:p-2">
                  <img
                    src={floorQrImageUrl(id)}
                    alt={`QR ${id}`}
                    className="h-[112px] w-[112px] sm:h-[128px] sm:w-[128px] md:h-[136px] md:w-[136px]"
                  />
                </div>
                <span className="text-center text-sm font-black tracking-wide text-blue-900 sm:text-base">
                  {caption}
                </span>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  );
};

/** 24-hour only: H:mm or HH:mm, optional :ss → HH:mm:ss */
const parse24hTimeToHms = (timeStr: string): string | null => {
  const raw = timeStr.trim();
  if (!raw) return null;
  const m = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const sec = m[3] ? parseInt(m[3], 10) : 0;
  if (Number.isNaN(h) || Number.isNaN(min) || Number.isNaN(sec)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59 || sec < 0 || sec > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const sanitizeTimeTyping = (value: string) => value.replace(/[^\d:]/g, '').slice(0, 8);

interface SessionQrFormModalProps {
  professor: Professor;
  initialRecord?: QrRecord;
  onClose: () => void;
}

const SessionQrFormModal: React.FC<SessionQrFormModalProps> = ({ professor, initialRecord, onClose }) => {
  const [qrName, setQrName] = useState(initialRecord?.name || '');

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');

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
        start = new Date(existingRecords[0].expiresAt);
      } else {
        start = new Date();
      }

      const recommendedExpiry = new Date(start.getTime() + 60 * 60 * 1000);

      setStartDate(formatDate(start));
      setStartTime(formatTime(start));
      setExpiryDate(formatDate(recommendedExpiry));
      setExpiryTime(formatTime(recommendedExpiry));
    }
  }, [initialRecord, professor.id]);

  useEffect(() => {
    if (initialRecord) return;
    if (!startDate || !startTime) return;
    const hms = parse24hTimeToHms(startTime);
    if (!hms) return;
    const startDateTime = new Date(`${startDate}T${hms}`);
    if (!isNaN(startDateTime.getTime())) {
      const recommendedExpiry = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      setExpiryDate(formatDate(recommendedExpiry));
      setExpiryTime(formatTime(recommendedExpiry));
    }
  }, [startDate, startTime, initialRecord]);

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrName || !startDate || !startTime || !expiryDate || !expiryTime) return;

    const startHms = parse24hTimeToHms(startTime);
    const expiryHms = parse24hTimeToHms(expiryTime);
    if (!startHms || !expiryHms) {
      setValidationError('Use 24-hour time (e.g. 13:00 for 1:00 PM).');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startHms}`);
    const expiryDateTime = new Date(`${expiryDate}T${expiryHms}`);

    if (isNaN(startDateTime.getTime()) || isNaN(expiryDateTime.getTime())) {
      setValidationError('Invalid date or time entered.');
      return;
    }

    if (expiryDateTime <= startDateTime) {
      setValidationError('Expiration must be after Start time.');
      return;
    }

    const existingRecords = StorageService.getQrRecords(professor.id);
    const hasOverlap = existingRecords.some((record) => {
      if (initialRecord && record.id === initialRecord.id) return false;

      const existingStart = new Date(record.startsAt);
      const existingEnd = new Date(record.expiresAt);

      return startDateTime < existingEnd && expiryDateTime > existingStart;
    });

    if (hasOverlap) {
      setValidationError('Time Conflict: An active QR Code already exists for this interval.');
      return;
    }

    setValidationError(null);
    const startPayload = `${startDate}T${startHms}`;
    const endPayload = `${expiryDate}T${expiryHms}`;
    const encodedData = encodeURIComponent(`ACM_SYNC:${qrName}:${startPayload}:${endPayload}`);
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

  const handleDone = async () => {
    if (generatedUrl) {
      const startHms = parse24hTimeToHms(startTime);
      const expiryHms = parse24hTimeToHms(expiryTime);
      if (!startHms || !expiryHms) {
        alert('Use 24-hour time (e.g. 13:00 for 1:00 PM).');
        return;
      }

      const startPayload = `${startDate}T${startHms}`;
      const endPayload = `${expiryDate}T${expiryHms}`;
      const startDateTime = new Date(startPayload);
      const expiryDateTime = new Date(endPayload);

      if (isNaN(startDateTime.getTime()) || isNaN(expiryDateTime.getTime())) {
        alert('Error saving: Invalid date value.');
        return;
      }

      if (initialRecord) {
        StorageService.updateQrRecord(professor.id, {
          ...initialRecord,
          name: qrName,
          startsAt: startPayload,
          expiresAt: endPayload,
        });
      } else {
        StorageService.saveQrRecord(professor.id, qrName, startPayload, endPayload);
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
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up border-4 border-yellow-500">
        <div className="bg-blue-900 p-8 flex flex-col items-center text-white text-center relative">
          <button
            type="button"
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
                  <label className={labelClasses}>Start Time (24h)</label>
                  <div className="relative group">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="13:00"
                      title="24-hour time, e.g. 13:00 for 1:00 PM"
                      value={startTime}
                      onChange={(e) => setStartTime(sanitizeTimeTyping(e.target.value))}
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
                  <label className={labelClasses}>Expiry Time (24h)</label>
                  <div className="relative group">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="14:00"
                      title="24-hour time, e.g. 14:00 for 2:00 PM"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(sanitizeTimeTyping(e.target.value))}
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
                      type="button"
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="w-full py-3 bg-blue-50 text-blue-900 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border-2 border-blue-100 active:scale-95 transition-transform"
                    >
                      <Download size={14} /> Download
                    </button>

                    {showDownloadMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-full bg-white border-2 border-blue-100 rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden animate-slide-up">
                        <button
                          type="button"
                          onClick={() => {
                            void handleDownload('IMAGE');
                            setShowDownloadMenu(false);
                          }}
                          className="px-4 py-3 text-[9px] font-black text-blue-900 uppercase hover:bg-blue-50 border-b border-blue-50 flex items-center justify-between"
                        >
                          Save as Image <ImageIcon size={12} className="text-yellow-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDownload('PDF');
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
                  type="button"
                  onClick={() => {
                    void handleDone();
                  }}
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

interface QrGeneratorModalProps {
  professor: Professor;
  onClose: () => void;
  initialRecord?: QrRecord;
  /** With no log selected: `'floor'` = static 2×2 codes; `'session'` = timed QR registration. */
  view?: 'floor' | 'session';
}

const QrGeneratorModal: React.FC<QrGeneratorModalProps> = ({ professor, initialRecord, onClose, view = 'session' }) => {
  if (!initialRecord && view === 'floor') {
    return <FloorQrGalleryModal professor={professor} onClose={onClose} />;
  }
  return <SessionQrFormModal professor={professor} initialRecord={initialRecord} onClose={onClose} />;
};

export default QrGeneratorModal;
