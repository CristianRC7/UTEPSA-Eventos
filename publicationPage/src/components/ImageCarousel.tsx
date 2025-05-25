import { useEffect, useRef, useState } from 'react';

interface ImageCarouselProps {
  images: string[];
  altPrefix?: string;
  autoPlayInterval?: number; // en ms
}

export default function ImageCarousel({ images, altPrefix = 'Imagen', autoPlayInterval = 10000 }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length, autoPlayInterval]);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const next = () => setCurrent((prev) => (prev + 1) % images.length);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={altPrefix + ' 1'}
        className="w-full h-80 object-cover rounded-xl border border-gray-200 shadow-sm"
      />
    );
  }

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      <img
        src={images[current]}
        alt={altPrefix + ' ' + (current + 1)}
        className="w-full h-80 object-cover rounded-xl border border-gray-200 shadow-sm transition-all duration-500"
      />
      {/* Botón anterior */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-red-100 text-red-700 rounded-full p-2 shadow-md"
        aria-label="Anterior"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
      </button>
      {/* Botón siguiente */}
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-red-100 text-red-700 rounded-full p-2 shadow-md"
        aria-label="Siguiente"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
      </button>
      {/* Indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-3 h-3 rounded-full border-2 ${idx === current ? 'bg-red-700 border-red-700' : 'bg-white border-red-300'} transition-all`}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 