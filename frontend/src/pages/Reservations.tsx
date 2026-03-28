import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const Reservations: React.FC = () => {
  const driverId = 'd0000000-0000-0000-0000-000000000001'; // Sami
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getReservations(driverId);
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
    try {
      await api.cancelReservation(id);
      await loadReservations();
    } catch (err) {
      alert("Erreur lors de l'annulation");
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (activeTab === 'upcoming') {
      return res.status === 'CONFIRMED' || res.status === 'PENDING' || res.status === 'ACTIVE';
    } else {
      return res.status === 'COMPLETED' || res.status === 'CANCELLED' || res.status === 'NO_SHOW';
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e82127]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white pb-24 px-6 pt-12 font-['Inter']">
      <h1 className="text-3xl font-black mb-8 tracking-tighter">Mes Réservations</h1>

      {/* ── Tabs ── */}
      <div className="flex bg-[#1c1c1c] p-1.5 rounded-2xl mb-8 border border-white/5">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'upcoming' ? 'bg-[#252525] text-[#e82127] shadow-lg border border-white/5' : 'text-gray-500'
          }`}
        >
          À Venir
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'past' ? 'bg-[#252525] text-[#e82127] shadow-lg border border-white/5' : 'text-gray-500'
          }`}
        >
          Passées
        </button>
      </div>

      {/* ── List ── */}
      <div className="space-y-6">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((res: any) => (
            <div key={res.id} className="bg-[#1c1c1c] border border-white/5 rounded-3xl overflow-hidden relative group">
               {/* Accent Bar */}
               <div className={`absolute top-0 left-0 w-1.5 h-full ${
                 res.status === 'CONFIRMED' ? 'bg-[#e82127]' : 
                 res.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-700'
               }`} />

               <div className="p-6">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <h3 className="text-xl font-bold tracking-tight mb-1">{res.stations?.name}</h3>
                     <p className="text-xs text-gray-500 font-medium">{res.stations?.address}</p>
                   </div>
                   <span className={`px-4 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-[0.2em] ${
                     res.status === 'CONFIRMED' ? 'bg-[#e82127]/10 text-[#e82127]' :
                     res.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                     'bg-white/5 text-gray-500'
                   }`}>
                     {res.status}
                   </span>
                 </div>

                 <div className="grid grid-cols-2 gap-6 mb-8">
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-[#e82127] text-xl">calendar_today</span>
                     <div>
                       <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Date</p>
                       <p className="text-sm font-bold">{new Date(res.scheduled_start).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-[#e82127] text-xl">schedule</span>
                     <div>
                       <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Heure</p>
                       <p className="text-sm font-bold">{new Date(res.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-[#e82127] text-xl">directions_car</span>
                     <div>
                       <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Car</p>
                       <p className="text-sm font-bold">{res.vehicles?.model}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-[#e82127] text-xl">pin</span>
                     <div>
                       <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Plate</p>
                       <p className="text-sm font-bold">{res.vehicles?.license_plate}</p>
                     </div>
                   </div>
                 </div>

                 {res.status === 'CONFIRMED' && (
                   <div className="flex gap-3">
                     <button className="flex-1 bg-white/5 border border-white/5 py-3.5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-colors active:scale-95">
                       Détails
                     </button>
                     <button 
                       onClick={() => handleCancel(res.id)}
                       className="flex-1 bg-[#e82127] py-3.5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-colors active:scale-95 shadow-lg shadow-[#e82127]/20"
                     >
                       Annuler
                     </button>
                   </div>
                 )}

                 {res.status === 'COMPLETED' && (
                   <button className="w-full bg-white/5 border border-white/5 py-3.5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                     <span className="material-symbols-outlined text-sm">receipt_long</span>
                     Voir Facture
                   </button>
                 )}
               </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-gray-700 text-6xl mb-4">calendar_today</span>
            <p className="text-gray-500 font-medium italic">Aucune réservation pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
