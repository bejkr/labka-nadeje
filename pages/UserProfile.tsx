
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    Heart, Edit2, Trash2, Home as HomeIcon, Clock, CheckCircle,
    Dog, Lock, LogOut, X,
    User as UserIcon, Loader2,
    ChevronRight, ChevronDown, Sparkles, Camera, Filter, Settings, Activity,
    Smile, Zap, Target, ArrowLeft, MessageCircle,
    Baby, Award, Briefcase, MapPin, Mail, Phone, Coins, ExternalLink, Ruler, Building2, Trophy,
    ListTodo, Info, ShieldCheck, Star, ArrowUpRight,
    Send, Footprints, Quote, CreditCard, Bookmark, Calendar, Utensils, HeartHandshake, ArrowRight,
    TrendingUp, Sparkle, PlusCircle, Bell, BellOff
} from 'lucide-react';
import { User, PetType, Size, Gender, HousingType, WorkMode, ExperienceLevel, UserPreferences, AdoptionInquiry, Shelter, Pet, PetAlert } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import ChatWindow from '../components/ChatWindow';
import CertificateModal from '../components/CertificateModal';
import PetAlertForm from '../components/PetAlertForm';
import { api } from '../services/api';


const PreferenceChip: React.FC<{ label: string, active: boolean, onClick?: () => void, variant?: 'brand' | 'blue' | 'purple' | 'green' | 'gray' }> = ({ label, active, onClick, variant = 'brand' }) => {
    const colors: Record<string, string> = {
        brand: active ? 'bg-brand-600 border-brand-600 text-white shadow-brand-200 shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50',
        blue: active ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200 shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50',
        purple: active ? 'bg-purple-600 border-purple-600 text-white shadow-purple-200 shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50',
        green: active ? 'bg-green-600 border-green-600 text-white shadow-green-200 shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-600 hover:bg-green-50',
        gray: active ? 'bg-gray-800 border-gray-800 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black border-2 transition-all duration-300 transform active:scale-95 ${colors[variant]} ${!onClick ? 'cursor-default' : ''}`}
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

    const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'virtual-adoptions' | 'settings' | 'favorites' | 'alerts'>('about');
    const [selectedInquiry, setSelectedInquiry] = useState<AdoptionInquiry | null>(null);
    const [relatedShelter, setRelatedShelter] = useState<Shelter | null>(null);

    // Alert State
    const [alerts, setAlerts] = useState<PetAlert[]>([]);
    const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);

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
    const [selectedCertificatePet, setSelectedCertificatePet] = useState<any | null>(null);

    const user = useMemo(() => currentUser as User, [currentUser]);

    useEffect(() => {
        if (!currentUser || userRole !== 'user') {
            navigate('/auth');
        }
    }, [currentUser, userRole, navigate]);

    useEffect(() => {
        if (currentUser) {
            fetchAlerts();
        }
    }, [currentUser]);

    const fetchAlerts = async () => {
        try {
            const data = await api.getPetAlerts();
            setAlerts(data);
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        }
    };

    const handleDeleteAlert = async (id: string) => {
        if (!confirm('Naozaj chcete vymazať toto upozornenie?')) return;
        try {
            await api.deletePetAlert(id);
            await fetchAlerts();
            showToast('Upozornenie vymazané', 'success');
        } catch (e) {
            showToast('Chyba pri mazaní', 'error');
        }
    };

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

    const handleCancelAdoption = async (id: string) => {
        if (!confirm("Naozaj chcete zrušiť túto virtuálnu adopciu?")) return;
        try {
            await api.cancelVirtualAdoption(id);
            await updateUserProfile({}); // Refresh profile data
            showToast("Virtuálna adopcia bola zrušená.", "success");
        } catch (e) {
            showToast("Chyba pri rušení adopcie.", "error");
        }
    };


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
            case 'Schválená': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' };
            case 'Zamietnutá': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' };
            case 'Zrušená': return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
            case 'Kontaktovaný': return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' };
            default: return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' };
        }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen text-gray-900 font-sans pb-20">
            {/* LARGE HERO HEADER WITH GLASSMORPHISM */}
            <div className="relative bg-white pt-10 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-700 opacity-[0.03]"></div>
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-5xl md:text-6xl font-[900] text-gray-900 tracking-tighter leading-none mb-4">
                                Váš <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Profil</span>
                            </h1>
                            <p className="text-lg text-gray-500 font-medium max-w-lg">
                                Vitajte späť, {user.name.split(' ')[0]}! Spravujte svoje preferencie, sledujte žiadosti a pomáhajte zvieratkám.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={logout} className="px-6 py-3 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                                <LogOut size={18} /> Odhlásiť
                            </button>
                        </div>
                    </div>

                    {/* STICKY NAV TABS */}
                    <div className="sticky top-6 z-30 p-2 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-gray-200/50 rounded-3xl inline-flex gap-1">
                        {[
                            { id: 'about', label: 'Môj Profil', icon: UserIcon },
                            { id: 'favorites', label: 'Uložené', icon: Heart },
                            { id: 'activity', label: 'Žiadosti', icon: MessageCircle },
                            { id: 'alerts', label: 'Upozornenia', icon: Bell },
                            { id: 'virtual-adoptions', label: 'Virtuálne adopcie', icon: Sparkles },
                            { id: 'settings', label: 'Nastavenia', icon: Settings }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as any); setSelectedInquiry(null); }}
                                className={`
                                    flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black transition-all duration-300
                                    ${activeTab === tab.id
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-100'
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}

                                `}
                            >
                                <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - ALWAYS VISIBLE */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* AVATAR CARD */}
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100/50 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent h-32 z-0"></div>

                            <div className="relative z-10 w-40 h-40 rounded-[2.5rem] p-1.5 bg-white shadow-2xl shadow-brand-100 mb-6 mt-4 group-hover:scale-105 transition-transform duration-500">
                                <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative bg-gray-100">
                                    {isUploadingAvatar ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                                            <Loader2 size={32} className="animate-spin text-brand-600 mb-2" />
                                            <span className="text-[10px] font-black text-brand-600">Nahrávam...</span>
                                        </div>
                                    ) : null}
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-600 text-5xl font-black">{user.name.charAt(0)}</div>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-2 right-2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-brand-600 transition-colors z-20"
                                    >
                                        <Camera size={18} />
                                    </button>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />

                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2 relative z-10">{user.name}</h2>
                            <div className="flex flex-wrap justify-center gap-2 mb-8 relative z-10">
                                {user.badges.map(b => (
                                    <span key={b} className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-[10px] font-black flex items-center gap-1.5">
                                        <Award size={12} /> {b}
                                    </span>
                                ))}
                                {user.isFosterParent && (
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-black flex items-center gap-1.5">
                                        <HomeIcon size={12} /> Dočaskár
                                    </span>
                                )}
                                {virtualAdoptionsWithData.some(va => va.status === 'active') && (
                                    <span className="px-3 py-1 bg-pink-50 text-pink-600 border border-pink-100 rounded-lg text-[10px] font-black flex items-center gap-1.5">
                                        <Heart size={12} fill="currentColor" /> Virtuálny rodič
                                    </span>
                                )}
                            </div>

                            <div className="w-full bg-gray-50/50 rounded-3xl p-5 border border-gray-100 space-y-3 relative z-10 text-left">
                                <div className="flex items-center gap-3 group/item">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm"><Mail size={14} /></div>
                                    <span className="text-xs font-bold text-gray-500 truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm"><Phone size={14} /></div>
                                    <span className="text-xs font-bold text-gray-500">{user.phone || 'Neuvedené'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm"><MapPin size={14} /></div>
                                    <span className="text-xs font-bold text-gray-500">{user.location || 'Slovensko'}</span>
                                </div>
                            </div>
                        </div>

                        {/* PROGRESS CARD */}
                        <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-8 rounded-[2.5rem] shadow-xl shadow-brand-200 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-brand-100">Kompletnosť profilu</div>
                                        <div className="text-4xl font-black tracking-tighter">{completionPercent}%</div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10`}>
                                        <Trophy size={20} className="text-white" />
                                    </div>
                                </div>

                                <div className="h-4 bg-black/20 rounded-full overflow-hidden p-0.5 mb-4 shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-white to-brand-100 rounded-full relative" style={{ width: `${completionPercent}%` }}>
                                        <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-brand-50 leading-relaxed">
                                    {completionStatus.sub}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - DYNAMIC CONTENT */}
                    <div className="lg:col-span-8 animate-in slide-in-from-right-4 duration-500 delay-150">

                        {/* ABOUT TAB */}
                        {activeTab === 'about' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">

                                {/* BIO SECTION */}
                                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                                                <Smile size={24} strokeWidth={2.5} />
                                            </div>
                                            O mne
                                        </h2>
                                        <button
                                            onClick={() => setIsEditingBio(!isEditingBio)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
                                        >
                                            {isEditingBio ? <X size={20} /> : <Edit2 size={20} />}
                                        </button>
                                    </div>

                                    {isEditingBio ? (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 relative z-10">
                                            <textarea
                                                value={bioInput}
                                                onChange={e => setBioInput(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-6 min-h-[180px] focus:bg-white focus:border-brand-500 outline-none text-lg font-medium text-gray-700 transition-all resize-none leading-relaxed"
                                                placeholder="Napíšte nám niečo o sebe, svojej skúsenosti so zvieratami a prečo hľadáte nového člena rodiny..."
                                            />
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="relative flex-1">
                                                    <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        value={availability}
                                                        onChange={e => setAvailability(e.target.value)}
                                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-brand-500 outline-none transition-all"
                                                        placeholder="Napr. Víkendy, Práca z domu, Večery..."
                                                    />
                                                </div>
                                                <button onClick={handleSaveBio} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-brand-600 transition-all shadow-xl hover:shadow-brand-200 active:scale-95">
                                                    Uložiť zmeny
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative z-10">
                                            <div className="prose prose-lg text-gray-600 font-medium leading-relaxed mb-8">
                                                {user.bio ? (
                                                    <p className="whitespace-pre-wrap">{user.bio}</p>
                                                ) : (
                                                    <p className="text-gray-400 italic">Zatiaľ ste o sebe nič nenapísali. Pridajte krátky popis, aby sme vás lepšie spoznali.</p>
                                                )}
                                            </div>

                                            {user.availability && (
                                                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50/50 text-blue-700 rounded-2xl border border-blue-100/50">
                                                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-400">Dostupnosť</span>
                                                    <div className="w-1 h-4 bg-blue-200 rounded-full"></div>
                                                    <span className="font-bold text-sm">{user.availability}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* HOUSEHOLD SECTION */}
                                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                                <HomeIcon size={24} strokeWidth={2.5} />
                                            </div>
                                            Domácnosť
                                        </h2>
                                        <button onClick={() => setIsEditingHousehold(!isEditingHousehold)} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                                            {isEditingHousehold ? 'Zrušiť úpravy' : 'Upraviť'}
                                        </button>
                                    </div>

                                    {isEditingHousehold ? (
                                        <div className="space-y-8 animate-in slide-in-from-top-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {['housingType', 'workMode', 'experienceLevel'].map(field => (
                                                    <div key={field} className="space-y-3">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-wide pl-1">
                                                            {field === 'housingType' ? 'Typ bývania' : field === 'workMode' ? 'Pracovný režim' : 'Skúsenosti'}
                                                        </label>
                                                        <div className="relative group">
                                                            <select
                                                                value={(householdData as any)[field]}
                                                                onChange={e => setHouseholdData({ ...householdData, [field]: e.target.value })}
                                                                className="w-full p-4 pr-10 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer group-hover:border-gray-200"
                                                            >
                                                                <option value="" disabled>Vyberte možnosť</option>
                                                                {field === 'housingType' && ['Byt', 'Dom', 'Dom so záhradou'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                {field === 'workMode' && ['Práca z domu', 'Hybrid', 'V kancelárii', 'Študent', 'Dôchodca'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                {field === 'experienceLevel' && ['Prvé zvieratko', 'Mierne pokročilý', 'Skúsený chovateľ', 'Expert'].map(o => <option key={o} value={o}>{o}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" size={16} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-wide mb-4 block">Členovia domácnosti</label>
                                                <div className="flex gap-4">
                                                    {[
                                                        { key: 'hasChildren', label: 'Deti v domácnosti', icon: Baby, color: 'text-pink-500', bg: 'peer-checked:bg-pink-50', border: 'peer-checked:border-pink-200', text: 'peer-checked:text-pink-700' },
                                                        { key: 'hasOtherPets', label: 'Iné zvieratá', icon: Dog, color: 'text-orange-500', bg: 'peer-checked:bg-orange-50', border: 'peer-checked:border-orange-200', text: 'peer-checked:text-orange-700' }
                                                    ].map(item => (
                                                        <label key={item.key} className="flex-1 cursor-pointer group relative">
                                                            <input type="checkbox" checked={(householdData as any)[item.key]} onChange={e => setHouseholdData({ ...householdData, [item.key]: e.target.checked })} className="peer hidden" />
                                                            <div className={`p-6 rounded-2xl border-2 border-transparent bg-white shadow-sm flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.02] ${item.bg} ${item.border}`}>
                                                                <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ${item.color} group-hover:bg-white transition-colors`}>
                                                                    <item.icon size={24} />
                                                                </div>
                                                                <span className={`font-bold text-sm text-gray-400 ${item.text} transition-colors`}>{item.label}</span>
                                                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-gray-100 peer-checked:bg-green-500 peer-checked:border-green-500 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
                                                                    <CheckCircle size={14} />
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4 border-t border-gray-50">
                                                <button onClick={handleSaveHousehold} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95">
                                                    Uložiť informácie
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Bývanie', val: user.household?.housingType, icon: HomeIcon, theme: 'blue' },
                                                { label: 'Práca / Režim', val: user.household?.workMode, icon: Briefcase, theme: 'purple' },
                                                { label: 'Deti', val: user.household?.hasChildren ? 'Sú v rodine' : 'Bez detí', icon: Baby, theme: 'pink' },
                                                { label: 'Zvieratá', val: user.household?.hasOtherPets ? 'Máme zvieratá' : 'Bez zvierat', icon: Dog, theme: 'orange' }
                                            ].map(item => (
                                                <div key={item.label} className={`group p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 ${item.theme === 'blue' ? 'bg-blue-50/30 border-blue-100 hover:shadow-lg hover:shadow-blue-100' :
                                                    item.theme === 'purple' ? 'bg-purple-50/30 border-purple-100 hover:shadow-lg hover:shadow-purple-100' :
                                                        item.theme === 'pink' ? 'bg-pink-50/30 border-pink-100 hover:shadow-lg hover:shadow-pink-100' :
                                                            'bg-orange-50/30 border-orange-100 hover:shadow-lg hover:shadow-orange-100'
                                                    }`}>
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.theme === 'blue' ? 'bg-blue-100 text-blue-600' :
                                                        item.theme === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                            item.theme === 'pink' ? 'bg-pink-100 text-pink-600' :
                                                                'bg-orange-100 text-orange-600'
                                                        }`}>
                                                        <item.icon size={22} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{item.label}</div>
                                                    <div className="text-base font-bold text-gray-900">{item.val || '-'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* PREFERENCES SECTION */}
                                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                                                <Heart size={24} strokeWidth={2.5} />
                                            </div>
                                            Preferencie
                                        </h2>
                                        <button onClick={() => setIsEditingPreferences(!isEditingPreferences)} className="px-6 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs hover:bg-purple-100 transition-colors">
                                            {isEditingPreferences ? 'Zrušiť úpravy' : 'Upraviť'}
                                        </button>
                                    </div>

                                    {isEditingPreferences ? (
                                        <div className="space-y-12 animate-in slide-in-from-top-2">
                                            {[
                                                { title: 'O aké zvieratko máte záujem?', items: [PetType.DOG, PetType.CAT, PetType.RABBIT, PetType.BIRD, PetType.RODENT], key: 'types', variant: 'brand' },
                                                { title: 'Preferovaná veľkosť (pri psoch)', items: [Size.SMALL, Size.MEDIUM, Size.LARGE], key: 'sizes', variant: 'blue' },
                                                { title: 'Veková kategória', items: ['Šteňa/Mača', 'Mladý', 'Dospelý', 'Senior'], key: 'ageRange', variant: 'green' },
                                                { title: 'Pohlavie', items: [Gender.MALE, Gender.FEMALE], key: 'genders', format: (g: any) => g === Gender.MALE ? 'Samec' : 'Samica', variant: 'purple' }
                                            ].map((group: any) => (
                                                <div key={group.key} className="space-y-4">
                                                    <h3 className="text-sm font-black text-gray-900 ml-1">{group.title}</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {group.items.map((item: any) => (
                                                            <PreferenceChip
                                                                key={item}
                                                                label={group.format ? group.format(item) : item}
                                                                active={((Array.isArray(prefData[group.key as keyof UserPreferences])) ? (prefData[group.key as keyof UserPreferences] as any[]).includes(item) : false)}
                                                                onClick={() => toggleArrayItem(group.key as keyof UserPreferences, item)}
                                                                variant={group.variant}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-end pt-6 border-t border-gray-50">
                                                <button onClick={handleSavePreferences} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-200 hover:bg-purple-700 transition active:scale-95">
                                                    Uložiť preferencie
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {[
                                                { title: 'Hľadám', items: user.preferences?.types, variant: 'brand' },
                                                { title: 'Pohlavie', items: user.preferences?.genders?.map(g => g === Gender.MALE ? 'Samec' : 'Samica'), variant: 'purple' },
                                                { title: 'Veľkosti', items: user.preferences?.sizes, variant: 'blue' },
                                                { title: 'Vek', items: user.preferences?.ageRange, variant: 'green' },
                                            ].filter(g => g.items && g.items.length > 0).length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                                    {[
                                                        { title: 'Hľadám', items: user.preferences?.types, color: 'text-brand-600', bg: 'bg-brand-50' },
                                                        { title: 'Pohlavie', items: user.preferences?.genders?.map(g => g === Gender.MALE ? 'Samec' : 'Samica'), color: 'text-purple-600', bg: 'bg-purple-50' },
                                                        { title: 'Veľkosti', items: user.preferences?.sizes, color: 'text-blue-600', bg: 'bg-blue-50' },
                                                        { title: 'Vek', items: user.preferences?.ageRange, color: 'text-green-600', bg: 'bg-green-50' },
                                                    ].filter(g => g.items && g.items.length > 0).map(group => (
                                                        <div key={group.title} className="space-y-3">
                                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">{group.title}</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {group.items.map((item: any) => (
                                                                    <span key={item} className={`px-4 py-2 ${group.bg} ${group.color} rounded-xl text-sm font-bold`}>{item}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-100">
                                                    <span className="text-gray-400 font-medium">Zatiaľ ste si nenastavili žiadne preferencie.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ACTIVITY TAB */}
                        {activeTab === 'activity' && (
                            <div className="space-y-6">
                                {selectedInquiry ? (
                                    <div className="animate-in slide-in-from-right duration-500">
                                        <div className="flex items-center gap-4 mb-6">
                                            <button onClick={() => setSelectedInquiry(null)} className="p-4 bg-white rounded-[1.5rem] shadow-sm hover:shadow-md transition-all border border-gray-100 group"><ArrowLeft size={20} className="text-gray-400 group-hover:text-gray-900" /></button>
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedInquiry.petName}</h2>
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black ${getStatusInfo(selectedInquiry.status).bg} ${getStatusInfo(selectedInquiry.status).text} mt-1`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusInfo(selectedInquiry.status).dot}`}></div>
                                                    {selectedInquiry.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
                                                <div className="w-20 h-20 bg-gray-100 rounded-[1.8rem] overflow-hidden flex-shrink-0">
                                                    <img src={relatedPet?.imageUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-400 mb-1">Žiadosť o adopciu</div>
                                                    <h3 className="text-lg font-black text-gray-900">{relatedPet?.name}</h3>
                                                    <div className="text-xs font-bold text-gray-500 mt-1">{relatedPet?.breed}</div>
                                                </div>
                                                <Link to={`/pets/${selectedInquiry.petId}`} target="_blank" className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><ExternalLink size={20} /></Link>
                                            </div>

                                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
                                                <div className="w-20 h-20 bg-brand-50 rounded-[1.8rem] flex items-center justify-center text-brand-600 flex-shrink-0">
                                                    {relatedShelter?.logoUrl ? <img src={relatedShelter.logoUrl} className="w-full h-full object-cover rounded-[1.8rem]" alt="" /> : <Building2 size={32} />}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-400 mb-1">Útulok</div>
                                                    <h3 className="text-lg font-black text-gray-900">{relatedShelter?.name || 'Načítavam...'}</h3>
                                                    <div className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {relatedShelter?.location || '-'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-[700px]">
                                            <ChatWindow
                                                inquiryId={selectedInquiry.id}
                                                currentUser={user}
                                                inverted={true}
                                                myAvatarUrl={user.avatarUrl}
                                                otherAvatarUrl={relatedShelter?.logoUrl}
                                                className="h-full shadow-2xl shadow-gray-200 border border-gray-100 rounded-[3rem]"
                                                initialMessage={{ content: selectedInquiry.message, date: selectedInquiry.date, senderId: selectedInquiry.applicantId }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* APPLICATIONS LIST */}
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MessageCircle size={24} /></div>
                                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Žiadosti o adopciu</h2>
                                            </div>

                                            {myApplications.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-8">
                                                    {myApplications.map(app => {
                                                        const status = getStatusInfo(app.status);
                                                        const pet = pets.find(p => p.id === app.petId);
                                                        const hasChatUnread = (app as any).hasUnreadMessages === true;

                                                        return (
                                                            <div
                                                                key={app.id}
                                                                onClick={() => handleInquiryClick(app)}
                                                                className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row"
                                                            >
                                                                {/* Left Section: Image & Status */}
                                                                <div className="w-full md:w-1/3 bg-gray-50/50 p-8 flex flex-col items-center justify-center text-center relative group-hover:bg-brand-50/30 transition-colors">
                                                                    <div className="w-32 h-32 rounded-[2rem] bg-white shadow-lg overflow-hidden mb-6 relative group-hover:scale-105 transition-transform duration-500">
                                                                        <img src={pet?.imageUrl} className="w-full h-full object-cover" alt="" />
                                                                        {hasChatUnread && <div className="absolute top-3 right-3 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>}
                                                                    </div>
                                                                    <h3 className="text-2xl font-black text-gray-900 mb-2">{pet?.name}</h3>
                                                                    <div className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${status.bg} ${status.text}`}>
                                                                        {app.status}
                                                                    </div>
                                                                </div>

                                                                {/* Right Section: Content */}
                                                                <div className="p-8 md:p-10 flex-1 flex flex-col">
                                                                    <div className="flex justify-between items-start mb-6">
                                                                        <div>
                                                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Dátum žiadosti</div>
                                                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                                                <Calendar size={16} className="text-gray-400" />
                                                                                {new Date(app.date).toLocaleDateString('sk-SK')}
                                                                            </div>
                                                                        </div>
                                                                        <div className="hidden md:block">
                                                                            <ChevronRight size={24} className="text-gray-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                                                                        </div>
                                                                    </div>

                                                                    <div className="mb-8 flex-1">
                                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Vaša správa</div>
                                                                        <p className="text-gray-600 font-medium italic leading-relaxed line-clamp-2 md:line-clamp-3">"{app.message}"</p>
                                                                    </div>

                                                                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100">
                                                                        <span className="flex-1 text-sm font-black text-gray-900 group-hover:text-brand-600 transition-colors">Prejsť do konverzácie</span>
                                                                        <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs group-hover:bg-brand-600 transition-colors shadow-lg shadow-gray-200 flex items-center gap-2">
                                                                            Otvoriť chat <ArrowRight size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-200">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4"><MessageCircle size={32} /></div>
                                                    <p className="text-gray-400 font-medium">Zatiaľ žiadne žiadosti</p>
                                                </div>
                                            )}
                                        </section>
                                    </>
                                )}
                            </div>
                        )}

                        {/* FAVORITES TAB */}
                        {activeTab === 'favorites' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Heart size={24} fill="currentColor" /></div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Uložené Zvieratká</h2>
                                            <p className="text-sm text-gray-500 font-medium">Váš zoznam obľúbených miláčikov.</p>
                                        </div>
                                    </div>

                                    {favoritePets.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {favoritePets.map(pet => (
                                                <div key={pet.id} className="group bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); toggleFavorite(pet.id); }}
                                                        className="absolute top-6 right-6 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-sm hover:bg-white hover:scale-110 transition"
                                                        title="Odstrániť z uložených"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <Link to={`/pets/${pet.id}`} className="block aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-gray-100 relative">
                                                        <img src={pet.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={pet.name} />
                                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="flex items-center gap-2 text-xs font-bold">
                                                                <MapPin size={12} /> {pet.location}
                                                            </div>
                                                        </div>
                                                    </Link>

                                                    <div className="px-2 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-brand-600 transition-colors">{pet.name}</h3>
                                                            {pet.gender === 'Samec' ? <span className="p-1 bg-blue-50 text-blue-500 rounded-lg"><Dog size={14} /></span> : <span className="p-1 bg-pink-50 text-pink-500 rounded-lg"><Dog size={14} /></span>}
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-400 mb-4">{pet.breed} • {pet.age} rokov</p>

                                                        <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
                                                            <Link to={`/pets/${pet.id}`} className="flex-1 py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl text-center hover:bg-brand-600 transition shadow-lg shadow-gray-200">
                                                                Zobraziť profil
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm"><Heart size={32} /></div>
                                            <h3 className="text-lg font-black text-gray-900 mb-2">Zatiaľ žiadne srdcovky</h3>
                                            <p className="text-gray-400 font-medium max-w-xs mx-auto mb-8">Prehliadajte zvieratká a uložte si tie, ktoré vás chytia za srdce.</p>
                                            <Link to="/pets" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-brand-700 transition shadow-xl shadow-brand-200">
                                                <Dog size={18} /> Prehľadávať zvieratká
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* VIRTUAL ADOPTIONS TAB */}
                        {activeTab === 'virtual-adoptions' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl"><Sparkles size={24} /></div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Moje virtuálne adopcie</h2>
                                            <p className="text-sm text-gray-500 font-medium">Spravujte svoje pravidelné príspevky pre útulkáčov.</p>
                                        </div>
                                    </div>

                                    {virtualAdoptionsWithData.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 gap-6">
                                                {virtualAdoptionsWithData.map(va => (
                                                    <div key={va.id} className={`bg-white p-6 rounded-[2.5rem] border-2 ${va.status === 'active' ? 'border-pink-100 shadow-lg shadow-pink-50' : 'border-gray-100 opacity-70'} flex flex-col md:flex-row items-center gap-6 relative overflow-hidden transition-all hover:border-pink-200`}>
                                                        {va.status === 'active' && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl">AKTÍVNE</div>}
                                                        {va.status === 'cancelled' && <div className="absolute top-0 right-0 bg-gray-400 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl">ZRUŠENÉ</div>}

                                                        <div className="w-full md:w-32 h-32 rounded-[2rem] bg-gray-100 overflow-hidden shadow-md flex-shrink-0 relative group">
                                                            <img src={va.petImage || va.pet?.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                                        </div>

                                                        <div className="flex-1 text-center md:text-left w-full">
                                                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                                                <h3 className="text-2xl font-black text-gray-900">{va.petName || va.pet?.name}</h3>
                                                                <span className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black rounded-full w-max mx-auto md:mx-0">
                                                                    <Heart size={10} fill="currentColor" /> {va.amount} € mesačne
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 text-sm font-bold text-gray-500 mt-4">
                                                                <div className="bg-gray-50 px-4 py-2 rounded-xl flex flex-col md:block">
                                                                    <span className="text-[10px] text-gray-400 block md:inline md:mr-2">Celkovo darované:</span>
                                                                    <span className="text-brand-600">{va.totalDonated} €</span>
                                                                </div>
                                                                <div className="bg-gray-50 px-4 py-2 rounded-xl flex flex-col md:block">
                                                                    <span className="text-[10px] text-gray-400 block md:inline md:mr-2">Doba podpory:</span>
                                                                    <span className="text-gray-700">{va.months} mesiacov</span>
                                                                </div>
                                                                <div className="bg-gray-50 px-4 py-2 rounded-xl flex flex-col md:block">
                                                                    <span className="text-[10px] text-gray-400 block md:inline md:mr-2">Ďalšia platba:</span>
                                                                    <span className="text-gray-700">{new Date(va.nextBillingDate).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3 w-full md:w-auto">
                                                            <div className="flex flex-col gap-2 w-full">
                                                                <Link to={`/pets/${va.petId}`} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-brand-600 transition text-center shadow-lg shadow-gray-200 hover:shadow-brand-200">
                                                                    Pozrieť profil
                                                                </Link>
                                                                <button
                                                                    onClick={() => setSelectedCertificatePet(va)}
                                                                    className="px-6 py-3 bg-brand-50 text-brand-700 border-2 border-brand-100 rounded-2xl font-black text-xs hover:bg-brand-100 hover:border-brand-200 transition text-center flex items-center justify-center gap-2"
                                                                >
                                                                    <Award size={14} /> Certifikát
                                                                </button>
                                                            </div>
                                                            {va.status === 'active' && (
                                                                <button
                                                                    onClick={() => handleCancelAdoption(va.id)}
                                                                    className="px-6 py-3 bg-white border-2 border-red-50 text-red-400 rounded-2xl font-black text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition"
                                                                >
                                                                    Zrušiť predplatné
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* EXCLUSIVE UPDATES SECTION */}
                                            <div className="mt-12 pt-12 border-t border-gray-100">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MessageCircle size={24} /></div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-gray-900">Novinky z útulku</h3>
                                                        <p className="text-sm text-gray-500 font-medium">Čo majú nové vaši zverenci.</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-8">
                                                    {(() => {
                                                        const allUpdates = virtualAdoptionsWithData.flatMap(va =>
                                                            (va.pet?.updates || []).map(update => ({
                                                                ...update,
                                                                petName: va.pet?.name || 'Zvieratko',
                                                            }))
                                                        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                                        if (allUpdates.length === 0) {
                                                            return (
                                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                                                                        <Sparkles size={24} />
                                                                    </div>
                                                                    <p className="font-bold text-gray-400 text-sm">Zatiaľ žiadne novinky.</p>
                                                                    <p className="text-xs text-gray-400 mt-1">Útulok čoskoro pridá aktualizácie o vašich zverencoch.</p>
                                                                </div>
                                                            );
                                                        }

                                                        return allUpdates.map(update => (
                                                            <div key={update.id} className="flex gap-4">
                                                                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm border border-pink-100">
                                                                    {update.type === 'photo' ? <Camera size={20} /> : <Heart size={20} fill="currentColor" />}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-black text-gray-900">{update.petName}</span>
                                                                        <span className="text-[10px] font-bold text-gray-400">• {new Date(update.date).toLocaleDateString('sk-SK')}</span>
                                                                    </div>
                                                                    <h4 className="text-sm font-bold text-gray-800 mb-1">{update.title}</h4>
                                                                    <p className="text-sm text-gray-600 font-medium leading-relaxed break-words whitespace-pre-wrap">
                                                                        {update.content}
                                                                    </p>
                                                                    {update.imageUrl && (
                                                                        <div className="mt-3 max-w-sm rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                                                            <img src={update.imageUrl} className="w-full h-auto max-h-80 object-contain" alt="Aktualizácia" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-12 rounded-[2.5rem] text-center border-2 border-white shadow-sm">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-pink-400 mx-auto mb-6 shadow-sm animate-bounce">
                                                <Heart size={32} fill="currentColor" />
                                            </div>
                                            <h3 className="font-black text-2xl text-gray-900 mb-2">Zatiaľ nikoho nepodporujete</h3>
                                            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">Vyberte si zvieratko z útulku a staňte sa jeho virtuálnym rodičom. Už od 5€ mesačne.</p>
                                            <Link to="/" className="inline-block px-8 py-4 bg-white text-pink-600 shadow-xl shadow-pink-100 rounded-2xl font-black hover:scale-105 transition transform">
                                                Nájsť zvieratko na adopciu
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'alerts' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><Bell size={24} /></div>
                                            <div>
                                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upozornenia</h2>
                                                <p className="text-sm text-gray-500 font-medium">Dostávajte e-maily o nových zvieratkách.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsAlertFormOpen(true)} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-brand-600 transition shadow-lg shadow-gray-200 hover:shadow-brand-200">
                                            <PlusCircle size={16} /> Pridať upozornenie
                                        </button>
                                    </div>

                                    {alerts.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                            {alerts.map(alert => (
                                                <div key={alert.id} className="group bg-gray-50 p-6 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-brand-100/50 hover:border-brand-100 transition-all duration-300 relative">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="p-3 bg-white rounded-2xl text-brand-600 shadow-sm group-hover:bg-brand-50 transition-colors">
                                                            <Bell size={20} />
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAlert(alert.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>

                                                    <h3 className="text-lg font-black text-gray-900 mb-2">{alert.name}</h3>

                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {alert.filters.types && alert.filters.types.map(t => <span key={t} className="px-3 py-1 bg-white text-gray-600 rounded-lg text-xs font-bold border border-gray-100 shadow-sm">{t}</span>)}
                                                        {alert.filters.locations && alert.filters.locations.map(l => <span key={l} className="px-3 py-1 bg-white text-gray-600 rounded-lg text-xs font-bold border border-gray-100 shadow-sm"><MapPin size={10} className="inline mr-1" />{l}</span>)}
                                                        {alert.filters.breeds && alert.filters.breeds.map(b => <span key={b} className="px-3 py-1 bg-white text-gray-600 rounded-lg text-xs font-bold border border-gray-100 shadow-sm">{b}</span>)}
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center gap-2 text-xs font-bold text-gray-400">
                                                        <Clock size={12} /> Vytvorené {new Date(alert.createdAt).toLocaleDateString('sk-SK')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-yellow-100/50">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-yellow-400 mx-auto mb-6 shadow-sm">
                                                <BellOff size={32} />
                                            </div>
                                            <h3 className="font-black text-2xl text-gray-900 mb-2">Žiadne aktívne upozornenia</h3>
                                            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">Vytvorte si upozornenie a my vás budeme informovať, keď pribudne zvieratko podľa vašich predstáv.</p>
                                        </div>
                                    )}
                                </div>
                                {isAlertFormOpen && <PetAlertForm onClose={() => setIsAlertFormOpen(false)} onSuccess={() => { setIsAlertFormOpen(false); fetchAlerts(); showToast('Upozornenie vytvorené', 'success'); }} />}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Nastavenia účtu</h2>

                                    <div className="divide-y divide-gray-100">
                                        <div className="py-6 flex items-center justify-between">
                                            <div className="flex gap-4 items-center">
                                                <div className="p-3 bg-gray-50 text-gray-600 rounded-2xl"><Bell size={20} /></div>
                                                <div>
                                                    <p className="font-black text-gray-900">E-mailové notifikácie</p>
                                                    <p className="text-xs text-gray-500 font-bold mt-1">Dostávať novinky a aktualizácie e-mailom</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={toggleEmailNotifications}
                                                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${user.emailNotificationsEnabled ? 'bg-brand-500' : 'bg-gray-200'}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${user.emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </button>
                                        </div>

                                        <div className="py-6 flex items-center justify-between">
                                            <div className="flex gap-4 items-center">
                                                <div className="p-3 bg-gray-50 text-gray-600 rounded-2xl"><Lock size={20} /></div>
                                                <div>
                                                    <p className="font-black text-gray-900">Zmena hesla</p>
                                                    <p className="text-xs text-gray-500 font-bold mt-1">Z bezpečnostných dôvodov odporúčame pravidelnú zmenu</p>
                                                </div>
                                            </div>
                                            <button onClick={handlePasswordReset} className="px-5 py-2.5 bg-gray-50 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-100 transition">Zmeniť heslo</button>
                                        </div>

                                        <div className="py-8 mt-4">
                                            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="flex gap-4 items-start">
                                                    <div className="p-3 bg-white text-red-500 rounded-2xl shadow-sm"><Trash2 size={24} /></div>
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-lg">Zmazať účet</h3>
                                                        <p className="text-sm text-gray-600 font-medium max-w-sm mt-1">Táto akcia je nevratná. Všetky vaše údaje a história budú navždy odstránené.</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-white border border-red-100 text-red-600 font-black text-xs rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm whitespace-nowrap">
                                                    Odstrániť môj účet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                </div>
            </div>


            <CertificateModal
                isOpen={!!selectedCertificatePet}
                onClose={() => setSelectedCertificatePet(null)}
                adoption={selectedCertificatePet}
                userName={user.name}
            />

            <ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => { setShowDeleteConfirm(false); logout(); }} title="Naozaj nás chcete opustiť?" message="Stratíte prístup k histórii." confirmText="Áno, zmazať účet" variant="danger" />
        </div>
    );
};

export default UserProfilePage;
