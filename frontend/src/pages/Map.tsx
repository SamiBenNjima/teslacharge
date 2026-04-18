import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const Map: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<any>(null);

  useEffect(() => {
    async function loadStations() {
      try {
        // Get nearby stations (using Paris coordinates as default)
        const data = await api.getNearbyStations(48.8566, 2.3522, 50, 20);
        setStations(data);
      } catch (err) {
        console.error('Error loading stations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStations();
  }, []);

  const handleStationClick = (station: any) => {
    setSelectedStation(station);
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Stations de Recharge</h1>
        <p className="text-gray-400">Trouvez et réservez une borne près de chez vous</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher une station..."
          className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#e82127]/50 transition-colors"
        />
      </div>

      {/* Map Placeholder */}
      <div className="bg-[#1c1c1c] border border-white/5 rounded-3xl h-96 mb-8 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">map</span>
          <p className="text-gray-500">Carte interactive à implémenter</p>
          <p className="text-gray-600 text-sm mt-2">Utilisera Leaflet pour l'affichage</p>
        </div>
      </div>

      {/* Stations List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight mb-6">Stations à Proximité</h3>

        {stations.length > 0 ? (
          stations.map((station: any) => (
            <div
              key={station.id}
              className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 hover:bg-[#222] transition-colors cursor-pointer"
              onClick={() => handleStationClick(station)}
            >
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

      {/* Station Details Modal */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-[#131313] rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{selectedStation.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">{selectedStation.address}, {selectedStation.city}</p>
                </div>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="p-2 bg-[#1c1c1c] rounded-full hover:bg-[#252525] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-[#1c1c1c] rounded-2xl">
                  <span className="text-gray-400">Connecteurs disponibles</span>
                  <span className="font-bold text-[#e82127]">{selectedStation.availableConnectors}/{selectedStation.totalConnectors}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#1c1c1c] rounded-2xl">
                  <span className="text-gray-400">Distance</span>
                  <span className="font-bold">{selectedStation.distanceKm?.toFixed(1)} km</span>
                </div>
              </div>

              <button className="w-full bg-[#e82127] py-4 text-white font-bold uppercase tracking-wider rounded-2xl hover:bg-red-700 transition-colors">
                Réserver une Borne
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
