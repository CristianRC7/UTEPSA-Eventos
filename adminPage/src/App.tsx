import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createContext, useContext, useState, type ReactNode } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventPanelPage from './pages/EventPanelPage';
import UsersPage from './pages/Users';
import PublicationPage from './pages/PublicationPage';
import CronogramaPage from './pages/CronogramaPage';
import SpeakerPage from './pages/Speaker';

// Contexto de autenticación
interface AuthContextType {
  user: any;
  login: (user: any) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const login = (user: any) => setUser(user);
  const logout = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()!;
  const location = useLocation();
  if (!user || user.rol !== 'administrador') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/evento/:id" element={
            <ProtectedRoute>
              <EventPanelPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/evento/:id/cronograma" element={
            <ProtectedRoute>
              <CronogramaPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/usuarios" element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/publicaciones" element={
            <ProtectedRoute>
              <PublicationPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/expositores" element={
            <ProtectedRoute>
              <SpeakerPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
