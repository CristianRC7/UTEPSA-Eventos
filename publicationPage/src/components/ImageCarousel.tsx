"use client"

import React, { useEffect, useRef, useState } from "react"
import ModalImage from "./ModalImage"

interface ImageCarouselProps {
  images: string[]
  altPrefix?: string
  autoPlayInterval?: number // en ms
}

export default function ImageCarousel({ images, altPrefix = "Imagen", autoPlayInterval = 10000 }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (images.length <= 1) return
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, autoPlayInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [images.length, autoPlayInterval])

  const goTo = (idx: number) => setCurrent(idx)
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length)
  const next = () => setCurrent((prev) => (prev + 1) % images.length)

  const handleImageLoad = () => setIsLoading(false)

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}
        <img
          src={images[0] || "/placeholder.svg"}
          alt={altPrefix + " 1"}
          className="w-full h-96 object-cover transition-opacity duration-300 cursor-pointer"
          onLoad={handleImageLoad}
          style={{ opacity: isLoading ? 0 : 1 }}
          onClick={() => setModalOpen(true)}
        />
        <ModalImage
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          src={images[0] || "/placeholder.svg"}
          alt={altPrefix + " 1"}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden group">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Main image */}
      <img
        src={images[current] || "/placeholder.svg"}
        alt={altPrefix + " " + (current + 1)}
        className="w-full h-96 object-cover transition-all duration-500 ease-in-out cursor-pointer"
        onLoad={handleImageLoad}
        style={{ opacity: isLoading ? 0 : 1 }}
        onClick={() => setModalOpen(true)}
      />

      {/* Navigation buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
        aria-label="Anterior"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
        aria-label="Siguiente"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Image counter */}
      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
        {current + 1} / {images.length}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              idx === current ? "bg-white scale-110 shadow-lg" : "bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
      <ModalImage
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        src={images[current] || "/placeholder.svg"}
        alt={altPrefix + " " + (current + 1)}
      />
    </div>
  )
}
