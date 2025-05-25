import { useSearchParams } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import { BASE_IMG_URL } from '../utils/config';

export default function SharedPublication() {
  const [params] = useSearchParams();
  const images = params.get('images')?.split(',') || [];
  const user = params.get('user') || '';
  const event = params.get('event') || '';
  const desc = params.get('desc') || '';

  // Corrige las URLs de las imágenes
  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return BASE_IMG_URL + img.replace(/^\/+/, '');
  };
  const imageUrls = images.map(getImageUrl);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-red-50 to-red-100 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-red-600 p-8 flex flex-col items-center relative">
        <h1 className="text-4xl font-extrabold text-red-700 mb-1 text-center tracking-wide drop-shadow">UTEPSA</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center uppercase tracking-wide">{event}</h2>
        <div className="flex items-center mb-6 w-full">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-red-700">{user.charAt(0).toUpperCase()}</span>
          </div>
          <span className="font-semibold text-lg text-gray-800">{user}</span>
        </div>
        <div className="mb-6 w-full">
          <p className="text-gray-700 whitespace-pre-line text-base">{desc}</p>
        </div>
        <div className="w-full mb-6">
          <ImageCarousel images={imageUrls} />
        </div>
        <div className="text-center mt-2">
          <span className="text-base text-gray-500">Comparte este enlace para mostrar tu publicación</span>
        </div>
      </div>
      {/* Publicidad/descarga app */}
      <div className="w-full max-w-2xl mt-8 flex flex-col items-center bg-white/80 rounded-2xl border border-red-200 p-6 shadow">
        <h3 className="text-xl font-bold text-red-700 mb-2 text-center">¡Descarga la app UTEPSA Eventos!</h3>
        <p className="text-gray-700 mb-4 text-center">Participa, comparte y vive la experiencia de los eventos UTEPSA desde tu móvil.</p>
        <div className="flex flex-row gap-4 justify-center">
          <a href="#" target="_blank" rel="noopener" className="">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-12" />
          </a>
          <a href="#" target="_blank" rel="noopener" className="">
            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-12" />
          </a>
        </div>
      </div>
    </div>
  );
}
