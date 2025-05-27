import React from 'react';

interface Actividad {
  id_actividad: number;
  titulo: string;
  inscritos: number;
  inscripcion_habilitada?: boolean;
}

interface FilterModalProps {
  actividades: Actividad[];
  seleccionadas: number[];
  setSeleccionadas: (ids: number[]) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ actividades, seleccionadas, setSeleccionadas, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative border border-gray-200">
        <h3 className="text-lg font-bold text-[#cf152d] mb-4">Selecciona actividades habilitadas</h3>
        <div className="max-h-60 overflow-y-auto mb-4">
          {actividades.map(a => (
            <label key={a.id_actividad} className="flex items-center gap-2 mb-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={seleccionadas.includes(a.id_actividad)}
                onChange={e => {
                  if (e.target.checked) {
                    setSeleccionadas([...seleccionadas, a.id_actividad]);
                  } else {
                    setSeleccionadas(seleccionadas.filter(id => id !== a.id_actividad));
                  }
                }}
                className="cursor-pointer"
              />
              <span className="cursor-pointer">{a.titulo}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-[#cf152d] text-white rounded hover:bg-[#b01223] cursor-pointer"
            onClick={onClose}
            disabled={seleccionadas.length === 0}
          >
            Aplicar filtro
          </button>
        </div>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-[#cf152d] text-xl cursor-pointer"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default FilterModal; 