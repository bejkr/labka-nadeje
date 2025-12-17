
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, User, Lock, Mail, MapPin } from 'lucide-react';
import { LogoIcon } from '../components/Logo';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, registerUser, registerShelter } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'user' | 'shelter'>('user');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
             navigate('/');
        } else {
          setError('Nesprávny email alebo heslo. Ak ste sa práve registrovali, skontrolujte si email pre potvrdenie.');
        }
      } else {
        // Register
        if (role === 'user') {
          await registerUser(name, email, password);
          navigate('/profile');
        } else {
          await registerShelter(name, location, email, password);
          navigate('/shelter');
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      
      if (msg.includes('infinite recursion')) {
          setError('CHYBA DATABÁZY: Zistená nekonečná rekurzia v politikách (RLS). Prosím, spustite opravný SQL skript v Supabase.');
      } else if (msg.includes('User already registered') || msg.includes('already exists')) {
          setError('Tento email je už zaregistrovaný. Skúste sa prihlásiť.');
      } else {
          setError(msg || 'Nastala chyba. Skúste to prosím znova.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Smart Demo Login: Tries login, if fails (user doesn't exist), registers new account automatically
  const handleDemoAction = async (demoRole: 'user' | 'shelter') => {
      setLoading(true);
      setError('');
      
      const demoEmail = demoRole === 'user' ? 'filip@example.com' : 'info@utuloknadej.sk';
      const demoPass = 'password';
      const demoName = demoRole === 'user' ? 'Filip Dobrý (Demo)' : 'Útulok Nádej (Demo)';
      const demoLoc = 'Bratislava';

      try {
          // 1. Try Login
          const success = await login(demoEmail, demoPass);
          if (success) {
              navigate(demoRole === 'user' ? '/profile' : '/shelter');
              return;
          } else {
              // This part often won't execute because api.login throws on error, but just in case of soft fail
              throw new Error("Login failed");
          }
      } catch (e: any) {
          console.warn("Demo login failed, trying registration...", e.message);
          
          // 2. If login fails, try Registering
          try {
              if (demoRole === 'user') {
                  await registerUser(demoName, demoEmail, demoPass);
                  navigate('/profile');
              } else {
                  await registerShelter(demoName, demoLoc, demoEmail, demoPass);
                  navigate('/shelter');
              }
          } catch (regError: any) {
              console.error("Demo registration failed:", regError);
              const msg = regError.message || '';

              // Handle "User already registered" specifically
              if (msg.includes("already registered") || msg.includes("already exists")) {
                  setError("Účet už existuje, ale prihlásenie zlyhalo. Skontrolujte, či nemáte zapnuté potvrdzovanie emailov v Supabase.");
              } else if (msg.includes('infinite recursion')) {
                  setError('CRITICAL DB ERROR: Infinite recursion detected. Run the fix SQL script.');
              } else {
                  setError(`Nepodarilo sa vytvoriť demo účet: ${msg}`);
              }
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Toggle Role */}
        {!isLogin && (
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setRole('user')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${role === 'user' ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <User size={18} /> Hľadám zvieratko
                </button>
                <button 
                    onClick={() => setRole('shelter')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${role === 'shelter' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Building2 size={18} /> Som útulok
                </button>
            </div>
        )}
        
        {/* Header */}
        <div className={`p-8 pb-4 text-center ${isLogin ? 'bg-brand-600' : (role === 'user' ? 'bg-brand-600' : 'bg-indigo-600')} text-white`}>
           <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <LogoIcon className="h-16 w-16 text-white" />
           </div>
           <h1 className="text-2xl font-bold">
             {isLogin ? 'Vitajte späť' : (role === 'user' ? 'Vytvoriť profil osvojiteľa' : 'Registrácia útulku')}
           </h1>
           <p className="text-white/80 mt-2 text-sm">
             {isLogin 
               ? 'Prihláste sa do svojho účtu' 
               : (role === 'user' ? 'Pridajte sa k komunite milovníkov zvierat' : 'Spravujte adopcie efektívne online')
             }
           </p>
        </div>

        {/* Form */}
        <div className="p-8">
            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name (Register Only) */}
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                             {role === 'user' ? 'Meno a Priezvisko' : 'Názov Útulku'}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                                placeholder={role === 'user' ? "Jozef Novák" : "Útulok Nádej"}
                            />
                        </div>
                    </div>
                )}

                {/* Location (Shelter Register Only) */}
                {!isLogin && role === 'shelter' && (
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mesto / Lokalita</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                                placeholder="Bratislava"
                            />
                        </div>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Emailová adresa</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                            placeholder="vas@email.com"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Heslo</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-70 ${isLogin ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200' : (role === 'user' ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200')}`}
                >
                    {loading ? 'Spracovávam...' : (isLogin ? 'Prihlásiť sa' : 'Registrovať sa')}
                </button>

            </form>

            <div className="mt-8 text-center text-sm">
                <p className="text-gray-500">
                    {isLogin ? 'Ešte nemáte účet?' : 'Už máte účet?'}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 font-bold text-brand-600 hover:underline"
                    >
                        {isLogin ? 'Zaregistrujte sa' : 'Prihláste sa'}
                    </button>
                </p>
                
                {/* Robust Demo Buttons */}
                {isLogin && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Rýchly prístup (Automatické vytvorenie)</p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => handleDemoAction('user')} 
                                disabled={loading}
                                className="flex-1 text-xs font-bold px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50"
                            >
                                {loading ? '...' : 'Demo Užívateľ'}
                            </button>
                            <button 
                                onClick={() => handleDemoAction('shelter')} 
                                disabled={loading}
                                className="flex-1 text-xs font-bold px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50"
                            >
                                {loading ? '...' : 'Demo Útulok'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
