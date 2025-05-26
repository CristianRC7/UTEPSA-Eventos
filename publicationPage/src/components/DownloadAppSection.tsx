import React from "react"

const DownloadAppSection: React.FC = () => (
  <section className="bg-white border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Aplicación UTEPSA Eventos</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Descarga la aplicación oficial para participar en eventos, compartir momentos y obtener certificados
          digitales.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eventos en Tiempo Real</h3>
              <p className="text-gray-600">
                Enterate sobre los eventos, actividades importantes de UTEPSA.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Galería Colaborativa</h3>
              <p className="text-gray-600">
                Comparte tus fotos y momentos especiales con toda la comunidad universitaria.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificados Digitales</h3>
              <p className="text-gray-600">
                Descarga automáticamente tus certificados de participación en eventos y actividades académicas de
                UTEPSA.
              </p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Descarga la aplicación</h3>
            <div className="space-y-4">
              <a
                href="#"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block transform hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Descargar en Google Play"
                  className="h-14 mx-auto"
                />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block transform hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Descargar en App Store"
                  className="h-14 mx-auto"
                />
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">Disponible para iOS y Android</p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default DownloadAppSection 