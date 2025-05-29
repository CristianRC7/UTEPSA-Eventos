import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, Users, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../App';

const SideBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth()!;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Botón hamburguesa */}
      {!open && (
        <button
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow cursor-pointer"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu size={28} />
        </button>
      )}

      {/* Drawer lateral */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'bg-black/30 pointer-events-auto' : 'pointer-events-none bg-transparent'}`}
        onClick={() => setOpen(false)}
        style={{ display: open ? 'block' : 'none' }}
      >
        <nav
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-bold text-lg text-[#cf152d]">Menú</span>
            <button
              className="text-gray-500 hover:text-[#cf152d] cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-2 p-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${location.pathname === '/dashboard' ? 'bg-[#cf152d] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link
              to="/dashboard/usuarios"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${location.pathname === '/dashboard/usuarios' ? 'bg-[#cf152d] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setOpen(false)}
            >
              <Users size={20} />
              Usuarios
            </Link>
            <Link
              to="/dashboard/publicaciones"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${location.pathname === '/dashboard/publicaciones' ? 'bg-[#cf152d] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setOpen(false)}
            >
              <ImageIcon size={20} />
              Publicaciones
            </Link>
            <Link
              to="/dashboard/expositores"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${location.pathname === '/dashboard/expositores' ? 'bg-[#cf152d] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setOpen(false)}
            >
              <Users size={20} />
              Expositores
            </Link>
          </div>
          <div className="p-4 border-t mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg font-medium bg-gray-100 text-[#cf152d] hover:bg-[#cf152d] hover:text-white transition-colors cursor-pointer"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default SideBar;