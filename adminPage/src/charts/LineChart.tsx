import ReactECharts from 'echarts-for-react';
interface LineChartProps {
  eventos: { nombre: string; inscritos: number }[];
}

export const LineChart = ({ eventos }: LineChartProps) => {
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: eventos.map(e => e.nombre),
      axisLabel: { interval: 0, rotate: 0 },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        name: 'Inscritos',
        type: 'line',
        data: eventos.map(e => e.inscritos),
        smooth: true,
        lineStyle: { color: '#cf152d' },
        itemStyle: { color: '#cf152d' },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320, width: '100%' }} />;
}; 