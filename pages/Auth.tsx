
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, User, Lock, Mail, MapPin, ArrowLeft, CheckCircle, RefreshCcw, MailCheck } from 'lucide-react';
import { LogoIcon } from '../components/Logo';

type AuthMode = 'login' | 'register' | 'forgot' | 'update-password' | 'verification-pending';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, registerUser, registerShelter, resetPassword, updatePassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'user' | 'shelter'>('user');

  // Detect mode from URL (for password reset redirect)
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'update-password') {
      setMode('update-password');
    }
  }, [searchParams]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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
          result = await registerShelter(name, location, email, password);
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
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Toggle Role (Only during registration) */}
        {mode === 'register' && (
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
        <div className={`p-8 pb-4 text-center ${mode === 'login' || (mode === 'register' && role === 'user') ? 'bg-brand-600' : (mode === 'register' && role === 'shelter' ? 'bg-indigo-600' : 'bg-gray-800')} text-white relative`}>
           {mode !== 'login' && mode !== 'update-password' && (
             <button 
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }} 
              className="absolute left-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition"
             >
               <ArrowLeft size={20} />
             </button>
           )}
           <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <LogoIcon className="h-16 w-16 text-white" />
           </div>
           <h1 className="text-2xl font-bold">
             {mode === 'login' && 'Vitajte späť'}
             {mode === 'register' && (role === 'user' ? 'Vytvoriť profil' : 'Registrácia útulku')}
             {mode === 'forgot' && 'Zabudnuté heslo'}
             {mode === 'update-password' && 'Nové heslo'}
           </h1>
           <p className="text-white/80 mt-2 text-sm">
             {mode === 'login' && 'Prihláste sa do svojho účtu'}
             {mode === 'register' && (role === 'user' ? 'Pridajte sa k milovníkom zvierat' : 'Spravujte adopcie online')}
             {mode === 'forgot' && 'Zadajte email pre obnovu prístupu'}
             {mode === 'update-password' && 'Zadajte svoje nové bezpečné heslo'}
           </p>
        </div>

        {/* Form */}
        <div className="p-8">
            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl text-center font-bold flex flex-col items-center gap-2">
                    <CheckCircle className="text-green-600" />
                    {success}
                    {mode === 'forgot' && (
                      <button onClick={() => setMode('login')} className="mt-2 text-xs underline">Späť na prihlásenie</button>
                    )}
                </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Name (Register Only) */}
                  {mode === 'register' && (
                      <div className="animate-in fade-in duration-300">
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
                  {mode === 'register' && role === 'shelter' && (
                      <div className="animate-in fade-in duration-300">
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

                  {/* Email (Hidden in Update Password Mode) */}
                  {mode !== 'update-password' && (
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
                  )}

                  {/* Password (Hidden in Forgot Mode) */}
                  {mode !== 'forgot' && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-bold text-gray-700">
                            {mode === 'update-password' ? 'Nové heslo' : 'Heslo'}
                          </label>
                          {mode === 'login' && (
                            <button 
                              type="button" 
                              onClick={() => setMode('forgot')}
                              className="text-xs font-bold text-brand-600 hover:underline"
                            >
                              Zabudli ste heslo?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                  )}

                  <button 
                      type="submit"
                      disabled={loading}
                      className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2 ${
                        mode === 'login' || (mode === 'register' && role === 'user') 
                        ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200' 
                        : (mode === 'register' && role === 'shelter' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-gray-800 hover:bg-gray-900 shadow-gray-200')
                      }`}
                  >
                      {loading ? (
                        <>
                          <RefreshCcw size={18} className="animate-spin" />
                          Spracovávam...
                        </>
                      ) : (
                        <>
                          {mode === 'login' && 'Prihlásiť sa'}
                          {mode === 'register' && 'Registrovať sa'}
                          {mode === 'forgot' && 'Odoslať odkaz na reset'}
                          {mode === 'update-password' && 'Aktualizovať heslo'}
                        </>
                      )}
                  </button>

              </form>
            )}

            {mode !== 'update-password' && !success && (
              <div className="mt-8 text-center text-sm">
                  <p className="text-gray-500">
                      {mode === 'login' ? 'Ešte nemáte účet?' : 'Už máte účet?'}
                      <button 
                          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                          className="ml-2 font-bold text-brand-600 hover:underline"
                      >
                          {mode === 'login' ? 'Zaregistrujte sa' : 'Prihláste sa'}
                      </button>
                  </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
