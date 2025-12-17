
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Plus, LayoutDashboard, Dog, MessageSquare, Building, Gift, 
  BarChart as ChartIcon, Search, Trash2, CheckCircle, XCircle, 
  Upload, X, Sparkles, Pencil, Eye, EyeOff, LogOut, Users,
  Calendar, MapPin, Mail, Phone, ArrowUpRight, Filter, Building2, Camera, Save, Clock, CreditCard, Loader2,
  Facebook, Instagram, Globe, TrendingUp, MousePointerClick, Menu, Link as LinkIcon, Truck, AlertTriangle, ArrowLeft, Quote, User, Check, AlertCircle, Home, Briefcase, Award
} from 'lucide-react';
import { Pet, PetType, AdoptionInquiry, Volunteer, ShelterSupply, Gender, Size, Shelter } from '../types';
import { usePets } from '../contexts/PetContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext'; 
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PetFormModal from '../components/PetFormModal';
import ChatWindow from '../components/ChatWindow';

// --- Sub-components ---

const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
                {subtext && <p className={`text-xs mt-2 font-medium ${color.text}`}>{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const OverviewSection = ({ onNavigate, pets, inquiries, shelter }: { onNavigate: (tab: string) => void, pets: Pet[], inquiries: AdoptionInquiry[], shelter: Shelter }) => {
  const activePets = pets.filter(p => p.adoptionStatus === 'Available').length;
  const newInquiries = inquiries.filter(i => i.status === 'Nová').length;
  const adoptedPets = pets.filter(p => p.adoptionStatus === 'Adopted').length;

  // Calculate Chart Data dynamically for last 7 days
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Count Inquiries for this day
        const inquiriesCount = inquiries.filter(inq => 
            inq.date.startsWith(dateStr)
        ).length;

        // Count New Pets for this day (postedDate)
        const newPetsCount = pets.filter(pet => 
            pet.postedDate.startsWith(dateStr)
        ).length;

        days.push({
            name: date.toLocaleDateString('sk-SK', { weekday: 'short' }), // Po, Ut...
            inquiries: inquiriesCount,
            newPets: newPetsCount
        });
    }
    return days;
  }, [inquiries, pets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Verification Alert */}
      {!shelter.isVerified ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                  <h3 className="text-amber-800 font-bold text-sm">Váš profil čaká na overenie</h3>
                  <p className="text-amber-700 text-xs mt-1">
                      Niektoré funkcie môžu byť obmedzené. Administrátor čoskoro skontroluje vaše údaje.
                      Uistite sa, že máte vyplnený profil v sekcii Nastavenia.
                  </p>
              </div>
          </div>
      ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" />
              <div>
                  <h3 className="text-green-800 font-bold text-sm">Váš profil je overený</h3>
                  <p className="text-green-700 text-xs mt-0.5">Máte plný prístup ku všetkým funkciám.</p>
              </div>
          </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vitajte späť! 👋</h2>
        <p className="text-gray-500">Tu je prehľad toho, čo sa deje vo vašom útulku.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => onNavigate('pets')} className="cursor-pointer">
             <StatCard 
                label="Aktívne zvieratá" 
                value={activePets} 
                icon={Dog} 
                color={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
                subtext="Na adopciu"
             />
        </div>
        <div onClick={() => onNavigate('inquiries')} className="cursor-pointer">
            <StatCard 
                label="Nové správy" 
                value={newInquiries} 
                icon={MessageSquare} 
                color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} 
                subtext="Čakajú na odpoveď"
            />
        </div>
        <div>
            <StatCard 
                label="Úspešné adopcie" 
                value={adoptedPets} 
                icon={CheckCircle} 
                color={{ bg: 'bg-green-50', text: 'text-green-600' }}
                subtext="Celkovo"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900">Aktivita za posledných 7 dní</h3>
                  <div className="flex gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1 text-orange-600"><span className="w-2 h-2 rounded-full bg-orange-600"></span> Dopyty</span>
                      <span className="flex items-center gap-1 text-blue-500"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Nové zvieratá</span>
                  </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="inquiries" name="Dopyty" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorInq)" />
                        <Area type="monotone" dataKey="newPets" name="Nové zvieratá" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPet)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Recent List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Nedávne dopyty</h3>
              <div className="space-y-4">
                  {inquiries.slice(0, 4).map(inq => (
                      <div key={inq.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer" onClick={() => onNavigate('inquiries')}>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {inq.applicantName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{inq.applicantName}</p>
                              <p className="text-xs text-gray-500 truncate">Záujem o: <span className="text-brand-600 font-medium">{inq.petName}</span></p>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(inq.date).toLocaleDateString()}</span>
                      </div>
                  ))}
                  {inquiries.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Žiadne nové správy.</p>}
              </div>
              <button onClick={() => onNavigate('inquiries')} className="w-full mt-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition flex items-center justify-center gap-1">
                  Zobraziť všetky <ArrowUpRight size={16}/>
              </button>
          </div>
      </div>
    </div>
  );
};

