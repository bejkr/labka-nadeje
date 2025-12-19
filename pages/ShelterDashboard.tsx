
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  Plus, LayoutDashboard, Dog, MessageSquare, Building, Gift, 
  BarChart as ChartIcon, Search, Trash2, CheckCircle, XCircle, 
  Upload, X, Sparkles, Pencil, Eye, EyeOff, LogOut, Users,
  Calendar, MapPin, Mail, Phone, ArrowUpRight, Filter, Building2, Camera, Save, Clock, CreditCard, Loader2,
  Facebook, Instagram, Globe, TrendingUp, MousePointerClick, Menu, Link as LinkIcon, Truck, AlertTriangle, ArrowLeft, Quote, User, Check, AlertCircle, Home, Briefcase, Award, PieChart as PieChartIcon, TrendingDown, DollarSign, Heart, Baby, ShieldCheck
} from 'lucide-react';
import { Pet, PetType, AdoptionInquiry, Volunteer, ShelterSupply, Gender, Size, Shelter } from '../types';
import { usePets } from '../contexts/PetContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext'; 
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PetFormModal from '../components/PetFormModal';
import ChatWindow from '../components/ChatWindow';
import ConfirmationModal from '../components/ConfirmationModal';

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

  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const inquiriesCount = inquiries.filter(inq => 
            inq.date && typeof inq.date === 'string' && inq.date.startsWith(dateStr)
        ).length;

        const newPetsCount = pets.filter(pet => 
            pet.postedDate && typeof pet.postedDate === 'string' && pet.postedDate.startsWith(dateStr)
        ).length;

        days.push({
            name: date.toLocaleDateString('sk-SK', { weekday: 'short' }),
            inquiries: inquiriesCount,
            newPets: newPetsCount
        });
    }
    return days;
  }, [inquiries, pets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {!shelter.isVerified ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                  <h3 className="text-amber-800 font-bold text-sm">Váš profil čaká na overenie</h3>
                  <p className="text-amber-700 text-xs mt-1">
                      Niektoré funkcie môžu byť obmedzené. Administrátor čoskoro skontroluje vaše údaje.
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
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900">Aktivita za posledných 7 dní</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="inquiries" name="Dopyty" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorInq)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Nedávne dopyty</h3>
              <div className="space-y-4">
                  {inquiries.slice(0, 4).map(inq => (
                      <div key={inq.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer" onClick={() => onNavigate('inquiries')}>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {inq.applicantName ? inq.applicantName.charAt(0) : '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{inq.applicantName}</p>
                              <p className="text-xs text-gray-500 truncate">Záujem o: <span className="text-brand-600 font-medium">{inq.petName}</span></p>
                          </div>
                          <span className="text-xs text-gray-400">{inq.date ? new Date(inq.date).toLocaleDateString() : ''}</span>
                      </div>
                  ))}
                  {inquiries.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Žiadne nové správy.</p>}
              </div>
          </div>
      </div>
    </div>
  );
};

const PetsSection = ({ onAdd, onEdit, pets, onDelete }: { onAdd: () => void, onEdit: (p: Pet) => void, pets: Pet[], onDelete: (id: string) => Promise<void> }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useApp();

  const filteredPets = pets.filter(pet => {
    return pet.name && pet.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const confirmDelete = async () => {
    if (!petToDelete) return;
    setIsDeleting(true);
    try {
        await onDelete(petToDelete.id);
        showToast(`Profil ${petToDelete.name} bol úspešne vymazaný.`, 'success');
        setPetToDelete(null);
    } catch (e: any) {
        showToast(e.message || "Nepodarilo sa vymazať zviera.", 'error');
    } finally {
        setIsDeleting(false);
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
         <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Hľadať podľa mena..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                />
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
                             >
                                <Pencil size={18} />
                            </div>
                            <div 
                                onClick={() => setPetToDelete(pet)} 
                                className="text-gray-400 p-2 rounded-lg transition cursor-pointer flex items-center justify-center hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={18} />
                            </div>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
         </div>
       </div>

       <ConfirmationModal 
          isOpen={!!petToDelete}
          onClose={() => setPetToDelete(null)}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Vymazať inzerát?"
          message={`Naozaj chcete natrvalo vymazať profil ${petToDelete?.name}?`}
          confirmText="Vymazať profil"
       />
    </div>
  );
};

const InquiriesSection = ({ inquiries, updateStatus, shelter }: { inquiries: AdoptionInquiry[], updateStatus: any, shelter: Shelter }) => {
  const [selectedInquiry, setSelectedInquiry] = useState<AdoptionInquiry | null>(null);
  const { currentUser } = useAuth();
  const { pets } = usePets();
  const { showToast } = useApp();

  const inquiryPet = selectedInquiry ? pets.find(p => p.id === selectedInquiry.petId) : null;
  const applicant = selectedInquiry?.applicantDetails;

  const handleAction = async (status: 'Schválená' | 'Zamietnutá') => {
      if (!selectedInquiry) return;
      try {
          await updateStatus(selectedInquiry.id, status);
          setSelectedInquiry({ ...selectedInquiry, status });
          showToast(`Žiadosť bola ${status.toLowerCase()}.`, 'success');
      } catch (e) {
          showToast("Chyba pri aktualizácii statusu.", "error");
      }
  };

  if (selectedInquiry) {
      return (
          <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col pb-10">
              <div className="flex items-center gap-4 mb-6">
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition"
                  >
                      <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">Detail dopytu: {selectedInquiry.applicantName}</h2>
                    <p className="text-sm text-gray-500">Zaslané: {new Date(selectedInquiry.date).toLocaleDateString('sk-SK')}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                  {/* Candidate Profile - Left Column (5/12) */}
                  <div className="lg:col-span-5 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                      {/* Pet Context */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                  <img src={inquiryPet?.imageUrl} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Záujem o zvieratko</div>
                                  <div className="font-extrabold text-gray-900 text-xl">{selectedInquiry.petName}</div>
                              </div>
                          </div>
                      </div>

                      {/* Applicant Contact */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><User size={20} className="text-brand-500"/> Kontaktné údaje</h3>
                          <div className="grid grid-cols-1 gap-4">
                              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                                  <Mail size={16} className="text-gray-400" />
                                  <span className="text-sm font-bold text-gray-700">{selectedInquiry.email}</span>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                                  <Phone size={16} className="text-gray-400" />
                                  <span className="text-sm font-bold text-gray-700">{selectedInquiry.phone || 'Neuvedený'}</span>
                              </div>
                              {applicant?.location && (
                                  <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                                      <MapPin size={16} className="text-gray-400" />
                                      <span className="text-sm font-bold text-gray-700">{applicant.location}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Household & Experience Details */}
                      {applicant?.household && (
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                              <div>
                                  <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Home size={20} className="text-brand-500"/> Domácnosť a bývanie</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                          <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Typ bývania</div>
                                          <div className="text-sm font-black text-gray-800">{applicant.household.housingType}</div>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                          <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Práca</div>
                                          <div className="text-sm font-black text-gray-800">{applicant.household.workMode}</div>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                              <Baby size={16} className="text-pink-500" />
                                              <span className="text-xs font-bold text-gray-600">Deti</span>
                                          </div>
                                          <span className="text-xs font-black">{applicant.household.hasChildren ? 'Áno' : 'Nie'}</span>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                              <Dog size={16} className="text-blue-500" />
                                              <span className="text-xs font-bold text-gray-600">Iné zvery</span>
                                          </div>
                                          <span className="text-xs font-black">{applicant.household.hasOtherPets ? 'Áno' : 'Nie'}</span>
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Award size={20} className="text-brand-500"/> Skúsenosti</h3>
                                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                      <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Úroveň kynológa</div>
                                      <div className="text-sm font-black text-blue-900">{applicant.household.experienceLevel}</div>
                                  </div>
                              </div>

                              {applicant.availability && (
                                  <div>
                                      <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Clock size={20} className="text-brand-500"/> Čas a dostupnosť</h3>
                                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{applicant.availability}</p>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* BIO / Message Summary */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Quote size={20} className="text-brand-500"/> O kandidátovi</h3>
                          <div className="prose prose-sm text-gray-600 italic">
                              "{applicant?.bio || selectedInquiry.message}"
                          </div>
                      </div>

                      {/* ACTION BUTTONS (DECISION) */}
                      {selectedInquiry.status !== 'Schválená' && selectedInquiry.status !== 'Zamietnutá' ? (
                          <div className="bg-gray-900 p-6 rounded-3xl shadow-xl space-y-3">
                              <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-green-500"/> Rozhodnutie útulku</h4>
                              <button 
                                onClick={() => handleAction('Schválená')}
                                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                              >
                                  <CheckCircle size={20} /> Schváliť adopciu
                              </button>
                              <button 
                                onClick={() => handleAction('Zamietnutá')}
                                className="w-full bg-white/10 text-white py-3.5 rounded-xl font-bold hover:bg-white/20 transition border border-white/10 flex items-center justify-center gap-2"
                              >
                                  <XCircle size={20} /> Zamietnuť žiadosť
                              </button>
                              <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest mt-4">
                                Schválenie označí zvieratko ako rezervované
                              </p>
                          </div>
                      ) : (
                          <div className={`p-6 rounded-3xl border text-center ${selectedInquiry.status === 'Schválená' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                              <div className="text-xs font-black uppercase tracking-widest mb-1">Status žiadosti</div>
                              <div className="text-xl font-black">{selectedInquiry.status.toUpperCase()}</div>
                          </div>
                      )}
                  </div>

                  {/* Chat - Right Column (7/12) */}
                  <div className="lg:col-span-7 flex flex-col h-[700px] lg:h-auto">
                      <ChatWindow 
                        inquiryId={selectedInquiry.id} 
                        currentUser={currentUser} 
                        myAvatarUrl={shelter.logoUrl}
                        otherAvatarUrl={selectedInquiry.applicantDetails?.avatarUrl}
                        className="h-full shadow-sm border-gray-100"
                        initialMessage={{ content: selectedInquiry.message, date: selectedInquiry.date, senderId: selectedInquiry.applicantId }}
                      />
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div><h2 className="text-2xl font-bold text-gray-900">Adopčné dopyty</h2></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-bold">Dátum</th>
                            <th className="px-6 py-4 font-bold">Záujemca</th>
                            <th className="px-6 py-4 font-bold">Zviera</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 text-right">Akcia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inquiries.map(inq => (
                            <tr key={inq.id} onClick={() => setSelectedInquiry(inq)} className="hover:bg-gray-50 transition cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{inq.date ? new Date(inq.date).toLocaleDateString('sk-SK') : ''}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{inq.applicantName}</td>
                                <td className="px-6 py-4"><span className="text-brand-600 font-bold">{inq.petName}</span></td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                        inq.status === 'Nová' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                        inq.status === 'Schválená' ? 'bg-green-50 text-green-700 border-green-200' :
                                        inq.status === 'Zamietnutá' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}>{inq.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right"><ArrowUpRight size={20} className="text-gray-300 group-hover:text-brand-600 inline" /></td>
                            </tr>
                        ))}
                        {inquiries.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Zatiaľ ste nedostali žiadne dopyty.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}

const AnalyticsSection = ({ pets, inquiries, virtualParents }: { pets: Pet[], inquiries: AdoptionInquiry[], shelter: Shelter, virtualParents: number }) => {
    
    // LIVE VÝPOČET: Sčítame videnia zo všetkých zvierat pre reálny celkový dosah
    const totalViews = useMemo(() => pets.reduce((sum, pet) => sum + (pet.views || 0), 0), [pets]);
    const totalInquiries = inquiries.length;
    
    // Konverzia: pomer dopytov k celkovým videniam inzerátov
    const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0';
    
    const adoptedCount = pets.filter(p => p.adoptionStatus === 'Adopted').length;
    const adoptionRate = pets.length > 0 ? Math.round((adoptedCount / pets.length) * 100) : 0;
    
    const sortedPets = useMemo(() => [...pets].sort((a, b) => {
        const inqA = inquiries.filter(i => i.petId === a.id).length;
        const inqB = inquiries.filter(i => i.petId === b.id).length;
        return inqB - inqA;
    }), [pets, inquiries]);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytika a Výkon</h2>
                <p className="text-gray-500 text-sm">Štatistiky počítané v reálnom čase z aktivity na vašich inzerátoch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard label="Zobrazenia celkom" value={totalViews} icon={Eye} color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} subtext="Videnia všetkých inzerátov" />
                 <StatCard label="Miera Konverzie" value={`${conversionRate}%`} icon={TrendingUp} color={{ bg: 'bg-orange-50', text: 'text-orange-600' }} subtext="Záujem návštevníkov" />
                 <StatCard label="Miera adopcie" value={`${adoptionRate}%`} icon={CheckCircle} color={{ bg: 'bg-green-50', text: 'text-green-600' }} subtext={`${adoptedCount} úspešných domovov`} />
                 <StatCard label="Virtuálni rodičia" value={virtualParents} icon={Heart} color={{ bg: 'bg-pink-50', text: 'text-pink-600' }} subtext="Pravidelná podpora" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ChartIcon size={20} className="text-brand-600" /> Live výkonnosť inzerátov
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg border border-green-100 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Live dáta
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Zviera</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center">Videnia</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center">Dopyty</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Miera úspešnosti</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedPets.map(pet => {
                                const petInqs = inquiries.filter(i => i.petId === pet.id).length;
                                const views = pet.views || 0;
                                const successRate = views > 0 ? ((petInqs / views) * 100).toFixed(1) : '0';
                                
                                return (
                                    <tr key={pet.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                                                    <img src={pet.imageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-extrabold text-gray-900">{pet.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-600">{views}</td>
                                        <td className="px-6 py-4 text-center font-bold text-brand-600">{petInqs}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${
                                                            parseFloat(successRate) > 10 ? 'bg-green-500' : 
                                                            parseFloat(successRate) > 5 ? 'bg-blue-500' : 'bg-brand-500'
                                                        }`} 
                                                        style={{ width: `${Math.min(parseFloat(successRate) * 5, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-black px-2.5 py-1 rounded-lg border shadow-sm ${
                                                    parseFloat(successRate) > 10 ? 'bg-green-50 text-green-700 border-green-100' : 
                                                    parseFloat(successRate) > 5 ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                    'bg-brand-50 text-brand-700 border-brand-100'
                                                }`}>
                                                    {successRate}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {pets.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-400 italic">Zatiaľ nemáte žiadne inzerované zvieratá pre analýzu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="bg-brand-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl"><Sparkles size={32}/></div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">Potrebujete poradiť s marketingom?</h3>
                        <p className="text-brand-100 text-sm">Zistite, ako upraviť inzeráty, aby mali vyššiu úspešnosť.</p>
                    </div>
                </div>
                <button className="bg-white text-brand-600 px-6 py-3 rounded-xl font-bold hover:bg-brand-50 transition flex-shrink-0">
                    Otvoriť poradňu
                </button>
            </div>
        </div>
    );
};

const ShelterProfileForm = ({ shelter }: { shelter: Shelter }) => {
    const { updateUserProfile } = useAuth();
    const { showToast } = useApp();
    const [formData, setFormData] = useState<Shelter>({ ...shelter });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setFormData({ ...shelter }); }, [shelter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, socials: { ...(prev.socials || {}), [name]: value } }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(formData);
            showToast('Profil útulku bol úspešne aktualizovaný.', 'success');
        } catch (error) { showToast('Nepodarilo sa aktualizovať profil.', 'error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-20">
             <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-gray-900">Profil útulku</h2><p className="text-gray-500 text-sm">Upravte informácie, ktoré vidia návštevníci.</p></div>
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 disabled:opacity-70">{loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}Uložiť zmeny</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-gray-900">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group-hover:border-brand-200 transition">{formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2"/> : <Building2 className="text-gray-300" size={48}/>}</div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold text-xs backdrop-blur-sm"><Camera size={24} className="mb-1"/></div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </div>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Názov útulku</label><input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Telefón</label><input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+421..." /></div>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-8 space-y-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg"><MapPin size={20} className="text-brand-500"/> Lokalita a prevádzka</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Mesto / Región (Lokalita)</label><input name="location" type="text" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Napr. Bratislava" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Otváracie hodiny</label><input name="openingHours" type="text" value={formData.openingHours || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Napr. Pon-Pia: 10:00-16:00" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Adresa pre doručenie darov (Materiálna pomoc)</label><input name="shippingAddress" type="text" value={formData.shippingAddress || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ulica, Číslo, PSČ, Mesto" /></div>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-8 mt-8 space-y-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg"><CreditCard size={20} className="text-brand-500"/> Podpora</h3>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">Číslo účtu (IBAN) pre dary</label><input name="bankAccount" type="text" value={formData.bankAccount || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-mono tracking-wider focus:ring-2 focus:ring-brand-500 outline-none" placeholder="SK..." /></div>
                </div>
                <div className="border-t border-gray-100 pt-8 mt-8 space-y-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg"><Globe size={20} className="text-brand-500"/> Sociálne siete a Web</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Globe size={14}/> Webstránka</label><input name="website" type="text" value={formData.socials?.website || ''} onChange={handleSocialChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="www.priklad.sk" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Facebook size={14}/> Facebook</label><input name="facebook" type="text" value={formData.socials?.facebook || ''} onChange={handleSocialChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="facebook.com/utulok" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Instagram size={14}/> Instagram</label><input name="instagram" type="text" value={formData.socials?.instagram || ''} onChange={handleSocialChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="@utulok" /></div>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-8 mt-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2">O nás / Príbeh útulku</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 h-40 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Napíšte príbeh vášho útulku, vašu víziu a úspechy..." />
                </div>
            </div>
        </div>
    );
};

const VolunteersSection = ({ shelterId }: { shelterId: string }) => {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('');
    const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);

    useEffect(() => { loadVolunteers(); }, [shelterId]);
    const loadVolunteers = async () => { try { const data = await api.getVolunteers(shelterId); setVolunteers(data); } catch (e) {} };
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try { const added = await api.addVolunteer(shelterId, { name: newName, email: newEmail, role: newRole, status: 'Aktívny' }); setVolunteers([added, ...volunteers]); setNewName(''); setNewEmail(''); setNewRole(''); } catch (e) {}
    };
    const confirmDelete = async () => {
        if(!volunteerToDelete) return;
        try { await api.deleteVolunteer(volunteerToDelete); setVolunteers(prev => prev.filter(v => v.id !== volunteerToDelete)); setVolunteerToDelete(null); } catch(e) {}
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             <div><h2 className="text-2xl font-bold text-gray-900">Dobrovoľníci</h2><p className="text-gray-500 text-sm">Tím ľudí, ktorí vám pomáhajú.</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Plus className="text-brand-600"/> Pridáť člena</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input required placeholder="Meno" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none transition"/>
                            <input required type="email" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none transition"/>
                            <button type="submit" className="w-full bg-brand-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition">Pridať do tímu</button>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500"><tr><th className="px-6 py-4 font-bold">Meno</th><th className="px-6 py-4 font-bold">Rola</th><th className="px-6 py-4 text-right">Akcia</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">{volunteers.map(v => (<tr key={v.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 font-bold text-gray-900">{v.name}</td><td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">{v.role}</span></td><td className="px-6 py-4 text-right"><button onClick={() => setVolunteerToDelete(v.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition"><Trash2 size={16}/></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal isOpen={!!volunteerToDelete} onClose={() => setVolunteerToDelete(null)} onConfirm={confirmDelete} title="Odstrániť dobrovoľníka?" message="Naozaj chcete odstrániť tohto člena tímu?" confirmText="Odstrániť" />
        </div>
    );
};

const SuppliesSection = ({ shelterId }: { shelterId: string }) => {
    const [supplies, setSupplies] = useState<ShelterSupply[]>([]);
    const [newItem, setNewItem] = useState('');
    useEffect(() => { const load = async () => { const data = await api.getSupplies(shelterId); setSupplies(data); }; load(); }, [shelterId]);
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try { const added = await api.addSupply(shelterId, { item: newItem, priority: 'Stredná' }); setSupplies([added, ...supplies]); setNewItem(''); } catch (e) {}
    };
    const handleDelete = async (id: string) => { try { await api.deleteSupply(id); setSupplies(prev => prev.filter(s => s.id !== id)); } catch(e) {} };
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div><h2 className="text-2xl font-bold text-gray-900">Materiálna pomoc</h2><p className="text-gray-500 text-sm">Zoznam vecí, ktoré aktuálne potrebujete.</p></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-100"><form onSubmit={handleAdd} className="flex gap-4"><input required placeholder="Položka" value={newItem} onChange={e => setNewItem(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none"/><button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold">Pridať</button></form></div>
                <ul className="divide-y divide-gray-100">{supplies.map(s => (<li key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${s.priority === 'Vysoká' ? 'bg-red-500' : 'bg-yellow-500'}`}></div><span className="font-bold text-gray-900">{s.item}</span></div><button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-500 transition"><X size={20}/></button>
                </li>))}</ul>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [vpCount, setVpCount] = useState(0);

  useEffect(() => {
    if (!currentUser || userRole !== 'shelter') { navigate('/auth'); return; }
    
    // Načítanie reálneho počtu virtuálnych rodičov pri aktivácii analytiky
    const fetchStats = async () => {
        const count = await api.getShelterVirtualAdoptionsCount(currentUser.id);
        setVpCount(count);
    };
    fetchStats();
  }, [currentUser, userRole, navigate, activeTab]);

  if (!currentUser || userRole !== 'shelter') return null;
  const currentShelter = currentUser as Shelter;
  const myPets = pets.filter(p => p.shelterId === currentShelter.id);
  const myInquiries = inquiries.filter(i => i.shelterId === currentShelter.id);

  const openAddModal = () => { setEditingPet(null); setShowModal(true); };
  const openEditModal = (pet: Pet) => { setEditingPet(pet); setShowModal(true); };
  const handleSavePet = async (petData: Pet) => { if (editingPet) { await updatePet(petData); } else { await addPet(petData); } setShowModal(false); };

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition duration-200 ${activeTab === id ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
      <Icon size={20} className={activeTab === id ? 'text-brand-600' : 'text-gray-400'} />{label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">L</div><span className="font-bold">Dashboard</span></div><button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button></div>
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>)}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 md:pb-8 flex items-center gap-3"><div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div><div><h2 className="text-lg font-extrabold tracking-tight">Dashboard</h2><p className="text-xs text-gray-500 truncate max-w-[120px]">{currentShelter.name}</p></div></div>
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <SidebarItem id="overview" icon={LayoutDashboard} label="Prehľad" />
          <SidebarItem id="pets" icon={Dog} label="Moje zvieratá" />
          <SidebarItem id="inquiries" icon={MessageSquare} label="Dopyty" />
          <SidebarItem id="supplies" icon={Gift} label="Materiálna pomoc" />
          <SidebarItem id="volunteers" icon={Users} label="Dobrovoľníci" />
          <SidebarItem id="analytics" icon={ChartIcon} label="Analytika" />
          <SidebarItem id="profile" icon={Building} label="Profil" />
        </nav>
        <div className="p-4 border-t border-gray-100"><button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"><LogOut size={20} /> Odhlásiť sa</button></div>
      </aside>
      <main className="flex-1 p-4 md:p-10 overflow-y-auto h-[calc(100vh-64px)] md:h-screen bg-gray-50">
         <div className="max-w-7xl mx-auto">
             {activeTab === 'overview' && <OverviewSection onNavigate={setActiveTab} pets={myPets} inquiries={myInquiries} shelter={currentShelter} />}
             {activeTab === 'pets' && <PetsSection onAdd={openAddModal} onEdit={openEditModal} pets={myPets} onDelete={deletePet} />}
             {activeTab === 'inquiries' && <InquiriesSection inquiries={myInquiries} updateStatus={updateInquiryStatus} shelter={currentShelter} />}
             {activeTab === 'profile' && <ShelterProfileForm shelter={currentShelter} />}
             {activeTab === 'volunteers' && <VolunteersSection shelterId={currentShelter.id} />}
             {activeTab === 'supplies' && <SuppliesSection shelterId={currentShelter.id} />}
             {activeTab === 'analytics' && <AnalyticsSection pets={myPets} inquiries={myInquiries} shelter={currentShelter} virtualParents={vpCount} />}
         </div>
      </main>
      <PetFormModal isOpen={showModal} onClose={() => setShowModal(false)} pet={editingPet} shelterId={currentShelter.id} onSave={handleSavePet} defaultLocation={currentShelter.location} />
    </div>
  );
};

export default ShelterDashboard;
