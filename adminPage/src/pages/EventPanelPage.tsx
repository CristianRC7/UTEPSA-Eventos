import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/Config';
import { BarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import { LineChart } from '../charts/LineChart';
import FilterModal from '../components/FilterModal';

interface Inscrito {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  usuario: string;
}

interface Actividad {
  id_actividad: number;
  titulo: string;
  inscripcion_habilitada: boolean;
  inscritos: number;
}

interface Evento {
  id_evento: number;
  titulo: string;
}

interface ValoracionActividad {
  cantidad: number;
  promedio: number | null;
  descripciones: string[];
}

const EventPanelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombreEvento, setNombreEvento] = useState('');
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosComparar, setEventosComparar] = useState<string[]>([]);
  const [datosComparar, setDatosComparar] = useState<{ nombre: string; inscritos: number }[]>([]);
  // Estado para el modal de selección de actividades
  const [modalOpen, setModalOpen] = useState(false);
  // Estado para actividades seleccionadas (por defecto todas las habilitadas)
  const actividadesHabilitadas = actividades.filter(a => a.inscripcion_habilitada);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<number[]>([]);
  const [valoracionesHabilitadas, setValoracionesHabilitadas] = useState<Record<number, ValoracionActividad>>({});
  const [modalComentarios, setModalComentarios] = useState<{ open: boolean; comentarios: string[]; actividad: string | null }>({ open: false, comentarios: [], actividad: null });
  const [actividadesHabilitadasValoracion, setActividadesHabilitadasValoracion] = useState<Actividad[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}admin/eventPanel.php?id_evento=${id}`);
        const data = await res.json();
        if (data.success) {
          setNombreEvento(data.evento.titulo);
          setInscritos(data.inscritos);
          setActividades(data.actividades);
        } else {
          alert(data.message || 'Error al obtener datos del evento');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('Error de red o del servidor');
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    // Obtener todos los eventos para el filtro de comparación
    const fetchEventos = async () => {
      try {
        const res = await fetch(`${BASE_URL}admin/getEventos.php`);
        const data = await res.json();
        if (data.success) {
          setEventos(data.eventos);
        } else {
          alert(data.message || 'Error al obtener eventos');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('Error de red o del servidor');
        }
      }
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    // Fetch de inscritos totales para cada evento seleccionado
    const fetchComparar = async () => {
      if (!eventosComparar.length) {
        setDatosComparar([]);
        return;
      }
      const results: { nombre: string; inscritos: number }[] = [];
      for (const eid of eventosComparar) {
        try {
          const res = await fetch(`${BASE_URL}admin/eventPanel.php?id_evento=${eid}`);
          const data = await res.json();
          if (data.success) {
            results.push({ nombre: data.evento.titulo, inscritos: data.inscritos.length });
          } else {
            alert(data.message || 'Error al obtener datos de evento para comparar');
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            alert(err.message);
          } else {
            alert('Error de red o del servidor');
          }
        }
      }
      setDatosComparar(results);
    };
    fetchComparar();
  }, [eventosComparar]);

  // Actualizar selección por defecto cuando cambian las actividades
  useEffect(() => {
    setActividadesSeleccionadas(actividadesHabilitadas.map(a => a.id_actividad));
  }, [actividadesHabilitadas.length]);

  // Filtrar actividades según selección
  const actividadesFiltradas = actividadesHabilitadas.filter(a => actividadesSeleccionadas.includes(a.id_actividad));

  // Stats filtradas
  const actividadMasInscritos = actividadesFiltradas.length > 0 ? actividadesFiltradas.reduce((max, a) => a.inscritos > max.inscritos ? a : max, actividadesFiltradas[0]) : null;
  const actividadMenosInscritos = actividadesFiltradas.length > 0 ? actividadesFiltradas.reduce((min, a) => a.inscritos < min.inscritos ? a : min, actividadesFiltradas[0]) : null;

  // Fetch para valoraciones de actividades habilitadas
  useEffect(() => {
    const fetchHabilitadas = async () => {
      try {
        const res = await fetch(`${BASE_URL}admin/getHabilitadasConValoracion.php?id_evento=${id}`);
        const data = await res.json();
        if (data.success) {
          setActividadesHabilitadasValoracion(data.actividades);
          setValoracionesHabilitadas(data.valoraciones || {});
        } else {
          alert(data.message || 'Error al obtener valoraciones');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('Error de red o del servidor');
        }
      }
    };
    if (id) fetchHabilitadas();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <div className="w-full max-w-6xl px-4 mt-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer"
        >
          ← Volver al Dashboard
        </button>
        {loading ? (
          <div className="text-center py-8">Cargando datos...</div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#cf152d] mb-4">{nombreEvento}</h2>
            {/* Botón para generar reporte PDF */}
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer mr-2"
                onClick={() => {
                  if (!id) return;
                  const url = `${BASE_URL}admin/generateEventReport.php?id_evento=${id}`;
                  // Abrir en nueva pestaña para descarga directa
                  window.open(url, '_blank');
                }}
              >
                Generar reporte PDF
              </button>
              {/* Botón para abrir modal de filtro */}
              <button
                className="px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                Filtrar actividades
              </button>
            </div>
            {/* Modal de selección de actividades */}
            {modalOpen && (
              <FilterModal
                actividades={actividadesHabilitadas}
                seleccionadas={actividadesSeleccionadas}
                setSeleccionadas={setActividadesSeleccionadas}
                onClose={() => setModalOpen(false)}
              />
            )}
            {/* Cards de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-[#cf152d]">{inscritos.length}</div>
                <div className="text-gray-600 text-sm">Total inscritos</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-green-600">{actividadMasInscritos ? actividadMasInscritos.inscritos : '-'}</div>
                <div className="text-gray-600 text-xs text-center">Más inscritos<br />{actividadMasInscritos?.titulo || '-'}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-red-600">{actividadMenosInscritos ? actividadMenosInscritos.inscritos : '-'}</div>
                <div className="text-gray-600 text-xs text-center">Menos inscritos<br />{actividadMenosInscritos?.titulo || '-'}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-[#cf152d]">{actividadesFiltradas.length}</div>
                <div className="text-gray-600 text-xs text-center">Actividades seleccionadas</div>
              </div>
            </div>
            {/* Card BarChart */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div className="text-lg font-semibold text-[#cf152d]">Inscritos por actividad</div>
              </div>
              {actividadesFiltradas.length > 0 ? (
                <BarChart actividades={actividadesFiltradas} />
              ) : (
                <div className="text-center text-gray-400 py-8">No hay actividades seleccionadas para mostrar en el gráfico.</div>
              )}
            </div>
            {/* Card DonutChart */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div className="text-lg font-semibold text-[#cf152d]">Distribución de inscritos por actividad (Donut)</div>
              </div>
              {actividadesFiltradas.length > 0 ? (
                <DonutChart actividades={actividadesFiltradas} />
              ) : (
                <div className="text-center text-gray-400 py-8">No hay actividades seleccionadas para mostrar en el gráfico.</div>
              )}
            </div>
            {/* Card LineChart */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div className="text-lg font-semibold text-[#cf152d]">Comparar inscritos totales entre eventos</div>
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600">Comparar con eventos:</label>
                  <select
                    className="border border-gray-300 rounded px-2 py-1"
                    multiple
                    size={Math.min(4, eventos.length-1)}
                    value={eventosComparar}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setEventosComparar(selected);
                    }}
                  >
                    {eventos.filter(ev => String(ev.id_evento) !== id).map(ev => (
                      <option key={ev.id_evento} value={ev.id_evento}>{ev.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(() => {
                const datos = [
                  { nombre: nombreEvento, inscritos: inscritos.length },
                  ...datosComparar
                ];
                if (datos.length > 1) {
                  return <LineChart eventos={datos} />;
                } else {
                  return <div className="text-center text-gray-400 py-8">Selecciona uno o más eventos para comparar.</div>;
                }
              })()}
            </div>
            {/* Tabla de actividades */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="text-lg font-semibold text-[#cf152d] mb-4">Lista de actividades</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Actividad</th>
                      <th className="px-4 py-2 text-left">Inscritos</th>
                      <th className="px-4 py-2 text-left">Inscripción habilitada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividades.map(a => (
                      <tr key={a.id_actividad} className="border-b">
                        <td className="px-4 py-2">{a.titulo}</td>
                        <td className="px-4 py-2">{a.inscritos}</td>
                        <td className="px-4 py-2">
                          {a.inscripcion_habilitada ? (
                            <span className="text-green-600 font-semibold">Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Sección de valoraciones */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="text-lg font-semibold text-[#cf152d] mb-4">Valoración de actividades</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Actividad</th>
                      <th className="px-4 py-2 text-left">Promedio (%)</th>
                      <th className="px-4 py-2 text-left">Cantidad de respuestas</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividadesHabilitadasValoracion.length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-gray-400 py-8">No hay actividades habilitadas para encuestas.</td></tr>
                    ) : actividadesHabilitadasValoracion.map(a => {
                      const val = valoracionesHabilitadas[a.id_actividad] || { cantidad: 0, promedio: null, descripciones: [] };
                      const porcentaje = val.promedio !== null ? ((val.promedio / 5) * 100).toFixed(1) : '-';
                      return (
                        <tr key={a.id_actividad} className="border-b">
                          <td className="px-4 py-2">{a.titulo}</td>
                          <td className="px-4 py-2">{val.promedio !== null ? `${porcentaje} %` : '-'}</td>
                          <td className="px-4 py-2">{val.cantidad}</td>
                          <td className="px-4 py-2">
                            <button
                              className="px-3 py-1 bg-[#cf152d] text-white rounded hover:bg-[#b01223] text-xs"
                              onClick={() => setModalComentarios({ open: true, comentarios: val.descripciones, actividad: a.titulo })}
                              disabled={val.descripciones.length === 0}
                            >
                              Ver encuestas
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Modal de comentarios de encuestas */}
            {modalComentarios.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative border border-gray-200">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-[#cf152d] text-xl cursor-pointer"
                    onClick={() => setModalComentarios({ open: false, comentarios: [], actividad: null })}
                  >
                    ×
                  </button>
                  <h3 className="text-lg font-bold text-[#cf152d] mb-4">Comentarios recibidos - {modalComentarios.actividad}</h3>
                  {modalComentarios.comentarios.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto list-disc pl-5 space-y-2">
                      {modalComentarios.comentarios.map((desc, idx) => (
                        <li key={idx} className="text-gray-700 bg-gray-50 rounded p-2 border border-gray-200">{desc}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400 text-center py-8">No hay comentarios para esta actividad.</div>
                  )}
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] cursor-pointer"
                      onClick={() => setModalComentarios({ open: false, comentarios: [], actividad: null })}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventPanelPage; 