import ReactECharts from 'echarts-for-react';

interface Actividad {
  id_actividad: number;
  titulo: string;
  inscritos: number;
}

export const DonutChart = ({ actividades }: { actividades: Actividad[] }) => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: actividades.map(a => a.titulo)
    },
    series: [
      {
        name: 'Inscritos',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: actividades.map(a => ({ value: a.inscritos, name: a.titulo }))
      }
    ]
  };

  return (
    <ReactECharts option={option} style={{ height: 320, width: '100%' }} />
  );
}; 