const PetsSection = ({ onAdd, onEdit, pets, onDelete }: { onAdd: () => void, onEdit: (p: Pet) => void, pets: Pet[], onDelete: (p: Pet) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useApp();

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || pet.adoptionStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = async (e: React.MouseEvent, pet: Pet) => {
      e.stopPropagation();
      e.preventDefault();
      // Show custom UI toast instead of window.confirm if possible, or keep simple confirm
      if (window.confirm(`Naozaj chcete vymazať profil ${pet.name}?`)) {
          setDeletingId(pet.id);
          try {
            await onDelete(pet);
            showToast(`Profil ${pet.name} bol úspešne vymazaný.`, 'success');
          } catch (e: any) {
            showToast(e.message || "Nepodarilo sa vymazať zviera.", 'error');
          } finally {
            setDeletingId(null);
          }
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
               <h2 className="text-2xl font-bold text-gray-900">Správa zvierat</h2>
               <p className="text-gray-500 text-sm">Spravujte profily vašich zverencov.</p>
           </div>
           <button onClick={onAdd} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 transition flex items-center gap-2 font-bold shadow-lg shadow-brand-200">
            <Plus size={20} /> Pridať zviera
          </button>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         {/* Filters Toolbar */}
         <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Hľadať podľa mena..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>
            <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none"
                >
                    <option value="All">Všetky statusy</option>
                    <option value="Available">Na adopciu</option>
                    <option value="Reserved">Rezervované</option>
                    <option value="Adopted">Adoptované</option>
                </select>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                <tr>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Zviera</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Detaily</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Viditeľnosť</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Akcia</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {filteredPets.map(pet => (
                <tr key={pet.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <img src={pet.imageUrl} alt={pet.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                        <div>
                        <div className="font-bold text-gray-900 text-base">{pet.name}</div>
                        <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block">{pet.breed}</div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {pet.age} {pet.age === 1 ? 'rok' : 'rokov'}</span>
                            <span className="flex items-center gap-1"><Users size={12}/> {pet.gender}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        pet.adoptionStatus === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                        pet.adoptionStatus === 'Reserved' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                        {pet.adoptionStatus === 'Available' ? 'Na adopciu' : 
                        pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                    </span>
                    </td>
                    <td className="px-6 py-4">
                    {pet.isVisible 
                        ? <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold"><Eye size={14}/> Verejný</div> 
                        : <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold"><EyeOff size={14}/> Skrytý</div>
                    }
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                             <div 
                                onClick={() => onEdit(pet)} 
                                className="text-gray-400 hover:text-brand-600 p-2 hover:bg-brand-50 rounded-lg transition cursor-pointer" 
                                title="Upraviť"
                             >
                                <Pencil size={18} />
                            </div>
                            <div 
                                onClick={(e) => handleDeleteClick(e, pet)} 
                                className={`text-gray-400 p-2 rounded-lg transition cursor-pointer flex items-center justify-center ${deletingId === pet.id ? 'cursor-not-allowed opacity-50' : 'hover:text-red-600 hover:bg-red-50'}`}
                                title="Vymazať"
                            >
                                {deletingId === pet.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            </div>
                        </div>
                    </td>
                </tr>
                ))}
                {filteredPets.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">Nenašli sa žiadne zvieratá.</td>
                    </tr>
                )}
            </tbody>
            </table>
         </div>
       </div>
    </div>
  );
};

const InquiriesSection = ({ inquiries, updateStatus }: { inquiries: AdoptionInquiry[], updateStatus: any }) => {
  const [selectedInquiry, setSelectedInquiry] = useState<AdoptionInquiry | null>(null);
  const { currentUser } = useAuth();
  const { pets } = usePets();

  // Find the pet associated with the inquiry to show image
  const inquiryPet = selectedInquiry ? pets.find(p => p.id === selectedInquiry.petId) : null;

  // Determine status color and icon
  const getStatusVisuals = (status: string) => {
      switch(status) {
          case 'Schválená': return { color: 'bg-green-500', icon: CheckCircle, label: 'Schválená', text: 'Adopcia bola schválená.' };
          case 'Zamietnutá': return { color: 'bg-red-500', icon: XCircle, label: 'Zamietnutá', text: 'Adopcia bola zamietnutá.' };
          case 'Kontaktovaný': return { color: 'bg-blue-500', icon: MessageSquare, label: 'V riešení', text: 'Komunikácia prebieha.' };
          default: return { color: 'bg-brand-600', icon: AlertCircle, label: 'Nová žiadosť', text: 'Vyžaduje vašu pozornosť.' };
      }
  };

  // Wrapper to update both global and local state instantly
  const handleStatusChange = async (id: string, newStatus: string) => {
      await updateStatus(id, newStatus);
      if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
  };

  const InfoTag = ({ icon: Icon, text, subtext }: { icon: any, text: string, subtext?: string }) => (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-brand-500"><Icon size={20} /></div>
          <div>
              <div className="text-sm font-bold text-gray-800">{text}</div>
              {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
          </div>
      </div>
  );

  // DETAIL VIEW
  if (selectedInquiry) {
      const statusVis = getStatusVisuals(selectedInquiry.status);
      const StatusIcon = statusVis.icon;
      const applicant = selectedInquiry.applicantDetails;

      return (
          <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition"
                  >
                      <ArrowLeft size={20} />
                  </button>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-900">Detail dopytu: {selectedInquiry.applicantName}</h2>
                      <p className="text-gray-500 text-sm">Riešenie adopcie pre {selectedInquiry.petName}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                  {/* Left Column: Info & Actions */}
                  <div className="lg:col-span-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                      
                      {/* Pet Context Card */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                              <Dog className="text-brand-600" size={20} /> Zviera
                          </h3>
                          <div className="flex items-center gap-4">
                              {inquiryPet?.imageUrl && (
                                  <img 
                                    src={inquiryPet.imageUrl} 
                                    alt={inquiryPet.name} 
                                    className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                                  />
                              )}
                              <div>
                                  <div className="font-bold text-gray-900 text-lg">{selectedInquiry.petName}</div>
                                  {inquiryPet && <div className="text-xs text-gray-500">{inquiryPet.breed}</div>}
                              </div>
                          </div>
                      </div>

                      {/* Applicant Card */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                              <User className="text-brand-600" size={20} /> Záujemca
                          </h3>
                          <div className="space-y-3">
                              <div>
                                  <div className="text-xs text-gray-400 font-bold uppercase">Meno</div>
                                  <div className="font-medium text-gray-900">{selectedInquiry.applicantName}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 font-bold uppercase">Kontakt</div>
                                  <div className="flex items-center gap-2 mt-1">
                                      <Mail size={14} className="text-gray-400"/> 
                                      <a href={`mailto:${selectedInquiry.email}`} className="text-sm truncate hover:text-brand-600">{selectedInquiry.email}</a>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                      <Phone size={14} className="text-gray-400"/> 
                                      <a href={`tel:${selectedInquiry.phone}`} className="text-sm hover:text-brand-600">{selectedInquiry.phone || 'Neuvedený'}</a>
                                  </div>
                              </div>
                              {applicant?.location && (
                                  <div>
                                      <div className="text-xs text-gray-400 font-bold uppercase">Lokalita</div>
                                      <div className="flex items-center gap-2 mt-1">
                                          <MapPin size={14} className="text-gray-400"/>
                                          <span className="text-sm text-gray-900">{applicant.location}</span>
                                      </div>
                                  </div>
                              )}
                              <div>
                                  <div className="text-xs text-gray-400 font-bold uppercase">Dátum dopytu</div>
                                  <div className="text-sm text-gray-600">{new Date(selectedInquiry.date).toLocaleDateString('sk-SK')}</div>
                              </div>
                          </div>
                      </div>

                      {/* User Household/Details Card - NEW */}
                      {applicant?.household && (
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                              <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                  <Home className="text-brand-600" size={20} /> Profil domácnosti
                              </h3>
                              <div className="space-y-3">
                                  <InfoTag icon={Home} text={applicant.household.housingType || 'Neuvedené'} subtext="Typ bývania" />
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                      <InfoTag 
                                          icon={Users} 
                                          text={applicant.household.hasChildren ? 'Má deti' : 'Bez detí'} 
                                      />
                                      <InfoTag 
                                          icon={Dog} 
                                          text={applicant.household.hasOtherPets ? 'Má zvieratá' : 'Bez zvierat'} 
                                      />
                                  </div>

                                  <InfoTag icon={Award} text={applicant.household.experienceLevel || 'Neuvedené'} subtext="Skúsenosti" />
                                  <InfoTag icon={Briefcase} text={applicant.household.workMode || 'Neuvedené'} subtext="Pracovný režim" />
                                  
                                  {applicant.availability && (
                                      <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500 italic">
                                          "Dostupnosť: {applicant.availability}"
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}

                      {/* Action Card */}
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky bottom-2">
                          
                          {/* Status Header */}
                          <div className={`${statusVis.color} p-4 text-white flex items-center gap-3`}>
                              <div className="p-2 bg-white/20 rounded-full">
                                  <StatusIcon size={20} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-sm uppercase tracking-wide">{statusVis.label}</h3>
                                  <p className="text-xs text-white/90">{statusVis.text}</p>
                              </div>
                          </div>

                          <div className="p-5 space-y-5">
                              {/* 1. Initial Step: Mark as Contacted */}
                              {selectedInquiry.status === 'Nová' && (
                                  <div>
                                      <button 
                                          onClick={() => handleStatusChange(selectedInquiry.id, 'Kontaktovaný')}
                                          className="w-full bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                      >
                                          <MessageSquare size={18} /> Označiť ako kontaktovaný
                                      </button>
                                      <p className="text-xs text-gray-400 text-center mt-2">Potvrdzujete, že ste si prečítali správu.</p>
                                  </div>
                              )}

                              {/* 2. Decision Step: Visible if contacted or new */}
                              {(selectedInquiry.status === 'Nová' || selectedInquiry.status === 'Kontaktovaný') && (
                                  <div>
                                      <div className="flex items-center gap-2 mb-3">
                                          <div className="h-px bg-gray-100 flex-1"></div>
                                          <span className="text-xs font-bold text-gray-400 uppercase">Finálny verdikt</span>
                                          <div className="h-px bg-gray-100 flex-1"></div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                          <button 
                                              onClick={() => handleStatusChange(selectedInquiry.id, 'Schválená')}
                                              className="py-3 rounded-xl font-bold transition flex flex-col items-center justify-center gap-1 bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200"
                                          >
                                              <Check size={20}/>
                                              <span className="text-xs">Schváliť</span>
                                          </button>
                                          <button 
                                              onClick={() => handleStatusChange(selectedInquiry.id, 'Zamietnutá')}
                                              className="py-3 rounded-xl font-bold transition flex flex-col items-center justify-center gap-1 bg-white text-red-600 border border-red-200 hover:bg-red-50"
                                          >
                                              <X size={20}/>
                                              <span className="text-xs">Zamietnuť</span>
                                          </button>
                                      </div>
                                  </div>
                              )}

                              {/* 3. Revert Step: Visible if finished */}
                              {(selectedInquiry.status === 'Schválená' || selectedInquiry.status === 'Zamietnutá') && (
                                  <button 
                                      onClick={() => handleStatusChange(selectedInquiry.id, 'Kontaktovaný')}
                                      className="w-full text-xs text-gray-400 hover:text-gray-600 underline text-center"
                                  >
                                      Zmeniť rozhodnutie (vrátiť do riešenia)
                                  </button>
                              )}
                          </div>
                      </div>

                  </div>

                  {/* Right Column: Chat */}
                  <div className="lg:col-span-2 flex flex-col h-[600px] lg:h-auto">
                      <ChatWindow 
                        inquiryId={selectedInquiry.id} 
                        currentUser={currentUser} 
                        className="h-full shadow-sm border-gray-200"
                        initialMessage={{
                            content: selectedInquiry.message,
                            date: selectedInquiry.date,
                            // We don't have senderId here easily for the bubble alignment logic,
                            // but since we are Shelter, any ID != currentUser.id (Shelter ID) will appear on the left.
                            // 'applicant' string is safe.
                            senderId: 'applicant'
                        }}
                      />
                  </div>
              </div>
          </div>
      );
  }

  // LIST VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Adopčné dopyty</h2>
            <p className="text-gray-500 text-sm">Spravujte správy od záujemcov.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Dátum</th>
                            <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Záujemca</th>
                            <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">O koho má záujem?</th>
                            <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Správa</th>
                            <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Status</th>
                            <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Akcia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inquiries.map(inq => (
                            <tr 
                                key={inq.id} 
                                onClick={() => setSelectedInquiry(inq)}
                                className="hover:bg-gray-50 transition cursor-pointer group"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                                    {new Date(inq.date).toLocaleDateString('sk-SK')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 group-hover:text-brand-600 transition">{inq.applicantName}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={10}/> {inq.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">{inq.petName}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs">
                                    <p className="truncate" title={inq.message}>{inq.message}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                        inq.status === 'Nová' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        inq.status === 'Schválená' ? 'bg-green-50 text-green-700 border-green-200' :
                                        inq.status === 'Zamietnutá' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}>
                                        {inq.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 group-hover:text-brand-600 transition">
                                        <ArrowUpRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {inquiries.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-20"/>
                                    <p>Zatiaľ žiadne dopyty na adopciu.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}

const ShelterProfileForm = ({ shelter }: { shelter: Shelter }) => {
    const { updateUserProfile } = useAuth();
    const { showToast } = useApp();
    const [formData, setFormData] = useState<Shelter>({ ...shelter });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync formData with shelter prop when it changes (e.g., after context update)
    useEffect(() => {
        setFormData({ ...shelter });
    }, [shelter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socials: {
                ...prev.socials,
                [name]: value
            }
        }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(formData);
            showToast('Profil útulku bol úspešne aktualizovaný.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Nepodarilo sa aktualizovať profil.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profil útulku</h2>
                    <p className="text-gray-500 text-sm">Upravte informácie, ktoré vidia návštevníci.</p>
                </div>
                <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Uložiť zmeny
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group-hover:border-brand-200 transition">
                                {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2"/> : <Building2 className="text-gray-300" size={48}/>}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold text-xs backdrop-blur-sm">
                                <Camera size={24} className="mb-1"/>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </div>
                        <p className="text-xs text-gray-400 text-center max-w-[140px]">
                            Odporúčame štvorcové logo (PNG/JPG), min. 500x500px.
                        </p>
                    </div>
                    
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-gray-700 mb-2">Názov útulku</label>
                             <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="email" type="text" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Telefón</label>
                             <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+421..." />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Lokalita (Mesto/Obec)</label>
                             <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="location" type="text" value={formData.location} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Adresa pre doručovanie (Materiálna pomoc)</label>
                             <div className="relative">
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="shippingAddress" type="text" value={formData.shippingAddress || ''} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ulica, Číslo, PSČ, Mesto" />
                             </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                         <label className="block text-sm font-bold text-gray-700 mb-2">O nás</label>
                         <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 h-32 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Napíšte príbeh vášho útulku..." />
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Otváracie hodiny</label>
                         <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input name="openingHours" type="text" value={formData.openingHours || ''} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Po-Pia: 10:00 - 17:00" />
                         </div>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Bankový účet (IBAN)</label>
                         <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input name="bankAccount" type="text" value={formData.bankAccount || ''} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="SK..." />
                         </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sociálne siete & Web</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Facebook</label>
                             <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="facebook" type="text" value={formData.socials?.facebook || ''} onChange={handleSocialChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="URL profilu" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Instagram</label>
                             <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="instagram" type="text" value={formData.socials?.instagram || ''} onChange={handleSocialChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="URL profilu" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Webstránka</label>
                             <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input name="website" type="text" value={formData.socials?.website || ''} onChange={handleSocialChange} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="www.utulok.sk" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VolunteersSection = ({ shelterId }: { shelterId: string }) => {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        loadVolunteers();
    }, [shelterId]);

    const loadVolunteers = async () => {
        try {
            const data = await api.getVolunteers(shelterId);
            setVolunteers(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await api.addVolunteer(shelterId, { name: newName, email: newEmail, role: newRole, status: 'Aktívny' });
            setVolunteers([added, ...volunteers]);
            setNewName(''); setNewEmail(''); setNewRole('');
        } catch (e) { alert("Chyba pri pridávaní"); }
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Naozaj vymazať?")) return;
        try {
            await api.deleteVolunteer(id);
            setVolunteers(prev => prev.filter(v => v.id !== id));
        } catch(e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">Dobrovoľníci</h2>
                <p className="text-gray-500 text-sm">Tím ľudí, ktorí vám pomáhajú.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Plus className="text-brand-600"/> Pridať člena</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input required placeholder="Meno" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition"/>
                            <input required placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition"/>
                            <input required placeholder="Rola (napr. Venčenie)" value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition"/>
                            <button type="submit" className="w-full bg-brand-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200">Pridať do tímu</button>
                        </form>
                    </div>
                </div>
                
                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Meno</th>
                                        <th className="px-6 py-4 font-bold">Rola</th>
                                        <th className="px-6 py-4 font-bold">Kontakt</th>
                                        <th className="px-6 py-4 text-right">Akcia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {volunteers.map(v => (
                                        <tr key={v.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-bold text-gray-900">{v.name}</td>
                                            <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">{v.role}</span></td>
                                            <td className="px-6 py-4 text-gray-500">{v.email}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && volunteers.length === 0 && (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">Zoznam je prázdny.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SuppliesSection = ({ shelterId }: { shelterId: string }) => {
    const [supplies, setSupplies] = useState<ShelterSupply[]>([]);
    const [newItem, setNewItem] = useState('');
    const [newPriority, setNewPriority] = useState('Stredná');
    const [newLink, setNewLink] = useState('');

    useEffect(() => {
        const load = async () => {
             const data = await api.getSupplies(shelterId);
             setSupplies(data);
        };
        load();
    }, [shelterId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await api.addSupply(shelterId, { item: newItem, priority: newPriority as any, link: newLink });
            setSupplies([added, ...supplies]);
            setNewItem('');
            setNewLink('');
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteSupply(id);
            setSupplies(prev => prev.filter(s => s.id !== id));
        } catch(e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Materiálna pomoc</h2>
                <p className="text-gray-500 text-sm">Zoznam vecí, ktoré aktuálne potrebujete. Viditeľné verejne.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex gap-4">
                            <input required placeholder="Položka (napr. Granule pre šteňatá)" value={newItem} onChange={e => setNewItem(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"/>
                            <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="w-40 px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm cursor-pointer">
                                <option value="Nízka">Nízka priorita</option>
                                <option value="Stredná">Stredná priorita</option>
                                <option value="Vysoká">Vysoká priorita</option>
                            </select>
                        </div>
                        <div className="flex-1 flex gap-4">
                            <div className="flex-1 relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input placeholder="Link na e-shop (voliteľné)" value={newLink} onChange={e => setNewLink(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"/>
                            </div>
                            <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 shadow-md whitespace-nowrap">Pridať</button>
                        </div>
                    </form>
                </div>
                <ul className="divide-y divide-gray-100">
                    {supplies.map(s => (
                        <li key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${s.priority === 'Vysoká' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : s.priority === 'Stredná' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                <div>
                                    <span className="font-bold text-gray-900">{s.item}</span>
                                    {s.link && (
                                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-brand-600 hover:underline flex inline-flex items-center gap-1">
                                            <LinkIcon size={12} /> {new URL(s.link).hostname}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${s.priority === 'Vysoká' ? 'bg-red-50 text-red-600' : s.priority === 'Stredná' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-700'}`}>
                                    {s.priority}
                                </span>
                                <button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-500 transition"><X size={20}/></button>
                            </div>
                        </li>
                    ))}
                    {supplies.length === 0 && <li className="p-12 text-center text-gray-400">Zoznam potrieb je prázdny.</li>}
                </ul>
            </div>
        </div>
    );
};

// --- Analytics Section ---
const AnalyticsSection = ({ pets, inquiries, shelter }: { pets: Pet[], inquiries: AdoptionInquiry[], shelter: Shelter }) => {
    // Dynamic Analytics
    const totalViews = shelter.stats?.views || 0; 
    const adoptionRate = pets.length > 0 ? Math.round((pets.filter(p => p.adoptionStatus === 'Adopted').length / pets.length) * 100) : 0;
    
    // Sort pets by inquiry count (most popular first)
    const sortedPets = [...pets].sort((a, b) => {
        const inqA = inquiries.filter(i => i.petId === a.id).length;
        const inqB = inquiries.filter(i => i.petId === b.id).length;
        return inqB - inqA;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytika</h2>
                <p className="text-gray-500 text-sm">Dáta o vašej úspešnosti a výkone inzerátov.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard label="Zobrazenia profilov" value={totalViews} icon={Eye} color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} />
                 <StatCard label="Miera adopcie" value={`${adoptionRate}%`} icon={ArrowUpRight} color={{ bg: 'bg-green-50', text: 'text-green-600' }} />
                 <StatCard label="Virtuálna podpora" value="0 €" icon={Gift} color={{ bg: 'bg-pink-50', text: 'text-pink-600' }} subtext="Tento mesiac"/>
                 <StatCard label="Inzerované zvieratá" value={pets.length} icon={Dog} color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp size={20} className="text-brand-600" />
                        Výkonnosť inzerátov
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Zviera</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Dátum pridania</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Zobrazenia</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Počet žiadostí</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Miera záujmu (CTR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedPets.map(pet => {
                                const inquiryCount = inquiries.filter(i => i.petId === pet.id).length;
                                // Use REAL views from DB (previously mocked)
                                const views = pet.views || 0;
                                const conversionRate = views > 0 ? ((inquiryCount / views) * 100).toFixed(1) : '0.0';

                                return (
                                    <tr key={pet.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={pet.imageUrl} alt={pet.name} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                                                <div className="font-bold text-gray-900">{pet.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(pet.postedDate).toLocaleDateString('sk-SK')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                pet.adoptionStatus === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                                                pet.adoptionStatus === 'Reserved' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                {pet.adoptionStatus === 'Available' ? 'Na adopciu' : 
                                                pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 flex items-center gap-1.5">
                                            <Eye size={14} className="text-gray-400" /> {views}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <MessageSquare size={14} className="text-blue-500" />
                                                <span className="font-bold text-gray-900">{inquiryCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-gray-600">
                                                <MousePointerClick size={14} className="text-brand-600" />
                                                <span className="font-bold">{conversionRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedPets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">Žiadne dáta k dispozícii.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const ShelterDashboard: React.FC = () => {
  const { pets, updatePet, addPet, deletePet } = usePets();
  const { inquiries, updateInquiryStatus } = useApp(); 
  const { currentUser, userRole, logout } = useAuth(); 
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  
  // Mobile Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || userRole !== 'shelter') {
      navigate('/auth');
    }
  }, [currentUser, userRole, navigate]);

  if (!currentUser || userRole !== 'shelter') return null;
  const currentShelter = currentUser as Shelter;
  const myPets = pets.filter(p => p.shelterId === currentShelter.id);
  const myInquiries = inquiries.filter(i => i.shelterId === currentShelter.id);

  const openAddModal = () => {
    setEditingPet(null);
    setShowModal(true);
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setShowModal(true);
  };

  const handleDelete = async (pet: Pet) => {
    await deletePet(pet.id);
  };

  const handleSavePet = async (petData: Pet) => {
    if (editingPet) {
        await updatePet(petData);
    } else {
        await addPet(petData);
    }
    setShowModal(false);
  };

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition duration-200 ${
        activeTab === id ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'text-brand-600' : 'text-gray-400'} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                  <LayoutDashboard size={18} />
              </div>
              <span className="font-bold text-gray-900">Dashboard</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
          </button>
      </div>

      {/* Overlay for Mobile */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
      )}

      {/* Sidebar - Responsive */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 md:pb-8 flex items-center justify-between md:justify-start gap-3">
           <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                  <LayoutDashboard size={20} />
               </div>
               <div>
                   <h2 className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">Dashboard</h2>
                   <p className="text-xs text-gray-500 font-medium truncate max-w-[120px]">{currentShelter.name}</p>
               </div>
           </div>
           <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
               <X size={24} />
           </button>
        </div>
        
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <SidebarItem id="overview" icon={LayoutDashboard} label="Prehľad" />
          <SidebarItem id="pets" icon={Dog} label="Moje zvieratá" />
          <SidebarItem id="inquiries" icon={MessageSquare} label="Dopyty" />
          <SidebarItem id="supplies" icon={Gift} label="Materiálna pomoc" />
          <SidebarItem id="volunteers" icon={Users} label="Dobrovoľníci" />
          <SidebarItem id="analytics" icon={ChartIcon} label="Analytika" />
          <SidebarItem id="profile" icon={Building} label="Profil" />
        </nav>
        
        <div className="p-4 border-t border-gray-100">
             <button 
                onClick={logout} 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition duration-200"
              >
                 <LogOut size={20} /> Odhlásiť sa
              </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
         <div className="max-w-7xl mx-auto h-full">
             {activeTab === 'overview' && <OverviewSection onNavigate={setActiveTab} pets={myPets} inquiries={myInquiries} shelter={currentShelter} />}
             {activeTab === 'pets' && <PetsSection onAdd={openAddModal} onEdit={openEditModal} pets={myPets} onDelete={handleDelete} />}
             {activeTab === 'inquiries' && <InquiriesSection inquiries={myInquiries} updateStatus={updateInquiryStatus} />}
             {activeTab === 'profile' && <ShelterProfileForm shelter={currentShelter} />}
             {activeTab === 'volunteers' && <VolunteersSection shelterId={currentShelter.id} />}
             {activeTab === 'supplies' && <SuppliesSection shelterId={currentShelter.id} />}
             {activeTab === 'analytics' && <AnalyticsSection pets={myPets} inquiries={myInquiries} shelter={currentShelter} />}
         </div>
      </main>

      <PetFormModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        pet={editingPet}
        shelterId={currentShelter.id}
        onSave={handleSavePet}
        defaultLocation={currentShelter.location}
      />
    </div>
  );
};

export default ShelterDashboard;
