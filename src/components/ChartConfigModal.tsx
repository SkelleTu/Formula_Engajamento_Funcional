import { X, Settings, RefreshCw, Save } from 'lucide-react';
import { useChartConfig, ChartConfigs, ChartConfig } from '../contexts/ChartConfigContext';
import { useState } from 'react';

interface ChartConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const chartNames: Record<keyof ChartConfigs, string> = {
  devices: 'Dispositivos',
  browsers: 'Navegadores',
  os: 'Sistemas Operacionais',
  registrationDevices: 'Dispositivos (Cadastros)',
  countries: 'Países',
  cities: 'Cidades',
};

export default function ChartConfigModal({ isOpen, onClose }: ChartConfigModalProps) {
  const { configs, updateConfig, resetConfig, resetAllConfigs, saveToServer } = useChartConfig();
  const [selectedChart, setSelectedChart] = useState<keyof ChartConfigs>('devices');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentConfig: ChartConfig = configs[selectedChart];

  const handleUpdate = (updates: Partial<ChartConfig>) => {
    updateConfig(selectedChart, updates);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveToServer();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 border border-pink-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
              Configuração dos Gráficos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-purple-200" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          <div className="w-64 border-r border-pink-500/20 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-purple-300 mb-3 px-2">Selecione o Gráfico</h3>
            <div className="space-y-1">
              {Object.entries(chartNames).map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => setSelectedChart(id as keyof ChartConfigs)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    selectedChart === id
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-500/30'
                      : 'text-purple-200 hover:bg-white/5'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              {chartNames[selectedChart]}
            </h3>

            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-purple-300 mb-4">Tipo de Gráfico</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdate({ chartType: '2d' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentConfig.chartType === '2d'
                        ? 'border-pink-500 bg-pink-500/10 text-white'
                        : 'border-purple-500/30 bg-gray-800/50 text-purple-200 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-semibold">2D Clássico</div>
                    <div className="text-xs opacity-70 mt-1">Rápido e leve</div>
                  </button>
                  <button
                    onClick={() => handleUpdate({ chartType: '3d' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentConfig.chartType === '3d'
                        ? 'border-pink-500 bg-pink-500/10 text-white'
                        : 'border-purple-500/30 bg-gray-800/50 text-purple-200 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="font-semibold">3D Artístico</div>
                    <div className="text-xs opacity-70 mt-1">Moderno e impactante</div>
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-purple-300 mb-4">Paleta de Cores</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['default', 'vibrant', 'ocean', 'sunset', 'forest'].map((palette) => (
                    <button
                      key={palette}
                      onClick={() => handleUpdate({ palette: palette as any })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentConfig.palette === palette
                          ? 'border-pink-500 bg-pink-500/10 text-white'
                          : 'border-purple-500/30 bg-gray-800/50 text-purple-200 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="font-semibold capitalize">{palette}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-purple-300 mb-4">Opções de Visualização</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition">
                    <span className="text-purple-100">Mostrar Labels</span>
                    <input
                      type="checkbox"
                      checked={currentConfig.showLabels}
                      onChange={(e) => handleUpdate({ showLabels: e.target.checked })}
                      className="w-5 h-5 rounded accent-pink-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition">
                    <span className="text-purple-100">Ativar Animações</span>
                    <input
                      type="checkbox"
                      checked={currentConfig.enableAnimation}
                      onChange={(e) => handleUpdate({ enableAnimation: e.target.checked })}
                      className="w-5 h-5 rounded accent-pink-500"
                    />
                  </label>
                  {currentConfig.chartType === '3d' && (
                    <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition">
                      <span className="text-purple-100">Rotação Automática 3D</span>
                      <input
                        type="checkbox"
                        checked={currentConfig.enable3DRotation}
                        onChange={(e) => handleUpdate({ enable3DRotation: e.target.checked })}
                        className="w-5 h-5 rounded accent-pink-500"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => resetConfig(selectedChart)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-purple-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restaurar Padrão
                </button>
                <button
                  onClick={resetAllConfigs}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restaurar Todos
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-pink-500/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700/50 hover:bg-gray-700 text-purple-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar no Servidor'}
          </button>
        </div>
      </div>
    </div>
  );
}
