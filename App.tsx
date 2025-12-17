
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Home, Search, BookOpen, Building2, User as UserIcon, LogIn, ShieldAlert, Map, Facebook, Instagram } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';

// Pages imports
import HomePage from './pages/Home';
import PetListPage from './pages/PetList';
import PetDetailPage from './pages/PetDetail';
import ShelterDashboard from './pages/ShelterDashboard';
import ShelterDetailPage from './pages/ShelterDetail'; 
import ShelterListPage from './pages/ShelterList'; // New Page
import BlogPage from './pages/Blog';
import BlogDetailPage from './pages/BlogDetail';
import SupportPage from './pages/Support';
import UserProfilePage from './pages/UserProfile';
import AuthPage from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard'; // New Page
import PaymentSuccess from './pages/PaymentSuccess'; // New Page
import AdoptionAssistant from './components/AdoptionAssistant';
import ScrollToTop from './components/ScrollToTop';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { currentUser, userRole } = useAuth(); 

  const navLinks = [
    { name: 'Domov', path: '/', icon: Home },
    { name: 'Zvieratá', path: '/pets', icon: Search },
    { name: 'Útulky', path: '/shelters', icon: Map },
    { name: 'Blog', path: '/blog', icon: BookOpen },
    { name: 'Podpora', path: '/support', icon: Heart },
  ];

  // Robust check for shelter role
  const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
  const isSuperAdmin = (currentUser as any)?.isSuperAdmin;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20"> {/* Increased height slightly for the new logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-12" />
            </Link>
          </div>
          
          {/* Desktop Menu - Center Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Menu - Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
             
             {/* SUPER ADMIN LINK */}
             {isSuperAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all mr-2"
                >
                  <ShieldAlert size={18} />
                  Admin Panel
                </Link>
             )}

             {/* SHELTER VIEW */}
             {isShelter ? (
                <Link
                  to="/shelter"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    location.pathname === '/shelter'
                      ? 'text-brand-800 bg-brand-50 border border-brand-200'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 size={18} />
                  Môj Útulok
                </Link>
             ) : (
               /* REGULAR USER / GUEST VIEW */
               <>
                 {!currentUser && (
                   <Link
                      to="/auth"
                      state={{ role: 'shelter' }} 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:text-brand-600 hover:bg-gray-50 transition-all"
                    >
                      <Building2 size={18} />
                      Pre útulky
                    </Link>
                 )}

                <div className="h-6 w-px bg-gray-200"></div>
                
                {currentUser ? (
                  <Link 
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                      location.pathname === '/profile'
                      ? 'border-brand-200 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center overflow-hidden">
                      {(currentUser as any).avatarUrl ? <img src={(currentUser as any).avatarUrl} alt="" /> : <UserIcon size={14} className="text-brand-700"/>}
                    </div>
                    <span className="text-sm font-bold truncate max-w-[100px]">{currentUser.name}</span>
                  </Link>
                ) : (
                  <Link 
                    to="/auth"
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <LogIn size={18} />
                    <span className="text-sm font-bold">Prihlásiť</span>
                  </Link>
                )}

                <Link
                  to="/pets"
                  className="px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 transform hover:scale-105 duration-200"
                >
                  Chcem adoptovať
                </Link>
               </>
             )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-brand-50 text-brand-600' 
                    : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                }`}
              >
                <link.icon size={20} />
                {link.name}
              </Link>
            ))}

            {isSuperAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 bg-red-50 hover:bg-red-100"
                >
                  <ShieldAlert size={20} />
                  Admin Panel
                </Link>
            )}

            <div className="border-t border-gray-100 my-2 pt-2">
              {isShelter && (
                 <Link
                  to="/shelter"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    location.pathname === '/shelter'
                    ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                    : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 size={20} className={location.pathname === '/shelter' ? "text-brand-600" : "text-gray-500"} />
                  Môj Útulok
                </Link>
              )}

              {!isShelter && (
                <>
                  {!currentUser && (
                    <Link
                      to="/auth"
                      state={{ role: 'shelter' }}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                    >
                      <Building2 size={20} className="text-gray-500" />
                      Pre útulky
                    </Link>
                  )}
                  
                  {currentUser ? (
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                        location.pathname === '/profile'
                        ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                        : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                      }`}
                    >
                      <UserIcon size={20} className={location.pathname === '/profile' ? "text-brand-600" : "text-gray-500"} />
                      Môj účet
                    </Link>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                    >
                      <LogIn size={20} className="text-gray-500" />
                      Prihlásiť sa
                    </Link>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white pt-12 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4">
            <Logo className="h-12" variant="light" />
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Spájame opustené srdcia s milujúcimi domovmi. Pomáhame útulkom po celom Slovensku.
          </p>
          <div className="flex gap-4">
             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition text-white">
               <Facebook size={18} />
             </a>
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition text-white">
               <Instagram size={18} />
             </a>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-brand-400">Rýchle odkazy</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/pets" className="hover:text-white">Hľadám psa</Link></li>
            <li><Link to="/shelters" className="hover:text-white">Zoznam útulkov</Link></li>
            <li><Link to="/auth" className="hover:text-white">Pre útulky</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/support" className="hover:text-white">Podpora</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-brand-400">Kontakt</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>info@labkanadeje.sk</li>
            <li>+421 2 123 456 78</li>
            <li>Bratislava, Slovensko</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-brand-400">Novinky</h3>
          <p className="text-gray-400 text-sm mb-4">Prihláste sa na odber noviniek a príbehov.</p>
          <div className="flex">
            <input type="email" placeholder="Váš email" className="px-3 py-2 bg-gray-800 rounded-l text-sm w-full focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <button className="bg-brand-600 px-4 py-2 rounded-r hover:bg-brand-700 text-sm font-medium">OK</button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} LabkaNádeje. Všetky práva vyhradené.
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pets" element={<PetListPage />} />
            <Route path="/pets/:id" element={<PetDetailPage />} />
            <Route path="/shelter" element={<ShelterDashboard />} />
            <Route path="/shelters" element={<ShelterListPage />} />
            <Route path="/shelters/:id" element={<ShelterDetailPage />} /> 
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Routes>
        </main>
        <Footer />
        <AdoptionAssistant />
      </div>
    </Router>
  );
};

export default App;
