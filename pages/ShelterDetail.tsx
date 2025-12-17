
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, MapPin, Mail, Phone, Clock, CreditCard, 
  CheckCircle, Dog, Gift, LayoutGrid, Heart, Globe, 
  Facebook, Instagram, ExternalLink, Copy, Check, ShoppingCart, Info, AlertCircle, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Shelter, Pet, ShelterSupply } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const ShelterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toggleFavorite, isFavorite, userRole, currentUser } = useAuth();
  const { showToast } = useApp();
  
  // Robust check for shelter role
  const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
  
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [supplies, setSupplies] = useState<ShelterSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pets' | 'about' | 'help'>('pets');
  const [copied, setCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Increment views
        api.incrementShelterViews(id);

        const shelterData = await api.getPublicShelter(id);
        const petsData = await api.getPetsByShelter(id);
        const suppliesData = await api.getSupplies(id);
        
        setShelter(shelterData);
        setPets(petsData);
        setSupplies(suppliesData);
      } catch (e) {
        console.error("Error fetching shelter data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const copyIban = () => {
      if (shelter?.bankAccount) {
          navigator.clipboard.writeText(shelter.bankAccount);
          setCopied(true);
          showToast("IBAN skopírovaný", "success");
          setTimeout(() => setCopied(false), 2000);
      }
  };

  const copyAddress = () => {
      // Prefer full shipping address, fallback to location
      const addressToCopy = shelter?.shippingAddress || shelter?.location;
      if (addressToCopy) {
          navigator.clipboard.writeText(addressToCopy);
          setAddressCopied(true);
          showToast("Adresa skopírovaná", "success");
          setTimeout(() => setAddressCopied(false), 2000);
      }
  };

  const ensureUrl = (url: string) => {
      if (!url) return '#';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `https://${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Útulok sa nenašiel</h2>
            <p className="text-gray-500 mb-6">Je nám ľúto, ale tento profil neexistuje alebo bol odstránený.</p>
            <Link to="/" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition">
                Späť na domovskú stránku
            </Link>
        </div>
      </div>
    );
  }

  const hasSocials = shelter.socials && (shelter.socials.facebook || shelter.socials.instagram || shelter.socials.website);

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="relative bg-white pb-8">
        {/* Background Pattern - Animal Theme */}
        <div className="absolute inset-0 h-48 bg-brand-50 overflow-hidden border-b border-brand-100">
             <div className="absolute inset-0 opacity-[0.07]" style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 24c-1.9 0-3.5 1.9-3.5 4.2 0 2.3 1.6 4.2 3.5 4.2 1.9 0 3.5-1.9 3.5-4.2 0-2.3-1.6-4.2-3.5-4.2zM32.5 24c-1.9 0-3.5 1.9-3.5 4.2 0 2.3 1.6 4.2 3.5 4.2 1.9 0 3.5-1.9 3.5-4.2 0-2.3-1.6-4.2-3.5-4.2zM14.5 13.5c-1.9 0-3.5 1.9-3.5 4.2 0 2.3 1.6 4.2 3.5 4.2 1.9 0 3.5-1.9 3.5-4.2 0-2.3-1.6-4.2-3.5-4.2zM38.5 13.5c-1.9 0-3.5 1.9-3.5 4.2 0 2.3 1.6 4.2 3.5 4.2 1.9 0 3.5-1.9 3.5-4.2 0-2.3-1.6-4.2-3.5-4.2zM26.5 29c-5.2 0-9.5 4.5-9.5 10 0 5.5 4.3 10 9.5 10 5.2 0 9.5-4.5 9.5-10 0-5.5-4.3-10-9.5-10z' fill='%23ea580c' fill-rule='evenodd'/%3E%3C/svg%3E")`,
             }}></div>
             <div className="absolute -bottom-12 -right-12 text-brand-100 opacity-50 transform rotate-12">
                 <Dog size={200} />
             </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-6 border border-gray-100 relative mt-8">
                
                {/* Logo - Properly contained */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {shelter.logoUrl ? (
                        <img src={shelter.logoUrl} alt={shelter.name} className="w-full h-full object-contain p-1" />
                    ) : (
                        <Building2 size={40} className="text-gray-300" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                    {shelter.name}
                                </h1>
                                {/* Verified Badge - Inline with name on desktop */}
                                {shelter.isVerified && (
                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 w-fit mx-auto md:mx-0 flex-shrink-0">
                                        <CheckCircle size={14} className="fill-green-200 text-green-600" /> Overený útulok
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 text-sm font-medium mt-3">
                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-brand-600"/> {shelter.location}</span>
                                <span className="hidden md:inline text-gray-300">|</span>
                                <a href={`mailto:${shelter.email}`} className="flex items-center gap-1.5 hover:text-brand-600 transition"><Mail size={16}/> {shelter.email}</a>
                            </div>
                        </div>
                        
                        {!isShelter && (
                            <div className="flex gap-3 justify-center md:justify-end mt-4 md:mt-0 flex-shrink-0">
                                <button 
                                    onClick={() => setActiveTab('help')}
                                    className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-100 flex items-center gap-2 transform hover:-translate-y-0.5"
                                >
                                    <Heart size={18} fill="currentColor" className="text-brand-200" />
                                    Podporiť nás
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN (Content) - 8/12 */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Custom Tab Navigation */}
                <div className="flex items-center border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('pets')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'pets' 
                            ? 'border-brand-600 text-brand-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <LayoutGrid size={18} /> Zvieratá na adopciu ({pets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'about' 
                            ? 'border-brand-600 text-brand-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Building2 size={18} /> O útulku
                    </button>
                    {!isShelter && (
                        <button
                            onClick={() => setActiveTab('help')}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'help' 
                                ? 'border-brand-600 text-brand-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Gift size={18} /> Ako pomôcť
                        </button>
                    )}
                </div>

                {/* --- TAB CONTENT: PETS --- */}
                {activeTab === 'pets' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {pets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {pets.map(pet => (
                                    <Link key={pet.id} to={`/pets/${pet.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
                                        <div className="relative h-64 overflow-hidden bg-gray-100">
                                            <img 
                                                src={pet.imageUrl} 
                                                alt={pet.name} 
                                                className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                                            />
                                            
                                            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start">
                                                {pet.adoptionStatus !== 'Available' ? (
                                                    <span className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide shadow-sm border ${
                                                        pet.adoptionStatus === 'Reserved' 
                                                        ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                        {pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                                                    </span>
                                                ) : (
                                                    <span></span> /* Spacer */
                                                )}
                                                
                                                {!isShelter && (
                                                    <button 
                                                        onClick={(e) => { e.preventDefault(); toggleFavorite(pet.id); }}
                                                        className="p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all shadow-sm group/heart"
                                                    >
                                                        <Heart 
                                                            size={20} 
                                                            className={`transition ${isFavorite(pet.id) ? 'fill-red-500 text-red-500' : 'text-gray-500 group-hover/heart:text-red-500'}`} 
                                                        />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                                                <h3 className="text-xl font-bold text-white mb-0.5">{pet.name.replace(/\*\*/g, '')}</h3>
                                                <p className="text-white/80 text-sm font-medium">{pet.breed}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-5 flex-1 flex flex-col">
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                                                {pet.description.replace(/\*\*/g, '')}
                                            </p>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{pet.age} {pet.age === 1 ? 'rok' : 'rokov'}</span>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{pet.gender}</span>
                                                </div>
                                                <span className="text-brand-600 text-sm font-bold group-hover:underline">Zobraziť viac</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Dog size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Žiadne zvieratá</h3>
                                <p className="text-gray-500">Tento útulok momentálne nemá pridané žiadne zvieratká.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB CONTENT: ABOUT --- */}
                {activeTab === 'about' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building2 className="text-brand-600" /> Náš príbeh a misia
                            </h3>
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {shelter.description || "Tento útulok zatiaľ nepridal popis."}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <div className="text-4xl font-extrabold text-brand-600 mb-1">{shelter.stats.adoptions}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Úspešných adopcií</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <div className="text-4xl font-extrabold text-blue-600 mb-1">{shelter.stats.currentAnimals}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aktuálne v starostlivosti</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <div className="text-4xl font-extrabold text-green-600 mb-1">{shelter.stats.views || 0}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zobrazení profilu</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: HELP (Hidden for shelters) --- */}
                {activeTab === 'help' && !isShelter && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Donation "Credit Card" Design */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1">Finančná podpora</h3>
                                        <p className="text-gray-400 text-sm">Príspevky na veterinárnu starostlivosť a krmivo.</p>
                                    </div>
                                    <CreditCard size={32} className="text-brand-500" />
                                </div>

                                {shelter.bankAccount ? (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">IBAN (Bankový účet)</label>
                                        <div className="flex items-center gap-4">
                                            <code className="font-mono text-2xl md:text-3xl tracking-wider text-white">
                                                {shelter.bankAccount}
                                            </code>
                                            <button 
                                                onClick={copyIban}
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-white"
                                                title="Kopírovať IBAN"
                                            >
                                                {copied ? <Check size={20} className="text-green-400"/> : <Copy size={20}/>}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white/10 rounded-xl border border-white/10 text-gray-300">
                                        Útulok zatiaľ nezverejnil číslo účtu. Kontaktujte ich prosím priamo.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Material Supplies List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Gift className="text-brand-600" size={20} /> Materiálna pomoc
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Veci, ktoré nám môžete priniesť osobne alebo poslať.</p>
                            </div>
                            
                            {/* Tip for donors */}
                            {supplies.length > 0 && (
                                <div className="p-4 m-6 mb-2 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div className="flex-1">
                                        <p className="text-blue-900 text-sm font-medium mb-1">Tip pre darcov:</p>
                                        <p className="text-blue-800 text-xs leading-relaxed mb-2">
                                            Pri objednávke z e-shopu zadajte ako doručovaciu adresu adresu nášho útulku:
                                        </p>
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-100 w-fit max-w-full">
                                            <code className="text-xs font-mono text-gray-700 truncate">
                                                {shelter.shippingAddress || shelter.location}
                                            </code>
                                            <button 
                                                onClick={copyAddress}
                                                className="text-blue-500 hover:text-blue-700 transition flex-shrink-0"
                                                title="Kopírovať adresu"
                                            >
                                                {addressCopied ? <Check size={14}/> : <Copy size={14}/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <ul className="divide-y divide-gray-100">
                                {supplies.length > 0 ? supplies.map(item => (
                                    <li key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0 ${
                                                item.priority === 'Vysoká' ? 'bg-red-500 shadow-red-200' : 
                                                item.priority === 'Stredná' ? 'bg-yellow-500 shadow-yellow-200' : 'bg-green-500 shadow-green-200'
                                            }`}></div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-700 group-hover:text-gray-900 transition">{item.item}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 w-fit rounded px-1.5 py-0.5 ${
                                                    item.priority === 'Vysoká' ? 'bg-red-50 text-red-600' : 
                                                    item.priority === 'Stredná' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                    {item.priority} priorita
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {item.link ? (
                                            <a 
                                                href={item.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-brand-700 transition shadow-sm hover:shadow transform hover:-translate-y-0.5"
                                            >
                                                <ShoppingCart size={14} /> Kúpiť online
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                                                Doručiť osobne
                                            </span>
                                        )}
                                    </li>
                                )) : (
                                    <li className="p-12 text-center text-gray-400">Momentálne nemáme uvedené špeciálne potreby.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN (Sticky Sidebar) - 4/12 */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Contact Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                    <h3 className="font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Kontaktovať útulok</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 group">
                            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition duration-300">
                                <Mail size={20}/>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Email</div>
                                <a href={`mailto:${shelter.email}`} className="text-gray-900 font-bold hover:text-brand-600 transition break-all">
                                    {shelter.email}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                                <Phone size={20}/>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Telefón</div>
                                <a href={`tel:${shelter.phone}`} className="text-gray-900 font-bold hover:text-blue-600 transition">
                                    {shelter.phone}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-gray-800 group-hover:text-white transition duration-300">
                                <Clock size={20}/>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Otváracie hodiny</div>
                                <p className="text-gray-900 font-medium text-sm whitespace-pre-line leading-relaxed">
                                    {shelter.openingHours || "Dohodou"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasSocials ? (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-xs text-center text-gray-400 font-bold uppercase mb-4">Sledujte nás</p>
                            <div className="flex justify-center gap-4">
                                {shelter.socials?.facebook && (
                                    <a href={ensureUrl(shelter.socials.facebook)} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Facebook">
                                        <Facebook size={20}/>
                                    </a>
                                )}
                                {shelter.socials?.instagram && (
                                    <a href={ensureUrl(shelter.socials.instagram)} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-pink-50 hover:text-pink-600 transition" title="Instagram">
                                        <Instagram size={20}/>
                                    </a>
                                )}
                                {shelter.socials?.website && (
                                    <a href={ensureUrl(shelter.socials.website)} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition" title="Web">
                                        <Globe size={20}/>
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                             <p className="text-xs text-gray-400 font-bold uppercase">Žiadne sociálne siete</p>
                        </div>
                    )}
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default ShelterDetailPage;
