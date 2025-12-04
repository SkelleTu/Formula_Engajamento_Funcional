// Sistema de Analytics e Rastreamento
import { collectDeviceSignals, collectBehavioralSignals } from './fingerprint';

export interface VisitorData {
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  landingPage?: string;
}

class AnalyticsTracker {
  private visitorId: string;
  private sessionId: string;
  private apiUrl: string;
  private pageStartTime: number;
  private maxScrollDepth: number;
  private eventQueue: any[];
  private isInitialized: boolean;
  private isTrackingAllowed: boolean;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.apiUrl = '/api/analytics';
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;
    this.eventQueue = [];
    this.isInitialized = false;
    this.isTrackingAllowed = false; // Deny-by-default
  }

  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private detectDevice(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet|ipad/i.test(ua)) return 'Tablet';
    return 'Desktop';
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edg') > -1) return 'Edge';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
    return 'Unknown';
  }

  private detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    return 'Unknown';
  }

  async init() {
    if (this.isInitialized) return;

    // Verificar DNT (Do Not Track) - apenas bloquear se EXPLICITAMENTE ativado
    const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
    
    // Bloquear APENAS se DNT está explicitamente ATIVADO ('1' ou 'yes')
    // Se DNT é null, undefined, '0', 'no' ou ausente = PERMITIR tracking
    if (dnt === '1' || dnt === 'yes') {
      console.log('🔒 Analytics desabilitado - Do Not Track está ativado');
      this.isInitialized = true; // Marca como inicializado para não tentar novamente
      this.isTrackingAllowed = false; // Bloqueia todos os métodos de tracking
      return; // NÃO coleta NADA
    }

    console.log('✅ Analytics habilitado - Do Not Track não está ativado');
    this.isTrackingAllowed = true; // Permite tracking

    const visitorData: VisitorData = {
      userAgent: navigator.userAgent,
      deviceType: this.detectDevice(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      referrer: document.referrer || 'Direct',
      landingPage: window.location.href
    };

    try {
      // Tentar obter localização (pode falhar se API não disponível)
      const locationData = await this.getLocationData();
      Object.assign(visitorData, locationData);
    } catch (error) {
      console.log('Não foi possível obter dados de localização');
    }

    await this.sendData('/visitor', { visitorId: this.visitorId, userData: visitorData });

    // Coletar e enviar sinais de fingerprinting + comportamentais para inferência demográfica
    await this.collectAndSendSignals();

    this.setupEventListeners();
    this.isInitialized = true;
  }

  private async collectAndSendSignals() {
    try {
      // DNT já foi verificado no init(), aqui só coleta
      const deviceSignals = await collectDeviceSignals();
      const behavioralSignals = collectBehavioralSignals();

      await this.sendData('/signals', {
        visitorId: this.visitorId,
        deviceSignals,
        behavioralSignals
      });
    } catch (error) {
      console.error('Erro ao coletar sinais:', error);
    }
  }

  private async getLocationData() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        ip: data.ip,
        country: data.country_name,
        city: data.city,
        region: data.region
      };
    } catch {
      return {};
    }
  }

  private setupEventListeners() {
    // Rastrear cliques
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      this.trackEvent('click', {
        element: target.tagName,
        text: target.textContent?.substring(0, 100),
        className: target.className,
        id: target.id,
        x: e.clientX,
        y: e.clientY
      });
    });

    // Rastrear scroll
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > this.maxScrollDepth) {
        this.maxScrollDepth = scrollDepth;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackEvent('scroll', {
          depth: this.maxScrollDepth
        });
      }, 500);
    });

    // Rastrear saída da página
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
      this.trackPageView(timeSpent);
    });

    // Rastrear mudanças de foco
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden
      });
    });
  }

  async trackEvent(eventType: string, eventData: any = {}) {
    if (!this.isInitialized || !this.isTrackingAllowed) return;
    
    await this.sendData('/event', {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      eventType,
      eventData,
      pageUrl: window.location.href
    });
  }

  async trackPageView(timeSpent?: number) {
    if (!this.isInitialized || !this.isTrackingAllowed) return;
    
    const time = timeSpent || Math.round((Date.now() - this.pageStartTime) / 1000);
    
    await this.sendData('/pageview', {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      timeSpent: time,
      scrollDepth: this.maxScrollDepth
    });

    // Reset para nova página
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;
  }

  async trackRegistration(data: { email?: string; name?: string; phone?: string; [key: string]: any }) {
    if (!this.isInitialized || !this.isTrackingAllowed) return;
    
    await this.sendData('/registration', {
      visitorId: this.visitorId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      registrationData: data
    });
  }

  private async sendData(endpoint: string, data: any) {
    try {
      // Obter valor atual de DNT para enviar no cabeçalho
      const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
      const dntValue = (dnt === '1' || dnt === 'yes') ? '1' : '0';
      
      await fetch(this.apiUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DNT': dntValue
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Erro ao enviar dados de analytics:', error);
      // Adicionar à fila para retry
      this.eventQueue.push({ endpoint, data });
    }
  }

  getVisitorId() {
    return this.visitorId;
  }

  getSessionId() {
    return this.sessionId;
  }
}

// Instância global
export const analytics = new AnalyticsTracker();

// Auto-inicializar quando o DOM estiver pronto
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analytics.init());
  } else {
    analytics.init();
  }
}
