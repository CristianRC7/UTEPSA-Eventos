import React from "react"

interface HeaderProps {
  onLogoClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => (
  <header className="bg-white shadow-sm border-b-4 border-red-600">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer"
            onClick={onLogoClick}
            title="Ir al inicio"
          >
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <div
            className="cursor-pointer"
            onClick={onLogoClick}
            title="Ir al inicio"
          >
            <h1 className="text-2xl font-bold text-gray-900">UTEPSA</h1>
            <p className="text-sm text-gray-600">Universidad Tecnológica Privada de Santa Cruz</p>
          </div>
        </div>
      </div>
    </div>
  </header>
)

export default Header 