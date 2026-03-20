
import React from 'react';

interface LandingPageProps {
  onProfessorClick: () => void;
  onDeveloperClick: () => void;
  onOpenManual: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onProfessorClick, onDeveloperClick, onOpenManual }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 relative overflow-hidden h-full">
      {/* Menu Icon Top-Right (Gold accent) */}
      <button 
        onClick={onOpenManual}
        className="absolute right-6 top-6 p-2 hover:bg-yellow-100 text-yellow-600 rounded-full transition-colors flex items-center justify-center z-50 border border-yellow-200 shadow-sm"
        aria-label="Manual Access"
      >
        <span className="text-2xl" role="img" aria-label="info">☰</span>
      </button>

      {/* Centered Header Text Block - Transparent background, Blue and Gold text */}
      <div className="text-center w-full max-w-lg flex flex-col items-center animate-fade-in px-4">
        <h1 className="text-5xl font-black text-blue-900 uppercase tracking-wider leading-none mb-3">ACM</h1>
        <div className="h-1.5 w-24 bg-yellow-500 rounded-full mb-6"></div>
        <p className="text-lg md:text-xl font-bold text-blue-800 leading-tight tracking-wide">
          Automated Cabinet Management System
        </p>
        <p className="text-sm md:text-base font-semibold text-yellow-600 mt-2 uppercase tracking-[0.15em]">
          Rizal Technological University
        </p>
      </div>

      {/* Professor Button centered below header */}
      <div className="animate-fade-in flex flex-col items-center mt-4">
        <button
          onClick={onProfessorClick}
          className="group relative w-64 py-10 px-8 bg-blue-900 hover:bg-blue-800 text-white rounded-[2rem] shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-4 overflow-hidden border-4 border-yellow-500"
        >
          <span className="text-2xl font-black tracking-[0.2em] uppercase text-yellow-400">Professor</span>
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </button>
      </div>

      {/* Developer Trigger - Lower Center */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-fade-in delay-500">
        <button 
          onClick={onDeveloperClick}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900/40 hover:text-blue-900 transition-colors p-4"
        >
          Developer
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
