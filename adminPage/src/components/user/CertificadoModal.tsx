import React, { useState } from 'react';
import { X, Trash2, Edit2, Award } from 'lucide-react';
import { BASE_URL } from '../../utils/Config';

interface CertificadoModalProps {
  open: boolean;
  onClose: (recargar?: boolean) => void;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    usuario: string;
    rol: string;
  };
  inscripciones: {
    id_inscripcion: number;
    id_evento: number;
    nro_certificado?: string | null;
    id_certificado?: number | null;
  }[];
  eventos: { id_evento: number; titulo: string }[];
}

const CertificadoModal: React.FC<CertificadoModalProps> = ({ open, onClose, usuario, inscripciones, eventos }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [nroCert, setNroCert] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = (id_inscripcion: number, nro_certificado?: string | null) => {
    setSelected(id_inscripcion);
    setNroCert(nro_certificado || '');
    setEditMode(!!nro_certificado);
  };

  const handleGuardar = async () => {
    if (!selected || !nroCert) {
      setError('Selecciona una inscripción y escribe el número de certificado');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const yaTiene = inscripciones.find(i => i.id_inscripcion === selected)?.nro_certificado;
      const accion = yaTiene ? 'editar_certificado' : 'asignar_certificado';
      let body: { accion: string; id_certificado?: number | null; id_inscripcion?: number; nro_certificado: string };
      if (yaTiene) {
        body = { accion, id_certificado: null, nro_certificado: nroCert };
      } else {
        body = { accion, id_inscripcion: selected, nro_certificado: nroCert };
      }
      if (yaTiene) {
        // Obtener id_certificado por fetch (no viene en inscripciones)
        const res = await fetch(`${BASE_URL}admin/Users.php?inscripciones_usuario=${usuario.id_usuario}`);
        const data = await res.json();
        if (data.success) {
          const cert = data.inscritos.find((i: { id_inscripcion: number; nro_certificado?: string | null; id_certificado?: number }) => i.id_inscripcion === selected && i.nro_certificado);
          if (cert && cert.id_certificado) {
            body.id_certificado = cert.id_certificado;
          } else {
            setError('No se encontró el certificado para editar');
            setSaving(false);
            return;
          }
        }
      }
      const res = await fetch(`${BASE_URL}admin/Users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        onClose(true);
      } else {
        setError(data.message || 'Error al guardar certificado');
      }
    } catch {
      setError('Error de conexión');
    }
    setSaving(false);
  };

  const handleEliminar = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      // Obtener id_certificado por fetch
      const res = await fetch(`${BASE_URL}admin/Users.php?inscripciones_usuario=${usuario.id_usuario}`);
      const data = await res.json();
      if (data.success) {
        const cert = data.inscritos.find((i: { id_inscripcion: number; nro_certificado?: string | null; id_certificado?: number }) => i.id_inscripcion === selected && i.nro_certificado);
        if (cert && cert.id_certificado) {
          const res2 = await fetch(`${BASE_URL}admin/Users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accion: 'eliminar_certificado', id_certificado: cert.id_certificado })
          });
          const data2 = await res2.json();
          if (data2.success) {
            onClose(true);
          } else {
            setError(data2.message || 'Error al eliminar certificado');
          }
        } else {
          setError('No se encontró el certificado para eliminar');
        }
      }
    } catch {
      setError('Error de conexión');
    }
    setSaving(false);
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
        <h3 className="text-lg font-bold text-[#cf152d] mb-4 flex items-center gap-2"><Award size={20}/> Certificados de eventos</h3>
        <div className="mb-2 text-sm text-gray-700 font-semibold">{usuario.nombre} {usuario.apellido_paterno} ({usuario.usuario})</div>
        <div className="max-h-60 overflow-y-auto mb-4">
          {inscripciones.length === 0 && <div className="text-gray-400 text-center">No hay inscripciones.</div>}
          {inscripciones.map(i => {
            const evento = eventos.find(e => e.id_evento === i.id_evento);
            return (
              <label key={i.id_inscripcion} className={`flex items-center gap-2 mb-2 cursor-pointer select-none ${selected === i.id_inscripcion ? 'font-bold text-[#cf152d]' : ''}`}>
                <input
                  type="radio"
                  checked={selected === i.id_inscripcion}
                  onChange={() => handleSelect(i.id_inscripcion, i.nro_certificado)}
                  className="cursor-pointer"
                />
                <span>{evento ? evento.titulo : `Evento #${i.id_evento}`} {i.nro_certificado ? `(Certificado: ${i.nro_certificado})` : '(Sin certificado)'}</span>
              </label>
            );
          })}
        </div>
        {selected && (
          <div className="mb-4 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Nro. certificado"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#cf152d] flex-1"
              value={nroCert}
              onChange={e => setNroCert(e.target.value)}
              disabled={saving}
            />
            {inscripciones.find(i => i.id_inscripcion === selected)?.nro_certificado && (
              <>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                  onClick={() => setEditMode(true)}
                  disabled={saving}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                  onClick={handleEliminar}
                  disabled={saving}
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        )}
        {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            onClick={() => onClose(false)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] cursor-pointer"
            onClick={handleGuardar}
            disabled={saving || !selected || !nroCert}
          >
            {saving ? 'Guardando...' : (editMode ? 'Editar/Asignar' : 'Asignar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificadoModal; 