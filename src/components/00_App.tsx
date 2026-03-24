import React, { useEffect, useMemo, useState } from 'react';
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
  const SELECTED_PROFESSOR_KEY = 'acm_selected_professor_id';
  const PROFESSOR_AUTH_KEY = 'acm_professor_authenticated';
  const DEV_AUTH_KEY = 'acm_developer_authenticated';

  const normalizePath = (p: string) => {
    const withSlash = p.startsWith('/') ? p : `/${p}`;
    const trimmed = withSlash.replace(/\/+$/, '');
    return trimmed.length ? trimmed : '/';
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const getProfessorSlug = (prof: Professor) => {
    const parts = prof.name.trim().split(/\s+/);
    const lastName = parts.length ? parts[parts.length - 1] : prof.name;
    return slugify(lastName);
  };

  const extractDashboardSlug = (p: string): string | null => {
    const path = normalizePath(p);
    const match = path.match(/^\/professor\/dashboard\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const pathToState = (p: string): AppState => {
    const path = normalizePath(p);
    if (/^\/professor\/dashboard\/[^/]+$/.test(path)) {
      return AppState.DASHBOARD;
    }
    switch (path) {
      case '/':
        return AppState.LANDING;
      case '/professor':
        return AppState.PROF_SELECT;
      case '/professor/dashboard':
        return AppState.DASHBOARD;
      case '/developer':
        return AppState.DEV_LOGIN;
      case '/developer/dashboard':
        return AppState.DEV_DASHBOARD;
      default:
        return AppState.LANDING;
    }
  };

  const stateToPath = (s: AppState, prof?: Professor | null): string => {
    switch (s) {
      case AppState.LANDING:
        return '/';
      case AppState.PROF_SELECT:
        return '/professor';
      case AppState.DASHBOARD:
        if (prof) {
          return `/professor/dashboard/${encodeURIComponent(getProfessorSlug(prof))}`;
        }
        return '/professor/dashboard';
      case AppState.DEV_LOGIN:
        return '/developer';
      case AppState.DEV_DASHBOARD:
        return '/developer/dashboard';
    }
  };

  const initialPath = typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/';
  const [currentPage, setCurrentPage] = useState<AppState>(pathToState(initialPath));
  const [professors, setProfessors] = useState<Professor[]>(() => StorageService.getProfessors(PROFESSORS));
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const selectedProfessorFromStorage = useMemo(() => {
    const id = localStorage.getItem(SELECTED_PROFESSOR_KEY);
    if (!id) return null;
    return professors.find((p) => p.id === id) || null;
  }, [professors]);

  const isProfessorAuthenticated = () => localStorage.getItem(PROFESSOR_AUTH_KEY) === 'true';
  const setProfessorAuthenticated = (value: boolean) => localStorage.setItem(PROFESSOR_AUTH_KEY, value ? 'true' : 'false');
  const isDeveloperAuthenticated = () => localStorage.getItem(DEV_AUTH_KEY) === 'true';
  const setDeveloperAuthenticated = (value: boolean) => localStorage.setItem(DEV_AUTH_KEY, value ? 'true' : 'false');

  const replaceUrl = (path: string) => window.history.replaceState({}, '', path);
  const pushUrl = (path: string) => window.history.pushState({}, '', path);

  // Sync state if professors are updated by dev
  useEffect(() => {
    setProfessors(StorageService.getProfessors(PROFESSORS));
  }, [currentPage]);

  // Keep currentPage in sync with browser URL
  useEffect(() => {
    const syncFromUrl = () => {
      const nextState = pathToState(window.location.pathname);
      let resolvedState = nextState;

      if (nextState === AppState.DASHBOARD) {
        const slugFromPath = extractDashboardSlug(window.location.pathname);
        const profFromPath = slugFromPath
          ? professors.find((p) => getProfessorSlug(p) === slugFromPath) || null
          : null;
        const prof = profFromPath || selectedProfessorFromStorage;

        if (prof && isProfessorAuthenticated()) {
          setSelectedProfessor(prof);
          localStorage.setItem(SELECTED_PROFESSOR_KEY, prof.id);
          const canonicalPath = stateToPath(AppState.DASHBOARD, prof);
          if (normalizePath(window.location.pathname) !== canonicalPath) {
            replaceUrl(canonicalPath);
          }
        } else {
          // Guard professor dashboard: requires professor context + verified PIN session
          setSelectedProfessor(null);
          setProfessorAuthenticated(false);
          resolvedState = AppState.PROF_SELECT;
          replaceUrl(stateToPath(AppState.PROF_SELECT));
        }
      }

      if (nextState === AppState.DEV_DASHBOARD && !isDeveloperAuthenticated()) {
        // Guard developer dashboard: requires successful developer login
        resolvedState = AppState.DEV_LOGIN;
        replaceUrl(stateToPath(AppState.DEV_LOGIN));
      }

      setCurrentPage(resolvedState);

      if (resolvedState !== AppState.DASHBOARD) {
        setSelectedProfessor(null);
        setIsPinModalOpen(false);
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [selectedProfessorFromStorage]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (nextState: AppState, prof?: Professor | null) => {
    const targetProf = prof ?? selectedProfessor;
    const path = stateToPath(nextState, targetProf);
    pushUrl(path);
    setCurrentPage(nextState);
  };

  const handleProfessorClick = () => navigate(AppState.PROF_SELECT);
  const handleDeveloperClick = () => navigate(AppState.DEV_LOGIN);

  const handleSelectProfessor = (prof: Professor) => {
    localStorage.setItem(SELECTED_PROFESSOR_KEY, prof.id);
    setProfessorAuthenticated(false);
    setSelectedProfessor(prof);
    setIsPinModalOpen(true);
  };

  const handlePinVerified = () => {
    setProfessorAuthenticated(true);
    setIsPinModalOpen(false);
    navigate(AppState.DASHBOARD, selectedProfessor);
  };

  const handleDevLoginSuccess = () => {
    setDeveloperAuthenticated(true);
    navigate(AppState.DEV_DASHBOARD);
  };

  const goBackToLanding = () => {
    setDeveloperAuthenticated(false);
    setProfessorAuthenticated(false);
    navigate(AppState.LANDING);
  };

  const goBackToSelect = () => {
    setProfessorAuthenticated(false);
    navigate(AppState.PROF_SELECT);
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

