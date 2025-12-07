import { supabase } from '../lib/supabase';
import { collectDeviceSignals, collectBehavioralSignals } from '../utils/fingerprint';

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

class SupabaseAnalyticsTracker {
  private visitorId: string;
  private sessionId: string;
  private pageStartTime: number;
  private maxScrollDepth: number;
  private isInitialized: boolean;
  private isTrackingAllowed: boolean;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;
    this.isInitialized = false;
    this.isTrackingAllowed = false;
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

    const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
    
    if (dnt === '1' || dnt === 'yes') {
      console.log('Analytics desabilitado - Do Not Track ativado');
      this.isInitialized = true;
      this.isTrackingAllowed = false;
      return;
    }

    console.log('Analytics habilitado - Supabase');
    this.isTrackingAllowed = true;

    const visitorData: VisitorData = {
      userAgent: navigator.userAgent,
      deviceType: this.detectDevice(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      referrer: document.referrer || 'Direct',
      landingPage: window.location.href
    };

    try {
      const locationData = await this.getLocationData();
      Object.assign(visitorData, locationData);
    } catch (error) {
      console.log('Não foi possível obter dados de localização');
    }

    await this.registerVisitor(visitorData);
    await this.collectAndSendSignals();
    this.setupEventListeners();
    this.isInitialized = true;
  }

  private async registerVisitor(userData: VisitorData) {
    try {
      const { data: existing } = await supabase
        .from('visitors')
        .select('*')
        .eq('visitor_id', this.visitorId)
        .single();

      if (existing) {
        await supabase
          .from('visitors')
          .update({
            last_visit: new Date().toISOString(),
            total_visits: (existing.total_visits || 0) + 1,
            ip_address: userData.ip || existing.ip_address,
            user_agent: userData.userAgent || existing.user_agent
          })
          .eq('visitor_id', this.visitorId);
      } else {
        await supabase
          .from('visitors')
          .insert({
            visitor_id: this.visitorId,
            ip_address: userData.ip,
            country: userData.country,
            city: userData.city,
            region: userData.region,
            user_agent: userData.userAgent,
            device_type: userData.deviceType,
            browser: userData.browser,
            os: userData.os,
            referrer: userData.referrer,
            landing_page: userData.landingPage,
            total_visits: 1
          });
      }
    } catch (error) {
      console.error('Erro ao registrar visitante:', error);
    }
  }

  private async collectAndSendSignals() {
    try {
      const deviceSignals = await collectDeviceSignals();
      const behavioralSignals = collectBehavioralSignals();

      await supabase
        .from('visitor_signals')
        .insert({
          visitor_id: this.visitorId,
          fingerprint_id: deviceSignals.fingerprintId,
          timezone: deviceSignals.timezone,
          language: deviceSignals.language,
          languages: deviceSignals.languages,
          screen_resolution: deviceSignals.screenResolution,
          color_depth: deviceSignals.colorDepth,
          hardware_concurrency: deviceSignals.hardwareConcurrency,
          device_memory: deviceSignals.deviceMemory || null,
          platform: deviceSignals.platform,
          touch_support: deviceSignals.touchSupport,
          cookie_enabled: deviceSignals.cookieEnabled,
          do_not_track: deviceSignals.doNotTrack,
          hour_of_day: behavioralSignals.hourOfDay,
          day_of_week: behavioralSignals.dayOfWeek,
          is_weekday: behavioralSignals.isWeekday,
          is_business_hours: behavioralSignals.isBusinessHours,
          referrer: behavioralSignals.referrer,
          landing_page: behavioralSignals.landingPage
        });

      const inference = this.inferDemographics(deviceSignals, behavioralSignals);

      if (inference.confidence > 0.3) {
        await supabase
          .from('inferred_demographics')
          .insert({
            visitor_id: this.visitorId,
            age_range: inference.ageRange,
            gender: inference.gender,
            occupation: inference.occupation,
            education_level: inference.educationLevel,
            interests: inference.interests,
            confidence_score: inference.confidence,
            algorithm_version: 'heuristic_v1.0'
          });

        await supabase
          .from('visitors')
          .update({
            age_range: inference.ageRange,
            gender: inference.gender,
            interests: inference.interests,
            occupation: inference.occupation,
            education_level: inference.educationLevel
          })
          .eq('visitor_id', this.visitorId);
      }
    } catch (error) {
      console.error('Erro ao coletar sinais:', error);
    }
  }

