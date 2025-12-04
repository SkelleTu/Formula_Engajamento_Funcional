import { createContext, useContext, useState, ReactNode } from 'react';
import ErrorToast, { ErrorDetails } from '../components/ErrorToast';

interface ErrorContextType {
  showError: (error: ErrorDetails) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const showError = (errorDetails: ErrorDetails) => {
    console.error('🔴 ERRO CAPTURADO PELO SISTEMA:', errorDetails);
    setError(errorDetails);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}
      {error && <ErrorToast error={error} onClose={clearError} />}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
