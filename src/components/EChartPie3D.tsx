import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import { useChartConfig, ChartConfig } from '../contexts/ChartConfigContext';
import { useMemo } from 'react';

interface DataItem {
  name: string;
  value: number;
}

interface EChartPie3DProps {
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

export default function EChartPie3D({ data, chartId, sortOrder = 'desc' }: EChartPie3DProps) {
  const { configs } = useChartConfig();
  const config: ChartConfig = configs[chartId as keyof typeof configs] || {} as ChartConfig;

  const option = useMemo(() => {
    const colors = paletteColors[config.palette] || paletteColors.default;
    
    // Se não houver dados, mostrar dados zerados
    const displayData = data.length > 0 ? data : [{ name: 'Sem dados', value: 1 }];
    
    const sortedData = [...displayData].sort((a, b) => 
      sortOrder === 'asc' ? a.value - b.value : b.value - a.value
    );
    
    if (config.chartType === '2d') {
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: 'rgba(236, 72, 153, 0.3)',
          borderWidth: 1,
          textStyle: { color: '#fff' },
        },
        legend: {
          bottom: '5%',
          left: 'center',
          textStyle: { color: '#cbd5e1' },
          itemGap: 15,
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: 'rgba(0,0,0,0.3)',
              borderWidth: 2,
            },
            label: {
              show: config.showLabels,
              formatter: '{d}%',
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(236, 72, 153, 0.5)',
              },
            },
            labelLine: {
              show: config.showLabels,
              lineStyle: { color: 'rgba(255, 255, 255, 0.3)' },
            },
            data: sortedData.map((item, index) => ({
              ...item,
              itemStyle: { color: colors[index % colors.length] },
            })),
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: config.enableAnimation ? (idx: number) => idx * 100 : 0,
          },
        ],
      };
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(236, 72, 153, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#fff' },
      },
      legend: {
        bottom: '2%',
        left: 'center',
        textStyle: { color: '#cbd5e1' },
        itemGap: 15,
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '70%'],
          center: ['50%', '40%'],
          data: sortedData.map((item, index) => {
            const baseColor = colors[index % colors.length];
            return {
              ...item,
              itemStyle: {
                color: {
                  type: 'radial',
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    { offset: 0, color: baseColor },
                    { offset: 0.7, color: baseColor },
                    { offset: 1, color: baseColor + 'dd' }
                  ]
                },
                shadowBlur: 20,
                shadowOffsetX: 5,
                shadowOffsetY: 5,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                borderWidth: 3,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            };
          }),
          label: {
            show: config.showLabels,
            formatter: '{b}\n{d}%',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#fff',
            textBorderColor: 'rgba(0,0,0,0.5)',
            textBorderWidth: 2,
          },
          labelLine: {
            show: config.showLabels,
            lineStyle: { color: 'rgba(255, 255, 255, 0.5)', width: 2 },
            length: 10,
            length2: 20,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 30,
              shadowOffsetX: 0,
              shadowOffsetY: 10,
              shadowColor: 'rgba(236, 72, 153, 0.6)',
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          animationType: config.enableAnimation ? 'expansion' : 'scale',
          animationEasing: 'elasticOut',
        },
      ],
    };
  }, [data, config, sortOrder]);

  return (
    <ReactECharts
      option={option}
      style={{ height: '350px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
