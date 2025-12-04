import ReactECharts from 'echarts-for-react';
import { useChartConfig, ChartConfig } from '../contexts/ChartConfigContext';
import { useMemo } from 'react';

interface ChartDataItem {
  name: string;
  value: number;
}

interface EChartLineProps {
  data: ChartDataItem[];
  chartId: string;
  sortOrder?: 'asc' | 'desc';
}

export default function EChartLine({ data, chartId, sortOrder = 'desc' }: EChartLineProps) {
  const { configs } = useChartConfig();
  const chartConfig: ChartConfig = configs[chartId as keyof typeof configs] || {} as ChartConfig;
  
  const palettes = {
    default: ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'],
    vibrant: ['#ff006e', '#8338ec', '#3a86ff', '#fb5607', '#ffbe0b', '#06ffa5', '#ff006e', '#8338ec', '#3a86ff', '#fb5607'],
    ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4', '#023e8a', '#0096c7', '#caf0f8', '#ade8f4', '#03045e', '#00b4d8'],
    sunset: ['#f72585', '#b5179e', '#7209b7', '#560bad', '#480ca8', '#3a0ca3', '#3f37c9', '#4361ee', '#4895ef', '#4cc9f0'],
    forest: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#1b4332', '#081c15', '#52b788'],
  };
  
  const palette = chartConfig.palette || 'default';
  const colors = palettes[palette as keyof typeof palettes] || palettes.default;

  // Se não houver dados, mostrar dados zerados
  const displayData = data.length > 0 ? data : [{ name: 'Sem dados', value: 0 }];

  const sortedData = useMemo(() => 
    [...displayData].sort((a, b) => 
      sortOrder === 'asc' ? a.value - b.value : b.value - a.value
    ),
    [displayData, sortOrder]
  );

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedData.map(item => item.name),
      axisLabel: {
        color: '#c084fc',
        fontSize: 12,
        interval: 0,
        rotate: sortedData.length > 8 ? 45 : 0,
      },
      axisLine: {
        lineStyle: {
          color: '#a855f7',
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
        color: '#c084fc',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#374151',
          type: 'dashed'
        }
      },
      axisLine: {
        show: false
      }
    },
    series: [
      {
        name: 'Valor',
        type: 'line',
        data: sortedData.map(item => item.value),
        smooth: true,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: colors[0] },
              { offset: 0.5, color: colors[1] },
              { offset: 1, color: colors[2] }
            ]
          }
        },
        itemStyle: {
          color: colors[0],
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${colors[0]}80` },
              { offset: 1, color: `${colors[1]}10` }
            ]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: colors[0],
            borderWidth: 3,
            shadowBlur: 20,
            shadowColor: colors[0]
          }
        },
        label: {
          show: chartConfig.showLabels !== false,
          position: 'top',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: '{c}'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#a855f7',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#a855f7'
        }
      }
    },
    animation: chartConfig.enableAnimation !== false,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }), [sortedData, colors, chartConfig]);

  return (
    <ReactECharts 
      option={option} 
      style={{ height: '400px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
