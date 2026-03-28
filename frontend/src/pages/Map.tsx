import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const Map: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {['Toutes', 'Supercharger', 'Disponible', 'V3 Only', 'Favoris'].map((filter, i) => (
            <button
              key={filter}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                i === 0 ? 'bg-[#e82127] text-white shadow-lg shadow-[#e82127]/20 scale-105' : 'bg-[#1c1c1c] text-gray-400 border border-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Map Area ── */}
      <div className="flex-1 relative min-h-[300px] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-20 grayscale invert contrast-125">
          <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
            alt="Map background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Mock Markers */}
        <div className="relative z-10 w-full h-full">
           {filteredStations.slice(0, 5).map((s, i) => (
             <div 
               key={s.id}
               className="absolute animate-bounce"
               style={{ 
                 top: `${20 + (i * 15)}%`, 
                 left: `${30 + (i * 10)}%`
               }}
             >
               <div className="bg-[#e82127] p-2 rounded-full shadow-2xl border-2 border-white/20">
                 <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>charging_station</span>
               </div>
             </div>
           ))}
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#131313] shadow-2xl active:scale-95 transition-transform">
            <span className="material-symbols-outlined">my_location</span>
          </button>
          <button className="w-12 h-12 bg-[#e82127] rounded-2xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      {/* ── Station List Area ── */}
      <div className="bg-[#131313] rounded-t-[40px] -mt-10 relative z-20 pt-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="px-6 pb-4 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
             {filteredStations.length} Stations à proximité
          </h3>
          <span className="material-symbols-outlined text-gray-400">expand_more</span>
        </div>

        <div className="px-6 space-y-4 pb-12 overflow-y-auto max-h-[500px] no-scrollbar">
          {filteredStations.length > 0 ? (
            filteredStations.map((station: any) => (
              <div key={station.id} className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex items-center gap-5 hover:bg-[#222] transition-colors group">
                <div className="w-16 h-16 bg-[#252525] rounded-2xl flex flex-col items-center justify-center border border-white/5">
                  <span className="text-xl font-black text-[#e82127]">{station.available_connectors}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">/ {station.total_connectors} DISPO</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold tracking-tight">{station.name}</h4>
                  <p className="text-xs text-gray-500 font-medium mb-2">{station.address}, {station.city}</p>
                  <div className="flex gap-2">
                    {station.amenities && Object.keys(station.amenities).slice(0, 3).map(key => (
                      <span key={key} className="material-symbols-outlined text-[16px] text-gray-600">
                        {key === 'wifi' ? 'wifi' : key === 'cafe' ? 'local_cafe' : 'restaurant'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#e82127] bg-[#e82127]/10 px-2 py-0.5 rounded">V3</span>
                   <button className="w-10 h-10 bg-[#252525] rounded-xl flex items-center justify-center border border-white/5 active:scale-90 transition-transform">
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
    </div>
  );
};

export default Map;
