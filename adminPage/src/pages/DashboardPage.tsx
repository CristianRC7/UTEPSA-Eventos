import SideBar from '../components/sideBar';
import Cards from '../components/Cards';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import CreateEventModal from '../components/dashboard/CreateEventModal';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (id_evento: number) => {
    navigate(`/dashboard/evento/${id_evento}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <SideBar />
      <div className="w-full max-w-5xl px-4 mt-12 mb-8 rounded-2xl shadow-2xl bg-white/90 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 pb-4">
          <h2 className="text-3xl font-extrabold text-[#cf152d] tracking-tight">Panel de eventos</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#cf152d] text-white rounded-lg shadow hover:bg-[#b01223] transition-colors cursor-pointer font-semibold"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={20} /> Crear evento
          </button>
        </div>
        <Cards onCardClick={handleCardClick} />
        {modalOpen && (
          <CreateEventModal open={modalOpen} onClose={() => setModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 