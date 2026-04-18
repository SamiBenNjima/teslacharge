import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'SIGNUP' | 'SIGNIN'>('SIGNUP');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [vin, setVin] = useState('');
  const [otp, setOtp] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'SIGNUP') {
        await api.sendSignUpOtp(email, phone, vin, channel);
      } else {
        await api.sendSignInOtp(email, vin, channel);
      }
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (mode === 'SIGNUP') {
        res = await api.verifySignUpOtp({
          email, phone, otp, firstName, lastName, vin
        });
      } else {
        res = await api.verifySignInOtp(email, otp);
      }
      
      // Inject returned token into Auth Context
      if (res && res.accessToken) {
        signIn(res.accessToken);
        navigate('/');
      } else {
        throw new Error("Jeton invalide reçu");
      }
    } catch (err: any) {
      setError(err.message || "OTP invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-white flex flex-col items-center justify-center p-6 font-['Inter'] relative overflow-hidden">
      {/* Background kinetic monolith glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e82127]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e82127]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md z-10 pt-10 pb-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1c1c1c] border border-white/10 mb-6 drop-shadow-[0_0_20px_rgba(232,33,39,0.3)]">
            <span className="material-symbols-outlined text-[#e82127] text-3xl">electric_car</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">TeslaCharge</h1>
          <p className="text-gray-400 font-medium tracking-wide">L'énergie monolithique</p>
        </div>

        {/* Tab Switcher */}
        {step === 'FORM' && (
          <div className="flex bg-[#1c1c1c] p-1.5 rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => { setMode('SIGNUP'); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                mode === 'SIGNUP' ? 'bg-[#252525] text-[#e82127] shadow-lg border border-white/5' : 'text-gray-500 hover:text-white'
              }`}
            >
              Nouveau Pilote
            </button>
            <button
              onClick={() => { setMode('SIGNIN'); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                mode === 'SIGNIN' ? 'bg-[#252525] text-[#e82127] shadow-lg border border-white/5' : 'text-gray-500 hover:text-white'
              }`}
            >
              Connexion
            </button>
          </div>
        )}

        {error && (
          <div className="bg-[#93000a] text-[#ffdad6] p-4 rounded-xl mb-6 text-xs font-bold uppercase tracking-wider flex gap-3 items-center">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {step === 'FORM' && (
          <form onSubmit={handleSendOtp} className="space-y-5 bg-[#1f1f1f] p-8 rounded-3xl border border-white/5 shadow-2xl relative">
            <div>
              <label className="block text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2 focus-within:text-[#e82127] transition-colors">
                Email
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0e0e0e] text-white outline-none rounded-sm px-4 py-3 border-b-2 border-transparent focus:border-[#e82127] transition-all font-medium placeholder:text-gray-600 text-sm"
                placeholder="elon@tesla.com"
              />
            </div>

            {mode === 'SIGNUP' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2 focus-within:text-[#e82127] transition-colors">
                      Prénom
                    </label>
                    <input 
                      type="text" 
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#0e0e0e] text-white outline-none rounded-sm px-4 py-3 border-b-2 border-transparent focus:border-[#e82127] transition-all font-medium placeholder:text-gray-600 text-sm"
                      placeholder="Elon"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2 focus-within:text-[#e82127] transition-colors">
                      Nom
                    </label>
                    <input 
                      type="text" 
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#0e0e0e] text-white outline-none rounded-sm px-4 py-3 border-b-2 border-transparent focus:border-[#e82127] transition-all font-medium placeholder:text-gray-600 text-sm"
                      placeholder="Musk"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2 focus-within:text-[#e82127] transition-colors">
                    Téléphone
                  </label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0e0e0e] text-white outline-none rounded-sm px-4 py-3 border-b-2 border-transparent focus:border-[#e82127] transition-all font-medium placeholder:text-gray-600 text-sm"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2 focus-within:text-[#e82127] transition-colors">
                17-Digit VIN (Châssis)
              </label>
              <input 
                type="text" 
                required
                maxLength={17}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                className="w-full bg-[#0e0e0e] text-white outline-none rounded-sm px-4 py-3 font-mono tracking-widest border-b-2 border-transparent focus:border-[#e82127] transition-all placeholder:text-gray-600 text-sm uppercase"
                placeholder="5YJ3E7EB0MF000000"
              />
            </div>

            <div className="pt-2">
              <label className="block text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mb-3">
                Méthode de Réception OTP
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${channel === 'EMAIL' ? 'border-[#e82127]' : 'border-gray-600 group-hover:border-gray-400'}`}>
                    {channel === 'EMAIL' && <div className="w-2 h-2 rounded-full bg-[#e82127]" />}
                  </div>
                  <input type="radio" value="EMAIL" checked={channel === 'EMAIL'} onChange={(e) => setChannel(e.target.value as 'EMAIL' | 'WHATSAPP')} className="hidden" />
                  <span className={`text-sm font-medium transition-colors ${channel === 'EMAIL' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${channel === 'WHATSAPP' ? 'border-[#e82127]' : 'border-gray-600 group-hover:border-gray-400'}`}>
                    {channel === 'WHATSAPP' && <div className="w-2 h-2 rounded-full bg-[#e82127]" />}
                  </div>
                  <input type="radio" value="WHATSAPP" checked={channel === 'WHATSAPP'} onChange={(e) => setChannel(e.target.value as 'EMAIL' | 'WHATSAPP')} className="hidden" />
                  <span className={`text-sm font-medium transition-colors ${channel === 'WHATSAPP' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>WhatsApp SMS</span>
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !email || !vin || (mode === 'SIGNUP' && (!phone || !firstName || !lastName))}
              className="w-full bg-[#e82127] disabled:opacity-50 mt-4 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-sm transition-transform active:scale-95 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Recevoir le Code OTP'}
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 bg-[#1f1f1f] p-8 rounded-3xl border border-white/5 shadow-2xl relative">
            <div className="text-center mb-6">
              <p className="text-xs text-gray-400">Un code a été envoyé à</p>
              <p className="font-bold text-white mt-1 text-sm">{email}</p>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2 focus-within:text-[#e82127] transition-colors text-center">
                Code de sécurité
              </label>
              <input 
                type="text" 
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-[#0e0e0e] text-white outline-none rounded-sm px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] border-b-2 border-transparent focus:border-[#e82127] transition-all"
                placeholder="000000"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#e82127] disabled:opacity-50 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-sm transition-transform active:scale-95 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Vérifier & Entrer'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('FORM')}
              className="w-full bg-transparent border border-white/10 text-white font-black hover:bg-white/5 uppercase tracking-[0.2em] text-[8px] py-3 rounded-sm transition-all mt-2"
            >
              Modifier Informations
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
