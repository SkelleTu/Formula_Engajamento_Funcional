import { ReactNode } from 'react';
import { BarChart3, PieChart, TrendingUp, ArrowUpDown } from 'lucide-react';

export type ChartType = 'pie3d' | 'bar3d' | 'bar' | 'line';
export type SortOrder = 'asc' | 'desc';

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
  accentColor?: 'pink' | 'purple' | 'blue' | 'green' | 'orange';
  className?: string;
  chartType?: ChartType;
  sortOrder?: SortOrder;
  onChartTypeChange?: (type: ChartType) => void;
  onSortOrderChange?: (order: SortOrder) => void;
}

const accentColors = {
  pink: {
    border: 'border-pink-500/30',
    glow: 'shadow-pink-500/20',
    gradient: 'from-pink-500/10 via-transparent to-transparent',
    text: 'text-pink-400',
  },
  purple: {
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
    gradient: 'from-purple-500/10 via-transparent to-transparent',
    text: 'text-purple-400',
  },
  blue: {
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    gradient: 'from-blue-500/10 via-transparent to-transparent',
    text: 'text-blue-400',
  },
  green: {
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20',
    gradient: 'from-green-500/10 via-transparent to-transparent',
    text: 'text-green-400',
  },
  orange: {
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
    gradient: 'from-orange-500/10 via-transparent to-transparent',
    text: 'text-orange-400',
  },
};

export default function AnalyticsCard({ 
  title, 
  subtitle, 
  children, 
  icon,
  accentColor = 'purple',
  className = '',
  chartType = 'pie3d',
  sortOrder = 'desc',
  onChartTypeChange,
  onSortOrderChange
}: AnalyticsCardProps) {
  const colors = accentColors[accentColor];

  const chartTypeButtons = [
    { type: 'pie3d' as ChartType, icon: PieChart, label: 'Pizza 3D' },
    { type: 'bar' as ChartType, icon: BarChart3, label: 'Barras' },
    { type: 'line' as ChartType, icon: TrendingUp, label: 'Linhas' },
  ];

  return (
    <div className={`group relative ${className}`}>
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${colors.gradient} rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}
      />
      
      <div className={`relative bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden shadow-2xl ${colors.glow} transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]`}>
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.gradient}`} />
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
        
        <div className="relative p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                {icon && (
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.gradient} ${colors.border} border shrink-0`}>
                    <div className={colors.text}>
                      {icon}
                    </div>
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent break-words">
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-purple-300/70 ml-1 break-words">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Controles de Visualização */}
            {onChartTypeChange && (
              <div className="hidden sm:flex items-center gap-2 ml-4 shrink-0">
                {/* Botões de tipo de gráfico */}
                <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
                  {chartTypeButtons.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => onChartTypeChange(type)}
                      className={`p-2 rounded transition-all ${
                        chartType === type
                          ? `bg-gradient-to-r from-pink-500 to-purple-600 ${colors.text} shadow-lg`
                          : 'text-purple-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                      title={label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
                
                {/* Botão de ordenação */}
                {onSortOrderChange && (
                  <button
                    onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`p-2 rounded-lg transition-all ${
                      sortOrder === 'desc'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-800/50 text-purple-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                    title={sortOrder === 'desc' ? 'Maior para Menor' : 'Menor para Maior'}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${colors.gradient}`} />
      </div>
    </div>
  );
}
