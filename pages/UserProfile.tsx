
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
    Baby, Award, Briefcase, MapPin, Mail, Phone, Coins, ExternalLink, Ruler, Building2, Trophy,
    ListTodo, Info, ShieldCheck, Star, ArrowUpRight,
    Send, Footprints, Quote, CreditCard, Bookmark, Calendar, Utensils, HeartHandshake, ArrowRight,
    TrendingUp, Sparkle, PlusCircle, Bell, BellOff
} from 'lucide-react';
import { User, PetType, Size, Gender, HousingType, WorkMode, ExperienceLevel, UserPreferences, AdoptionInquiry, Shelter, Pet } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import ChatWindow from '../components/ChatWindow';
import { api } from '../services/api';
import { formatSlovakAge } from '../utils/formatters';

const PreferenceChip: React.FC<{ label: string, active: boolean, onClick?: () => void, variant?: 'brand' | 'blue' | 'purple' | 'green' | 'gray' }> = ({ label, active, onClick, variant = 'brand' }) => {
    const colors = {
        brand: active ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-brand-200',
        blue: active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200',
        purple: active ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200',
        green: active ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-green-200',
        gray: active ? 'bg-gray-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${colors[variant]} ${!onClick ? 'cursor-default' : ''}`}
        >
            {label}
        </button>
    );
};

