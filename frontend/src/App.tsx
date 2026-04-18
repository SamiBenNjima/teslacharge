import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import MapPage from './pages/Map'
import Reservations from './pages/Reservations'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import { AuthProvider, useAuth } from './components/AuthContext'

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#131313] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e82127]"></div></div>;
  return token ? children : <Navigate to="/auth" />;
};

function AppContent() {
  const { token } = useAuth();
  return (
    <div className="min-h-screen bg-background pb-28">
      <Routes>
        <Route path="/auth" element={token ? <Navigate to="/" /> : <Auth />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
        <Route path="/reservations" element={<PrivateRoute><Reservations /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {token && <BottomNav />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
