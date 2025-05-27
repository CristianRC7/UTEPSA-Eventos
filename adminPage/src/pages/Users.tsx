import { useEffect, useState } from 'react';
import SideBar from '../components/sideBar';
import { BASE_URL } from '../utils/Config';
import UserModal from '../components/user/Modal';
import { Pencil, Trash2, Plus, CalendarCheck2 } from 'lucide-react';
import EventosModal from '../components/user/EventosModal';

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  usuario: string;
  rol: string;
}

const UsersPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [modalModo, setModalModo] = useState<'crear' | 'editar'>('crear');
  const [eventosModalOpen, setEventosModalOpen] = useState(false);
  const [usuarioEventos, setUsuarioEventos] = useState<Usuario | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}admin/Users.php`, {
        method: 'GET',
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.usuarios);
      }
    } catch {
      // Error al obtener usuarios, no hacer nada
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEditar = (usuario: Usuario) => {
    setUsuarioEditar(usuario);
    setModalModo('editar');
    setModalOpen(true);
  };

  const handleAgregar = () => {
    setUsuarioEditar(null);
    setModalModo('crear');
    setModalOpen(true);
  };

  const handleEliminar = async (usuario: Usuario) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido_paterno}?`)) return;
    try {
      const res = await fetch(`${BASE_URL}admin/Users.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: usuario.id_usuario })
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(usuarios.filter(u => u.id_usuario !== usuario.id_usuario));
      } else {
        alert('No se pudo eliminar el usuario.');
      }
    } catch {
      alert('Error al eliminar usuario.');
    }
  };

  const handleModalClose = (recargar = false) => {
    setModalOpen(false);
    setUsuarioEditar(null);
    if (recargar) fetchUsuarios();
  };

  const handleInscribirEventos = (usuario: Usuario) => {
    setUsuarioEventos(usuario);
    setEventosModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <SideBar />
      <div className="w-full max-w-5xl px-4 mt-8">
        <h2 className="text-2xl font-bold text-[#cf152d] mb-6">Usuarios</h2>
        <div className="mb-4 flex justify-between items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:border-[#cf152d]"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button
            className="ml-2 flex items-center gap-2 px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] transition-colors cursor-pointer"
            onClick={handleAgregar}
          >
            <Plus size={18} /> Agregar
          </button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Usuario</th>
                    <th className="px-4 py-2 text-left">Rol</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(u => (
                    <tr key={u.id_usuario} className="border-b">
                      <td className="px-4 py-2">{u.id_usuario}</td>
                      <td className="px-4 py-2">{u.nombre} {u.apellido_paterno} {u.apellido_materno}</td>
                      <td className="px-4 py-2">{u.usuario}</td>
                      <td className="px-4 py-2 capitalize">{u.rol}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title="Editar"
                          onClick={() => handleEditar(u)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Eliminar"
                          onClick={() => handleEliminar(u)}
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                          title="Inscribir a eventos"
                          onClick={() => handleInscribirEventos(u)}
                        >
                          <CalendarCheck2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 py-4">No se encontraron usuarios.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {modalOpen && (
          <UserModal
            open={modalOpen}
            onClose={handleModalClose}
            usuario={usuarioEditar}
            modo={modalModo}
          />
        )}
        {eventosModalOpen && usuarioEventos && (
          <EventosModal
            open={eventosModalOpen}
            onClose={() => setEventosModalOpen(false)}
            usuario={usuarioEventos}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage; 