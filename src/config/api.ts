/**
 * Configuração da API
 * 
 * Em desenvolvimento (Replit): usa o proxy do Vite (/api)
 * Em produção (Vercel): usa a URL completa do backend
 */

const getApiBaseUrl = (): string => {
  // Se estiver rodando no Vercel ou em produção, usa a variável de ambiente
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Em desenvolvimento local, usa o proxy do Vite
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper para criar URLs de API completas
 */
export const apiUrl = (endpoint: string): string => {
  // Remove barra inicial se existir
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
