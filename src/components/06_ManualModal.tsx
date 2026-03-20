import React from 'react';
import { X, BookOpen, Settings, Monitor, ShieldCheck, Cpu } from 'lucide-react';

interface ManualModalProps {
  onClose: () => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up border-4 border-yellow-500">
        {/* Header */}
        <div className="p-10 border-b-2 border-yellow-500 flex justify-between items-center bg-blue-900 text-white">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-500 text-blue-900 rounded-3xl shadow-lg">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-yellow-400">PROFESSOR MANUAL</h3>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">IT Configuration & System Control</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 text-yellow-500 rounded-full transition-colors">
            <X size={32} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <ShieldCheck className="text-yellow-600" size={24} />
              <h4 className="font-black text-xl tracking-tight">Security & Auth</h4>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed font-medium">
              Access is strictly restricted to verified faculty members. Use the designated university-issued PIN to interact with the cabinet hardware.
              Logs are transmitted via secure MQTT channels to the central RTU server.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <Monitor className="text-yellow-600" size={24} />
              <h4 className="font-black text-xl tracking-tight">Live Monitoring</h4>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed font-medium">
              The dashboard displays data pulled from IR proximity sensors located inside each ACM cabinet drawer.
              The 'Submitted' state confirms physical presence of student projects within the locked enclosure.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <Cpu className="text-yellow-600" size={24} />
              <h4 className="font-black text-xl tracking-tight">Hardware Node Specs</h4>
            </div>
            <div className="bg-blue-50 rounded-[2rem] p-8 border-2 border-blue-100">
              <ul className="space-y-4">
                <li className="flex gap-4 text-sm font-bold text-blue-900">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    <strong className="text-yellow-600">Core:</strong> Dual-Core ESP32 IoT Node
                  </span>
                </li>
                <li className="flex gap-4 text-sm font-bold text-blue-900">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    <strong className="text-yellow-600">Protocol:</strong> WSS (WebSocket Secure) + TLS 1.3
                  </span>
                </li>
                <li className="flex gap-4 text-sm font-bold text-blue-900">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    <strong className="text-yellow-600">Peripheral:</strong> MFRC522 RFID + 12V Solenoid Locks
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4 pb-6">
            <div className="flex items-center gap-3 text-blue-900">
              <Settings className="text-yellow-600" size={24} />
              <h4 className="font-black text-xl tracking-tight">Administrative Override</h4>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed font-medium italic border-l-4 border-yellow-500 pl-4">
              In manual failure mode, use the physical override key or the 'Emergency Release' API call located in the advanced logs section.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t-2 border-blue-50 flex justify-center">
          <button
            onClick={onClose}
            className="px-16 py-4 bg-blue-900 text-yellow-400 font-black text-lg rounded-[1.5rem] hover:bg-blue-800 transition-all active:scale-95 shadow-xl border-b-4 border-yellow-600"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualModal;

