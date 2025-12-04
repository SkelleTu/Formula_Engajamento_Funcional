// Google Analytics 4 Integration (adapted from Replit blueprint)

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Google Analytics não configurado. Adicione VITE_GA_MEASUREMENT_ID nas variáveis de ambiente.');
    return;
  }

  // Add Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      anonymize_ip: true
    });
  `;
  document.head.appendChild(script2);
};

// Track page views (useful for single-page applications)
export const trackPageView = (url: string) => {
  // Verificar DNT antes de rastrear
  const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  if (dnt === '1' || dnt === 'yes') {
    return; // Não rastrear se DNT está ativado
  }
  
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  // Verificar DNT antes de rastrear
  const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  if (dnt === '1' || dnt === 'yes') {
    return; // Não rastrear se DNT está ativado
  }
  
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track demographics (custom event)
export const trackDemographics = (data: {
  ageRange?: string;
  gender?: string;
  interests?: string;
}) => {
  // Verificar DNT antes de rastrear
  const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  if (dnt === '1' || dnt === 'yes') {
    return; // Não rastrear se DNT está ativado
  }
  
  trackEvent('user_demographics', 'engagement', 'demographics_submitted');
  
  // Set user properties for better audience insights
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', {
      age_range: data.ageRange,
      gender: data.gender,
      interests: data.interests
    });
  }
};

// Track conversions
export const trackConversion = (value?: number) => {
  trackEvent('conversion', 'registration', 'form_submitted', value || 0);
};

// Track video progress
export const trackVideoView = (videoTitle: string, progress: number) => {
  trackEvent('video_progress', 'video', videoTitle, progress);
};
