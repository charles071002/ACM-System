import React from 'react';
import { X, BookOpen, Smartphone, KeyRound, GraduationCap, Info } from 'lucide-react';

interface DeveloperManualModalProps {
  onClose: () => void;
}

const DeveloperManualModal: React.FC<DeveloperManualModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up border-4 border-yellow-500"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-manual-title"
      >
        <div className="p-10 border-b-2 border-yellow-500 flex justify-between items-center bg-blue-900 text-white">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-500 text-blue-900 rounded-3xl shadow-lg">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 id="dev-manual-title" className="text-2xl font-black tracking-tight text-yellow-400">
                DEVELOPER USER MANUAL
              </h3>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Admin guide — login, security, professor registry</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 text-yellow-500 rounded-full transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <Smartphone className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Accessing developer mode</h4>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm leading-relaxed font-medium">
              <li>Open the mobile application on your device.</li>
              <li>
                On the home screen, tap <span className="font-black text-blue-900">Developer</span> to open the developer login page.
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <KeyRound className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Login &amp; security setup</h4>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm leading-relaxed font-medium">
              <li>Sign in with the default developer account credentials.</li>
              <li>
                Change your password right away:
                <ul className="mt-2 ml-5 list-disc space-y-1 font-medium">
                  <li>
                    Tap the <span className="font-black text-blue-900">☰</span> menu icon (top right).
                  </li>
                  <li>
                    Choose <span className="font-black text-blue-900">Change Password</span>.
                  </li>
                  <li>Enter the current (default) password.</li>
                  <li>Enter and confirm your new password, then save.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <GraduationCap className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Managing professor accounts</h4>
            </div>
            <ol className="list-decimal list-inside space-y-4 text-blue-800 text-sm leading-relaxed font-medium">
              <li>
                To manage a professor, tap the <span className="font-black text-blue-900">☰</span> menu on that professor&apos;s row.
              </li>
              <li>
                <span className="font-black text-blue-900">Edit name:</span> choose <span className="font-black text-blue-900">Edit Name</span>, enter the updated name, save.
              </li>
              <li>
                <span className="font-black text-blue-900">PIN reset:</span> choose <span className="font-black text-blue-900">Edit PIN Code</span>, enter the new PIN, save.
              </li>
              <li>
                <span className="font-black text-blue-900">Compartment number:</span> choose{' '}
                <span className="font-black text-blue-900">Edit Compartment Number</span>, select the professor to swap with, confirm the update.
              </li>
            </ol>
          </section>

          <section className="space-y-4 pb-6">
            <div className="flex items-center gap-3 text-blue-900">
              <Info className="text-yellow-600 shrink-0" size={24} />
              <h4 className="font-black text-xl tracking-tight">Notes for proper use</h4>
            </div>
            <ul className="space-y-2 text-blue-800 text-sm leading-relaxed font-medium border-l-4 border-yellow-500 pl-4">
              <li>Verify changes before saving.</li>
              <li>Only authorized developers should use this module.</li>
              <li>Keep all login credentials confidential.</li>
              <li>Double-check professor details to avoid assignment errors.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DeveloperManualModal;
