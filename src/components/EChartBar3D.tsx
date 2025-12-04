import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import { useChartConfig, ChartConfig } from '../contexts/ChartConfigContext';
import { useMemo } from 'react';

interface DataItem {
  name: string;
  value: number;
}

interface EChartBar3DProps {
  data: DataItem[];
  chartId: string;
  sortOrder?: 'asc' | 'desc';
}

const paletteColors = {
  default: ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'],
  vibrant: ['#ff0080', '#7928ca', '#0070f3', '#00dfd8', '#ff4d4d', '#f9cb28', '#7b61ff', '#1ec9f0'],
  ocean: ['#0077be', '#00a8e8', '#48cae4', '#90e0ef', '#00b4d8', '#0096c7', '#023e8a', '#03045e'],
  sunset: ['#ff6b35', '#f7931e', '#fdc500', '#c1666b', '#d4a373', '#e76f51', '#f4a261', '#e9c46a'],
  forest: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#1b4332', '#081c15'],
};

export default function EChartBar3D({ data, chartId, sortOrder = 'desc' }: EChartBar3DProps) {
  const { configs } = useChartConfig();
  const config: ChartConfig = configs[chartId as keyof typeof configs] || {} as ChartConfig;

  const option = useMemo(() => {
    const colors = paletteColors[config.palette] || paletteColors.default;
    
    // Se não houver dados, mostrar dados zerados com múltiplos itens para evitar erros de renderização
    const displayData = data.length > 0 ? data : [
      { name: 'Aguardando', value: 0 },
      { name: 'dados', value: 0 },
      { name: '...', value: 0 }
    ];
    
    const sortedData = [...displayData]
      .sort((a, b) => sortOrder === 'asc' ? a.value - b.value : b.value - a.value)
      .slice(0, 10);
    
    if (config.chartType === '2d') {
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: 'rgba(236, 72, 153, 0.3)',
          borderWidth: 1,
          textStyle: { color: '#fff' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: sortedData.map(item => item.name),
          axisLabel: {
            color: '#cbd5e1',
            rotate: 45,
            fontSize: 11,
          },
          axisLine: { lineStyle: { color: 'rgba(203, 213, 225, 0.2)' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#cbd5e1' },
          axisLine: { lineStyle: { color: 'rgba(203, 213, 225, 0.2)' } },
          splitLine: { lineStyle: { color: 'rgba(203, 213, 225, 0.1)' } },
        },
        series: [
          {
            type: 'bar',
            data: sortedData.map((item, index) => ({
              value: item.value,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: colors[index % colors.length] },
                    { offset: 1, color: colors[(index + 1) % colors.length] },
                  ],
                },
                borderRadius: [8, 8, 0, 0],
              },
            })),
            label: {
              show: config.showLabels,
              position: 'top',
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold',
            },
            barWidth: '60%',
            animationDelay: config.enableAnimation ? (idx: number) => idx * 100 : 0,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(236, 72, 153, 0.5)',
              },
            },
          },
        ],
      };
    }

    const bar3DData = sortedData.map((item, index) => [index, 0, item.value]);
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => {
          if (params.value) {
            const index = params.value[0];
            const value = params.value[2];
            return `${sortedData[index].name}: ${value}`;
          }
          return '';
        },
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(236, 72, 153, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#fff' },
      },
      visualMap: {
        show: false,
        min: 0,
        max: Math.max(...sortedData.map(d => d.value), 1),
        inRange: {
          color: colors,
        },
      },
      xAxis3D: {
        type: 'category',
        data: sortedData.map(item => item.name),
        axisLabel: {
          color: '#cbd5e1',
          fontSize: 10,
          interval: 0,
          rotate: 45,
        },
        axisLine: { lineStyle: { color: 'rgba(203, 213, 225, 0.3)' } },
      },
      yAxis3D: {
        type: 'value',
        axisLabel: { show: false },
        axisLine: { show: false },
      },
      zAxis3D: {
        type: 'value',
        axisLabel: { color: '#cbd5e1', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(203, 213, 225, 0.3)' } },
        splitLine: { lineStyle: { color: 'rgba(203, 213, 225, 0.1)' } },
      },
      grid3D: {
        viewControl: {
          autoRotate: config.enable3DRotation,
          distance: 150,
          alpha: 20,
          beta: 0,
          rotateSensitivity: 1,
          zoomSensitivity: 1,
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true,
          },
          ambient: {
            intensity: 0.5,
          },
        },
        boxWidth: 100,
        boxDepth: 20,
        boxHeight: 80,
      },
      series: [
        {
          type: 'bar3D',
          data: bar3DData,
          shading: 'realistic',
          label: {
            show: config.showLabels,
            formatter: (params: any) => params.value[2],
            fontSize: 10,
            color: '#fff',
            textBorderColor: 'rgba(0,0,0,0.5)',
            textBorderWidth: 2,
          },
          itemStyle: {
            opacity: 0.9,
          },
          emphasis: {
            label: {
              fontSize: 12,
            },
            itemStyle: {
              opacity: 1,
            },
          },
        },
      ],
    };
  }, [data, config, sortOrder]);

  return (
    <ReactECharts
      option={option}
      style={{ height: '400px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