  private inferDemographics(deviceSignals: any, behavioralSignals: any) {
    let ageScore = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    let genderScore = { 'Masculino': 0, 'Feminino': 0, 'Outro': 0 };
    let occupationScore: Record<string, number> = {};
    let educationScore: Record<string, number> = {};
    let interests: string[] = [];

    if (deviceSignals.hardwareConcurrency >= 8) {
      ageScore['25-34'] += 2;
      ageScore['35-44'] += 1;
      occupationScore['Tecnologia'] = (occupationScore['Tecnologia'] || 0) + 2;
    }

    if (behavioralSignals.isBusinessHours) {
      occupationScore['Profissional'] = (occupationScore['Profissional'] || 0) + 1;
      ageScore['25-34'] += 1;
      ageScore['35-44'] += 1;
    }

    if (deviceSignals.deviceMemory && deviceSignals.deviceMemory >= 8) {
      occupationScore['Tecnologia'] = (occupationScore['Tecnologia'] || 0) + 1;
      educationScore['Superior'] = (educationScore['Superior'] || 0) + 1;
    }

    const platform = deviceSignals.platform?.toLowerCase() || '';
    if (platform.includes('mac')) {
      ageScore['25-34'] += 1;
      occupationScore['Criativo'] = (occupationScore['Criativo'] || 0) + 1;
    }

    interests.push('Marketing Digital');

    const getTop = (scores: Record<string, number>) => {
      const entries = Object.entries(scores);
      if (entries.length === 0) return 'Não identificado';
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    };

    return {
      ageRange: getTop(ageScore),
      gender: getTop(genderScore),
      occupation: getTop(occupationScore),
      educationLevel: getTop(educationScore),
      interests: interests.join(', '),
      confidence: 0.5
    };
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
        this.trackEvent('scroll', { depth: this.maxScrollDepth });
      }, 500);
    });

    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
      this.trackPageView(timeSpent);
    });

    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', { hidden: document.hidden });
    });
  }

  async trackEvent(eventType: string, eventData: any = {}) {
    if (!this.isInitialized || !this.isTrackingAllowed) return;
    
    try {
      await supabase
        .from('events')
        .insert({
          visitor_id: this.visitorId,
          session_id: this.sessionId,
          event_type: eventType,
          event_data: eventData,
          page_url: window.location.href
        });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
    }
  }

  async trackPageView(timeSpent?: number) {
    if (!this.isInitialized || !this.isTrackingAllowed) return;
    
    const time = timeSpent || Math.round((Date.now() - this.pageStartTime) / 1000);
    
    try {
      await supabase
        .from('page_views')
        .insert({
          visitor_id: this.visitorId,
          session_id: this.sessionId,
          page_url: window.location.href,
          page_title: document.title,
          time_spent: time,
          scroll_depth: this.maxScrollDepth
        });
    } catch (error) {
      console.error('Erro ao registrar page view:', error);
    }

    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;
  }

  async trackRegistration(data: { email?: string; name?: string; phone?: string; [key: string]: any }) {
    if (!this.isInitialized || !this.isTrackingAllowed) return;
    
    try {
      await supabase
        .from('registrations')
        .insert({
          visitor_id: this.visitorId,
          email: data.email,
          name: data.name,
          phone: data.phone,
          registration_data: data
        });
    } catch (error) {
      console.error('Erro ao registrar cadastro:', error);
    }
  }

  getVisitorId() {
    return this.visitorId;
  }

  getSessionId() {
    return this.sessionId;
  }

  async deleteMyData() {
    try {
      await supabase.from('visitor_signals').delete().eq('visitor_id', this.visitorId);
      await supabase.from('inferred_demographics').delete().eq('visitor_id', this.visitorId);
      await supabase.from('page_views').delete().eq('visitor_id', this.visitorId);
      await supabase.from('events').delete().eq('visitor_id', this.visitorId);
      await supabase.from('registrations').delete().eq('visitor_id', this.visitorId);
      await supabase.from('visitors').delete().eq('visitor_id', this.visitorId);
      
      localStorage.removeItem('visitorId');
      return { success: true, message: 'Todos os seus dados foram removidos' };
    } catch (error) {
      console.error('Erro ao deletar dados:', error);
      return { success: false, message: 'Erro ao deletar dados' };
    }
  }
}

export const analytics = new SupabaseAnalyticsTracker();

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analytics.init());
  } else {
    analytics.init();
  }
}
