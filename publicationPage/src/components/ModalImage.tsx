import React from "react"

interface ModalImageProps {
  open: boolean
  onClose: () => void
  src: string
  alt?: string
}

const ModalImage: React.FC<ModalImageProps> = ({ open, onClose, src, alt }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-3xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 cursor-pointer z-10"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] max-w-full rounded-xl shadow-2xl"
        />
      </div>
    </div>
  )
}

export default ModalImage 