const UserProfilePage: React.FC = () => {
    const { currentUser, userRole, logout, toggleFavorite, updateUserProfile, resetPassword, isFavorite } = useAuth();
    const { pets } = usePets();
    const { inquiries, updateInquiryStatus, markInquiryAsRead, seenInquiryIds, showToast } = useApp();
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

    const user = useMemo(() => currentUser as User, [currentUser]);

    useEffect(() => {
        if (!currentUser || userRole !== 'user') {
            navigate('/auth');
        }
    }, [currentUser, userRole, navigate]);

    const myApplications = useMemo(() => {
        if (!user?.id) return [];
        return inquiries.filter(inq => inq.applicantId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [inquiries, user?.id]);

    const favoritePets = useMemo(() => {
        if (!user?.favorites) return [];
        return pets.filter(p => user.favorites.includes(p.id));
    }, [pets, user?.favorites]);

    const virtualAdoptionsWithData = useMemo(() => {
        if (!user?.virtualAdoptions) return [];
        return user.virtualAdoptions.map(ad => {
            const pet = pets.find(p => p.id === ad.petId);
            const start = new Date(ad.startDate);
            const now = new Date();
            const months = Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth() + 1);
            const totalDonated = months * ad.amount;
            return { ...ad, pet, totalDonated, months };
        }).filter(ad => !!ad.pet);
    }, [user?.virtualAdoptions, pets]);

    const handleInquiryClick = (inq: AdoptionInquiry) => {
        setSelectedInquiry(inq);
        markInquiryAsRead(inq.id);
    };

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

    const handleSaveBio = async () => { setIsSaving(true); await updateUserProfile({ bio: bioInput, availability }); setIsEditingBio(false); setIsSaving(false); showToast("Osobné informácie uložené.", "success"); };
    const handleSaveHousehold = async () => { setIsSaving(true); await updateUserProfile({ household: householdData }); setIsEditingHousehold(false); setIsSaving(false); showToast("Informácie o domácnosti uložené.", "success"); };
    const handleSavePreferences = async () => { setIsSaving(true); await updateUserProfile({ preferences: prefData }); setIsEditingPreferences(false); setIsSaving(false); showToast("Preferencie zvieratka uložené.", "success"); };

    const toggleEmailNotifications = async () => {
        const newValue = !user.emailNotificationsEnabled;
        try {
            await updateUserProfile({ emailNotificationsEnabled: newValue });
            showToast(newValue ? "E-mailové notifikácie zapnuté." : "E-mailové notifikácie vypnuté.", "success");
        } catch (e) {
            showToast("Chyba pri zmene nastavení.", "error");
        }
    };

    const toggleArrayItem = (key: keyof UserPreferences, value: any) => {
        setPrefData(prev => {
            const current = prev[key];
            if (!Array.isArray(current)) return prev;
            const currentArray = current as any[];
            const exists = currentArray.includes(value);
            const updated = exists
                ? currentArray.filter(i => i !== value)
                : [...currentArray, value];
            return { ...prev, [key]: updated };
        });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingAvatar(true);
        try {
            const publicUrl = await api.uploadFile(file, 'images', 'avatars');
            await updateUserProfile({ avatarUrl: publicUrl });
            showToast("Profilová fotka bola aktualizovaná.", "success");
        } catch (err: any) {
            showToast(err.message || "Chyba pri nahrávaní fotky.", "error");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try { await resetPassword(user.email); alert("Odkaz na zmenu hesla bol odoslaný."); } catch (e) { alert("Chyba pri odosielaní."); }
    };

    if (!user || userRole !== 'user') return null;

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Schválená': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', dot: 'bg-green-500' };
            case 'Zamietnutá': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', dot: 'bg-red-500' };
            case 'Zrušená': return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
            case 'Kontaktovaný': return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-indigo-500' };
            default: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-500' };
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 md:py-12 text-gray-900 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER SECTION */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Môj Dashboard</h1>
                        <p className="text-gray-500 mt-1">Vitajte späť, {user.name.split(' ')[0]}! Tu je prehľad vašej aktivity.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={logout} className="p-2.5 bg-white text-gray-400 hover:text-red-500 border border-gray-100 rounded-xl shadow-sm transition hover:shadow-md" title="Odhlásiť sa">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* SIDEBAR */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group">
                            <div className="h-32 bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                            </div>
                            <div className="px-6 pb-8 -mt-16 flex flex-col items-center text-center relative z-10">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl relative overflow-hidden border border-gray-50 flex items-center justify-center transform transition-transform group-hover:scale-105 duration-500">
                                        {isUploadingAvatar ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={32} className="animate-spin text-brand-600" />
                                                <span className="text-[10px] font-bold text-brand-600">NAHRÁVAM...</span>
                                            </div>
                                        ) : (
                                            user.avatarUrl ? (
                                                <img src={user.avatarUrl} className="w-full h-full object-cover rounded-[2.2rem]" alt={user.name} />
                                            ) : (
                                                <div className="w-full h-full bg-brand-50 flex items-center justify-center text-4xl font-black text-brand-600 rounded-[2.2rem]">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        className="absolute bottom-2 right-2 p-2.5 bg-brand-600 text-white rounded-2xl shadow-xl hover:bg-brand-700 hover:scale-110 transition border-2 border-white disabled:opacity-50"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </div>
                                <h2 className="text-2xl font-black mt-6 text-gray-900 tracking-tight leading-tight">{user.name}</h2>

                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {user.badges.map(b => (
                                        <span key={b} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase border border-green-100 flex items-center gap-1">
                                            <Award size={12} /> {b}
                                        </span>
                                    ))}
                                    {user.isFosterParent && (
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase border border-indigo-100 flex items-center gap-1">
                                            <HomeIcon size={12} /> Dočaskár
                                        </span>
                                    )}
                                </div>

                                <div className="w-full space-y-3 mt-8 text-left bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-500 hover:text-brand-600 transition group cursor-default">
                                        <Mail size={16} className="text-gray-300 group-hover:text-brand-500" />
                                        <span className="text-xs font-bold truncate flex-1">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 hover:text-brand-600 transition group cursor-default">
                                        <Phone size={16} className="text-gray-300 group-hover:text-brand-500" />
                                        <span className="text-xs font-bold flex-1">{user.phone || 'Telefón neuvedený'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 hover:text-brand-600 transition group cursor-default">
                                        <MapPin size={16} className="text-gray-300 group-hover:text-brand-500" />
                                        <span className="text-xs font-bold flex-1">{user.location || 'Lokalita neuvedená'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-50 rounded-full opacity-50 group-hover:scale-125 transition duration-700"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2.5 bg-brand-50 text-brand-600 rounded-2xl"><Trophy size={20} /></div>
                                        <span className="font-black text-gray-800 text-xs uppercase tracking-[0.15em]">Progres profilu</span>
                                    </div>
                                    <span className={`font-black text-2xl ${completionStatus.color}`}>{completionPercent}%</span>
                                </div>
                                <div className="space-y-5">
                                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50">
                                        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-1000 relative" style={{ width: `${completionPercent}%` }}>
                                            <div className="absolute top-0 right-0 h-full w-8 bg-white/20 skew-x-12 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className={`font-black text-lg ${completionStatus.color} tracking-tight`}>{completionStatus.label}</p>
                                        <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">{completionStatus.sub}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[1.8rem] p-1.5 shadow-sm border border-gray-100 flex gap-1 sticky top-24 z-20 backdrop-blur-xl bg-white/90">
                            {[
                                { id: 'about', label: 'Profil', icon: UserIcon },
                                { id: 'activity', label: 'Moja aktivita', icon: Activity },
                                { id: 'settings', label: 'Nastavenia', icon: Settings }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as any); setSelectedInquiry(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-xl shadow-brand-200' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                                >
                                    <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* TAB CONTENT: ABOUT */}
                        {activeTab === 'about' && (
                            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><Smile size={24} /></div>
                                            <h2 className="text-xl font-black text-gray-800 tracking-tight">O mne</h2>
                                        </div>
                                        <button onClick={() => setIsEditingBio(!isEditingBio)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition border border-transparent hover:border-brand-100">
                                            {isEditingBio ? <X size={20} /> : <Edit2 size={18} />}
                                        </button>
                                    </div>
                                    {isEditingBio ? (
                                        <div className="space-y-5">
                                            <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} className="w-full border-2 border-gray-100 rounded-[2rem] p-6 h-40 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none bg-gray-50 text-base font-medium transition-all" placeholder="Napíšte niečo o vašom vzťahu k zvieratám..."></textarea>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors"><Clock size={18} /></div>
                                                <input value={availability} onChange={e => setAvailability(e.target.value)} className="w-full border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 bg-gray-50 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none" placeholder="Kedy máte čas?" />
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4">
                                                <button onClick={() => setIsEditingBio(false)} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition">Zrušiť</button>
                                                <button onClick={handleSaveBio} className="px-10 py-3.5 bg-brand-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-200 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all">
                                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Uložiť zmeny
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 group-hover:bg-white transition-colors duration-500">
                                            <p className="text-gray-600 text-lg leading-relaxed font-medium italic">
                                                {user.bio ? `"${user.bio}"` : 'Zatiaľ ste o sebe nič nenapísali.'}
                                            </p>
                                            {user.availability && (
                                                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                                                    <Clock size={16} className="text-blue-500" />
                                                    <span className="text-sm font-black text-gray-700 uppercase tracking-wide">Dostupnosť: <span className="text-blue-600 font-bold normal-case ml-1">{user.availability}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><HomeIcon size={24} /></div>
                                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Moja domácnosť</h2>
                                        </div>
                                        <button onClick={() => setIsEditingHousehold(!isEditingHousehold)} className="text-brand-600 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors">{isEditingHousehold ? 'Zatvoriť' : 'Upraviť'}</button>
                                    </div>
                                    {isEditingHousehold ? (
                                        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-900">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Typ bývania</label>
                                                    <select value={householdData.housingType} onChange={e => setHouseholdData({ ...householdData, housingType: e.target.value as any })} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none cursor-pointer">
                                                        <option value="Byt">Byt</option><option value="Dom">Dom</option><option value="Dom so záhradou">Dom so záhradou</option><option value="Farma">Farma</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pracovný režim</label>
                                                    <select value={householdData.workMode} onChange={e => setHouseholdData({ ...householdData, workMode: e.target.value as any })} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none cursor-pointer">
                                                        <option value="Práca z domu">Práca z domu</option><option value="Hybrid">Hybrid</option><option value="V kancelárii">V kancelárii</option><option value="Študent/Doma">Študent / Doma</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Skúsenosti so zvieratami</label>
                                                    <select value={householdData.experienceLevel} onChange={e => setHouseholdData({ ...householdData, experienceLevel: e.target.value as any })} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none cursor-pointer">
                                                        <option value="Začiatočník">Začiatočník</option><option value="Mierne pokročilý">Mierne pokročilý</option><option value="Skúsený">Skúsený</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-4 pt-6">
                                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${householdData.hasChildren ? 'bg-pink-50 border-pink-500' : 'bg-gray-50 border-gray-100'}`}>
                                                        <input type="checkbox" checked={householdData.hasChildren} onChange={e => setHouseholdData({ ...householdData, hasChildren: e.target.checked })} className="hidden" />
                                                        <Baby size={18} className={householdData.hasChildren ? 'text-pink-500' : 'text-gray-300'} />
                                                        <span className={`text-xs font-black uppercase tracking-widest ${householdData.hasChildren ? 'text-pink-700' : 'text-gray-400'}`}>Mám deti</span>
                                                    </label>
                                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${householdData.hasOtherPets ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-100'}`}>
                                                        <input type="checkbox" checked={householdData.hasOtherPets} onChange={e => setHouseholdData({ ...householdData, hasOtherPets: e.target.checked })} className="hidden" />
                                                        <Dog size={18} className={householdData.hasOtherPets ? 'text-indigo-500' : 'text-gray-300'} />
                                                        <span className={`text-xs font-black uppercase tracking-widest ${householdData.hasOtherPets ? 'text-indigo-700' : 'text-gray-400'}`}>Iné zvery</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <button onClick={handleSaveHousehold} className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-200 hover:bg-brand-700 transition flex items-center gap-2">
                                                    {isSaving && <Loader2 size={14} className="animate-spin" />} Uložiť domácnosť
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2 group hover:bg-white hover:shadow-md transition-all duration-300">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform"><HomeIcon size={22} /></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bývanie</span>
                                                <span className="text-sm font-black text-gray-700">{user.household?.housingType || 'Neuvedené'}</span>
                                            </div>
                                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2 group hover:bg-white hover:shadow-md transition-all duration-300">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-500 shadow-sm group-hover:scale-110 transition-transform"><Briefcase size={22} /></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Práca</span>
                                                <span className="text-sm font-black text-gray-700">{user.household?.workMode || 'Neuvedené'}</span>
                                            </div>
                                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2 group hover:bg-white hover:shadow-md transition-all duration-300">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform"><Award size={22} /></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Úroveň</span>
                                                <span className="text-sm font-black text-gray-700">{user.household?.experienceLevel || 'Začiatočník'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: ACTIVITY */}
                        {activeTab === 'activity' && (
                            <div className="space-y-12 animate-in fade-in duration-500 pb-12">
                                {selectedInquiry ? (
                                    <div className="flex flex-col space-y-8 animate-in slide-in-from-right duration-500">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => setSelectedInquiry(null)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition"><ArrowLeft size={20} /></button>
                                                <div><h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">Mám záujem o {selectedInquiry.petName}</h2><p className="text-sm text-gray-500 font-medium">Chat s útulkom {relatedShelter?.name}</p></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${getStatusInfo(selectedInquiry.status).bg} ${getStatusInfo(selectedInquiry.status).text} ${getStatusInfo(selectedInquiry.status).border}`}>
                                                    {selectedInquiry.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Added Profile Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Shelter Profile Card */}
                                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center border border-brand-100 flex-shrink-0">
                                                    {relatedShelter?.logoUrl ? <img src={relatedShelter.logoUrl} className="w-full h-full object-cover rounded-2xl" alt="" /> : <Building2 size={32} className="text-brand-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Útulok</div>
                                                    <h3 className="font-bold text-gray-900 truncate">{relatedShelter?.name || 'Neznámy útulok'}</h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {relatedShelter?.location || 'Slovensko'}</p>
                                                </div>
                                                {relatedShelter && (
                                                    <Link to={`/shelters/${relatedShelter.id}`} target="_blank" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-brand-600 hover:text-white transition">
                                                        <ExternalLink size={20} />
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Pet Profile Card */}
                                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200 flex-shrink-0 overflow-hidden">
                                                    <img src={relatedPet?.imageUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Zvieratko</div>
                                                    <h3 className="font-bold text-gray-900 truncate">{relatedPet?.name || selectedInquiry.petName}</h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Dog size={12} /> {relatedPet?.breed || 'Neznáme plemeno'}</p>
                                                </div>
                                                <Link to={`/pets/${selectedInquiry.petId}`} target="_blank" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-brand-600 hover:text-white transition">
                                                    <ExternalLink size={20} />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="w-full">
                                            <ChatWindow
                                                inquiryId={selectedInquiry.id}
                                                currentUser={user}
                                                inverted={true}
                                                myAvatarUrl={user.avatarUrl}
                                                otherAvatarUrl={relatedShelter?.logoUrl}
                                                className="h-[650px] shadow-2xl shadow-gray-200 border-gray-100 rounded-[3rem]"
                                                initialMessage={{ content: selectedInquiry.message, date: selectedInquiry.date, senderId: selectedInquiry.applicantId }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-16">
                                        {/* SECTION: ADOPTION INQUIRIES */}
                                        <section className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl"><MessageCircle size={24} /></div>
                                                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Moje žiadosti o adopciu</h2>
                                                </div>
                                                {myApplications.length > 0 && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{myApplications.length} aktívne</span>}
                                            </div>
                                            {myApplications.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {myApplications.map(app => {
                                                        const status = getStatusInfo(app.status);
                                                        const pet = pets.find(p => p.id === app.petId);

                                                        // OPRAVA LOGIKY: Zobraziť indikátor len ak je neprečítaná správa alebo nový status, ktorý sme ešte nevideli
                                                        const hasChatUnread = (app as any).hasUnreadMessages === true;
                                                        const isNewStatusNotSeen = app.status !== 'Nová' && !seenInquiryIds.includes(app.id);
                                                        const isUnread = hasChatUnread || isNewStatusNotSeen;

                                                        return (
                                                            <div
                                                                key={app.id}
                                                                onClick={() => handleInquiryClick(app)}
                                                                className={`bg-white rounded-[2.5rem] p-6 border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full transform hover:-translate-y-1 relative ${isUnread ? 'border-brand-200 bg-orange-50/10' : 'border-gray-100'}`}
                                                            >
                                                                {isUnread && (
                                                                    <div className="absolute top-6 right-6 w-3 h-3 bg-brand-500 rounded-full animate-pulse shadow-sm border-2 border-white"></div>
                                                                )}

                                                                <div className="flex items-start gap-4 mb-6">
                                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"><img src={pet?.imageUrl} className="w-full h-full object-cover" alt="" /></div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(app.date).toLocaleDateString('sk-SK')}</span>
                                                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest ${status.bg} ${status.text} ${status.border}`}>{app.status}</span>
                                                                        </div>
                                                                        <h3 className={`font-black text-lg leading-tight group-hover:text-brand-600 transition ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{app.petName}</h3>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isUnread ? 'text-brand-600' : 'text-gray-500'}`}>
                                                                            {hasChatUnread ? 'Nová správa!' : isNewStatusNotSeen ? 'Status sa zmenil' : 'Otvoriť chat'}
                                                                        </span>
                                                                    </div>
                                                                    <ChevronRight size={14} className={`${isUnread ? 'text-brand-600' : 'text-gray-400'} group-hover:translate-x-1 transition-all`} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-[3rem] p-16 border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6"><MessageCircle size={40} /></div>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Zatiaľ žiadne žiadosti</h3>
                                                    <Link to="/pets" className="mt-8 px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Hľadať zvieratko</Link>
                                                </div>
                                            )}
                                        </section>

                                        {/* SECTION: VIRTUAL ADOPTIONS */}
                                        <section className="space-y-8">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-pink-50 text-pink-600 rounded-2xl shadow-sm border border-pink-100"><Heart size={24} fill="currentColor" /></div>
                                                    <div><h2 className="text-2xl font-black text-gray-800 tracking-tight">Moji chránenci</h2><p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sponzorstvo na diaľku</p></div>
                                                </div>
                                                <Link to="/pets" className="text-[10px] font-black uppercase text-pink-600 tracking-widest hover:text-pink-700 transition flex items-center gap-1.5">Sponzorovať ďalšieho <PlusCircle size={14} /></Link>
                                            </div>
                                            {virtualAdoptionsWithData.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {virtualAdoptionsWithData.map(adoption => (
                                                        <div key={adoption.petId} className="bg-white rounded-[3.5rem] p-8 md:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
                                                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-50 to-transparent rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 pointer-events-none opacity-60"></div>
                                                            <div className="flex gap-8 mb-10 relative z-10">
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white"><img src={adoption.pet?.imageUrl} className="w-full h-full object-cover" alt="" /></div>
                                                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-50 group-hover:scale-110 transition-transform"><Sparkle size={20} className="text-yellow-400 fill-current" /></div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border border-pink-100 shadow-sm"><Star size={12} fill="currentColor" /> {adoption.months >= 6 ? 'Super rodič' : 'Verný priateľ'}</div>
                                                                    <h3 className="font-black text-gray-900 text-3xl tracking-tight truncate group-hover:text-pink-600 transition">{adoption.pet?.name}</h3>
                                                                    <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-xs"><Calendar size={14} /><span>Pomáhate už <span className="text-pink-600">{adoption.months} mes.</span></span></div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-8 relative z-10 flex-1">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-gray-50/80 p-4 rounded-[1.8rem] border border-gray-100 text-center"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Mesačne</span><span className="text-2xl font-black text-gray-900">{adoption.amount} €</span></div>
                                                                    <div className="bg-pink-50/50 p-4 rounded-[1.8rem] border border-pink-100 text-center"><span className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-1 block">Celková pomoc</span><span className="text-2xl font-black text-pink-600">{adoption.totalDonated} €</span></div>
                                                                </div>
                                                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-inner">
                                                                    <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><Utensils size={14} className="text-brand-500" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Naplnené potreby</span></div><span className="text-[11px] font-black text-brand-600">90%</span></div>
                                                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4 p-0.5"><div className="h-full bg-gradient-to-r from-pink-400 to-brand-500 w-[90%] rounded-full shadow-lg"></div></div>
                                                                    <div className="flex gap-4"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[9px] font-black text-gray-400 uppercase">Strava</span></div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[9px] font-black text-gray-400 uppercase">Zdravie</span></div></div>
                                                                </div>
                                                                <div className="flex gap-4 pt-2">
                                                                    <Link to={`/pets/${adoption.petId}`} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-center hover:bg-brand-600 transition">Navštíviť {adoption.pet?.name}</Link>
                                                                    <button onClick={() => showToast("Spracúvame...", "info")} className="p-4 bg-white text-gray-400 border border-gray-100 rounded-2xl hover:text-brand-600 hover:border-brand-200 transition"><CreditCard size={20} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-[3rem] p-16 border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6"><Heart size={40} /></div>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Zatiaľ žiadni chránenci</h3>
                                                    <Link to="/support" className="mt-8 px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Chcem pomôcť</Link>
                                                </div>
                                            )}
                                        </section>

                                        {/* SECTION: SAVED PETS - IMPROVED CARDS (2 PER ROW, NO TEXT ON PHOTO) */}
                                        <section className="space-y-8">
                                            <div className="flex items-center gap-3 px-2">
                                                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 shadow-sm"><Bookmark size={24} fill="currentColor" /></div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Moji vyvolení kamoši</h2>
                                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Zvieratká, ktoré vás chytili za srdce</p>
                                                </div>
                                            </div>
                                            {favoritePets.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {favoritePets.map(pet => {
                                                        const hasPrefs = user.preferences && user.preferences.types?.length > 0;
                                                        const matchScore = hasPrefs ? 85 : 0;

                                                        return (
                                                            <div key={pet.id} className="relative group animate-in zoom-in-95 duration-500">
                                                                <div className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">

                                                                    {/* Photo Area */}
                                                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                                                        <img src={pet.imageUrl} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt={pet.name} />

                                                                        {/* AI Match Badge - Top Left */}
                                                                        {hasPrefs && (
                                                                            <div className="absolute top-5 left-5">
                                                                                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl flex items-center gap-2 border backdrop-blur-md ${matchScore > 80 ? 'bg-green-600/90 text-white border-green-500' : 'bg-orange-600/90 text-white border-orange-500'}`}>
                                                                                    <Zap size={14} fill="currentColor" className={matchScore > 80 ? 'animate-pulse text-yellow-300' : ''} />
                                                                                    <span>Zhoda {matchScore}%</span>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Status Badge - Top Right */}
                                                                        {pet.adoptionStatus === 'Available' && (
                                                                            <div className="absolute top-5 right-14 sm:right-5">
                                                                                <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-white flex items-center gap-2">
                                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Hľadá domov</span>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Trash Button */}
                                                                        <button
                                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(pet.id); }}
                                                                            className="absolute top-5 right-5 p-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl shadow-xl transition-all border border-gray-100 opacity-0 group-hover:opacity-100 active:scale-90"
                                                                            title="Odstrániť z výberu"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </div>

                                                                    {/* Content Area - Clean white background for best readability */}
                                                                    <Link to={`/pets/${pet.id}`} className="p-8 flex flex-col flex-1 bg-white">
                                                                        <div className="flex justify-between items-start mb-4">
                                                                            <div className="min-w-0">
                                                                                <div className="text-[10px] font-black text-brand-600 uppercase tracking-[0.25em] mb-1.5">{pet.breed}</div>
                                                                                <h3 className="font-black text-gray-900 text-3xl truncate tracking-tight group-hover:text-brand-600 transition-colors leading-none">{pet.name}</h3>
                                                                            </div>
                                                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm flex-shrink-0">
                                                                                <ChevronRight size={28} />
                                                                            </div>
                                                                        </div>

                                                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                                                                            {pet.description.replace(/\*\*/g, '')}
                                                                        </p>

                                                                        <div className="mt-auto flex flex-wrap items-center gap-6 text-gray-400 text-[11px] font-black uppercase tracking-widest pt-5 border-t border-gray-50">
                                                                            <span className="flex items-center gap-2"><MapPin size={14} className="text-brand-500" /> {pet.location}</span>
                                                                            <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /> {formatSlovakAge(pet.age)}</span>
                                                                            <span className="flex items-center gap-2"><Heart size={14} className="text-pink-500" /> {pet.gender}</span>
                                                                        </div>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-[3rem] p-24 border border-dashed border-gray-200 text-center flex flex-col items-center group hover:border-brand-200 transition-colors">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-8 transition-transform group-hover:scale-110"><Bookmark size={40} /></div>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Zoznam vyvolených je prázdny</h3>
                                                    <p className="text-gray-400 mt-2 max-w-xs font-medium">Kliknite na srdiečko pri inzeráte a uvidíte ho tu.</p>
                                                    <Link to="/pets" className="mt-10 px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Prezerať inzeráty</Link>
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB CONTENT: SETTINGS */}
                        {activeTab === 'settings' && (
                            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-3 bg-gray-50 text-gray-600 rounded-2xl"><Settings size={24} /></div>
                                        <h2 className="text-xl font-black text-gray-800 tracking-tight">Nastavenia účtu</h2>
                                    </div>
                                    <div className="space-y-6">
                                        {/* Notifikácie */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 gap-6">
                                            <div className="flex gap-4 items-start">
                                                <div className="p-2 bg-white rounded-xl text-brand-600 shadow-sm">
                                                    {user.emailNotificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800 text-sm tracking-tight">E-mailové notifikácie</p>
                                                    <p className="text-xs text-gray-500 font-medium mt-1">Upozorníme vás e-mailom na každú novú správu v chate.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={toggleEmailNotifications}
                                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${user.emailNotificationsEnabled
                                                        ? 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700'
                                                        : 'bg-white text-gray-400 border-gray-200 hover:border-brand-600 hover:text-brand-600'
                                                    }`}
                                            >
                                                {user.emailNotificationsEnabled ? 'Zapnuté' : 'Vypnuté'}
                                            </button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 gap-6">
                                            <div className="flex gap-4 items-start"><div className="p-2 bg-white rounded-xl text-brand-600 shadow-sm"><ShieldCheck size={20} /></div><div><p className="font-black text-gray-800 text-sm tracking-tight">Prístupové heslo</p><p className="text-xs text-gray-500 font-medium mt-1">Zmeňte si heslo pre vyššiu bezpečnosť.</p></div></div>
                                            <button onClick={handlePasswordReset} className="px-8 py-3 bg-white text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-gray-200 hover:bg-brand-600 hover:text-white transition-all shadow-sm">Zmeniť heslo</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => { setShowDeleteConfirm(false); logout(); }} title="Naozaj nás chcete opustiť?" message="Stratíte prístup k histórii." confirmText="Áno, zmazať účet" variant="danger" />
        </div>
    );
};

export default UserProfilePage;
