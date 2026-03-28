import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import MapPage from './pages/Map'
import Reservations from './pages/Reservations'
import Profile from './pages/Profile'

function App() {
  return (
    <div className="min-h-screen bg-background pb-28">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default App
