import { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/Config';
import { Settings, BadgeCheck, X as XIcon } from 'lucide-react';
import EditEventModal from './dashboard/EditEventModal';

interface Evento {
  id_evento: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  certificado_img?: string;
}

interface CardsProps {
  onCardClick?: (id_evento: number) => void;
}

const Cards = ({ onCardClick }: CardsProps) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalCert, setModalCert] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [eventoEditar, setEventoEditar] = useState<Evento | null>(null);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}admin/getEventos.php`);
      const data = await res.json();
      if (data.success) {
        setEventos(data.eventos);
      }
    } catch {
      // Manejo de error opcional
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const eventosFiltrados = eventos.filter(ev =>
    ev.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCertClick = (certificado_img?: string) => {
    if (!certificado_img) return;
    const ext = certificado_img.split('.').pop()?.toLowerCase();
    const url = `${BASE_URL}certificate/${certificado_img}`;
    if (ext === 'pdf') {
      window.open(url, '_blank');
    } else {
      setModalCert(url);
    }
  };

  const handleEditClick = (evento: Evento) => {
    setEventoEditar(evento);
    setEditModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando eventos...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Buscar evento por nombre..."
          className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs focus:outline-none focus:border-[#cf152d] shadow-sm"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {eventosFiltrados.map(evento => (
          <div
            key={evento.id_evento}
            className="relative bg-white rounded-2xl shadow-xl p-7 border border-gray-200 hover:shadow-2xl transition cursor-pointer group overflow-hidden"
            onClick={() => onCardClick ? onCardClick(evento.id_evento) : alert(`Evento: ${evento.titulo}`)}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-[#cf152d] z-10 cursor-pointer bg-white rounded-full p-1 shadow group-hover:scale-110 transition"
              onClick={e => { e.stopPropagation(); handleEditClick(evento); }}
              title="Configuración"
            >
              <Settings size={22} />
            </button>
            {evento.certificado_img && (
              <button
                className="absolute top-4 left-4 text-green-600 hover:text-green-800 z-10 cursor-pointer bg-white rounded-full p-1 shadow group-hover:scale-110 transition"
                title="Ver certificado"
                onClick={e => { e.stopPropagation(); handleCertClick(evento.certificado_img); }}
              >
                <BadgeCheck size={22} />
              </button>
            )}
            <h3 className="text-xl font-bold text-[#cf152d] mb-2 truncate pr-10">{evento.titulo}</h3>
            <p className="text-gray-600 mb-3 line-clamp-3 min-h-[48px]">{evento.descripcion}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="bg-gray-100 rounded px-2 py-1">{new Date(evento.fecha_inicio).toLocaleDateString()} {new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>-</span>
              <span className="bg-gray-100 rounded px-2 py-1">{new Date(evento.fecha_fin).toLocaleDateString()} {new Date(evento.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {eventosFiltrados.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-8">No se encontraron eventos.</div>
        )}
      </div>
      {/* Modal de certificado imagen */}
      {modalCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setModalCert(null)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={modalCert} alt="certificado" className="max-w-[90vw] max-h-[80vh] rounded shadow-lg border-4 border-white" />
            <button
              className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-1 hover:bg-[#cf152d] cursor-pointer"
              onClick={() => setModalCert(null)}
            >
              <XIcon size={24} />
            </button>
          </div>
        </div>
      )}
      {/* Modal de edición de evento */}
      {editModalOpen && eventoEditar && (
        <EditEventModal
          open={editModalOpen}
          onClose={(recargar?: boolean) => {
            setEditModalOpen(false);
            setEventoEditar(null);
            if (recargar) fetchEventos();
          }}
          evento={eventoEditar}
        />
      )}
    </div>
  );
};

export default Cards; 