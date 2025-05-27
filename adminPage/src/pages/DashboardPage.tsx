import SideBar from '../components/sideBar';
import Cards from '../components/Cards';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleCardClick = (id_evento: number) => {
    navigate(`/dashboard/evento/${id_evento}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <SideBar />
      <div className="w-full max-w-4xl px-4 mt-8">
        <Cards onCardClick={handleCardClick} />
      </div>
    </div>
  );
};

export default DashboardPage; 