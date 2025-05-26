import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { BASE_URL } from '../utils/Config';
import { useAuth } from '../App';

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth()!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}admin/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
      });
      const data = await res.json();
      if (data.success && data.user && data.user.rol === 'administrador') {
        login(data.user);
        navigate('/dashboard');
      } else {
        setError('Credenciales incorrectas o no tienes permisos de administrador.');
      }
    } catch (e) {
      setError('Error de conexión.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#cf152d]">Iniciar Sesión</h2>
        <div className="mb-4 relative">
          <User className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            className="pl-10 pr-3 py-2 border border-gray-300 rounded w-full focus:outline-none focus:border-[#cf152d]"
            placeholder="Usuario"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-4 relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            className="pl-10 pr-10 py-2 border border-gray-300 rounded w-full focus:outline-none focus:border-[#cf152d]"
            placeholder="Contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2 text-gray-400 cursor-pointer"
            onClick={() => setShowPassword(v => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-[#cf152d] text-white py-2 rounded font-semibold hover:bg-[#b01223] transition-colors disabled:opacity-60 cursor-pointer"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage; 