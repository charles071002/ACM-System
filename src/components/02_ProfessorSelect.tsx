import React from 'react';
import { Professor } from '../types';
import { ChevronLeft, GraduationCap } from 'lucide-react';

interface ProfessorSelectProps {
  professors: Professor[];
  onSelect: (prof: Professor) => void;
  onBack: () => void;
  onOpenManual: () => void;
}

const ProfessorSelect: React.FC<ProfessorSelectProps> = ({ professors, onSelect, onBack, onOpenManual }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Screen Specific Top Header */}
      <header className="bg-white border-b-4 border-yellow-500 text-blue-900 p-6 shadow-sm relative flex flex-col items-center justify-center text-center z-10 flex-shrink-0">
        <h1 className="text-2xl font-black uppercase tracking-wider leading-none mb-1">ACM</h1>
        <p className="text-xs md:text-sm font-bold text-blue-800 tracking-wide">
          Automated Cabinet Management System
        </p>
        <p className="text-[10px] md:text-xs font-semibold text-yellow-600 uppercase tracking-wider">
          Rizal Technological University
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full p-6 relative">
        <div className="w-full max-w-5xl mx-auto flex flex-col animate-slide-up relative pt-4">
          {/* Top row: Back (left) + Manual menu (right) */}
          <div className="flex items-center justify-between gap-4 mb-6 px-1">
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
              <span className="text-2xl" role="img" aria-label="info">☰</span>
            </button>
          </div>

          <div className="flex items-center justify-center mb-8 mt-4 px-2">
            <h2 className="text-xl font-black text-blue-900 flex items-center gap-2">
              <GraduationCap className="text-yellow-500" size={24} />
              PROFESSOR
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {professors.map((prof) => (
              <button
                key={prof.id}
                onClick={() => onSelect(prof)}
                className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-yellow-500 hover:shadow-md transition-all text-center flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center group-hover:bg-blue-900 group-hover:text-yellow-400 transition-all border border-blue-100 group-hover:border-yellow-500">
                  <GraduationCap size={32} />
                </div>

                <div className="flex flex-col items-center">
                  <p className="font-black text-blue-900 leading-tight text-sm md:text-base group-hover:text-blue-800 transition-colors">
                    {prof.name}
                  </p>
                  <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mt-1">
                    {prof.department} DEPARTMENT
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessorSelect;

