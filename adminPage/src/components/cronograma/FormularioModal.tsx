import React, { useState, useEffect } from 'react';

interface FormularioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { fecha_inicio: string; fecha_fin: string }) => Promise<void>;
  initialData?: { fecha_inicio: string; fecha_fin: string };
  loading?: boolean;
}

const FormularioModal: React.FC<FormularioModalProps> = ({ open, onClose, onSave, initialData, loading }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFechaInicio(initialData.fecha_inicio?.slice(0, 16) || '');
      setFechaFin(initialData.fecha_fin?.slice(0, 16) || '');
    } else {
      setFechaInicio('');
      setFechaFin('');
    }
    setError('');
  }, [initialData, open]);

  const handleSave = async () => {
    setError('');
    if (!fechaInicio || !fechaFin) {
      setError('Ambas fechas son requeridas.');
      return;
    }
    if (fechaInicio > fechaFin) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ fecha_inicio: fechaInicio + ':00', fecha_fin: fechaFin + ':00' });
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Error al guardar');
      }
    }
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <h3 className="text-xl font-bold mb-4 text-[#cf152d]">Habilitar encuesta para la actividad</h3>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Fecha y hora de inicio</label>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#cf152d]"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            disabled={saving || loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Fecha y hora de cierre</label>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#cf152d]"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            disabled={saving || loading}
          />
        </div>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            onClick={onClose}
            disabled={saving || loading}
          >Cancelar</button>
          <button
            className="px-4 py-2 bg-[#cf152d] text-white rounded-lg hover:bg-[#b01223] font-semibold"
            onClick={handleSave}
            disabled={saving || loading}
          >{saving || loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
};

export default FormularioModal; 