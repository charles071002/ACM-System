import React, { useState, useEffect } from 'react';
import { AppState, Professor } from '../types';
import LandingPage from '../screens/01_landing/LandingScreen';
import ProfessorSelect from '../screens/02_professor-select/ProfessorSelectScreen';
import Dashboard from '../screens/03_professor-dashboard/ProfessorDashboardScreen';
import ManualModal from '../screens/06_modals/ManualModal';
import PinModal from '../screens/06_modals/PinModal';
import DevLogin from '../screens/04_dev-login/DevLoginScreen';
import DevDashboard from '../screens/05_dev-dashboard/DevDashboardScreen';
import { PROFESSORS } from '../constants';
import { StorageService } from '../lib/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.LANDING);
  const [professors, setProfessors] = useState<Professor[]>(() => StorageService.getProfessors(PROFESSORS));
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Sync state if professors are updated by dev
  useEffect(() => {
    setProfessors(StorageService.getProfessors(PROFESSORS));
  }, [currentPage]);

  const handleProfessorClick = () => {
    setCurrentPage(AppState.PROF_SELECT);
  };

  const handleDeveloperClick = () => {
    setCurrentPage(AppState.DEV_LOGIN);
  };

  const handleSelectProfessor = (prof: Professor) => {
    setSelectedProfessor(prof);
    setIsPinModalOpen(true);
  };

  const handlePinVerified = () => {
    setIsPinModalOpen(false);
    setCurrentPage(AppState.DASHBOARD);
  };

  const handleDevLoginSuccess = () => {
    setCurrentPage(AppState.DEV_DASHBOARD);
  };

  const goBackToLanding = () => {
    setCurrentPage(AppState.LANDING);
  };

  const goBackToSelect = () => {
    setCurrentPage(AppState.PROF_SELECT);
  };

  const openManual = () => setIsManualOpen(true);

  return (
    <div className="fixed inset-0 flex flex-col font-sans bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentPage === AppState.LANDING && (
          <LandingPage
            onProfessorClick={handleProfessorClick}
            onDeveloperClick={handleDeveloperClick}
            onOpenManual={openManual}
          />
        )}

        {currentPage === AppState.PROF_SELECT && (
          <ProfessorSelect
            professors={professors}
            onSelect={handleSelectProfessor}
            onBack={goBackToLanding}
            onOpenManual={openManual}
          />
        )}

        {currentPage === AppState.DASHBOARD && selectedProfessor && (
          <Dashboard
            professor={selectedProfessor}
            onBack={goBackToSelect}
            onOpenManual={openManual}
          />
        )}

        {currentPage === AppState.DEV_LOGIN && (
          <DevLogin
            onSuccess={handleDevLoginSuccess}
            onBack={goBackToLanding}
          />
        )}

        {currentPage === AppState.DEV_DASHBOARD && (
          <DevDashboard
            initialProfessors={professors}
            onBack={goBackToLanding}
          />
        )}
      </div>

      {isManualOpen && (
        <ManualModal onClose={() => setIsManualOpen(false)} />
      )}

      {isPinModalOpen && selectedProfessor && (
        <PinModal
          professor={selectedProfessor}
          onVerify={handlePinVerified}
          onClose={() => setIsPinModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

