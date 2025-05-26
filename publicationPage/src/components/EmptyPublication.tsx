import React from "react"
import Header from "./Header"
import Footer from "./Footer"
import DownloadAppSection from "./DownloadAppSection"

const EmptyPublication: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <Header onLogoClick={() => window.location.href = "/"} />
    {/* Hero section vacío */}
    <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-red-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Portal de Eventos</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Bienvenido al sistema de publicaciones de eventos de UTEPSA
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-red-600/20 rounded-full border border-red-500/30">
            <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-300 text-sm font-medium">No se encontró información de evento</span>
          </div>
        </div>
      </div>
    </section>
    {/* Contenido principal vacío */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="bg-white rounded-3xl shadow-lg p-12 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay publicación para mostrar</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Esta página está diseñada para mostrar publicaciones compartidas de eventos de UTEPSA. Para ver una
            publicación específica, necesitas acceder a través de un enlace válido desde la aplicación móvil.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 cursor-pointer" title="Descarga la app para acceder a eventos">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">App Móvil</h3>
              <p className="text-sm text-gray-600">Descarga la app para acceder a eventos</p>
            </div>
            <div className="text-center p-4 cursor-pointer" title="Comparte tus momentos de eventos">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Compartir</h3>
              <p className="text-sm text-gray-600">Comparte tus momentos de eventos</p>
            </div>
            <div className="text-center p-4 cursor-pointer" title="Obtén certificados digitales">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Certificados</h3>
              <p className="text-sm text-gray-600">Obtén certificados digitales</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-2">¿Cómo acceder a una publicación?</h4>
            <div className="text-left space-y-2 text-sm text-gray-600">
              <p>• Descarga la aplicación UTEPSA Eventos</p>
              <p>• Participa en eventos universitarios</p>
              <p>• Comparte tus fotos desde la app</p>
              <p>• Usa el enlace de compartir generado</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <DownloadAppSection />
    <Footer />
  </div>
)

export default EmptyPublication 