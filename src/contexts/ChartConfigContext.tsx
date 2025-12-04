import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiUrl } from '../config/api';

export type ChartType = '2d' | '3d';
export type ChartStyle = 'default' | 'gradient' | 'neon' | 'pastel';
export type ChartPalette = 'default' | 'vibrant' | 'ocean' | 'sunset' | 'forest';

export interface ChartConfig {
  chartType: ChartType;
  style: ChartStyle;
  palette: ChartPalette;
  enableAnimation: boolean;
  showLabels: boolean;
  enable3DRotation: boolean;
}

export interface ChartConfigs {
  devices: ChartConfig;
  browsers: ChartConfig;
  os: ChartConfig;
  registrationDevices: ChartConfig;
  countries: ChartConfig;
  cities: ChartConfig;
}

interface ChartConfigContextType {
  configs: ChartConfigs;
  updateConfig: (chartId: keyof ChartConfigs, config: Partial<ChartConfig>) => void;
  resetConfig: (chartId: keyof ChartConfigs) => void;
  resetAllConfigs: () => void;
  saveToServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;
}

const defaultConfig: ChartConfig = {
  chartType: '3d',
  style: 'gradient',
  palette: 'vibrant',
  enableAnimation: true,
  showLabels: true,
  enable3DRotation: true,
};

const defaultConfigs: ChartConfigs = {
  devices: { ...defaultConfig },
  browsers: { ...defaultConfig },
  os: { ...defaultConfig },
  registrationDevices: { ...defaultConfig },
  countries: { ...defaultConfig },
  cities: { ...defaultConfig },
};

const ChartConfigContext = createContext<ChartConfigContextType | undefined>(undefined);

export function ChartConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<ChartConfigs>(() => {
    const saved = localStorage.getItem('chartConfigs');
    return saved ? JSON.parse(saved) : defaultConfigs;
  });

  const loadFromServer = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/chart-config'), {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.configs) {
          setConfigs(data.configs);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar do servidor:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chartConfigs', JSON.stringify(configs));
  }, [configs]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const updateConfig = (chartId: keyof ChartConfigs, config: Partial<ChartConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [chartId]: { ...prev[chartId], ...config },
    }));
  };

  const resetConfig = (chartId: keyof ChartConfigs) => {
    setConfigs(prev => ({
      ...prev,
      [chartId]: { ...defaultConfig },
    }));
  };

  const resetAllConfigs = () => {
    setConfigs(defaultConfigs);
  };

  const saveToServer = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/chart-config'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(configs),
      });
      
      if (!response.ok) {
        console.warn('Falha ao salvar configurações no servidor, usando localStorage');
      }
    } catch (error) {
      console.warn('Erro ao salvar no servidor:', error);
    }
  };

  return (
    <ChartConfigContext.Provider value={{
      configs,
      updateConfig,
      resetConfig,
      resetAllConfigs,
      saveToServer,
      loadFromServer,
    }}>
      {children}
    </ChartConfigContext.Provider>
  );
}

export function useChartConfig() {
  const context = useContext(ChartConfigContext);
  if (!context) {
    throw new Error('useChartConfig deve ser usado dentro de ChartConfigProvider');
  }
  return context;
}
