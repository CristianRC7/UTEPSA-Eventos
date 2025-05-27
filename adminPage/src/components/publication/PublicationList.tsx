import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../utils/Config';
import { Check, X as XIcon } from 'lucide-react';

interface Publicacion {
  id_publicacion: number;
  descripcion: string;
  estado: string;
  fecha_subida: string;
  usuario: string;
  evento: string;
  imagenes: string[];
}

const PublicationList: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalImg, setModalImg] = useState<string | null>(null);

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroUsuario) params.append('usuario', filtroUsuario);
      if (filtroEvento) params.append('evento', filtroEvento);
      if (filtroEstado) params.append('estado', filtroEstado);
      const res = await fetch(`${BASE_URL}admin/Publications.php?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPublicaciones(data.publicaciones);
      } else {
        setError(data.message || 'Error al obtener publicaciones');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPublicaciones();
    // eslint-disable-next-line
  }, [filtroUsuario, filtroEvento, filtroEstado]);

  const handleAccion = async (id_publicacion: number, accion: 'aceptar' | 'rechazar') => {
    try {
      const res = await fetch(`${BASE_URL}admin/Publications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, id_publicacion })
      });
      const data = await res.json();
      if (data.success) {
        fetchPublicaciones();
      } else {
        alert(data.message || 'Error al actualizar publicación');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Filtrar por usuario..."
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3 focus:outline-none focus:border-[#cf152d]"
          value={filtroUsuario}
          onChange={e => setFiltroUsuario(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por evento..."
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3 focus:outline-none focus:border-[#cf152d]"
          value={filtroEvento}
          onChange={e => setFiltroEvento(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3 focus:outline-none focus:border-[#cf152d] cursor-pointer"
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
          <option value="esperando_aprobacion">Pendiente</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-8">Cargando publicaciones...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Evento</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Imágenes</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {publicaciones.map(pub => (
                <tr key={pub.id_publicacion} className="border-b">
                  <td className="px-4 py-2">{pub.id_publicacion}</td>
                  <td className="px-4 py-2">{pub.usuario}</td>
                  <td className="px-4 py-2">{pub.evento}</td>
                  <td className="px-4 py-2">{pub.descripcion}</td>
                  <td className="px-4 py-2 flex gap-1">
                    {pub.imagenes.map((img, i) => (
                      <img
                        key={i}
                        src={BASE_URL + img}
                        alt="img"
                        className="w-12 h-12 object-cover rounded cursor-pointer border border-gray-200 hover:shadow-lg"
                        onClick={() => setModalImg(BASE_URL + img)}
                      />
                    ))}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {pub.estado === 'aprobado' && <span className="text-green-600 font-semibold">Aprobado</span>}
                    {pub.estado === 'rechazado' && <span className="text-red-600 font-semibold">Rechazado</span>}
                    {pub.estado === 'esperando_aprobacion' && <span className="text-yellow-600 font-semibold">Pendiente</span>}
                  </td>
                  <td className="px-4 py-2">{new Date(pub.fecha_subida).toLocaleString()}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {pub.estado === 'esperando_aprobacion' && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                          title="Aceptar"
                          onClick={() => handleAccion(pub.id_publicacion, 'aceptar')}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Rechazar"
                          onClick={() => handleAccion(pub.id_publicacion, 'rechazar')}
                        >
                          <XIcon size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {publicaciones.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-4">No hay publicaciones.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal de imagen */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setModalImg(null)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="img-grande" className="max-w-[90vw] max-h-[80vh] rounded shadow-lg border-4 border-white" />
            <button
              className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-1 hover:bg-[#cf152d] cursor-pointer"
              onClick={() => setModalImg(null)}
            >
              <XIcon size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationList; 