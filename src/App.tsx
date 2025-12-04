import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { analytics } from './utils/analytics';
import { inject } from '@vercel/analytics';
import { initGA, trackPageView } from './utils/googleAnalytics';
import { ErrorProvider } from './contexts/ErrorContext';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'registration' | 'confirmation'>('landing');
  const [userData, setUserData] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    analytics.trackPageView();
  }, [currentPage]);

  const handleNavigateToHome = () => {
    setCurrentPage('landing');
  };

  const handleNavigateToRegistration = () => {
    setCurrentPage('registration');
  };

  const handleRegistrationComplete = (data: { name: string; phone: string; email: string }) => {
    setUserData(data);
    setCurrentPage('confirmation');
  };

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigateToRegistration} onNavigateToHome={handleNavigateToHome} />}
      {currentPage === 'registration' && <RegistrationPage onComplete={handleRegistrationComplete} onNavigateToHome={handleNavigateToHome} onBack={() => setCurrentPage('landing')} />}
      {currentPage === 'confirmation' && <ConfirmationPage userData={userData} onNavigateToHome={handleNavigateToHome} onBack={() => setCurrentPage('registration')} />}
    </>
  );
}

// Hook para rastrear mudanças de rota no Google Analytics
function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Verificar DNT antes de rastrear no Google Analytics
    const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
    const isDNTEnabled = (dnt === '1' || dnt === 'yes');
    
    if (!isDNTEnabled) {
      trackPageView(location.pathname + location.search);
    }
  }, [location]);
}

function RouterWithTracking() {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Verificar DNT antes de inicializar qualquer sistema de analytics
    const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
    const isDNTEnabled = (dnt === '1' || dnt === 'yes');
    
    // Inicializar sistema de analytics customizado (SEMPRE - ele já verifica DNT internamente)
    analytics.init();
    
    // Inicializar Vercel Analytics APENAS se DNT não estiver ativado
    if (!isDNTEnabled) {
      inject();
    } else {
      console.log('🔒 Vercel Analytics desabilitado - Do Not Track está ativado');
    }
    
    // Inicializar Google Analytics 4 APENAS se DNT não estiver ativado e se configurado
    if (!isDNTEnabled) {
      initGA();
    } else {
      console.log('🔒 Google Analytics desabilitado - Do Not Track está ativado');
    }
  }, []);

  return (
    <ErrorProvider>
      <BrowserRouter>
        <RouterWithTracking />
      </BrowserRouter>
    </ErrorProvider>
  );
}

export default App;
