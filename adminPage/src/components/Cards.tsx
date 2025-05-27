import { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/Config';

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

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch(`${BASE_URL}admin/getEventos.php`);
        const data = await res.json();
        if (data.success) {
          setEventos(data.eventos);
        }
      } catch (e) {
        // Manejo de error opcional
      }
      setLoading(false);
    };
    fetchEventos();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando eventos...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {eventos.map(evento => (
        <div
          key={evento.id_evento}
          className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition cursor-pointer"
          onClick={() => onCardClick ? onCardClick(evento.id_evento) : alert(`Evento: ${evento.titulo}`)}
        >
          <h3 className="text-lg font-bold text-[#cf152d] mb-2">{evento.titulo}</h3>
          <p className="text-gray-600 mb-2 line-clamp-2">{evento.descripcion}</p>
          <div className="text-xs text-gray-500">
            {new Date(evento.fecha_inicio).toLocaleString()} - {new Date(evento.fecha_fin).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cards; 