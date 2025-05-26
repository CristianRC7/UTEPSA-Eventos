"use client"

import { useSearchParams } from "react-router-dom"
import ImageCarousel from "../components/ImageCarousel"
import Header from "../components/Header"
import Footer from "../components/Footer"
import EmptyPublication from "../components/EmptyPublication"
import DownloadAppSection from "../components/DownloadAppSection"
import ParticipantInfo from "../components/ParticipantInfo"
import EventDetails from "../components/EventDetails"
import ShareSection from "../components/ShareSection"
import EventDescription from "../components/EventDescription"
import EventHero from "../components/EventHero"
import { BASE_IMG_URL } from "../utils/config"

export default function SharedPublication() {
  const [params] = useSearchParams()
  const images = params.get("images")?.split(",") || []
  const user = params.get("user") || ""
  const event = params.get("event") || ""
  const desc = params.get("desc") || ""

  // Verificar si no hay datos para mostrar
  const hasData = images.length > 0 || user || event || desc

  if (!hasData) {
    return <EmptyPublication />
  }

  // Corrige las URLs de las imágenes
  const getImageUrl = (img: string) => {
    if (!img) return ""
    if (img.startsWith("http")) return img
    return BASE_IMG_URL + img.replace(/^\/+/,'')
  }
  const imageUrls = images.map(getImageUrl)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={() => window.location.href = "/"} />
      <EventHero event={event} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Columna principal - Galería */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería de imágenes */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Galería del Evento
                </h2>
              </div>
              <div className="p-6">
                <ImageCarousel images={imageUrls} />
              </div>
            </section>
            <EventDescription desc={desc} />
          </div>
          {/* Sidebar */}
          <div className="space-y-8">
            <ParticipantInfo user={user} />
            <ShareSection />
            <EventDetails imagesCount={images.length} />
          </div>
        </div>
      </main>
      <DownloadAppSection />
      <Footer />
    </div>
  )
}
