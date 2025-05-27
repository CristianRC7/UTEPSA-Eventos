import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { BASE_URL } from '../../utils/Config';

interface EditEventModalProps {
  open: boolean;
  onClose: (recargar?: boolean) => void;
  evento: {
    id_evento: number;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    certificado_img?: string;
    url_web?: string;
  };
}

const EditEventModal: React.FC<EditEventModalProps> = ({ open, onClose, evento }) => {
  const [titulo, setTitulo] = useState(evento.titulo);
  const [descripcion, setDescripcion] = useState(evento.descripcion);
  const [fechaInicio, setFechaInicio] = useState(evento.fecha_inicio.slice(0, 16));
  const [fechaFin, setFechaFin] = useState(evento.fecha_fin.slice(0, 16));
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [certificadoActual, setCertificadoActual] = useState(evento.certificado_img || '');
  const [urlWeb, setUrlWeb] = useState(evento.url_web || '');
  const [conWeb, setConWeb] = useState(!!evento.url_web);
  const [webEliminada, setWebEliminada] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitulo(evento.titulo);
    setDescripcion(evento.descripcion);
    setFechaInicio(evento.fecha_inicio.slice(0, 16));
    setFechaFin(evento.fecha_fin.slice(0, 16));
    setCertificadoActual(evento.certificado_img || '');
    setUrlWeb(evento.url_web || '');
    setConWeb(!!evento.url_web);
    setWebEliminada(false);
  }, [evento, open]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let certificado_img = certificadoActual;
    try {
      if (certificadoFile) {
        // Subir nuevo archivo
        const formData = new FormData();
        const nombreLimpio = titulo.replace(/\s+/g, '');
        const ext = certificadoFile.name.split('.').pop();
        const nombreArchivo = `${nombreLimpio}.${ext}`;
        formData.append('certificado', certificadoFile, nombreArchivo);
        const resUpload = await fetch(`${BASE_URL}admin/Events.php`, {
          method: 'POST',
          body: formData
        });
        const dataUpload = await resUpload.json();
        if (dataUpload.success && dataUpload.certificado_img) {
          certificado_img = dataUpload.certificado_img;
        } else {
          setError(dataUpload.message || 'Error al subir certificado');
          setLoading(false);
          return;
        }
      }
      // Actualizar evento
      const body: any = {
        id_evento: evento.id_evento,
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        certificado_img: certificado_img || undefined
      };
      if (webEliminada || !conWeb || !urlWeb) {
        body.url_web = '';
      } else if (conWeb && urlWeb) {
        body.url_web = urlWeb;
      }
      const res = await fetch(`${BASE_URL}admin/Events.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        onClose(true);
      } else {
        setError(data.message || 'Error al actualizar evento');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const handleDeleteCertificado = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}admin/Events.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'eliminar_certificado', id_evento: evento.id_evento })
      });
      const data = await res.json();
      if (data.success) {
        setCertificadoActual('');
        setCertificadoFile(null);
      } else {
        setError(data.message || 'Error al eliminar certificado');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const handleDeleteEvento = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}admin/Events.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'eliminar_evento', id_evento: evento.id_evento })
      });
      const data = await res.json();
      if (data.success) {
        onClose(true);
      } else {
        setError(data.message || 'Error al eliminar evento');
      }
    } catch {
      setError('Error de conexión');
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
          <X size={24} />
        </button>
        <h3 className="text-lg font-bold text-[#cf152d] mb-4">Editar evento</h3>
        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Título del evento"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
          />
          <textarea
            placeholder="Descripción"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer min-h-[80px]"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            required
          />
          <label className="text-sm font-medium text-gray-700">Fecha y hora de inicio</label>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            required
          />
          <label className="text-sm font-medium text-gray-700">Fecha y hora de fin</label>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            required
          />
          <label className="text-sm font-medium text-gray-700">Certificado</label>
          {certificadoActual ? (
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-semibold">Certificado cargado</span>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 ml-2"
                onClick={handleDeleteCertificado}
                disabled={loading}
                title="Eliminar certificado actual"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*,.pdf"
              ref={fileInputRef}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer w-full"
              onChange={e => setCertificadoFile(e.target.files?.[0] || null)}
            />
          )}
          {/* Página web */}
          {evento.url_web && !webEliminada ? (
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-semibold">Página web cargada:</span>
              <a href={evento.url_web} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900 max-w-[120px] truncate" title={evento.url_web}>{evento.url_web}</a>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 ml-2"
                onClick={() => { setWebEliminada(true); setConWeb(false); setUrlWeb(''); }}
                disabled={loading}
                title="Eliminar página web"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={conWeb}
                  onChange={e => setConWeb(e.target.checked)}
                  className="cursor-pointer"
                />
                ¿Evento con página web?
              </label>
              {conWeb && (
                <input
                  type="url"
                  placeholder="Enlace de la página web del evento"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
                  value={urlWeb}
                  onChange={e => setUrlWeb(e.target.value)}
                  required={conWeb}
                />
              )}
            </>
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
        <div className="mt-4 flex justify-end">
          {!confirmDelete ? (
            <button
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm"
              onClick={() => setConfirmDelete(true)}
              disabled={loading}
            >
              <Trash2 size={16} /> Eliminar evento
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">¿Confirmar eliminación?</span>
              <button
                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                onClick={handleDeleteEvento}
                disabled={loading}
              >
                Sí, eliminar
              </button>
              <button
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                onClick={() => setConfirmDelete(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEventModal; 