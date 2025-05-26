import React from "react"

interface ParticipantInfoProps {
  user: string
}

const ParticipantInfo: React.FC<ParticipantInfoProps> = ({ user }) => (
  <section className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-6">Participante</h3>
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{user.charAt(0).toUpperCase()}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-lg">{user}</h4>
        <p className="text-gray-600">Miembro de la comunidad UTEPSA</p>
      </div>
    </div>
  </section>
)

export default ParticipantInfo 