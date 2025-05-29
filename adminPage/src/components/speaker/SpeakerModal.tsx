import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { BASE_URL } from '../../utils/Config';

interface Evento {
  id_evento: number;
  titulo: string;
}

interface Expositor {
  id_expositor?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  descripcion: string;
  imagen_url: string | null;
  eventos: Evento[];
}

interface SpeakerModalProps {
  open: boolean;
  onClose: (recargar?: boolean) => void;
  expositor: Expositor | null;
  modo: 'crear' | 'editar';
  eventos: Evento[];
}

const SpeakerModal: React.FC<SpeakerModalProps> = ({ open, onClose, expositor, modo, eventos }) => {
  const [form, setForm] = useState<Expositor>({
    nombre: expositor?.nombre || '',
    apellido_paterno: expositor?.apellido_paterno || '',
    apellido_materno: expositor?.apellido_materno || '',
    descripcion: expositor?.descripcion || '',
    imagen_url: expositor?.imagen_url || null,
    eventos: expositor?.eventos || [],
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagenEliminada, setImagenEliminada] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm({
      nombre: expositor?.nombre || '',
      apellido_paterno: expositor?.apellido_paterno || '',
      apellido_materno: expositor?.apellido_materno || '',
      descripcion: expositor?.descripcion || '',
      imagen_url: expositor?.imagen_url || null,
      eventos: expositor?.eventos || [],
    });
    setFile(null);
    setImagenEliminada(false);
    setError('');
  }, [expositor, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEventosChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));
    setForm({ ...form, eventos: eventos.filter(ev => selected.includes(ev.id_evento)) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleEliminarImagen = () => {
    setImagenEliminada(true);
    setForm({ ...form, imagen_url: null });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let success = false;
      if (modo === 'crear') {
        const formData = new FormData();
        formData.append('nombre', form.nombre);
        formData.append('apellido_paterno', form.apellido_paterno);
        formData.append('apellido_materno', form.apellido_materno);
        formData.append('descripcion', form.descripcion);
        formData.append('eventos', JSON.stringify(form.eventos.map(ev => ev.id_evento)));
        if (file) formData.append('imagen', file);
        const res = await fetch(`${BASE_URL}admin/Speakers.php`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        success = data.success;
        if (!success) setError(data.message || 'Error al crear expositor');
      } else if (modo === 'editar' && expositor) {
        // Si se eliminó la imagen, o no hay imagen, permitir subir otra
        let imagen_url = form.imagen_url;
        let body: any = {
          id_expositor: expositor.id_expositor,
          nombre: form.nombre,
          apellido_paterno: form.apellido_paterno,
          apellido_materno: form.apellido_materno,
          descripcion: form.descripcion,
          eventos: form.eventos.map(ev => ev.id_evento),
        };
        // Si hay imagen nueva, no se puede enviar por PUT, así que usar POST con campo especial
        if (file) {
          const formData = new FormData();
          formData.append('id_expositor', String(expositor.id_expositor));
          formData.append('nombre', form.nombre);
          formData.append('apellido_paterno', form.apellido_paterno);
          formData.append('apellido_materno', form.apellido_materno);
          formData.append('descripcion', form.descripcion);
          formData.append('eventos', JSON.stringify(form.eventos.map(ev => ev.id_evento)));
          formData.append('imagen', file);
          // Eliminar imagen anterior si existe
          if (imagenEliminada && expositor.imagen_url) {
            // No se elimina por separado, se sobreescribe
          }
          const res = await fetch(`${BASE_URL}admin/Speakers.php`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          success = data.success;
          if (!success) setError(data.message || 'Error al actualizar expositor');
        } else {
          // PUT sin imagen
          const putBody: Record<string, unknown> = { ...body };
          if (imagenEliminada) putBody.imagen_url = null;
          const res = await fetch(`${BASE_URL}admin/Speakers.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(putBody)
          });
          const data = await res.json();
          success = data.success;
          if (!success) setError(data.message || 'Error al actualizar expositor');
        }
      }
      if (success) {
        onClose(true);
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
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
        <h3 className="text-lg font-bold text-[#cf152d] mb-4">{modo === 'crear' ? 'Agregar expositor' : 'Editar expositor'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            name="apellido_paterno"
            type="text"
            placeholder="Apellido paterno"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={form.apellido_paterno}
            onChange={handleChange}
            required
          />
          <input
            name="apellido_materno"
            type="text"
            placeholder="Apellido materno"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={form.apellido_materno}
            onChange={handleChange}
            required
          />
          <textarea
            name="descripcion"
            placeholder="Descripción"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer min-h-[60px]"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
          <label className="text-sm font-medium text-gray-700">Eventos asociados</label>
          <select
            multiple
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={form.eventos.map(ev => String(ev.id_evento))}
            onChange={handleEventosChange}
            required
          >
            {eventos.map(ev => (
              <option key={ev.id_evento} value={ev.id_evento}>{ev.titulo}</option>
            ))}
          </select>
          <label className="text-sm font-medium text-gray-700">Imagen del expositor</label>
          {modo === 'editar' && form.imagen_url && !imagenEliminada && (
            <div className="flex items-center gap-2 mb-2">
              <img
                src={`${BASE_URL}upload/${form.imagen_url}`}
                alt="Imagen expositor"
                className="w-16 h-16 object-cover rounded-full border"
              />
              <span className="text-green-600 text-xs">Imagen subida</span>
              <button
                type="button"
                className="text-red-600 hover:text-red-800 cursor-pointer"
                title="Eliminar imagen"
                onClick={handleEliminarImagen}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
          {((modo === 'crear') || (modo === 'editar' && (!form.imagen_url || imagenEliminada))) && (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer w-full"
              onChange={handleFileChange}
              required={modo === 'crear'}
            />
          )}
          {file && (
            <div className="text-xs text-gray-500 mt-1">Archivo seleccionado: {file.name}</div>
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SpeakerModal; 