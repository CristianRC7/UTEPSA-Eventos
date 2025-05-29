import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../components/sideBar';
import { BASE_URL } from '../utils/Config';
import ActividadModal from '../components/cronograma/ActividadModal';
import { Pencil, Trash2 } from 'lucide-react';
import FormularioModal from '../components/cronograma/FormularioModal';

interface Actividad {
  id_actividad?: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  inscripcion_habilitada: boolean;
}

const CronogramaPage = () => {
  const { id } = useParams();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Actividad | null>(null);
  const [modalMode, setModalMode] = useState<'crear' | 'editar'>('crear');
  const navigate = useNavigate();
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formActividadId, setFormActividadId] = useState<number | null>(null);
  const [formInitData, setFormInitData] = useState<{ fecha_inicio: string; fecha_fin: string } | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}admin/eventPanel.php?id_evento=${id}`);
      const data = await res.json();
      if (data.success && data.actividades) {
        setActividades(data.actividades);
      }
    } catch {
      // error opcional
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActividades();
  }, [id]);

  const handleCrear = () => {
    setEditData(null);
    setModalMode('crear');
    setModalOpen(true);
  };

  const handleEditar = (actividad: Actividad) => {
    setEditData(actividad);
    setModalMode('editar');
    setModalOpen(true);
  };

  const handleSave = async (actividad: Actividad) => {
    try {
      if (modalMode === 'crear') {
        // Crear actividad
        const res = await fetch(`${BASE_URL}admin/Events.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accion: 'crear_actividad',
            id_evento: id,
            ...actividad
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Error al crear actividad');
      } else {
        // Editar actividad
        const res = await fetch(`${BASE_URL}admin/Events.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accion: 'editar_actividad',
            id_evento: id,
            ...actividad
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Error al editar actividad');
      }
      await fetchActividades();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error de red o del servidor');
      }
    }
  };

  const handleEliminar = async (actividad: Actividad) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta actividad? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${BASE_URL}admin/Events.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'eliminar_actividad',
          id_actividad: actividad.id_actividad
        })
      });
      const data = await res.json();
      if (!data.success) alert(data.message || 'Error al eliminar actividad');
      await fetchActividades();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error de red o del servidor');
      }
    }
  };

  const openFormularioModal = async (actividad: Actividad) => {
    setFormActividadId(actividad.id_actividad!);
    setFormLoading(true);
    setFormInitData(undefined);
    setFormModalOpen(true);
    try {
      const res = await fetch(`${BASE_URL}admin/Events.php?accion=get_habilitacion_formulario&id_actividad=${actividad.id_actividad}`);
      const data = await res.json();
      if (data.success && data.habilitacion) {
        setFormInitData({
          fecha_inicio: data.habilitacion.fecha_inicio,
          fecha_fin: data.habilitacion.fecha_fin
        });
      }
    } catch {
      // Opcional: puedes mostrar un error si lo deseas
    }
    setFormLoading(false);
  };

  const handleSaveFormulario = async (formData: { fecha_inicio: string; fecha_fin: string }) => {
    if (!formActividadId) return;
    setFormLoading(true);
    try {
      const res = await fetch(`${BASE_URL}admin/Events.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'habilitar_formulario',
          id_actividad: formActividadId,
          ...formData
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error al guardar habilitación');
      await fetchActividades();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error de red o del servidor');
      }
    }
    setFormLoading(false);
  };

  const actividadesFiltradas = actividades.filter(a =>
    a.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <div className="w-full max-w-5xl px-4 mt-12 mb-8 rounded-2xl shadow-2xl bg-white/90 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 pb-4">
          <h2 className="text-3xl font-extrabold text-[#cf152d] tracking-tight">Cronograma del evento</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer font-semibold"
          >
            ← Volver al Dashboard
          </button>
        </div>
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <input
            type="text"
            placeholder="Buscar actividad por nombre..."
            className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs focus:outline-none focus:border-[#cf152d] shadow-sm"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#cf152d] text-white rounded-lg shadow hover:bg-[#b01223] transition-colors cursor-pointer font-semibold mt-2 md:mt-0"
            onClick={handleCrear}
          >
            + Crear actividad
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2">Título</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Hora</th>
                <th className="px-4 py-2">Ubicación</th>
                <th className="px-4 py-2">Inscripción</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Cargando...</td></tr>
              ) : actividadesFiltradas.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No se encontraron actividades.</td></tr>
              ) : (
                actividadesFiltradas.map(act => (
                  <tr key={act.id_actividad} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold max-w-[220px] truncate" title={act.titulo}>{act.titulo}</td>
                    <td className="px-4 py-2">{act.descripcion}</td>
                    <td className="px-4 py-2">{act.fecha}</td>
                    <td className="px-4 py-2">{act.hora}</td>
                    <td className="px-4 py-2">{act.ubicacion}</td>
                    <td className="px-4 py-2">
                      {act.inscripcion_habilitada ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Habilitada</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">No habilitada</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded cursor-pointer"
                        title="Editar actividad"
                        onClick={() => handleEditar(act)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer ml-2"
                        title="Eliminar actividad"
                        onClick={() => handleEliminar(act)}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 p-1 rounded cursor-pointer ml-2"
                        title="Habilitar/Editar encuesta"
                        onClick={() => openFormularioModal(act)}
                      >
                        📝
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <ActividadModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initialData={editData || undefined}
          modo={modalMode}
        />
        <FormularioModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveFormulario}
          initialData={formInitData}
          loading={formLoading}
        />
      </div>
    </div>
  );
};

export default CronogramaPage; 