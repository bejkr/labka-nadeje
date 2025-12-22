
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, User, Lock, Mail, MapPin, ArrowLeft, CheckCircle, 
  RefreshCcw, MailCheck, Heart, Dog, LayoutDashboard, 
  MessageSquare, TrendingUp, Gift, Coins, Zap, ShieldCheck, Quote,
  Eye, EyeOff
} from 'lucide-react';
import { LogoIcon } from '../components/Logo';

type AuthMode = 'login' | 'register' | 'forgot' | 'update-password' | 'verification-pending';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, registerUser, registerShelter, resetPassword, updatePassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'user' | 'shelter'>('user');

  // Detect mode and role from URL or Navigation State
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'update-password') {
      setMode('update-password');
    }

    // If coming from "Pre útulky" link in navbar
    if (location.state?.role === 'shelter') {
        setRole('shelter');
        setMode('register'); // Prefer registration for new shelter partners
    }
  }, [searchParams, location.state]);

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

    // Validation: Passwords must match for register and update
    if ((mode === 'register' || mode === 'update-password') && password !== confirmPassword) {
        setError('Heslá sa nezhodujú. Skontrolujte prosím obe polia.');
        setLoading(false);
        return;
    }

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
             navigate('/');
        } else {
          setError('Nesprávny email alebo heslo. Skontrolujte si údaje.');
        }
      } else if (mode === 'register') {
        let result: any;
        if (role === 'user') {
          result = await registerUser(name, email, password);
        } else {
          result = await registerShelter(name, locationField, email, password);
        }

        if (result?.verificationRequired) {
            setMode('verification-pending');
        } else {
            navigate(role === 'user' ? '/profile' : '/shelter');
        }
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccess('Odkaz na resetovanie hesla bol odoslaný na váš email. Skontrolujte si schránku.');
      } else if (mode === 'update-password') {
        await updatePassword(password);
        setSuccess('Vaše heslo bolo úspešne zmenené. Teraz sa môžete prihlásiť.');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      
      if (msg.includes('infinite recursion')) {
          setError('CHYBA DATABÁZY: Zistená nekonečná rekurzia v politikách (RLS).');
      } else if (msg.includes('User already registered') || msg.includes('already exists')) {
          setError('Tento email je už zaregistrovaný. Skúste sa prihlásiť.');
      } else {
          setError(msg || 'Nastala chyba. Skúste to prosím znova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const ShelterBenefits = () => (
    <div className="bg-indigo-600 p-8 md:p-12 text-white flex flex-col justify-between h-full">
        <div>
            <div className="mb-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-xl">
                    <Building2 size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                    Moderný domov <br/> pre váš útulok
                </h2>
                <p className="text-indigo-100 text-lg leading-relaxed opacity-90">
                    Získajte prístup k nástrojom, ktoré vám ušetria čas a pomôžu vašim zverencom nájsť domov rýchlejšie.
                </p>
            </div>

            <div className="space-y-6 mb-12">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                        <LayoutDashboard size={20} className="text-indigo-200" />
                    </div>
                    <div>
                        <h4 className="font-bold text-base">Kompletný Dashboard</h4>
                        <p className="text-indigo-100/70 text-sm">Jednoduchá správa zvierat, fotiek a inzerátov na jednom mieste.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                        <MessageSquare size={20} className="text-indigo-200" />
                    </div>
                    <div>
                        <h4 className="font-bold text-base">Integrovaný Chat</h4>
                        <p className="text-indigo-100/70 text-sm">Priama komunikácia so záujemcami bez nutnosti zverejnenia čísla.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                        <Coins size={20} className="text-indigo-200" />
                    </div>
                    <div>
                        <h4 className="font-bold text-base">Virtuálne Adopcie</h4>
                        <p className="text-indigo-100/70 text-sm">Získajte pravidelnú podporu pre vaše zvieratká od darcov.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6 animate-in fade-in duration-700 delay-300">
            <div className="bg-indigo-700/50 p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-indigo-700/70 transition-all">
                <Quote className="absolute -right-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform" size={80} />
                <p className="text-sm italic text-indigo-50 leading-relaxed mb-4 relative z-10">
                    "Vďaka LabkeNádeje sme skrátili čas hľadania domova o tretinu. Systém chatov nám šetrí hodiny času, ktoré sme predtým trávili na telefóne."
                </p>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-[10px] font-black border border-white/20">JS</div>
                    <div>
                        <p className="text-xs font-black">Jana S.</p>
                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Útulok Labka Šťastia</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-200">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h5 className="text-sm font-bold">Manuálne overenie</h5>
                    <p className="text-xs text-indigo-200/80">Každý útulok preverujeme do 24h pre bezpečnosť zvierat i adoptujúcich.</p>
                </div>
            </div>

            <div className="pt-6 border-t border-indigo-500/30 flex items-center gap-3">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(64 + i)}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-indigo-200 font-medium">Pridajte sa k viac ako 40 útulkom na Slovensku</p>
            </div>
        </div>
    </div>
  );

  // --- Verification Pending Screen ---
  if (mode === 'verification-pending') {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12 font-sans">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
                  <div className="p-10 text-center">
                      <div className="mx-auto w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mb-6 text-brand-600">
                          <MailCheck size={48} />
                      </div>
                      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Skontrolujte si e-mail</h1>
                      <p className="text-gray-600 mb-8 leading-relaxed">
                          Na vašu adresu <strong className="text-gray-900">{email}</strong> sme odoslali potvrdzujúci odkaz. 
                          Kliknite naň, aby ste aktivovali svoj účet.
                      </p>
                      
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700 mb-8 text-left flex items-start gap-3">
                          <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
                          <p>Ak e-mail nevidíte, skontrolujte si prosím priečinok <strong>Spam</strong> alebo <strong>Reklamy</strong>.</p>
                      </div>

                      <button 
                          onClick={() => setMode('login')}
                          className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition"
                      >
                          Späť na prihlásenie
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12 font-sans">
      <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${role === 'shelter' ? 'max-w-5xl' : 'max-w-lg'} overflow-hidden border border-gray-100 transition-all duration-500`}>
        
        <div className="flex flex-col lg:flex-row">
            
            {/* LEFT PANEL: BENEFITS (Only for Shelter mode) */}
            {role === 'shelter' && (
                <div className="lg:w-1/2 order-2 lg:order-1 border-r border-gray-100">
                    <ShelterBenefits />
                </div>
            )}

            {/* RIGHT PANEL: FORM */}
            <div className={`${role === 'shelter' ? 'lg:w-1/2' : 'w-full'} order-1 lg:order-2 bg-white`}>
                
                {/* Header inside Form Column */}
                <div className={`p-8 pb-10 text-center ${mode === 'login' || (mode === 'register' && role === 'user') ? 'bg-brand-600' : (mode === 'register' && role === 'shelter' ? 'bg-indigo-600' : 'bg-gray-800')} text-white relative transition-colors duration-500`}>
                   <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner">
                        <LogoIcon className="h-10 w-10 text-white" />
                     </div>

                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-md shadow-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${mode === 'register' ? 'bg-green-400 animate-pulse' : 'bg-white'}`}></div>
                        {mode === 'login' ? 'Prihlásenie' : mode === 'register' ? 'Nová registrácia' : mode === 'forgot' ? 'Obnova hesla' : 'Zmena hesla'}
                     </div>

                     <h1 className="text-3xl font-extrabold tracking-tight">
                       {mode === 'login' && 'Vitajte späť'}
                       {mode === 'register' && (role === 'user' ? 'Pridajte sa k nám' : 'Registrácia útulku')}
                       {mode === 'forgot' && 'Zabudnuté heslo'}
                       {mode === 'update-password' && 'Nové heslo'}
                     </h1>
                     <p className="text-white/70 mt-2 text-sm font-medium max-w-[280px] mx-auto">
                       {mode === 'login' && 'Zadajte svoje údaje pre prístup k účtu'}
                       {mode === 'register' && (role === 'user' ? 'Nájdite svojho nového štvornohého priateľa' : 'Budujte komunitu a spravujte adopcie')}
                       {mode === 'forgot' && 'Zašleme vám odkaz na obnovu prístupu'}
                       {mode === 'update-password' && 'Zvoľte si nové bezpečné heslo'}
                     </p>
                   </div>
                </div>

                {/* Form Body */}
                <div className="p-8 md:p-10 -mt-6 bg-white rounded-t-[2.5rem] relative z-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-bold animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-6 p-6 bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl text-center font-bold flex flex-col items-center gap-3 animate-in fade-in zoom-in-95">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                <CheckCircle size={28} />
                            </div>
                            {success}
                            {mode === 'forgot' && (
                              <button onClick={() => setMode('login')} className="mt-2 text-xs uppercase tracking-widest text-brand-600 underline">Späť na prihlásenie</button>
                            )}
                        </div>
                    )}

                    {!success && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                          
                          {/* ROLE SELECTION CARDS (PROMINENT) */}
                          {mode === 'register' && (
                              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
                                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.15em] ml-1 mb-4">Vyberte typ účtu</label>
                                  <div className="grid grid-cols-2 gap-4">
                                      <button 
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`flex flex-col items-center text-center p-4 rounded-3xl border-2 transition-all group ${role === 'user' ? 'border-brand-600 bg-brand-50 ring-4 ring-brand-500/10' : 'border-gray-100 bg-gray-50/50 hover:border-brand-200'}`}
                                      >
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${role === 'user' ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-white text-gray-400 group-hover:text-brand-500 shadow-sm'}`}>
                                              <User size={24} />
                                          </div>
                                          <span className={`text-sm font-black tracking-tight ${role === 'user' ? 'text-brand-900' : 'text-gray-500'}`}>Hľadám lásku</span>
                                          <span className="text-[10px] font-bold text-gray-400 mt-1 opacity-80 uppercase leading-tight">Chcem si <br/>adoptovať</span>
                                      </button>

                                      <button 
                                        type="button"
                                        onClick={() => setRole('shelter')}
                                        className={`flex flex-col items-center text-center p-4 rounded-3xl border-2 transition-all group ${role === 'shelter' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/10' : 'border-gray-100 bg-gray-50/50 hover:border-indigo-200'}`}
                                      >
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${role === 'shelter' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-400 group-hover:text-indigo-500 shadow-sm'}`}>
                                              <Building2 size={24} />
                                          </div>
                                          <span className={`text-sm font-black tracking-tight ${role === 'shelter' ? 'text-indigo-900' : 'text-gray-500'}`}>Som útulok</span>
                                          <span className="text-[10px] font-bold text-gray-400 mt-1 opacity-80 uppercase leading-tight">Hľadám nové <br/>domovy</span>
                                      </button>
                                  </div>
                              </div>
                          )}

                          {/* Name (Register Only) */}
                          {mode === 'register' && (
                              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                       {role === 'user' ? 'Vaše celé meno' : 'Názov vášho útulku'}
                                  </label>
                                  <div className="relative group">
                                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${role === 'user' ? 'text-brand-400 group-focus-within:text-brand-600' : 'text-indigo-400 group-focus-within:text-indigo-600'}`}>
                                        <User size={20} />
                                      </div>
                                      <input 
                                          type="text" 
                                          required
                                          value={name}
                                          onChange={(e) => setName(e.target.value)}
                                          className={`w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 ${role === 'user' ? 'focus:ring-brand-500/10 focus:border-brand-500' : 'focus:ring-indigo-500/10 focus:border-indigo-500'}`} 
                                          placeholder={role === 'user' ? "Napr. Jozef Hraško" : "Napr. Labka Nádeje o.z."}
                                      />
                                  </div>
                              </div>
                          )}

                          {/* Location (Shelter Register Only) */}
                          {mode === 'register' && role === 'shelter' && (
                              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mesto / Región</label>
                                  <div className="relative group">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
                                        <MapPin size={20} />
                                      </div>
                                      <input 
                                          type="text" 
                                          required
                                          value={locationField}
                                          onChange={(e) => setLocationField(e.target.value)}
                                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-gray-900 focus:bg-white" 
                                          placeholder="Napr. Bratislava"
                                      />
                                  </div>
                              </div>
                          )}

                          {/* Email */}
                          {mode !== 'update-password' && (
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Emailová adresa</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-bold text-gray-900 focus:bg-white" 
                                        placeholder="meno@priklad.sk"
                                    />
                                </div>
                            </div>
                          )}

                          {/* Password */}
                          {mode !== 'forgot' && (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                                        {mode === 'update-password' ? 'Zvoľte si nové heslo' : 'Heslo'}
                                    </label>
                                    {mode === 'login' && (
                                        <button 
                                        type="button" 
                                        onClick={() => setMode('forgot')}
                                        className="text-[10px] font-black uppercase tracking-wider text-brand-600 hover:underline"
                                        >
                                        Zabudli ste heslo?
                                        </button>
                                    )}
                                    </div>
                                    <div className="relative group">
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${role === 'user' ? 'group-focus-within:text-brand-600' : 'group-focus-within:text-indigo-600'}`}>
                                            <Lock size={20} />
                                        </div>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 ${role === 'user' ? 'focus:ring-brand-500/10 focus:border-brand-500' : 'focus:ring-indigo-500/10 focus:border-indigo-500'}`} 
                                            placeholder="••••••••"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password (Register or Update only) */}
                                {(mode === 'register' || mode === 'update-password') && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Heslo znova</label>
                                        <div className="relative group">
                                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${role === 'user' ? 'group-focus-within:text-brand-600' : 'group-focus-within:text-indigo-600'}`}>
                                                <Lock size={20} />
                                            </div>
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                required
                                                minLength={6}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 ${role === 'user' ? 'focus:ring-brand-500/10 focus:border-brand-500' : 'focus:ring-indigo-500/10 focus:border-indigo-500'}`} 
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                          )}

                          <div className="pt-4">
                            <button 
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-3 ${
                                    mode === 'login' || (mode === 'register' && role === 'user') 
                                    ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-100' 
                                    : (mode === 'register' && role === 'shelter' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-gray-800 hover:bg-gray-900 shadow-gray-200')
                                }`}
                            >
                                {loading ? (
                                    <>
                                    <RefreshCcw size={18} className="animate-spin" />
                                    Spracovávam...
                                    </>
                                ) : (
                                    <>
                                    {mode === 'login' && 'Vstúpiť do účtu'}
                                    {mode === 'register' && 'Vytvoriť profil'}
                                    {mode === 'forgot' && 'Odoslať odkaz'}
                                    {mode === 'update-password' && 'Aktualizovať heslo'}
                                    </>
                                )}
                            </button>
                          </div>

                      </form>
                    )}

                    {mode !== 'update-password' && !success && (
                      <div className="mt-10 text-center">
                          <p className="text-gray-400 text-sm font-bold">
                              {mode === 'login' ? 'Ešte nemáte u nás účet?' : 'Už ste zaregistrovaný?'}
                              <button 
                                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                                  className="ml-2 font-black text-brand-600 hover:text-brand-700 transition-colors uppercase text-xs tracking-widest underline underline-offset-4"
                              >
                                  {mode === 'login' ? 'Vytvoriť profil' : 'Prihláste sa'}
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
