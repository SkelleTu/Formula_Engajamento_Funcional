import { supabase } from '../lib/supabase';

export async function deleteMyData(): Promise<boolean> {
  try {
    const visitorId = localStorage.getItem('visitorId');
    
    if (!visitorId) {
      console.log('Nenhum dado para deletar - você ainda não foi rastreado');
      return true;
    }

    await supabase.from('visitor_signals').delete().eq('visitor_id', visitorId);
    await supabase.from('inferred_demographics').delete().eq('visitor_id', visitorId);
    await supabase.from('page_views').delete().eq('visitor_id', visitorId);
    await supabase.from('events').delete().eq('visitor_id', visitorId);
    await supabase.from('registrations').delete().eq('visitor_id', visitorId);
    await supabase.from('visitors').delete().eq('visitor_id', visitorId);

    localStorage.removeItem('visitorId');
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('demographics_collected');
    
    console.log('Todos os seus dados foram removidos com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao solicitar exclusão de dados:', error);
    return false;
  }
}

export function enableDoNotTrack() {
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

export function isDoNotTrackEnabled(): boolean {
  const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

if (typeof window !== 'undefined') {
  (window as any).deleteMyData = deleteMyData;
  (window as any).checkDoNotTrack = isDoNotTrackEnabled;
}
