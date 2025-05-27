import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { BASE_URL } from '../../utils/Config';

interface Evento {
  id_evento: number;
  titulo: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  usuario: string;
  rol: string;
}

interface EventosModalProps {
  open: boolean;
  onClose: (recargar?: boolean) => void;
  usuario: Usuario;
}

const EventosModal: React.FC<EventosModalProps> = ({ open, onClose, usuario }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [inscritos, setInscritos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}admin/Users.php?inscripciones_usuario=${usuario.id_usuario}`);
        const data = await res.json();
        if (data.success) {
          setEventos(data.eventos);
          setInscritos(data.inscritos.map((e: any) => e.id_evento));
        }
      } catch {
        setError('Error al obtener eventos');
      }
      setLoading(false);
    };
    if (open) fetchEventos();
  }, [open, usuario.id_usuario]);

  const handleToggle = (id_evento: number) => {
    setInscritos(prev =>
      prev.includes(id_evento)
        ? prev.filter(id => id !== id_evento)
        : [...prev, id_evento]
    );
  };

  const handleGuardar = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}admin/Users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'actualizar_inscripciones', id_usuario: usuario.id_usuario, eventos: inscritos })
      });
      const data = await res.json();
      if (data.success) {
        onClose(true);
      } else {
        setError(data.message || 'Error al guardar inscripciones');
      }
    } catch {
      setError('Error de conexión');
    }
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative border border-gray-200">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-[#cf152d] text-xl cursor-pointer"
          onClick={() => onClose(false)}
        >
          <X size={24} />
        </button>
        <h3 className="text-lg font-bold text-[#cf152d] mb-4">Inscribir a eventos</h3>
        <div className="mb-2 text-sm text-gray-700 font-semibold">{usuario.nombre} {usuario.apellido_paterno} ({usuario.usuario})</div>
        {loading ? (
          <div className="text-center py-8">Cargando eventos...</div>
        ) : (
          <div className="max-h-60 overflow-y-auto mb-4">
            {eventos.map(ev => (
              <label key={ev.id_evento} className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inscritos.includes(ev.id_evento)}
                  onChange={() => handleToggle(ev.id_evento)}
                  className="cursor-pointer"
                />
                <span className="cursor-pointer">{ev.titulo}</span>
              </label>
            ))}
            {eventos.length === 0 && <div className="text-gray-400 text-center">No hay eventos disponibles.</div>}
          </div>
        )}
        {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            onClick={() => onClose(false)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] cursor-pointer"
            onClick={handleGuardar}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventosModal; 