import React from "react"

interface EventDetailsProps {
  imagesCount: number
}

const EventDetails: React.FC<EventDetailsProps> = ({ imagesCount }) => (
  <section className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-6">Detalles</h3>
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">Fotos compartidas</span>
        <span className="font-semibold text-gray-900">{imagesCount}</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">Participante</span>
        <span className="font-semibold text-gray-900">Verificado</span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-gray-600">Publicación</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Pública
        </span>
      </div>
    </div>
  </section>
)

export default EventDetails 