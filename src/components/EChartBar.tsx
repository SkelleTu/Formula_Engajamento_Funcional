import ReactECharts from 'echarts-for-react';
import { useChartConfig, ChartConfig } from '../contexts/ChartConfigContext';
import { useMemo } from 'react';

interface DataItem {
  name: string;
  value: number;
}

interface EChartBarProps {
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

export default function EChartBar({ data, chartId, sortOrder = 'desc' }: EChartBarProps) {
  const { configs } = useChartConfig();
  const config: ChartConfig = configs[chartId as keyof typeof configs] || {} as ChartConfig;

  const option = useMemo(() => {
    const colors = paletteColors[config.palette] || paletteColors.default;
    
    const displayData = data.length > 0 ? data : [
      { name: 'Aguardando', value: 0 },
      { name: 'dados', value: 0 },
      { name: '...', value: 0 }
    ];
    
    const sortedData = [...displayData]
      .sort((a, b) => sortOrder === 'asc' ? a.value - b.value : b.value - a.value)
      .slice(0, 10);
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { 
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(236, 72, 153, 0.1)'
          }
        },
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(236, 72, 153, 0.3)',
        borderWidth: 1,
        textStyle: { 
          color: '#fff',
          fontSize: 13
        },
        padding: [10, 15],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => item.name),
        axisLabel: {
          color: '#cbd5e1',
          rotate: 45,
          fontSize: 11,
          fontWeight: 500,
          margin: 10,
        },
        axisLine: { 
          lineStyle: { 
            color: 'rgba(203, 213, 225, 0.2)',
            width: 2
          } 
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          color: '#cbd5e1',
          fontSize: 11,
          fontWeight: 500
        },
        axisLine: { 
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: { 
          lineStyle: { 
            color: 'rgba(203, 213, 225, 0.08)',
            type: 'dashed'
          } 
        },
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
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 10,
            },
          })),
          label: {
            show: config.showLabels,
            position: 'top',
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            distance: 8,
            formatter: '{c}'
          },
          barWidth: '50%',
          barMaxWidth: 60,
          animationDelay: config.enableAnimation ? (idx: number) => idx * 80 : 0,
          animationDuration: config.enableAnimation ? 1000 : 0,
          animationEasing: 'cubicOut',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(236, 72, 153, 0.6)',
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
      ],
      animation: config.enableAnimation,
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
