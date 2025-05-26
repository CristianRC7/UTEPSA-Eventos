import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const DashboardPage = () => {
  const { logout } = useAuth()!;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#cf152d]">Bienvenido, Administrador</h1>
        <p className="mb-8 text-gray-600">Esta es la página de Dashboard. Aquí podrás gestionar el sistema próximamente.</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#cf152d] text-white px-4 py-2 rounded hover:bg-[#b01223] transition-colors mx-auto cursor-pointer"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default DashboardPage; 