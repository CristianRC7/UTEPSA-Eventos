import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { BASE_URL } from '../../utils/Config';

interface CreateEventModalProps {
  open: boolean;
  onClose: (recargar?: boolean) => void;
  initialData?: {
    id_evento?: number;
    titulo?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    certificado_img?: string;
    url_web?: string;
  };
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ open, onClose, initialData }) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [fechaInicio, setFechaInicio] = useState(initialData?.fecha_inicio || '');
  const [fechaFin, setFechaFin] = useState(initialData?.fecha_fin || '');
  const [conCertificado, setConCertificado] = useState(!!initialData?.certificado_img);
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [urlWeb, setUrlWeb] = useState(initialData?.url_web || '');
  const [conWeb, setConWeb] = useState(!!initialData?.url_web);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitulo(initialData?.titulo || '');
    setDescripcion(initialData?.descripcion || '');
    setFechaInicio(initialData?.fecha_inicio || '');
    setFechaFin(initialData?.fecha_fin || '');
    setConCertificado(!!initialData?.certificado_img);
    setUrlWeb(initialData?.url_web || '');
    setConWeb(!!initialData?.url_web);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let certificado_img = '';
    try {
      if (conCertificado && certificadoFile) {
        // Subir archivo primero
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
      // Crear o editar evento
      const body: any = {
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        certificado_img: certificado_img || (conCertificado ? initialData?.certificado_img : undefined)
      };
      if (conWeb && urlWeb) {
        body.url_web = urlWeb;
      } else {
        body.url_web = '';
      }
      if (initialData?.id_evento) {
        body.id_evento = initialData.id_evento;
      }
      const res = await fetch(`${BASE_URL}admin/Events.php`, {
        method: initialData?.id_evento ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        onClose(true);
      } else {
        setError(data.message || 'Error al guardar evento');
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
        <h3 className="text-lg font-bold text-[#cf152d] mb-4">{initialData ? 'Editar evento' : 'Crear nuevo evento'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={conCertificado}
              onChange={e => setConCertificado(e.target.checked)}
              className="cursor-pointer"
            />
            ¿Evento con certificado?
          </label>
          {conCertificado && (
            <div>
              <input
                type="file"
                accept="image/*,.pdf"
                ref={fileInputRef}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer w-full"
                onChange={e => setCertificadoFile(e.target.files?.[0] || null)}
                required={!initialData?.certificado_img}
              />
              {certificadoFile && (
                <div className="text-xs text-gray-500 mt-1">Archivo seleccionado: {certificadoFile.name}</div>
              )}
            </div>
          )}
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
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (initialData ? 'Guardando...' : 'Creando...') : (initialData ? 'Guardar cambios' : 'Crear evento')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal; 