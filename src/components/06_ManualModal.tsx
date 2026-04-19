import React from 'react';
import { X, BookOpen, Smartphone, ShieldCheck, QrCode, Box, Info } from 'lucide-react';

interface ManualModalProps {
  onClose: () => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up border-4 border-yellow-500"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-title"
      >
        <div className="p-10 border-b-2 border-yellow-500 flex justify-between items-center bg-blue-900 text-white">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-500 text-blue-900 rounded-3xl shadow-lg">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 id="manual-title" className="text-2xl font-black tracking-tight text-yellow-400">
                PROFESSOR USER MANUAL
              </h3>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Faculty guide — PIN, QR codes and compartments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 text-yellow-500 rounded-full transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <Smartphone className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Getting started</h4>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm leading-relaxed font-medium">
              <li>Open the mobile application on your device.</li>
              <li>
                On the home screen, tap <span className="font-black text-blue-900">Professor</span> to go to professor selection.
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <ShieldCheck className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Account setup</h4>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm leading-relaxed font-medium">
              <li>Select your assigned professor profile to continue to verification.</li>
              <li>Enter the default PIN you were given to open the professor dashboard.</li>
              <li>
                For security, change your PIN right away:
                <ul className="mt-2 ml-5 list-disc space-y-1 font-medium">
                  <li>Tap <span className="font-black text-blue-900">Change PIN Code</span>.</li>
                  <li>Enter a new PIN only you will use.</li>
                  <li>Confirm and save.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <QrCode className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Scheduling QR codes</h4>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm leading-relaxed font-medium">
              <li>
                Tap <span className="font-black text-blue-900">View Available QR Code</span> to see your QR options.
              </li>
              <li>
                Pick the QR you need, then:
                <ul className="mt-2 ml-5 list-disc space-y-1 font-medium">
                  <li>Tap <span className="font-black text-blue-900">Download</span> to save it, or</li>
                  <li>Tap <span className="font-black text-blue-900">Copy</span> to share it.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <Box className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Accessing compartments</h4>
            </div>
            <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm leading-relaxed font-medium">
              <li>
                Tap <span className="font-black text-blue-900">Compartment QR</span> to open the compartment QR screen.
              </li>
              <li>Show or scan that QR at the cabinet scanner.</li>
              <li>Wait for confirmation before opening the compartment.</li>
            </ul>
          </section>

          <section className="space-y-4 pb-6">
            <div className="flex items-center gap-3 text-blue-900">
              <Info className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Notes for proper use</h4>
            </div>
            <ul className="space-y-2 text-blue-800 text-sm leading-relaxed font-medium border-l-4 border-yellow-500 pl-4">
              <li>Keep your PIN private. Do not share it.</li>
              <li>Contact support if a QR will not scan or has expired.</li>
              <li>Contact support if you forget your PIN.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
