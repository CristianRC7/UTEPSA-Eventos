import React, { useState, useEffect } from 'react';

interface Actividad {
  id_actividad?: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  inscripcion_habilitada: boolean;
}

interface ActividadModalProps {
  open: boolean;
  onClose: (recargar?: boolean) => void;
  onSave: (actividad: Actividad) => Promise<void>;
  initialData?: Actividad;
  modo: 'crear' | 'editar';
}

const ActividadModal: React.FC<ActividadModalProps> = ({ open, onClose, onSave, initialData, modo }) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [fecha, setFecha] = useState(initialData?.fecha || '');
  const [hora, setHora] = useState(initialData?.hora || '');
  const [ubicacion, setUbicacion] = useState(initialData?.ubicacion || '');
  const [inscripcionHabilitada, setInscripcionHabilitada] = useState(initialData?.inscripcion_habilitada || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitulo(initialData?.titulo || '');
    setDescripcion(initialData?.descripcion || '');
    setFecha(initialData?.fecha || '');
    setHora(initialData?.hora || '');
    setUbicacion(initialData?.ubicacion || '');
    setInscripcionHabilitada(initialData?.inscripcion_habilitada || false);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        id_actividad: initialData?.id_actividad,
        titulo,
        descripcion,
        fecha,
        hora,
        ubicacion,
        inscripcion_habilitada: inscripcionHabilitada
      });
      onClose(true);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative border border-gray-200">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-[#cf152d] text-xl cursor-pointer"
          onClick={() => onClose(false)}
        >
          ×
        </button>
        <h3 className="text-lg font-bold text-[#cf152d] mb-4">{modo === 'crear' ? 'Crear actividad' : 'Editar actividad'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            placeholder="Título de la actividad"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer min-h-[40px] resize-none"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            maxLength={100}
          />
          <textarea
            placeholder="Descripción"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer min-h-[60px] resize-none"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            required
            maxLength={500}
          />
          <label className="text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            required
          />
          <label className="text-sm font-medium text-gray-700">Hora</label>
          <input
            type="time"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={hora}
            onChange={e => setHora(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Ubicación"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            required
          />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inscripcionHabilitada}
              onChange={e => setInscripcionHabilitada(e.target.checked)}
              className="cursor-pointer"
            />
            ¿Habilitar inscripción?
          </label>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (modo === 'crear' ? 'Creando...' : 'Guardando...') : (modo === 'crear' ? 'Crear actividad' : 'Guardar cambios')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActividadModal; 