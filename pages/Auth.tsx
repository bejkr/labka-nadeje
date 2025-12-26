import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, User, Lock, Mail, MapPin, ArrowLeft, CheckCircle, 
  RefreshCcw, MailCheck, Heart, Dog, LayoutDashboard, 
  TrendingUp, Gift, Zap, Star, Users,
  Eye, EyeOff, AlertCircle, Quote
} from 'lucide-react';
import { LogoIcon } from '../components/Logo';
import { supabase } from '../services/supabaseClient';

type AuthMode = 'login' | 'register' | 'forgot' | 'update-password' | 'verification-pending';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, registerUser, registerShelter, resetPassword, updatePassword, isRecoveringPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'user' | 'shelter'>('user');

  // Detect mode and role from URL or Navigation State
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'update-password') {
      setMode('update-password');
      const hasTokenInHash = window.location.hash.includes('access_token=') || window.location.hash.includes('code=');
      if (!hasTokenInHash && !isRecoveringPassword) {
          console.warn("Update password mode without active token in URL or context.");
      }
    }

    if (location.state?.role === 'shelter') {
        setRole('shelter');
        setMode('register');
    }
  }, [searchParams, location.state, isRecoveringPassword]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [locationField, setLocationField] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if ((mode === 'register' || mode === 'update-password') && password !== confirmPassword) {
        setError('Heslá sa nezhodujú.');
        setLoading(false);
        return;
    }

    try {
      if (mode === 'login') {
        const successResult = await login(email, password);
        if (successResult) { navigate('/'); } 
        else { setError('Nesprávny email alebo heslo.'); }
      } else if (mode === 'register') {
        let result: any;
        if (role === 'user') { result = await registerUser(name, email, password); } 
        else { result = await registerShelter(name, locationField, email, password); }
        if (result?.verificationRequired) { setMode('verification-pending'); } 
        else { navigate(role === 'user' ? '/profile' : '/shelter'); }
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccess('Odkaz na resetovanie hesla bol odoslaný. Skontrolujte si e-mail.');
      } else if (mode === 'update-password') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
           throw new Error("Váš overovací odkaz už nie je platný alebo bol použitý. Prosím, požiadajte o nový e-mail na reset hesla.");
        }
        await updatePassword(password);
        setSuccess('Vaše heslo bolo úspešne zmenené. Teraz sa môžete prihlásiť novým heslom.');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
          navigate('/auth', { replace: true });
        }, 3000);
      }
    } catch (err: any) {
      if (err.message?.includes('invalid or has expired') || err.status === 403) {
          setError("Tento odkaz na zmenu hesla už vypršal alebo bol použitý. Nechajte si prosím zaslať nový.");
      } else {
          setError(err.message || 'Nastala chyba. Skúste to prosím znova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const MessageCircle = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
  );

  const UserBenefits = () => (
    <div className="bg-brand-600 p-8 md:p-12 text-white flex flex-col justify-between h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10">
            <div className="mb-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-xl">
                    <Heart size={32} fill="white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">Nájdite svoju <br/> Labka Zhodu</h2>
                <p className="text-brand-100 text-lg leading-relaxed opacity-90">Pomáhame spájať správnych ľudí so správnymi zvieratkami pomocou AI.</p>
            </div>
            <div className="space-y-8 mb-12">
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm"><Zap size={24} className="text-yellow-300" fill="currentColor" /></div>
                    <div><h4 className="font-bold text-lg">AI Analýza zhody</h4><p className="text-brand-100/70 text-sm">Zistite, ktoré zvieratko sa najviac hodí k vášmu životnému štýlu.</p></div>
                </div>
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm"><Star size={24} className="text-brand-200" /></div>
                    <div><h4 className="font-bold text-lg">Ukladanie obľúbených</h4><p className="text-brand-100/70 text-sm">Majte prehľad o zvieratkách, ktoré vás chytili za srdce.</p></div>
                </div>
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm"><MessageCircle size={24} className="text-brand-200" /></div>
                    <div><h4 className="font-bold text-lg">Priama komunikácia</h4><p className="text-brand-100/70 text-sm">Pýtajte sa útulkov priamo cez náš zabezpečený chat.</p></div>
                </div>
            </div>
        </div>
        
        <div className="relative z-10 animate-in fade-in duration-1000 delay-300">
            <div className="bg-brand-700/50 p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                <Quote className="absolute -right-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform" size={80} />
                <p className="text-sm italic text-brand-50 leading-relaxed mb-4 relative z-10">"Vďaka Labka zhode sme našli Baka. Je to náš najlepší priateľ."</p>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-[10px] font-black">MK</div>
                    <div><p className="text-xs font-black">Martin K.</p><p className="text-[10px] text-brand-200 uppercase">Adoptér</p></div>
                </div>
            </div>
        </div>
    </div>
  );

  const ShelterBenefits = () => (
    <div className="bg-indigo-600 p-8 md:p-12 text-white flex flex-col justify-between h-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        
        <div className="relative z-10">
            <div className="mb-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-xl">
                    <Building2 size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">Moderný domov <br/> pre váš útulok</h2>
                <p className="text-indigo-100 text-lg leading-relaxed opacity-90">Získajte prístup k nástrojom, ktoré vám ušetria hodiny administrácie.</p>
            </div>
            <div className="space-y-8 mb-12">
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm"><LayoutDashboard size={24} className="text-indigo-200" /></div>
                    <div><h4 className="font-bold text-lg">Kompletný Dashboard</h4><p className="text-indigo-100/70 text-sm">Jednoduchá správa zvierat, inzerátov a statusov adopcie.</p></div>
                </div>
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm"><Users size={24} className="text-indigo-200" /></div>
                    <div><h4 className="font-bold text-lg">Správa dobrovoľníkov</h4><p className="text-indigo-100/70 text-sm">Majte prehľad o svojom tíme a rozdelení úloh.</p></div>
                </div>
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm"><TrendingUp size={24} className="text-indigo-200" /></div>
                    <div><h4 className="font-bold text-lg">Pokročilá analytika</h4><p className="text-indigo-100/70 text-sm">Sledujte videnia inzerátov a záujem o vašich zverencov.</p></div>
                </div>
            </div>
        </div>

        <div className="relative z-10 animate-in fade-in duration-1000 delay-300">
            <div className="bg-indigo-700/50 p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-indigo-700/70 transition-all">
                <Quote className="absolute -right-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform" size={80} />
                <p className="text-sm italic text-indigo-50 leading-relaxed mb-4 relative z-10">"Systém nám šetrí čas, ktorý môžeme venovať priamo zvieratám."</p>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-[10px] font-black">JS</div>
                    <div><p className="text-xs font-black">Jana S.</p><p className="text-[10px] text-indigo-200 uppercase">Útulok Labka</p></div>
                </div>
            </div>
        </div>
    </div>
  );

  const showBenefits = mode === 'register';

  if (mode === 'verification-pending') {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 p-10 text-center animate-in zoom-in-95">
                  <div className="mx-auto w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mb-6 text-brand-600"><MailCheck size={48} /></div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Skontrolujte e-mail</h1>
                  <p className="text-gray-600 mb-8 leading-relaxed">Odoslali sme potvrdzujúci odkaz na <strong className="text-gray-900">{email}</strong>.</p>
                  <button onClick={() => setMode('login')} className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-700 transition">Späť na prihlásenie</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12 font-sans">
      <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full transition-all duration-500 overflow-hidden border border-gray-100 ${showBenefits ? 'max-w-5xl' : 'max-w-lg'}`}>
        <div className="flex flex-col lg:flex-row min-h-[700px]">
            {/* LEFT SIDE PANEL - INFO (Only on Registration) */}
            {showBenefits && (
              <div className="lg:w-1/2 order-2 lg:order-1 border-r border-gray-100 hidden md:block">
                  {role === 'shelter' ? <ShelterBenefits /> : <UserBenefits />}
              </div>
            )}

            {/* RIGHT SIDE - FORMS */}
            <div className={`${showBenefits ? 'lg:w-1/2' : 'w-full'} order-1 lg:order-2 bg-white flex flex-col`}>
                <div className={`p-8 pb-12 text-center transition-colors duration-500 ${
                  mode === 'login' || (mode === 'register' && role === 'user') ? 'bg-brand-600' : (mode === 'register' && role === 'shelter' ? 'bg-indigo-600' : 'bg-gray-800')
                } text-white relative`}>
                   <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner cursor-pointer" onClick={() => navigate('/')}>
                        <LogoIcon className="h-10 w-10 text-white" />
                     </div>
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${mode === 'register' ? 'bg-green-400 animate-pulse' : 'bg-white'}`}></div>
                        {mode === 'login' ? 'Prihlásenie' : mode === 'register' ? 'Registrácia' : mode === 'forgot' ? 'Obnova' : 'Nové heslo'}
                     </div>
                     <h1 className="text-3xl font-extrabold tracking-tight">
                       {mode === 'login' ? 'Vitajte späť' : mode === 'register' ? (role === 'user' ? 'Pridajte sa' : 'Registrácia útulku') : mode === 'forgot' ? 'Obnova hesla' : 'Zmena hesla'}
                     </h1>
                   </div>
                </div>

                <div className="p-8 md:p-10 -mt-8 bg-white rounded-t-[2.5rem] relative z-10 flex-1">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-6 p-6 bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl text-center font-bold flex flex-col items-center gap-3 animate-in fade-in zoom-in-95">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm"><CheckCircle size={28} /></div>
                            {success}
                            {(mode === 'forgot' || mode === 'update-password') && (
                              <button onClick={() => { setMode('login'); navigate('/auth', { replace: true }); }} className="mt-2 text-xs uppercase tracking-widest text-brand-600 underline font-black">Späť na prihlásenie</button>
                            )}
                        </div>
                    )}

                    {!success && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                          {mode === 'register' && (
                              <div className="space-y-3 mb-8">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Vyberte si typ účtu</label>
                                  <div className="grid grid-cols-2 gap-4">
                                      <button type="button" onClick={() => setRole('user')} className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${role === 'user' ? 'border-brand-600 bg-brand-50' : 'border-gray-100 bg-gray-50'}`}>
                                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${role === 'user' ? 'bg-brand-600 text-white' : 'bg-white text-gray-400'}`}><User size={20} /></div>
                                          <span className="text-xs font-black">Chcem adoptovať</span>
                                      </button>
                                      <button type="button" onClick={() => setRole('shelter')} className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${role === 'shelter' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}>
                                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${role === 'shelter' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}><Building2 size={20} /></div>
                                          <span className="text-xs font-black">Som útulok</span>
                                      </button>
                                  </div>
                              </div>
                          )}

                          {mode === 'register' && (
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{role === 'user' ? 'Meno a priezvisko' : 'Názov útulku'}</label>
                                  <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${role === 'shelter' ? 'group-focus-within:text-indigo-500' : 'group-focus-within:text-brand-500'} text-gray-400`}>
                                      {role === 'user' ? <User size={20} /> : <Building2 size={20} />}
                                    </div>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 font-bold transition-all" placeholder={role === 'user' ? "Jozef Pekný" : "Názov vašej organizácie"} />
                                  </div>
                              </div>
                          )}

                          {mode === 'register' && role === 'shelter' && (
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Lokalita / Mesto</label>
                                  <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><MapPin size={20} /></div>
                                    <input type="text" required value={locationField} onChange={(e) => setLocationField(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all" placeholder="Napr. Bratislava" />
                                  </div>
                              </div>
                          )}

                          {mode !== 'update-password' && (
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mailová adresa</label>
                                <div className="relative group">
                                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${role === 'shelter' && mode === 'register' ? 'group-focus-within:text-indigo-500' : 'group-focus-within:text-brand-500'}`}><Mail size={20} /></div>
                                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 font-bold transition-all" placeholder="meno@priklad.sk" />
                                </div>
                            </div>
                          )}

                          {mode !== 'forgot' && (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2 ml-1">
                                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{mode === 'update-password' ? 'Nové heslo' : 'Heslo'}</label>
                                      {mode === 'login' && <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black uppercase text-brand-600 tracking-wider">Zabudli ste heslo?</button>}
                                    </div>
                                    <div className="relative group">
                                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${role === 'shelter' && mode === 'register' ? 'group-focus-within:text-indigo-500' : 'group-focus-within:text-brand-500'}`}><Lock size={20} /></div>
                                      <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 font-bold transition-all" placeholder="••••••••" />
                                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                </div>
                                {(mode === 'register' || mode === 'update-password') && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Zopakovať heslo</label>
                                        <div className="relative group">
                                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${role === 'shelter' && mode === 'register' ? 'group-focus-within:text-indigo-500' : 'group-focus-within:text-brand-500'}`}><Lock size={20} /></div>
                                          <input type={showConfirmPassword ? "text" : "password"} required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 font-bold transition-all" placeholder="••••••••" />
                                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                          )}

                          <div className="pt-4">
                            <button type="submit" disabled={loading} className={`w-full py-5 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition transform hover:-translate-y-1 disabled:opacity-70 flex items-center justify-center gap-3 ${
                              mode === 'login' || (mode === 'register' && role === 'user') ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200' : (mode === 'register' && role === 'shelter' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-gray-800')
                            }`}>
                                {loading ? <RefreshCcw size={18} className="animate-spin" /> : (mode === 'login' ? 'Vstúpiť do účtu' : mode === 'register' ? 'Vytvoriť profil' : mode === 'forgot' ? 'Odoslať odkaz' : 'Zmeniť heslo')}
                            </button>
                          </div>
                      </form>
                    )}

                    {mode !== 'update-password' && !success && (
                      <div className="mt-10 text-center">
                          <p className="text-gray-400 text-sm font-bold">
                            {mode === 'login' ? 'Ešte nemáte u nás účet?' : 'Už ste registrovaný?'}
                            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }} className={`ml-2 font-black uppercase text-xs tracking-widest underline underline-offset-4 ${role === 'shelter' && mode === 'register' ? 'text-indigo-600' : 'text-brand-600'}`}>
                              {mode === 'login' ? 'Zaregistrovať sa' : 'Prihlásiť sa'}
                            </button>
                          </p>
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;