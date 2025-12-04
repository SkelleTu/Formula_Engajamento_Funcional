import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface DeviceSignals {
  fingerprintId: string;
  timezone: string;
  language: string;
  languages: string[];
  screenResolution: string;
  colorDepth: number;
  hardwareConcurrency: number;
  deviceMemory: number | undefined;
  platform: string;
  touchSupport: boolean;
  cookieEnabled: boolean;
  doNotTrack: string | null;
}

let fpPromise: Promise<any> | null = null;

export async function initFingerprint() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

export async function collectDeviceSignals(): Promise<DeviceSignals> {
  const fp = await initFingerprint();
  const result = await fp.get();

  return {
    fingerprintId: result.visitorId,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory,
    platform: navigator.platform,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || null
  };
}

export function collectBehavioralSignals() {
  const now = new Date();
  
  return {
    hourOfDay: now.getHours(),
    dayOfWeek: now.getDay(),
    isWeekday: now.getDay() >= 1 && now.getDay() <= 5,
    isBusinessHours: now.getHours() >= 9 && now.getHours() <= 18,
    sessionStart: new Date().toISOString(),
    referrer: document.referrer || 'direct',
    landingPage: window.location.pathname
  };
}

export function inferBasicDemographics(signals: DeviceSignals, behavioral: any): {
  likelyAgeRange?: string;
  likelyGender?: string;
  likelyOccupation?: string;
  likelyEducationLevel?: string;
  confidence: number;
} {
  let ageScore = 0;
  let occupationHints: string[] = [];
  let educationHints: string[] = [];
  
  // Business hours + weekday = likely employed
  if (behavioral.isWeekday && behavioral.isBusinessHours) {
    occupationHints.push('employee');
  }
  
  // Late night/early morning = younger demographic or shift worker
  if (behavioral.hourOfDay >= 0 && behavioral.hourOfDay < 6) {
    ageScore += 1; // younger
  } else if (behavioral.hourOfDay >= 22) {
    ageScore += 1; // younger
  }
  
  // High-end device specs = higher income/education
  if (signals.hardwareConcurrency >= 8 || (signals.deviceMemory && signals.deviceMemory >= 8)) {
    educationHints.push('graduate');
    occupationHints.push('professional');
  }
  
  // Mobile only = potentially younger or lower income
  if (signals.touchSupport && signals.screenResolution.includes('x')) {
    const [width] = signals.screenResolution.split('x').map(Number);
    if (width < 800) {
      ageScore += 0.5;
    }
  }
  
  // Basic heuristic inference (placeholder for ML model)
  const ageRange = ageScore > 1.5 ? '18-24' : ageScore > 0.5 ? '25-34' : '35-44';
  const occupation = occupationHints.length > 0 ? occupationHints[0] : undefined;
  const education = educationHints.length > 0 ? educationHints[0] : undefined;
  
  return {
    likelyAgeRange: ageRange,
    likelyOccupation: occupation,
    likelyEducationLevel: education,
    confidence: 0.4 // Low confidence for basic heuristics
  };
}
