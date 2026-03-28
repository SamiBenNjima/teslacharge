import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const Home: React.FC = () => {
  const driverId = 'd0000000-0000-0000-0000-000000000001'; // Sami (Mocked Auth)
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, st, sessions] = await Promise.all([
          api.getDriverProfile(driverId),
          api.getDriverStats(driverId),
          api.getRecentSessions(driverId, 2)
        ]);
        setProfile(prof);
        setStats(st);
        setRecentSessions(sessions);
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
          <h1 className="text-3xl font-bold tracking-tight">Bonjour, {profile?.first_name || 'Sami'}</h1>
          <p className="text-gray-400 mt-1">Votre Tesla est prête.</p>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#e82127]">
          <img 
            src={profile?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </nav>

      {/* Vehicle Card */}
      <div className="bg-gradient-to-br from-[#1c1c1c] to-[#131313] rounded-3xl p-8 mb-8 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-[#e82127]/10 text-[#e82127] text-xs font-black px-4 py-1.5 rounded-sm uppercase tracking-[0.2em] border border-[#e82127]/20">
                Connecté
              </span>
              <span className="text-gray-500 font-mono tracking-widest text-sm uppercase">{profile?.active_vehicle?.license_plate || '230 TN 1234'}</span>
            </div>
            
            <h2 className="text-4xl font-extrabold tracking-tighter mb-2">{profile?.active_vehicle?.model || 'Model 3 Performance'}</h2>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-[5rem] font-black leading-none tracking-tighter">84</span>
              <span className="text-2xl font-bold text-gray-500 mb-4">%</span>
              <span className="material-symbols-outlined text-[#e82127] mb-5 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                battery_charging_80
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Estimation</p>
                <p className="text-xl font-bold">382 <span className="text-sm font-medium text-gray-500">km</span></p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 text-right">
                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Température</p>
                <p className="text-xl font-bold text-[#e82127]">21° <span className="text-sm font-medium text-gray-500">C</span></p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center pointer-events-none">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3NS6FsxKAd8cXKTqMcRzlzrfY8ftwKVi6qTxqfgi3us6X2mD8lPayD-EYtUJ_tNgp2Li43Awq46g456nF5357az3RNUSA5QENNbJJfe12JRqpwjgZFTQddHDPpuW_dyQXD2NIo503lt8wHyw6Y4zTEyMm_8LrYgyN0afnOYB3eHbuzDV1wa25ByXF78rauDvF5vBtM61wx93BmoU-zVmijwxyLZtN-8pFIfx2i0j1VbzSGXQpbIjpK4L_zzA0HrwF1cyx_hbj-fY" 
              alt="Tesla side profile"
              className="w-full transform scale-125 translate-x-12"
            />
          </div>
        </div>
        
        {/* Background Accent */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#e82127]/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-[#1c1c1c] rounded-2xl p-5 border border-white/5 hover:border-[#e82127]/30 transition-colors group">
          <div className="bg-[#252525] w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#e82127]">bolt</span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Sessions</p>
          <p className="text-xl font-bold">{stats?.sessionCount || 0}</p>
        </div>
        <div className="bg-[#1c1c1c] rounded-2xl p-5 border border-white/5 hover:border-[#e82127]/30 transition-colors group">
          <div className="bg-[#252525] w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#e82127]">energy_savings_leaf</span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Énergie</p>
          <p className="text-xl font-bold">{stats?.totalEnergy || 0} <span className="text-xs font-medium text-gray-500">kWh</span></p>
        </div>
        <div className="bg-[#1c1c1c] rounded-2xl p-5 border border-white/5 hover:border-[#e82127]/30 transition-colors group">
          <div className="bg-[#252525] w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#e82127]">eco</span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Durabilité</p>
          <p className="text-xl font-bold">{stats?.co2Saved || 0} <span className="text-xs font-medium text-gray-500">kg</span></p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-black tracking-tighter">Dernières Sessions</h3>
          <button className="text-[#e82127] text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Voir Historique</button>
        </div>

        <div className="space-y-4">
          {recentSessions.length > 0 ? (
            recentSessions.map((session: any) => (
              <div key={session.id} className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex items-center gap-5 hover:bg-[#222] transition-colors">
                <div className="w-14 h-14 bg-[#252525] rounded-2xl flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#e82127] text-3xl">charging_station</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold tracking-tight">{session.charging_connectors?.stations?.name || 'Inconnu'}</h4>
                  <p className="text-xs text-on-surface-variant/60 font-medium">Session du {new Date(session.started_at).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#e82127]">+{session.energy_kwh}<span className="text-sm ml-1 font-bold">kWh</span></p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{session.cost_eur} €</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#1c1c1c] border border-dashed border-white/10 rounded-3xl p-10 text-center">
              <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">history</span>
              <p className="text-gray-500 font-medium italic">Aucune session enregistrée pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Favorite Stations */}
      <div className="mb-10">
        <h3 className="text-2xl font-black tracking-tighter mb-8">Stations de Confiance</h3>
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
          <div className="min-w-[280px] bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl group">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold mb-1 tracking-tight">Tunis Centre</h4>
                  <p className="text-xs text-gray-500 font-medium">Avenue Habib Bourguiba</p>
                </div>
                <span className="material-symbols-outlined text-[#e82127]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
             </div>
             <div className="flex items-center gap-3 mb-8">
               <div className="flex items-center gap-2 bg-[#e82127]/10 px-3 py-1.5 rounded-full">
                 <span className="w-2 h-2 rounded-full bg-[#e82127] animate-pulse"></span>
                 <span className="text-[10px] font-black uppercase tracking-wider text-[#e82127]">4 / 6 Libres</span>
               </div>
               <span className="text-xs text-gray-500 font-bold">V3 · 250kW</span>
             </div>
             <button className="w-full bg-[#e82127] py-3.5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-colors active:scale-95">
               Réserver
             </button>
          </div>

          <div className="min-w-[280px] bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl group opacity-60">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold mb-1 tracking-tight">La Marsa Beach</h4>
                  <p className="text-xs text-gray-500 font-medium">Rue du Lac</p>
                </div>
                <span className="material-symbols-outlined text-[#e82127]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
             </div>
             <div className="flex items-center gap-3 mb-8">
               <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                 <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                 <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500">1 / 4 Libre</span>
               </div>
               <span className="text-xs text-gray-500 font-bold">V2 · 150kW</span>
             </div>
             <button className="w-full border border-white/10 py-3.5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/5 transition-colors active:scale-95">
               Réserver
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
