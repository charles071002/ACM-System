import React, { useEffect, useState } from 'react';
import { AppState, Professor } from '../types';
import LandingPage from '../screens/01_landing/LandingScreen';
import ProfessorSelect from '../screens/02_professor-select/ProfessorSelectScreen';
import Dashboard from '../screens/03_professor-dashboard/ProfessorDashboardScreen';
import ManualModal from '../screens/06_modals/ManualModal';
import PinModal from '../screens/06_modals/PinModal';
import DevLogin from '../screens/04_dev-login/DevLoginScreen';
import DevDashboard from '../screens/05_dev-dashboard/DevDashboardScreen';
import { fetchProfessorsFromApi } from '../lib/api';

const App: React.FC = () => {
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
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isProfessorAuthenticated, setIsProfessorAuthenticated] = useState(false);
  const [isDeveloperAuthenticated, setIsDeveloperAuthenticated] = useState(false);

  const replaceUrl = (path: string) => window.history.replaceState({}, '', path);
  const pushUrl = (path: string) => window.history.pushState({}, '', path);

  // Strict DB-only source of truth for professor registry.
  useEffect(() => {
    let isMounted = true;

    const loadProfessors = async () => {
      try {
        const remoteProfessors = await fetchProfessorsFromApi();
        if (isMounted) {
          setProfessors(remoteProfessors);
        }
      } catch {
        if (isMounted) {
          setProfessors([]);
        }
      }
    };

    loadProfessors();
    return () => {
      isMounted = false;
    };
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
        const prof = profFromPath || selectedProfessor;

        if (prof && isProfessorAuthenticated) {
          setSelectedProfessor(prof);
          const canonicalPath = stateToPath(AppState.DASHBOARD, prof);
          if (normalizePath(window.location.pathname) !== canonicalPath) {
            replaceUrl(canonicalPath);
          }
        } else {
          // Guard professor dashboard: requires professor context + verified PIN session
          setSelectedProfessor(null);
          setIsProfessorAuthenticated(false);
          resolvedState = AppState.PROF_SELECT;
          replaceUrl(stateToPath(AppState.PROF_SELECT));
        }
      }

      if (nextState === AppState.DEV_DASHBOARD && !isDeveloperAuthenticated) {
        // Guard developer dashboard: requires successful developer login
        resolvedState = AppState.DEV_LOGIN;
        replaceUrl(stateToPath(AppState.DEV_LOGIN));
      }

      setCurrentPage(resolvedState);

      // Only clear professor context when leaving the professor flow.
      // While on PROF_SELECT we may intentionally keep the selected professor + PIN modal open.
      if (resolvedState !== AppState.DASHBOARD && resolvedState !== AppState.PROF_SELECT) {
        setSelectedProfessor(null);
        setIsPinModalOpen(false);
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [professors, selectedProfessor, isProfessorAuthenticated, isDeveloperAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (nextState: AppState, prof?: Professor | null) => {
    const targetProf = prof ?? selectedProfessor;
    const path = stateToPath(nextState, targetProf);
    pushUrl(path);
    setCurrentPage(nextState);
  };

  const handleProfessorClick = () => navigate(AppState.PROF_SELECT);
  const handleDeveloperClick = () => navigate(AppState.DEV_LOGIN);

  const handleSelectProfessor = (prof: Professor) => {
    setIsProfessorAuthenticated(false);
    setSelectedProfessor(prof);
    setIsPinModalOpen(true);
  };

  const handlePinVerified = () => {
    setIsProfessorAuthenticated(true);
    setIsPinModalOpen(false);
    navigate(AppState.DASHBOARD, selectedProfessor);
  };

  const handleDevLoginSuccess = () => {
    setIsDeveloperAuthenticated(true);
    navigate(AppState.DEV_DASHBOARD);
  };

  const goBackToLanding = () => {
    setIsDeveloperAuthenticated(false);
    setIsProfessorAuthenticated(false);
    navigate(AppState.LANDING);
  };

  const goBackToSelect = () => {
    setIsProfessorAuthenticated(false);
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

