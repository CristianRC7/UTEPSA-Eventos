import React from 'react';
import ReactECharts from 'echarts-for-react';

interface Actividad {
  id_actividad: number;
  titulo: string;
  inscritos: number;
}

export const BarChart = ({ actividades }: { actividades: Actividad[] }) => {
  const option = {
    tooltip: {},
    xAxis: {
      type: 'category',
      data: actividades.map(a => a.titulo),
      axisLabel: { interval: 0, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        data: actividades.map(a => a.inscritos),
        type: 'bar',
        itemStyle: { color: '#cf152d' },
        barWidth: '50%'
      }
    ]
  };

  return (
    <ReactECharts option={option} style={{ height: 320, width: '100%' }} />
  );
}; 