// Utilitário para opt-out e exclusão de dados (LGPD)
import { apiUrl } from '../config/api';

export async function deleteMyData(): Promise<boolean> {
  try {
    const visitorId = localStorage.getItem('visitorId');
    
    if (!visitorId) {
      console.log('Nenhum dado para deletar - você ainda não foi rastreado');
      return true;
    }

    const response = await fetch(apiUrl('/api/analytics/delete-my-data'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ visitorId })
    });

    if (response.ok) {
      // Limpar dados locais também
      localStorage.removeItem('visitorId');
      sessionStorage.removeItem('sessionId');
      sessionStorage.removeItem('demographics_collected');
      
      console.log('✅ Todos os seus dados foram removidos com sucesso');
      return true;
    } else {
      console.error('Erro ao deletar dados');
      return false;
    }
  } catch (error) {
    console.error('Erro ao solicitar exclusão de dados:', error);
    return false;
  }
}

export function enableDoNotTrack() {
  // Informar ao usuário como ativar DNT no navegador
  const instructions = {
    chrome: 'Chrome: Settings → Privacy and Security → Send a "Do Not Track" request',
    firefox: 'Firefox: Settings → Privacy & Security → Tell websites not to track me',
    safari: 'Safari: Preferences → Privacy → Website tracking: Ask websites not to track me',
    edge: 'Edge: Settings → Privacy → Send "Do Not Track" requests'
  };

  console.log('Para ativar Do Not Track no seu navegador:');
  console.log(instructions);
  
  return instructions;
}

// Verificar se DNT está ativado
export function isDoNotTrackEnabled(): boolean {
  const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

// Exportar função global para ser usada no console
if (typeof window !== 'undefined') {
  (window as any).deleteMyData = deleteMyData;
  (window as any).checkDoNotTrack = isDoNotTrackEnabled;
}
