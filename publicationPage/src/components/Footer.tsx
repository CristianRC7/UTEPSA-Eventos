import React from "react"

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">U</span>
          </div>
          <span className="text-lg font-semibold">UTEPSA</span>
        </div>
        <p className="text-gray-400 text-sm">
          © 2024 Universidad Tecnológica Privada de Santa Cruz. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
)

export default Footer 