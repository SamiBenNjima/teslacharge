import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { api } from '../lib/api';

// Leaflet marker icon fix (default icons often break in React)
import 'leaflet/dist/leaflet.css';

const DARK_TILES_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_TILES_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Custom Bolt Icon for Leaflet
const createBoltIcon = () => {
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);

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
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setMapCenter(loc);
          setUserLocation(loc);
          setMapZoom(14);
        },
        () => console.error("Geolocation failed")
      );
    }
  };

  const handleNavigate = async (station: any) => {
    // OpenStreetMap Directions via OSRM Polyline
    const startLoc = userLocation || mapCenter;
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLoc[1]},${startLoc[0]};${station.longitude},${station.latitude}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
        setRoutePolyline(coords);
        setSelectedStation(station);
        setIsListExpanded(true);
        setMapCenter([station.latitude, station.longitude]);
      }
    } catch (err) {
      console.error("Routing error", err);
    }
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
    <div className="h-screen w-screen bg-[#131313] text-white font-['Inter'] relative overflow-hidden">
      {/* ── Search Header ── */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-12 pb-6 bg-gradient-to-b from-[#131313] to-transparent z-[1002]">
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
          <span 
            className={`material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${showFilters ? 'text-white bg-[#e82127] rounded-lg p-1 scale-110' : 'text-[#e82127]'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            tune
          </span>
        </div>

        {/* ── Quick Filters ── */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
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
        )}
      </div>

      <div className="absolute inset-0 z-0 bg-[#1a1a1a]">
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
              icon={createBoltIcon()}
              eventHandlers={{
                click: () => {
                  setMapCenter([station.latitude, station.longitude]);
                  setSelectedStation(station);
                  setIsListExpanded(true);
                  setRoutePolyline([]); // Clear route if just clicking marker
                },
              }}
            />
          ))}
          {routePolyline.length > 0 && (
            <Polyline positions={routePolyline} color="#e82127" weight={4} opacity={0.8} />
          )}
        </MapContainer>

        <div className="absolute bottom-16 right-6 flex flex-col gap-3 z-[1000]">
          <button 
            onClick={handleLocalise}
            className="w-12 h-12 bg-[#1c1c1c] border border-white/5 rounded-2xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </div>

      {/* ── Station List Area / Selected Station Overlay ── */}
      <div className="fixed bottom-[112px] left-4 right-4 z-[1001] bg-[#131313] rounded-[2rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Sheet Drag Handle */}
        <div className="w-full flex justify-center py-4 cursor-pointer" onClick={() => setIsListExpanded(!isListExpanded)}>
          <div className="w-12 h-1 bg-[#353535] rounded-full opacity-50"></div>
        </div>

        {selectedStation ? (
          <div className={`px-6 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${isListExpanded ? 'max-h-[50vh] pb-8 opacity-100' : 'max-h-0 opacity-0 pb-0'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.6875rem] font-medium tracking-[0.05em] uppercase text-[#ffb4ac] py-1 px-2 bg-[#e82127]/10 rounded-sm">OPEN</span>
                  <div className="flex items-center gap-1 text-[#e7bdb8]">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#e2e2e2]">{selectedStation.name}</h2>
              </div>
              <button 
                className="p-3 bg-[#1f1f1f] rounded-full hover:bg-[#353535] transition-colors active:scale-90 duration-150"
                onClick={() => { setSelectedStation(null); setRoutePolyline([]); setIsListExpanded(false); }}
              >
                <span className="material-symbols-outlined text-[#ffb4ac]">close</span>
              </button>
            </div>

            {/* Photo Strip */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-8 hide-scrollbar">
              <div className="min-w-[280px] h-48 rounded-xl overflow-hidden bg-[#1f1f1f]">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvRvncnXLSWH3a_a6liYaiTL3lOaHALilQ9cwIL3TZ8FqLLWca3HAeCwup9dL_GBBT7pGxxVm2XHuLCWET9uxUYLDln07tECz7_HQKq6bKQjsI9feKtIM5Kj0Uq1Hne_gKG6K0mvXRv7hSsuLxdISQNpgrkIUp1JUYA47LedMwKZjdfgxUWUYv5DARF1IgVv4HW3Au9ojvFsbTyjFyZ1ew8bLFFKJFeZRar5EVN3-mfTFh0Rm9OtDdwONWuQlh5bYB0IuiPstRAkU" alt="Station" />
              </div>
              <div className="min-w-[200px] h-48 rounded-xl overflow-hidden bg-[#1f1f1f]">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn0gsz9TS3ZZ8Mtrr64t2eFS0a-LOy-pAKQjeup2rzT_c7zpE58SwUmILzlp9VBf8TaGGTuhFYPiHjd8A01gmjRKxLO5xFIZC3zYwm18xcK-LeTLVvtYzKhHBf1SgsTkC_DXpSmKWo8H-e4A3oUNhZaAmxgEuvB1Qpy6SoJWsCc_EVt2Jn-KOXfNocFjjV4c2J_x1Uia6bQHajFqxDZKIUkCfSDU1_0s9zkEylNxXu-f2aud7dHz52vk-AkKZ6hhup8jlAaq0DMPg" alt="Connector" />
              </div>
            </div>

            {/* Amenities Bento Grid */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              <div className="bg-[#1b1b1b] p-4 rounded-xl flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb4ac]">wifi</span>
                <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-[#e7bdb8]">WiFi</span>
              </div>
              <div className="bg-[#1b1b1b] p-4 rounded-xl flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb4ac]">wc</span>
                <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-[#e7bdb8]">Restroom</span>
              </div>
              <div className="bg-[#1b1b1b] p-4 rounded-xl flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb4ac]">coffee</span>
                <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-[#e7bdb8]">Café</span>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="mb-10">
              <h3 className="text-sm font-bold tracking-[0.1em] uppercase text-[#e7bdb8] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#e82127] rounded-full"></span>
                Connector Availability
              </h3>
              <div className="space-y-4">
                {[...Array(selectedStation.total_connectors)].map((_, i) => (
                  <div key={i} className={`bg-[${i < selectedStation.available_connectors ? '#1f1f1f' : '#1b1b1b'}] p-6 rounded-sm flex items-center justify-between ${i >= selectedStation.available_connectors ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[0.6875rem] font-medium text-[#e7bdb8] uppercase tracking-widest mb-1">ID</span>
                        <span className="font-mono text-lg font-bold">CONN-0{i+1}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.6875rem] font-medium text-[#e7bdb8] uppercase tracking-widest mb-1">TYPE</span>
                        <span className="font-bold">{selectedStation.connector_type || 'NACS'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.6875rem] font-medium text-[#e7bdb8] uppercase tracking-widest mb-1">MAX</span>
                        <span className="font-bold">250kW</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[0.6875rem] font-medium uppercase tracking-widest mb-1 ${i < selectedStation.available_connectors ? 'text-[#ffb4ac]' : 'text-[#e7bdb8]'}`}>STATUS</span>
                      <span className={`text-sm font-bold ${i < selectedStation.available_connectors ? 'text-[#ffb4ac]' : 'text-[#e7bdb8]'}`}>{i < selectedStation.available_connectors ? 'AVAILABLE' : 'OCCUPIED'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-[#e82127] h-16 flex items-center justify-center gap-3 text-[#140000] font-bold tracking-widest uppercase rounded-sm shadow-[0_20px_40px_rgba(232,33,39,0.2)] active:scale-95 transition-transform">
              SCHEDULE RESERVATION
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pb-4 flex justify-between items-center cursor-pointer" onClick={() => setIsListExpanded(!isListExpanded)}>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
                {filteredStations.length} Stations à proximité
              </h3>
              <span className="material-symbols-outlined text-gray-400">{isListExpanded ? 'expand_more' : 'expand_less'}</span>
            </div>

            <div className={`px-6 space-y-4 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${isListExpanded ? 'max-h-[50vh] pb-8 opacity-100' : 'max-h-0 opacity-0 pb-0'}`}>
              {filteredStations.length > 0 ? (
                filteredStations.map((station: any) => (
                  <div 
                    key={station.id} 
                    className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex items-center gap-5 hover:bg-[#222] transition-colors group cursor-pointer"
                    onClick={() => {
                      setMapCenter([station.latitude, station.longitude]);
                      setSelectedStation(station);
                      setIsListExpanded(true);
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
          </>
        )}
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
