import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { BASE_URL } from '../../utils/Config';

interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  usuario: string;
  rol: string;
}

interface UserModalProps {
  open: boolean;
  onClose: (recargar?: boolean) => void;
  usuario: Usuario | null;
  modo: 'crear' | 'editar';
}

const roles = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'interno', label: 'Interno' },
  { value: 'externo', label: 'Externo' },
];

const UserModal: React.FC<UserModalProps> = ({ open, onClose, usuario, modo }) => {
  const [form, setForm] = useState<Usuario>({
    nombre: usuario?.nombre || '',
    apellido_paterno: usuario?.apellido_paterno || '',
    apellido_materno: usuario?.apellido_materno || '',
    usuario: usuario?.usuario || '',
    rol: usuario?.rol || 'interno',
  });
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      type Payload = Usuario & { contrasena?: string; id_usuario?: number };
      const payload: Payload = { ...form };
      if (contrasena) payload.contrasena = contrasena;
      const url = `${BASE_URL}admin/Users.php`;
      const method: 'POST' | 'PUT' = modo === 'crear' ? 'POST' : 'PUT';
      if (modo === 'editar') {
        payload.id_usuario = usuario?.id_usuario;
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onClose(true);
      } else {
        setError(data.message || 'Error al guardar usuario');
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
        <h3 className="text-lg font-bold text-[#cf152d] mb-4">{modo === 'crear' ? 'Agregar usuario' : 'Editar usuario'}</h3>
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
          <input
            name="usuario"
            type="text"
            placeholder="Usuario"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={form.usuario}
            onChange={handleChange}
            required
            autoComplete="username"
          />
          <div className="relative">
            <input
              name="contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder={modo === 'crear' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer w-full pr-10"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              autoComplete="new-password"
              required={modo === 'crear'}
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-400 hover:text-[#cf152d] cursor-pointer"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <select
            name="rol"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] cursor-pointer"
            value={form.rol}
            onChange={handleChange}
            required
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
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

export default UserModal; 