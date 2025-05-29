import { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/Config';
import { Pencil, Trash2, Plus } from 'lucide-react';
import SpeakerModal from '../components/speaker/SpeakerModal';
import SideBar from '../components/sideBar';

interface Evento {
  id_evento: number;
  titulo: string;
}

interface Expositor {
  id_expositor: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  descripcion: string;
  imagen_url: string | null;
  eventos: Evento[];
}

export default function Speaker() {
  const [expositores, setExpositores] = useState<Expositor[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [eventoFiltro, setEventoFiltro] = useState('');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModo, setModalModo] = useState<'crear' | 'editar'>('crear');
  const [expositorEditar, setExpositorEditar] = useState<Expositor | null>(null);

  // Obtener eventos para el filtro
  useEffect(() => {
    fetch(`${BASE_URL}admin/getEventos.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setEventos(data.eventos);
      });
  }, []);

  // Obtener expositores con filtros
  const fetchExpositores = () => {
    setLoading(true);
    let url = `${BASE_URL}admin/Speakers.php?`;
    if (busqueda) url += `nombre=${encodeURIComponent(busqueda)}&`;
    if (eventoFiltro) url += `id_evento=${eventoFiltro}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) setExpositores(data.expositores);
        else setExpositores([]);
        setLoading(false);
      })
      .catch(() => {
        setExpositores([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExpositores();
    // eslint-disable-next-line
  }, [busqueda, eventoFiltro]);

  const handleAgregar = () => {
    setExpositorEditar(null);
    setModalModo('crear');
    setModalOpen(true);
  };

  const handleEditar = (expositor: Expositor) => {
    setExpositorEditar(expositor);
    setModalModo('editar');
    setModalOpen(true);
  };

  const handleEliminar = async (expositor: Expositor) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al expositor ${expositor.nombre} ${expositor.apellido_paterno}?`)) return;
    try {
      const res = await fetch(`${BASE_URL}admin/Speakers.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_expositor: expositor.id_expositor })
      });
      const data = await res.json();
      if (data.success) {
        fetchExpositores();
      } else {
        alert('No se pudo eliminar el expositor.');
      }
    } catch {
      alert('Error al eliminar expositor.');
    }
  };

  const handleModalClose = (recargar = false) => {
    setModalOpen(false);
    setExpositorEditar(null);
    if (recargar) fetchExpositores();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <SideBar />
      <div className="w-full max-w-6xl px-4 mt-8">
        <h2 className="text-2xl font-bold text-[#cf152d] mb-6">Expositores</h2>
        <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:border-[#cf152d]"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:border-[#cf152d]"
            value={eventoFiltro}
            onChange={e => setEventoFiltro(e.target.value)}
          >
            <option value="">Todos los eventos</option>
            {eventos.map(ev => (
              <option key={ev.id_evento} value={ev.id_evento}>{ev.titulo}</option>
            ))}
          </select>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer"
            onClick={handleAgregar}
          >
            <Plus size={18} /> Agregar
          </button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <div className="text-center py-8">Cargando expositores...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Imagen</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Descripción</th>
                    <th className="px-4 py-2 text-left">Eventos asociados</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expositores.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 py-4">No se encontraron expositores.</td>
                    </tr>
                  )}
                  {expositores.map(exp => (
                    <tr key={exp.id_expositor} className="border-b">
                      <td className="px-4 py-2">
                        {exp.imagen_url ? (
                          <img
                            src={`${BASE_URL}upload/${exp.imagen_url}`}
                            alt={exp.nombre}
                            className="w-16 h-16 object-cover rounded-full border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">Sin imagen</div>
                        )}
                      </td>
                      <td className="px-4 py-2 font-medium">{exp.nombre} {exp.apellido_paterno} {exp.apellido_materno}</td>
                      <td className="px-4 py-2">{exp.descripcion}</td>
                      <td className="px-4 py-2">
                        {exp.eventos.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {exp.eventos.map(ev => (
                              <li key={ev.id_evento}>{ev.titulo}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">Sin eventos</span>
                        )}
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title="Editar"
                          onClick={() => handleEditar(exp)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Eliminar"
                          onClick={() => handleEliminar(exp)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {modalOpen && (
          <SpeakerModal
            open={modalOpen}
            onClose={handleModalClose}
            expositor={expositorEditar}
            modo={modalModo}
            eventos={eventos}
          />
        )}
      </div>
    </div>
  );
}
