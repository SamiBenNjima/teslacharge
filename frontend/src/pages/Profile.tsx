import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const Profile: React.FC = () => {
  const driverId = 'd0000000-0000-0000-0000-000000000001'; // Sami
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const prof = await api.getDriverProfile(driverId);
        setProfile(prof);
        
        // Fetch all vehicles for this driver
        const { data: vData } = await (window as any).supabase
          .from('driver_vehicles')
          .select('*, vehicles(*)')
          .eq('driver_id', driverId);
        
        setVehicles(vData?.map((v: any) => ({ ...v.vehicles, is_selected: v.is_selected })) || []);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
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
      {/* ── Profile Header ── */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#e82127] shadow-2xl p-1 mb-6">
          <img 
             src={profile?.avatar_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop"} 
             alt="Profile" 
             className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h1 className="text-3xl font-black tracking-tighter">{profile?.first_name} {profile?.last_name}</h1>
        <p className="text-gray-500 font-medium tracking-wide mt-1">{profile?.email}</p>
        
        <div className="flex gap-4 mt-6">
           <button className="bg-[#e82127] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#e82127]/20 active:scale-95 transition-all">
             Modifier Profil
           </button>
           <button className="bg-[#1c1c1c] border border-white/5 py-3 px-4 rounded-xl active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[#e82127]">share</span>
           </button>
        </div>
      </div>

      {/* ── Status Grid ── */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex flex-col items-center">
           <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Inscrit le</span>
           <span className="text-sm font-bold">{new Date(profile?.created_at).toLocaleDateString()}</span>
        </div>
        <div className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex flex-col items-center">
           <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Status</span>
           <span className="text-sm font-bold text-[#e82127] flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-[#e82127]"></span> Actif
           </span>
        </div>
      </div>

      {/* ── Vehicles Section ── */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-black tracking-tighter">Mes Véhicules</h3>
          <button className="text-[#e82127] text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Ajouter</button>
        </div>

        <div className="space-y-4">
          {vehicles.map((v: any) => (
            <div key={v.id} className="bg-[#1c1c1c] border border-white/5 rounded-3xl p-6 flex items-center gap-5 relative group overflow-hidden">
              {v.is_selected && (
                <div className="absolute top-0 right-0 bg-[#e82127] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg">
                  Actif
                </div>
              )}
              <div className="w-16 h-16 bg-[#252525] rounded-2xl flex items-center justify-center border border-white/5">
                <span className="material-symbols-outlined text-[#e82127] text-3xl">directions_car</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold tracking-tight">{v.model}</h4>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{v.vin}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{v.license_plate}</p>
                <p className="text-xs text-on-surface-variant/40 font-medium">Tesla Inc.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Settings Menu ── */}
      <div className="space-y-3 mb-12">
        {[
          { icon: 'notifications', label: 'Notifications', color: '#e82127' },
          { icon: 'security', label: 'Sécurité et Confidentialité', color: '#e82127' },
          { icon: 'help', label: "Centre d'Aide", color: '#e82127' },
          { icon: 'logout', label: 'Déconnexion', color: '#e2e2e2', classes: 'opacity-50 mt-4' },
        ].map((item) => (
          <button key={item.label} className={`w-full bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 flex items-center justify-between group active:scale-[0.98] transition-all ${item.classes}`}>
            <div className="flex items-center gap-4">
               <span className="material-symbols-outlined" style={{ color: item.color }}>{item.icon}</span>
               <span className="font-bold tracking-tight text-sm">{item.label}</span>
            </div>
            <span className="material-symbols-outlined text-gray-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Profile;
