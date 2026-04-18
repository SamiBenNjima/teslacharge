import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../components/AuthContext';

const Home: React.FC = () => {
  const { driver } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [nearbyStations, setNearbyStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Get user's reservations
        const resData = await api.getMyReservations();
        setReservations(resData);

        // Get nearby stations (using Paris coordinates as default)
        const stationsData = await api.getNearbyStations(48.8566, 2.3522, 10, 5);
        setNearbyStations(stationsData);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e82127]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white pb-24 px-6 pt-12 font-['Inter']">
      {/* Header */}
      <nav className="flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Bonjour, {driver?.first_name || 'Driver'}</h1>
          <p className="text-gray-400 mt-1">Votre Tesla est prête.</p>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#e82127]">
          <img 
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-[#1c1c1c] rounded-2xl p-5 border border-white/5 hover:border-[#e82127]/30 transition-colors group">
          <div className="bg-[#252525] w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#e82127]">event_available</span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Réservations</p>
          <p className="text-xl font-bold">{reservations.length}</p>
        </div>
        <div className="bg-[#1c1c1c] rounded-2xl p-5 border border-white/5 hover:border-[#e82127]/30 transition-colors group">
          <div className="bg-[#252525] w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#e82127]">charging_station</span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Stations</p>
          <p className="text-xl font-bold">{nearbyStations.length}</p>
        </div>
        <div className="bg-[#1c1c1c] rounded-2xl p-5 border border-white/5 hover:border-[#e82127]/30 transition-colors group">
          <div className="bg-[#252525] w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#e82127]">electric_car</span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Véhicules</p>
          <p className="text-xl font-bold">1</p>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-black tracking-tighter">Mes Réservations</h3>
          <button className="text-[#e82127] text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Voir Tout</button>
        </div>

        <div className="space-y-4">
          {reservations.length > 0 ? (
            reservations.slice(0, 3).map((reservation: any) => (
              <div key={reservation.id} className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex items-center gap-5 hover:bg-[#222] transition-colors">
                <div className="w-14 h-14 bg-[#252525] rounded-2xl flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#e82127] text-3xl">event</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold tracking-tight">{reservation.stationName}</h4>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(reservation.scheduledStart).toLocaleDateString('fr-FR')} • 
                    {new Date(reservation.scheduledStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    reservation.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                    reservation.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#1c1c1c] border border-dashed border-white/10 rounded-3xl p-10 text-center">
              <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">event_note</span>
              <p className="text-gray-500 font-medium italic">Aucune réservation pour le moment.</p>
              <p className="text-gray-600 text-sm mt-2">Réservez une borne de recharge pour commencer.</p>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Stations */}
      <div className="mb-10">
        <h3 className="text-2xl font-black tracking-tighter mb-8">Stations à Proximité</h3>
        <div className="space-y-4">
          {nearbyStations.length > 0 ? (
            nearbyStations.map((station: any) => (
              <div key={station.id} className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 hover:bg-[#222] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold mb-1 tracking-tight">{station.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{station.address}, {station.city}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-bold">{station.distanceKm?.toFixed(1)} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-[#e82127]/10 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#e82127] animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#e82127]">
                      {station.availableConnectors}/{station.totalConnectors} Libre{station.availableConnectors !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-bold">Tesla Supercharger</span>
                </div>
                <button className="w-full bg-[#e82127] py-3.5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-colors active:scale-95">
                  Réserver Maintenant
                </button>
              </div>
            ))
          ) : (
            <div className="bg-[#1c1c1c] border border-dashed border-white/10 rounded-3xl p-10 text-center">
              <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">location_off</span>
              <p className="text-gray-500 font-medium italic">Aucune station trouvée à proximité.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
