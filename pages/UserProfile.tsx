
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, Edit2, Trash2, Home as HomeIcon, Clock, CheckCircle, 
  Dog, Lock, LogOut, X, 
  User as UserIcon, Loader2,
  ChevronRight, Sparkles, Camera, Filter, Settings, Activity,
  Smile, Zap, Target, ArrowLeft, MessageCircle,
  Baby, Award, Briefcase, MapPin, Mail, Phone, Coins, ExternalLink, Ruler, Building2, Trophy
} from 'lucide-react';
import { User, PetType, Size, Gender, HousingType, WorkMode, ExperienceLevel, UserPreferences, AdoptionInquiry, Shelter } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import ChatWindow from '../components/ChatWindow';
import { api } from '../services/api';

const PreferenceChip: React.FC<{ label: string, active: boolean, onClick: () => void, variant?: 'brand' | 'blue' | 'purple' | 'green' }> = ({ label, active, onClick, variant = 'brand' }) => {
    const colors = {
        brand: active ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-brand-200',
        blue: active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200',
        purple: active ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200',
        green: active ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-green-200'
    };
    return (
        <button type="button" onClick={onClick} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${colors[variant]}`}>
            {label}
        </button>
    );
};

const UserProfilePage: React.FC = () => {
  const { currentUser, userRole, logout, toggleFavorite, updateUserProfile, resetPassword, isFavorite } = useAuth();
  const { pets } = usePets(); 
  const { inquiries, showToast } = useApp();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'settings'>('about');
  const [selectedInquiry, setSelectedInquiry] = useState<AdoptionInquiry | null>(null);
  const [relatedShelter, setRelatedShelter] = useState<Shelter | null>(null);
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingHousehold, setIsEditingHousehold] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [bioInput, setBioInput] = useState('');
  const [availability, setAvailability] = useState('');
  
  const [householdData, setHouseholdData] = useState({
      housingType: 'Byt' as HousingType,
      workMode: 'Hybrid' as WorkMode,
      hasChildren: false,
      hasOtherPets: false,
      experienceLevel: 'Začiatočník' as ExperienceLevel
  });

  const [prefData, setPrefData] = useState<UserPreferences>({
      types: [PetType.DOG],
      sizes: [Size.MEDIUM],
      genders: [Gender.MALE, Gender.FEMALE],
      ageRange: ['Mladý'],
      temperament: ['Hravý'],
      preferredBreeds: [],
      activityLevel: 'Stredná (Prechádzky)',
      socialRequirements: [],
      specialNeedsAccepted: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Robust check to avoid crashes if currentUser is null
  const user = useMemo(() => currentUser as User, [currentUser]);

  useEffect(() => {
    if (!currentUser || userRole !== 'user') {
        navigate('/auth');
    }
  }, [currentUser, userRole, navigate]);

  const myApplications = useMemo(() => {
      if (!user?.id) return [];
      return inquiries.filter(inq => inq.applicantId === user.id);
  }, [inquiries, user?.id]);

  const favoritePets = useMemo(() => {
      if (!user?.favorites) return [];
      return pets.filter(p => user.favorites.includes(p.id));
  }, [pets, user?.favorites]);

  const virtualAdoptionsWithData = useMemo(() => {
      if (!user?.virtualAdoptions) return [];
      return user.virtualAdoptions.map(ad => {
          const pet = pets.find(p => p.id === ad.petId);
          return { ...ad, pet };
      }).filter(ad => !!ad.pet);
  }, [user?.virtualAdoptions, pets]);

  const relatedPet = useMemo(() => {
      if (!selectedInquiry) return null;
      return pets.find(p => p.id === selectedInquiry.petId);
  }, [selectedInquiry, pets]);

  useEffect(() => {
      const fetchInquiryShelter = async () => {
          if (selectedInquiry?.shelterId) {
              try {
                  const data = await api.getPublicShelter(selectedInquiry.shelterId);
                  setRelatedShelter(data);
              } catch (e) {
                  console.error("Failed to fetch shelter for inquiry");
              }
          } else {
              setRelatedShelter(null);
          }
      };
      fetchInquiryShelter();
  }, [selectedInquiry]);

  // Robust data synchronization - runs only when user object changes reference
  useEffect(() => {
    if (!user) return;
    setBioInput(user.bio || '');
    setAvailability(user.availability || '');
    if (user.household) {
        setHouseholdData({
            housingType: user.household.housingType || 'Byt',
            workMode: user.household.workMode || 'Hybrid',
            hasChildren: !!user.household.hasChildren,
            hasOtherPets: !!user.household.hasOtherPets,
            experienceLevel: user.household.experienceLevel || 'Začiatočník'
        });
    }
    if (user.preferences) {
        setPrefData({
            types: user.preferences.types || [PetType.DOG],
            sizes: user.preferences.sizes || [Size.MEDIUM],
            genders: user.preferences.genders || [Gender.MALE, Gender.FEMALE],
            ageRange: user.preferences.ageRange || ['Mladý'],
            temperament: user.preferences.temperament || ['Hravý'],
            preferredBreeds: user.preferences.preferredBreeds || [],
            activityLevel: user.preferences.activityLevel || 'Stredná (Prechádzky)',
            socialRequirements: user.preferences.socialRequirements || [],
            specialNeedsAccepted: !!user.preferences.specialNeedsAccepted
        });
    }
  }, [user]);

  const completionPercent = useMemo(() => {
      if (!user) return 0;
      const points = [
          !!user.bio, 
          !!user.availability, 
          !!user.household?.housingType, 
          (user.preferences?.types?.length || 0) > 0, 
          !!user.household?.experienceLevel,
          !!user.phone
      ];
      return Math.round((points.filter(Boolean).length / points.length) * 100);
  }, [user]);

  const completionStatus = useMemo(() => {
      if (completionPercent === 100) return { label: 'Perfektné!', color: 'text-green-600', sub: 'Ste pripravený na adopciu.' };
      if (completionPercent > 70) return { label: 'Skoro tam!', color: 'text-blue-600', sub: 'Doplňte detaily pre útulky.' };
      if (completionPercent > 40) return { label: 'Dobrý začiatok', color: 'text-orange-600', sub: 'Ešte pár krokov k cieľu.' };
      return { label: 'Na začiatku', color: 'text-gray-600', sub: 'Vyplňte profil pre dôveru útulkov.' };
  }, [completionPercent]);

  const handleSaveBio = async () => { setIsSaving(true); await updateUserProfile({ bio: bioInput, availability }); setIsEditingBio(false); setIsSaving(false); };
  const handleSaveHousehold = async () => { setIsSaving(true); await updateUserProfile({ household: householdData }); setIsEditingHousehold(false); setIsSaving(false); };
  const handleSavePreferences = async () => { setIsSaving(true); await updateUserProfile({ preferences: prefData }); setIsEditingPreferences(false); setIsSaving(false); };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingAvatar(true);
      try {
          // UPLOAD: Použijeme bucket 'images' a priečinok 'avatars'
          const publicUrl = await api.uploadFile(file, 'images', 'avatars');
          // Update profile with the new URL
          await updateUserProfile({ avatarUrl: publicUrl });
          showToast("Profilová fotka bola aktualizovaná.", "success");
      } catch (err: any) {
          console.error(err);
          showToast(err.message || "Chyba pri nahrávaní fotky.", "error");
      } finally {
          setIsUploadingAvatar(false);
      }
  };

  const toggleArrayItem = (key: keyof UserPreferences, value: any) => {
      setPrefData(prev => {
          const current = (prev[key] as any[]) || [];
          const updated = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
          return { ...prev, [key]: updated };
      });
  };

  const handlePasswordReset = async () => {
      if (!user?.email) return;
      try { await resetPassword(user.email); alert("Odkaz na zmenu hesla bol odoslaný."); } catch (e) { alert("Chyba pri odosielaní."); }
  };

  if (!user || userRole !== 'user') return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-brand-600 to-orange-500"></div>
                <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-3xl bg-white p-1 shadow-lg relative overflow-hidden border border-gray-50 flex items-center justify-center">
                            {isUploadingAvatar ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 size={32} className="animate-spin text-brand-600" />
                                    <span className="text-[10px] font-bold text-brand-600">NAHRÁVAM...</span>
                                </div>
                            ) : (
                                user.avatarUrl ? (
                                    <img src={user.avatarUrl} className="w-full h-full object-cover rounded-2xl" alt={user.name} />
                                ) : (
                                    <div className="w-full h-full bg-brand-50 flex items-center justify-center text-3xl font-extrabold text-brand-600 rounded-2xl">
                                        {user.name.charAt(0)}
                                    </div>
                                )
                            )}
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={isUploadingAvatar}
                            className="absolute bottom-0 right-0 p-2 bg-white text-brand-600 rounded-xl shadow-md hover:scale-110 transition border border-gray-100 disabled:opacity-50"
                        >
                            <Camera size={16} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleAvatarUpload}
                        />
                    </div>
                    <h2 className="text-xl font-bold mt-4 text-gray-800 leading-tight">{user.name}</h2>
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1 mb-4">ID: #{user.id.slice(0,6)}</p>
                    
                    <div className="w-full space-y-2 mt-2 px-4">
                        <div className="flex items-center gap-3 justify-center text-gray-500 hover:text-brand-600 transition group cursor-default">
                            <Mail size={14} className="text-gray-400 group-hover:text-brand-500" />
                            <span className="text-xs font-bold truncate max-w-[200px]">{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-3 justify-center text-gray-500 hover:text-brand-600 transition group cursor-default">
                                <Phone size={14} className="text-gray-400 group-hover:text-brand-500" />
                                <span className="text-xs font-bold">{user.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {user.badges.map(b => (
                            <span key={b} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase border border-green-100">{b}</span>
                        ))}
                    </div>
                </div>
                <div className="border-t border-gray-50 p-4">
                    <button onClick={logout} className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition"><LogOut size={18}/> Odhlásiť sa</button>
                </div>
            </div>

            {/* COMPLETENESS WIDGET */}
            <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand-50 rounded-full opacity-50 group-hover:scale-110 transition duration-500"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                                <Trophy size={18} />
                            </div>
                            <span className="font-bold text-gray-800 text-xs uppercase tracking-wider">Môj progres</span>
                        </div>
                        <span className={`font-extrabold text-lg ${completionStatus.color}`}>{completionPercent}%</span>
                    </div>

                    <div className="space-y-4">
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                            <div 
                                className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-1000 relative" 
                                style={{ width: `${completionPercent}%` }}
                            >
                                {completionPercent < 100 && (
                                    <div className="absolute top-0 right-0 h-full w-4 bg-white/20 animate-pulse"></div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className={`font-black text-sm ${completionStatus.color}`}>{completionStatus.label}</p>
                            <p className="text-[11px] text-gray-500 leading-relaxed mt-1">{completionStatus.sub}</p>
                        </div>

                        {completionPercent < 100 && (
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mt-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                                    <Zap size={10} className="text-brand-500" /> Prečo vyplniť profil?
                                </p>
                                <p className="text-[10px] text-gray-500 leading-tight">
                                    Úplné údaje zvyšujú vašu dôveryhodnosť a urýchľujú schvaľovanie žiadostí útulkami.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex gap-1">
               {[
                   { id: 'about', label: 'Môj profil', icon: UserIcon },
                   { id: 'activity', label: 'Moja aktivita', icon: Activity },
                   { id: 'settings', label: 'Nastavenia', icon: Settings }
               ].map(tab => (
                   <button 
                        key={tab.id} 
                        onClick={() => { setActiveTab(tab.id as any); setSelectedInquiry(null); }} 
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                       <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                   </button>
               ))}
             </div>

             {/* --- TAB: ABOUT --- */}
             {activeTab === 'about' && (
                <div className="space-y-6 animate-in fade-in duration-500 pb-12">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3"><Smile size={24} className="text-brand-500"/> O mne</h2>
                            <button onClick={() => setIsEditingBio(!isEditingBio)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition">
                                {isEditingBio ? <X size={20}/> : <Edit2 size={18}/>}
                            </button>
                        </div>
                        {isEditingBio ? (
                            <div className="space-y-4">
                                <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} className="w-full border border-gray-200 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 text-sm font-medium" placeholder="Napíšte niečo o vašom vzťahu k zvieratám..."></textarea>
                                <input value={availability} onChange={e => setAvailability(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-sm" placeholder="Kedy máte čas na venčenie alebo návštevy?" />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 text-xs font-bold text-gray-500">Zrušiť</button>
                                    <button onClick={handleSaveBio} className="px-6 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2">
                                        {isSaving && <Loader2 size={14} className="animate-spin"/>} Uložiť
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
                                <p className="italic text-gray-600 text-sm leading-relaxed">"{user.bio || 'Zatiaľ ste o sebe nič nenapísali...'}"</p>
                                {user.availability && <div className="text-xs font-bold text-gray-500 flex items-center gap-2"><Clock size={14} className="text-blue-500"/> Čas na zvieratká: {user.availability}</div>}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3"><Target size={24} className="text-brand-500"/> Moja domácnosť</h2>
                            <button onClick={() => setIsEditingHousehold(!isEditingHousehold)} className="text-brand-600 font-bold text-xs uppercase tracking-widest hover:underline">{isEditingHousehold ? 'Zatvoriť' : 'Upraviť údaje'}</button>
                        </div>
                        {isEditingHousehold ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Typ bývania</label>
                                        <select value={householdData.housingType} onChange={e => setHouseholdData({...householdData, housingType: e.target.value as any})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-500">
                                            <option value="Byt">Byt</option><option value="Dom">Dom</option><option value="Dom so záhradou">Dom so záhradou</option><option value="Farma">Farma</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Pracovný režim</label>
                                        <select value={householdData.workMode} onChange={e => setHouseholdData({...householdData, workMode: e.target.value as any})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-500">
                                            <option value="Práca z domu">Práca z domu</option><option value="Hybrid">Hybrid</option><option value="V kancelárii">V kancelárii</option><option value="V kancelárii/Terén">V kancelárii/Terén</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-brand-200 transition">
                                        <input type="checkbox" checked={householdData.hasChildren} onChange={e => setHouseholdData({...householdData, hasChildren: e.target.checked})} className="rounded text-brand-600 w-5 h-5 focus:ring-brand-500"/> 
                                        <div className="flex items-center gap-2"><Baby size={18} className="text-pink-500"/> <span className="text-sm font-bold text-gray-700">Mám v dome deti</span></div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-brand-200 transition">
                                        <input type="checkbox" checked={householdData.hasOtherPets} onChange={e => setHouseholdData({...householdData, hasOtherPets: e.target.checked})} className="rounded text-brand-600 w-5 h-5 focus:ring-brand-500"/> 
                                        <div className="flex items-center gap-2"><Dog size={18} className="text-brand-500"/> <span className="text-sm font-bold text-gray-700">Mám iné zvieratá</span></div>
                                    </label>
                                </div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Skúsenosti so zvieratami</label>
                                    <select value={householdData.experienceLevel} onChange={e => setHouseholdData({...householdData, experienceLevel: e.target.value as any})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-500">
                                        <option value="Začiatočník">Začiatočník</option><option value="Mierne pokročilý">Mierne pokročilý</option><option value="Skúsený">Skúsený</option>
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleSaveHousehold} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 hover:bg-brand-700 transition flex items-center gap-2">
                                        {isSaving && <Loader2 size={14} className="animate-spin"/>} Uložiť domácnosť
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 flex items-center gap-2"><HomeIcon size={14} className="text-blue-500"/> {user.household?.housingType || 'Bývanie neuvedené'}</span>
                                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 flex items-center gap-2"><Briefcase size={14} className="text-purple-500"/> {user.household?.workMode || 'Práca neuvedená'}</span>
                                {user.household?.hasChildren && <span className="px-3 py-1.5 bg-pink-50 text-pink-700 text-xs font-bold rounded-lg border border-pink-100 flex items-center gap-2"><Baby size={14}/> Deti v dome</span>}
                                {user.household?.hasOtherPets && <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 flex items-center gap-2"><Dog size={14}/> Iné zvieratá</span>}
                                <span className="px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100 flex items-center gap-2"><Award size={14}/> {user.household?.experienceLevel || 'Začiatočník'}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3"><Filter size={24} className="text-brand-500"/> Moje preferencie</h2>
                            <button onClick={() => setIsEditingPreferences(!isEditingPreferences)} className="text-brand-600 font-bold text-xs uppercase tracking-widest hover:underline">{isEditingPreferences ? 'Zatvoriť' : 'Upraviť preferencie'}</button>
                        </div>
                        {isEditingPreferences ? (
                            <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 tracking-widest ml-1">Druh zvieratka</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[PetType.DOG, PetType.CAT].map(t => (
                                            <PreferenceChip key={t} label={t} active={prefData.types.includes(t)} onClick={() => toggleArrayItem('types', t)} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 tracking-widest ml-1">Veľkosť</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[Size.SMALL, Size.MEDIUM, Size.LARGE].map(s => (
                                            <PreferenceChip key={s} label={s} variant="blue" active={prefData.sizes.includes(s)} onClick={() => toggleArrayItem('sizes', s)} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 tracking-widest ml-1">Pohlavie</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[Gender.MALE, Gender.FEMALE].map(g => (
                                            <PreferenceChip key={g} label={g} variant="green" active={prefData.genders.includes(g)} onClick={() => toggleArrayItem('genders', g)} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 tracking-widest ml-1">Aktivita</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Nízka (Gaučák)', 'Stredná (Prechádzky)', 'Vysoká (Športovec)'].map(a => (
                                            <PreferenceChip key={a} label={a} variant="purple" active={prefData.activityLevel === a} onClick={() => setPrefData({...prefData, activityLevel: a as any})} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-gray-50">
                                    <button onClick={handleSavePreferences} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 hover:bg-brand-700 transition flex items-center gap-2">
                                        {isSaving && <Loader2 size={14} className="animate-spin"/>} Uložiť preferencie
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {user.preferences?.types?.map(t => (
                                        <span key={t} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border border-brand-100 flex items-center gap-2"><Dog size={14}/> {t}</span>
                                    ))}
                                    {user.preferences?.sizes?.map(s => (
                                        <span key={s} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-2"><Ruler size={14}/> {s}</span>
                                    ))}
                                    {user.preferences?.genders?.map(g => (
                                        <span key={g} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">{g}</span>
                                    ))}
                                    {user.preferences?.activityLevel && (
                                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 flex items-center gap-2"><Zap size={14} className="fill-current"/> {user.preferences.activityLevel}</span>
                                    )}
                                </div>
                                {(!user.preferences || (!user.preferences.types?.length && !user.preferences.activityLevel)) && (
                                    <p className="text-gray-400 text-sm italic">Zatiaľ ste si nenastavili žiadne preferencie.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
             )}

             {/* --- TAB: MY ACTIVITY --- */}
             {activeTab === 'activity' && (
                <div className="space-y-12 animate-in fade-in duration-500 pb-12">
                    {selectedInquiry ? (
                        /* CHAT DETAIL */
                        <div className="flex flex-col space-y-6">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedInquiry(null)} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition"><ArrowLeft size={20} /></button>
                                <div><h2 className="text-xl font-bold text-gray-800 leading-tight">Konverzácia o adopcii</h2><p className="text-sm text-gray-500">Začaté dňa {new Date(selectedInquiry.date).toLocaleDateString('sk-SK')}</p></div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Info column */}
                                <div className="lg:col-span-4 space-y-4">
                                    {/* Pet Card */}
                                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                                                <img src={relatedPet?.imageUrl} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zvieratko</div>
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedInquiry.petName}</h3>
                                                <p className="text-xs text-brand-600 font-bold">{relatedPet?.breed}</p>
                                            </div>
                                        </div>
                                        <Link to={`/pets/${selectedInquiry.petId}`} className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-50 hover:text-brand-600 transition">
                                            Profil zvieraťa <ExternalLink size={14}/>
                                        </Link>
                                    </div>

                                    {/* Shelter Card */}
                                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Kontakt na útulok</div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                                                <Building2 size={20}/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{relatedShelter?.name || 'Načítavam...'}</h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10}/> {relatedShelter?.location}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-xs">
                                                <Mail size={14} className="text-gray-400"/>
                                                <span className="font-bold text-gray-700 truncate">{relatedShelter?.email}</span>
                                            </div>
                                            {relatedShelter?.phone && (
                                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-xs">
                                                    <Phone size={14} className="text-gray-400"/>
                                                    <span className="font-bold text-gray-700">{relatedShelter?.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Window */}
                                <div className="lg:col-span-8">
                                    <ChatWindow 
                                        inquiryId={selectedInquiry.id} 
                                        currentUser={user} 
                                        inverted={true} 
                                        myAvatarUrl={user.avatarUrl}
                                        otherAvatarUrl={relatedShelter?.logoUrl}
                                        className="h-[600px] shadow-sm border-gray-100 rounded-[2rem]" 
                                        initialMessage={{ content: selectedInquiry.message, date: selectedInquiry.date, senderId: selectedInquiry.applicantId }} 
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3 ml-2"><MessageCircle size={22} className="text-brand-500"/> Moje žiadosti o adopciu</h2>
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50/80 text-gray-400 border-b border-gray-100">
                                                <tr className="text-[10px] font-bold uppercase tracking-widest"><th className="px-6 py-4">Dátum</th><th className="px-6 py-4">Zviera</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Akcia</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {myApplications.map(app => (
                                                    <tr key={app.id} onClick={() => setSelectedInquiry(app)} className="hover:bg-gray-50 transition cursor-pointer group">
                                                        <td className="px-6 py-4 font-bold text-gray-500">{new Date(app.date).toLocaleDateString('sk-SK')}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-700">{app.petName}</td>
                                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${app.status === 'Schválená' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{app.status}</span></td>
                                                        <td className="px-6 py-4 text-right text-brand-600 font-bold text-[10px] uppercase group-hover:translate-x-1 transition-transform">Prejsť k chatu <ChevronRight size={14} className="inline ml-1"/></td>
                                                    </tr>
                                                ))}
                                                {myApplications.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">Zatiaľ žiadne odoslané žiadosti.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3 ml-2"><Heart size={22} className="text-red-500 fill-red-500"/> Obľúbení kamoši</h2>
                                {favoritePets.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {favoritePets.map(pet => (
                                            <div key={pet.id} className="bg-white rounded-[1.5rem] p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition group">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"><img src={pet.imageUrl} className="w-full h-full object-cover" alt="" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-800 truncate">{pet.name}</h3>
                                                    <p className="text-[11px] font-medium text-gray-400 truncate uppercase tracking-wider">{pet.breed} • {pet.location}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link to={`/pets/${pet.id}`} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition" title="Zobraziť detail"><ExternalLink size={18}/></Link>
                                                    <button onClick={() => toggleFavorite(pet.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Odstrániť"><Trash2 size={18}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-[2rem] p-10 border border-dashed border-gray-200 text-center">
                                        <Heart size={32} className="text-gray-200 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm font-medium">Zatiaľ ste si neuložili žiadne zvieratko.</p>
                                        <Link to="/pets" className="text-brand-600 font-bold text-xs uppercase tracking-widest mt-4 inline-block hover:underline">Hľadať zvieratá</Link>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3 ml-2"><Coins size={22} className="text-orange-500"/> Moje virtuálne adopcie</h2>
                                {virtualAdoptionsWithData.length > 0 ? (
                                    <div className="space-y-3">
                                        {virtualAdoptionsWithData.map((ad, idx) => (
                                            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl border border-gray-100 p-0.5 overflow-hidden shadow-sm"><img src={ad.pet?.imageUrl} className="w-full h-full object-cover rounded-xl" alt="" /></div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">Podporujem: {ad.pet?.name}</h3>
                                                        <p className="text-xs text-gray-400">Adoptovaný dňa: {new Date(ad.startDate).toLocaleDateString('sk-SK')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Príspevok</p>
                                                        <p className="text-xl font-extrabold text-brand-600">{ad.amount} € <span className="text-[10px] font-bold text-gray-400">/ mesačne</span></p>
                                                    </div>
                                                    <Link to={`/pets/${ad.petId}`} className="px-5 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-600 transition">Spravovať</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 rounded-[2.5rem] p-10 border border-orange-100 flex flex-col md:flex-row items-center gap-8">
                                        <div className="p-5 bg-white rounded-2xl shadow-sm text-orange-500"><Coins size={48}/></div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="font-bold text-orange-900 text-xl">Pomáhajte na diaľku</h4>
                                            <p className="text-orange-800/70 text-sm mt-2 leading-relaxed">Pravidelným príspevkom zabezpečíte krmivo a lieky pre zvieratá.</p>
                                        </div>
                                        <Link to="/pets" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-700 transition flex-shrink-0">Adoptovať virtuálne</Link>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
             )}

             {/* --- TAB: SETTINGS --- */}
             {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-8"><Lock size={24} className="text-brand-500"/> Zabezpečenie a súkromie</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div><p className="font-bold text-gray-800 text-sm">Prístupové heslo</p><p className="text-xs text-gray-500">Pre bezpečnosť ho meňte aspoň raz ročne.</p></div>
                                <button onClick={handlePasswordReset} className="px-6 py-2 bg-white text-gray-600 text-xs font-bold rounded-xl border border-gray-200 hover:bg-brand-600 hover:text-white transition">Zmeniť heslo</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 mt-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2"><Trash2 size={20}/> Zmazanie účtu</h2>
                                <p className="text-red-700/70 text-xs mt-1 max-w-md">Táto akcia je nevratná.</p>
                            </div>
                            <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition shadow-lg shadow-red-100 flex-shrink-0">Zmazať môj účet</button>
                        </div>
                    </div>
                </div>
             )}
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={() => { setShowDeleteConfirm(false); logout(); }}
        title="Naozaj chcete odísť?" 
        message="Stratíte prístup k histórii adopcií a komunikácii s útulkami."
        confirmText="Áno, zmazať účet"
        variant="danger"
      />
    </div>
  );
};

export default UserProfilePage;
