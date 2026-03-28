import React, { useEffect, useState, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMap,
  ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import { api } from '../lib/api';

// Leaflet marker icon fix (default icons often break in React)
import 'leaflet/dist/leaflet.css';

const DARK_TILES_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_TILES_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Custom Bolt Icon for Leaflet
const createBoltIcon = (available: number) => {
  return L.divIcon({
    html: `
      <div class="bg-[#e82127] p-1.5 rounded-full shadow-2xl border-2 border-white/20 transform hover:scale-110 transition-transform flex items-center justify-center">
        <span class="material-symbols-outlined text-white text-[18px]" style="font-variation-settings: 'FILL' 1">
          bolt
        </span>
      </div>
    `,
    className: 'custom-bolt-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Helper component to access the map instance
const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const MapComponent: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.8065, 10.1815]);
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    async function loadStations() {
      try {
        const data = await api.getStations();
        setStations(data);
      } catch (err) {
        console.error('Error loading stations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStations();
  }, []);

  const handleLocalise = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(14);
        },
        () => console.error("Geolocation failed")
      );
    }
  };

  const handleNavigate = (station: any) => {
    // OpenStreetMap Directions
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  const filteredStations = stations.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'Toutes') return matchesSearch;
    if (activeFilter === 'Supercharger') return matchesSearch && s.operator?.toLowerCase() === 'tesla';
    if (activeFilter === 'Disponible') return matchesSearch && s.available_connectors > 0;
    if (activeFilter === 'V3 Only') return matchesSearch && s.connector_type?.includes('V3');
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e82127]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white pb-24 font-['Inter'] flex flex-col">
      {/* ── Search Header ── */}
      <div className="px-6 pt-12 pb-6 bg-[#131313]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Rechercher une station..."
            className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:border-[#e82127]/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            search
          </span>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#e82127]">
            tune
          </span>
        </div>

        {/* ── Quick Filters ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['Toutes', 'Supercharger', 'Disponible', 'V3 Only'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeFilter === filter ? 'bg-[#e82127] text-white shadow-lg shadow-[#e82127]/20 scale-105' : 'bg-[#1c1c1c] text-gray-400 border border-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[500px] relative overflow-hidden bg-[#1a1a1a]">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url={DARK_TILES_URL}
            attribution={DARK_TILES_ATTRIBUTION}
          />
          <MapController center={mapCenter} zoom={mapZoom} />
          {filteredStations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createBoltIcon(station.available_connectors)}
              eventHandlers={{
                click: () => setMapCenter([station.latitude, station.longitude]),
              }}
            />
          ))}
        </MapContainer>

        <div className="absolute bottom-16 right-6 flex flex-col gap-3 z-[1000]">
          <button 
            onClick={handleLocalise}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#131313] shadow-2xl active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">my_location</span>
          </button>
          <button className="w-12 h-12 bg-[#e82127] rounded-2xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      {/* ── Station List Area ── */}
      <div className="bg-[#131313] rounded-t-[40px] -mt-10 relative z-[1001] pt-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="px-6 pb-4 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
             {filteredStations.length} Stations à proximité
          </h3>
          <span className="material-symbols-outlined text-gray-400">expand_more</span>
        </div>

        <div className="px-6 space-y-4 pb-12 overflow-y-auto max-h-[500px] no-scrollbar">
          {filteredStations.length > 0 ? (
            filteredStations.map((station: any) => (
              <div 
                key={station.id} 
                className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex items-center gap-5 hover:bg-[#222] transition-colors group cursor-pointer"
                onClick={() => {
                  setMapCenter([station.latitude, station.longitude]);
                  setMapZoom(15);
                }}
              >
                <div className="w-16 h-16 bg-[#252525] rounded-2xl flex flex-col items-center justify-center border border-white/5">
                  <span className="text-xl font-black text-[#e82127]">{station.available_connectors}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">/ {station.total_connectors} DISPO</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold tracking-tight">{station.name}</h4>
                  <p className="text-xs text-gray-500 font-medium mb-2">{station.city}</p>
                  <div className="flex gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#e82127] bg-[#e82127]/10 px-2 py-0.5 rounded">
                       {station.operator === 'Tesla' ? 'Supercharger' : 'Standard'}
                     </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       handleNavigate(station);
                     }}
                     className="w-10 h-10 bg-[#252525] rounded-xl flex items-center justify-center border border-white/5 active:scale-90 transition-transform"
                   >
                     <span className="material-symbols-outlined text-sm">navigation</span>
                   </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10 italic">Aucune station trouvée.</p>
          )}
        </div>
      </div>
      
      <style>{`
        .leaflet-container {
          background: #111 !important;
        }
        .custom-bolt-marker {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
