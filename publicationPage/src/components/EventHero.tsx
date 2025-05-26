import React from "react"

interface EventHeroProps {
  event: string
}

const EventHero: React.FC<EventHeroProps> = ({ event }) => (
  <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-red-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-red-600/20 rounded-full border border-red-500/30 mb-6">
          <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span className="text-red-300 text-sm font-medium">UTEPSA Eventos</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{event}</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Compartiendo momentos únicos de nuestra comunidad universitaria
        </p>
      </div>
    </div>
  </section>
)

export default EventHero 