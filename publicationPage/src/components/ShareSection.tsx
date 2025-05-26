import React from "react"

const ShareSection: React.FC = () => (
  <section className="bg-gradient-to-br from-gray-900 to-red-900 rounded-2xl shadow-lg p-6 text-white">
    <h3 className="text-lg font-bold mb-4 flex items-center">
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
        />
      </svg>
      Compartir Publicación
    </h3>
    <p className="text-gray-300 mb-4">
      Comparte este enlace para mostrar esta publicación a otros miembros de la comunidad.
    </p>
    <div
      className="flex items-center space-x-2 bg-white/10 rounded-lg p-3 cursor-pointer"
      title="Copiar enlace"
      onClick={() => navigator.clipboard.writeText(window.location.href)}
    >
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      <span className="text-sm text-gray-300">Enlace copiable</span>
    </div>
  </section>
)

export default ShareSection 