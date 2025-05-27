import SideBar from '../components/sideBar';
import PublicationList from '../components/publication/PublicationList';

const PublicationPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <SideBar />
      <div className="w-full max-w-5xl px-4 mt-8">
        <h2 className="text-2xl font-bold text-[#cf152d] mb-6">Publicaciones</h2>
        <PublicationList />
      </div>
    </div>
  );
};

export default PublicationPage; 