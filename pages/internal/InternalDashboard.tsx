import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Pet, AdoptionInquiry, MedicalRecord } from '../../types';
import {
    Dog, Heart, FileText, Activity, Clock, ImageOff,
    Settings, Plus, MessageSquare, CheckCircle2,
    XCircle, AlertTriangle, ChevronRight, ExternalLink,
    TrendingUp, Calendar, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, subDays, isAfter, parseISO, getHours } from 'date-fns';
import { sk } from 'date-fns/locale';

import StatusCard from '../../components/internal/dashboard/StatusCard';
import PriorityList from '../../components/internal/dashboard/PriorityList';

interface DashboardStats {
    pets: Pet[];
    inquiries: AdoptionInquiry[];
    medical: MedicalRecord[];
    loading: boolean;
}

const InternalDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardStats>({ pets: [], inquiries: [], medical: [], loading: true });

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) return;
            try {
                // Parallel fetch for dashboard data with error handling for each
                const [petsResult, inquiriesResult, medicalResult] = await Promise.allSettled([
                    api.getPetsByShelter(currentUser.id),
                    api.getInquiries(),
                    api.getMedicalRecords(currentUser.id)
                ]);

                const petsData = petsResult.status === 'fulfilled' ? petsResult.value : [];
                if (petsResult.status === 'rejected') console.error("Failed to load pets", petsResult.reason);

                const inquiriesData = inquiriesResult.status === 'fulfilled' ? inquiriesResult.value : [];
                if (inquiriesResult.status === 'rejected') console.error("Failed to load inquiries", inquiriesResult.reason);

                const medicalData = medicalResult.status === 'fulfilled' ? medicalResult.value : [];
                if (medicalResult.status === 'rejected') console.error("Failed to load medical records", medicalResult.reason);

                setData({
                    pets: petsData,
                    inquiries: inquiriesData,
                    medical: medicalData,
                    loading: false
                });
            } catch (e) {
                console.error("Dashboard load failed completely", e);
                setData(prev => ({ ...prev, loading: false }));
            }
        };
        loadData();
    }, [currentUser]);

    // --- Calculations ---

    const today = new Date();
    const hour = getHours(today);
    let greeting = 'Dobrý deň';
    if (hour < 10) greeting = 'Dobré ráno';
    else if (hour > 18) greeting = 'Dobrý večer';

    // 1. Status Snapshot Data
    const totalAnimals = data.pets.length;
    const availableAnimals = data.pets.filter(p => p.adoptionStatus === 'Available').length;
    const pendingAdoptions = data.inquiries.filter(i => ['Nová', 'Kontaktovaný'].includes(i.status)).length;
    const underCare = data.pets.filter(p => p.health?.medication && p.health.medication.length > 0).length;

    const validDates = data.pets.map(p => p.intakeDate || p.postedDate).filter(Boolean);
    const avgDays = validDates.length > 0
        ? Math.round(validDates.reduce((acc, date) => acc + (today.getTime() - parseISO(date!).getTime()) / (1000 * 3600 * 24), 0) / validDates.length)
        : 0;

    const missingPhotos = data.pets.filter(p => !p.imageUrl || p.imageUrl.includes('unsplash')).length;

    // 2. Priority List (Action Items)
    const newInquiries = data.inquiries.filter(i => i.status === 'Nová');
    const longStayPets = data.pets.filter(p => p.adoptionStatus === 'Available' && isAfter(parseISO(p.postedDate), subDays(today, 90)));

    const priorityItems = [
        ...newInquiries.map(i => ({
            id: i.id,
            type: 'inquiry',
            priority: 'high' as const,
            title: `Nová žiadosť: ${i.petName}`,
            subtitle: i.applicantName,
            link: 'adoptions',
            date: i.date
        })),
        ...(missingPhotos > 0 ? [{
            id: 'photos',
            type: 'photo',
            priority: 'medium' as const,
            title: `${missingPhotos} zvierat bez fotky`,
            subtitle: 'Pridajte fotky pre vyššiu šancu na adopciu',
            link: 'pets',
            date: new Date().toISOString()
        }] : []),
        ...longStayPets.map(p => ({
            id: p.id,
            type: 'stagnant',
            priority: 'low' as const,
            title: `Dlho v útulku: ${p.name}`,
            subtitle: 'Zvážte aktualizáciu profilu',
            link: 'pets',
            date: p.postedDate
        }))
    ].slice(0, 5);

    // 3. Mini Graphs
    // Chart Data Generation (Last 14 days)
    const activityTrend = Array.from({ length: 14 }).map((_, i) => {
        const d = subDays(today, i);
        return data.inquiries.filter(inq => format(parseISO(inq.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).length;
    }).reverse();
    const maxActivity = Math.max(...activityTrend, 1); // Avoid division by zero

    const adopted30d = data.pets.filter(p => p.adoptionStatus === 'Adopted' && isAfter(parseISO(p.postedDate), subDays(new Date(), 30))).length;
    const new30d = data.pets.filter(p => isAfter(parseISO(p.postedDate), subDays(today, 30))).length;

    // 4. Timeline
    const timeline = [
        ...data.inquiries.map(i => ({ date: i.date, type: 'inquiry', title: 'Nová žiadosť', desc: `${i.applicantName} o ${i.petName}` })),
        ...data.medical.map(m => ({ date: m.date, type: 'medical', title: 'Veterinárny záznam', desc: m.title })),
        ...data.pets.map(p => ({ date: p.postedDate, type: 'pet', title: 'Nové zviera', desc: p.name }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    // Profile Health
    const profileHealth = {
        hasLogo: !!(currentUser as any)?.logoUrl,
        hasDesc: !!(currentUser as any)?.description,
        hasLocation: !!(currentUser as any)?.location,
        activePets: availableAnimals > 0
    };
    const healthPercent = Math.round((Object.values(profileHealth).filter(Boolean).length / 4) * 100);

    if (data.loading) return (
        <div className="h-[50vh] flex flex-col items-center justify-center text-gray-500 gap-4">
            <Activity className="animate-spin text-brand-500" size={32} />
            <span className="font-medium animate-pulse">Načítavam dáta...</span>
        </div>
    );

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-700 ease-out">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        {greeting}, {currentUser?.name}! <span className="text-2xl">👋</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                        Dnes je {format(today, 'd. MMMM yyyy', { locale: sk })}. Máte <span className="font-bold text-gray-800 dark:text-gray-200">{priorityItems.length} dôležitých úloh</span>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('pets/new')} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 dark:shadow-none active:scale-95 flex items-center gap-2">
                        <Plus size={20} /> <span className="hidden sm:inline">Pridať zviera</span>
                    </button>
                    <button onClick={() => window.location.reload()} className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl text-gray-400 dark:text-gray-500 transition shadow-sm" title="Obnoviť dáta">
                        <Activity size={20} />
                    </button>
                </div>
            </div>

            {/* 1. STATUS SNAPSHOT (KPI Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatusCard label="Spolu zvierat" value={totalAnimals} icon={Dog} color="blue" onClick={() => navigate('pets')} />
                <StatusCard label="Na adopciu" value={availableAnimals} icon={Heart} color="green" onClick={() => navigate('pets')} />
                <StatusCard label="Čaká na schválenie" value={pendingAdoptions} icon={FileText} color="orange" onClick={() => navigate('adoptions')} />
                <StatusCard label="V liečení" value={underCare} icon={Activity} color="red" onClick={() => navigate('medical')} />
                <StatusCard label="Priemer dní" value={avgDays || '-'} icon={Clock} color="purple" onClick={() => navigate('pets')} />
                <StatusCard label="Chýba fotka" value={missingPhotos} icon={ImageOff} color="gray" alert={missingPhotos > 0} onClick={() => navigate('pets')} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* LEFT COL (2/3): Priority & Trends */}
                <div className="xl:col-span-2 space-y-8">

                    {/* 2. PRIORITY LIST vs TIMELINE GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[250px]">
                        <PriorityList items={priorityItems} />

                        {/* 4. INTERNAL TIMELINE */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm overflow-hidden h-full flex flex-col hover:shadow-md transition duration-300">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><MessageSquare size={18} /></div>
                                Aktivita tímu
                            </h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pl-2">
                                <div className="space-y-8 relative border-l-2 border-dashed border-gray-100 dark:border-gray-700 ml-3 pl-8 pb-2">
                                    {timeline.length === 0 && (
                                        <div className="text-gray-400 text-sm italic py-10">Žiadna nedávna aktivita.</div>
                                    )}
                                    {timeline.map((item, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className={`absolute -left-[39px] top-1.5 w-4 h-4 rounded-full border-[3px] border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 ${item.type === 'inquiry' ? 'bg-blue-500' : item.type === 'medical' ? 'bg-red-500' : 'bg-green-500'} group-hover:scale-125 transition duration-300 shadow-sm`}></div>
                                            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black mb-1 tracking-wider">{format(parseISO(item.date), 'dd.MM HH:mm')}</div>
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{item.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. TRENDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Activity Graph */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition duration-300">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Záujem o adopcie</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">{activityTrend.reduce((a, b) => a + b, 0)}</span>
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">za 14 dní</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400">
                                    <TrendingUp size={20} />
                                </div>
                            </div>

                            <div className="h-40 flex items-end gap-3">
                                {activityTrend.map((val, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end group h-full relative">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 font-bold">
                                            {val} žiadostí
                                        </div>
                                        <div
                                            className="w-full bg-brand-50 dark:bg-brand-900/30 rounded-t-lg group-hover:bg-brand-500 transition-all duration-300 relative overflow-hidden"
                                            style={{ height: `${(val / maxActivity) * 100}%`, minHeight: '4px' }}
                                        >
                                            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-brand-200 dark:from-brand-800 to-transparent opacity-50"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase">
                                <span>Pred 14 dňami</span>
                                <span>Dnes</span>
                            </div>
                        </div>

                        {/* Monthly Balance Card */}
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
                            {/* Animated Background Elements */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                                <Calendar size={14} /> Mesačná bilancia
                            </h3>

                            <div className="flex items-end justify-between mb-8 relative z-10">
                                <div>
                                    <div className="text-5xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                        +{new30d}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Nových zvierat</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-black text-brand-400">{adopted30d}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Adoptovaných</div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                    <span>Efektivita útulku</span>
                                    <span className="text-white">{new30d > 0 ? Math.round((adopted30d / new30d) * 100) : 0}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="bg-brand-500 h-full rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] relative overflow-hidden"
                                        style={{ width: `${Math.min((adopted30d / Math.max(new30d, 1)) * 100, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COL (1/3): Actions & Profile */}
                <div className="space-y-8">

                    {/* 5. QUICK ACTIONS */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400"><Zap size={18} /></div>
                            Rýchle akcie
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickActionBtn icon={Plus} label="Pridať zviera" onClick={() => navigate('pets/new')} primary />
                            <QuickActionBtn icon={FileText} label="Nahrať dok." onClick={() => navigate('documents')} />
                            <QuickActionBtn icon={Heart} label="Adopcie" onClick={() => navigate('adoptions')} />
                            <QuickActionBtn icon={ExternalLink} label="Webstránka" onClick={() => window.open('/', '_blank')} />
                        </div>
                    </div>

                    {/* 6. PROFILE HEALTH */}
                    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Kvalita profilu</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Kompletne vyplnený profil budí dôveru.</p>
                            </div>
                            <div className="relative transform scale-125">
                                <svg className="w-16 h-16 transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="6" fill="transparent" />
                                    <circle cx="32" cy="32" r="28" stroke={healthPercent === 100 ? '#22c55e' : '#f97316'} strokeWidth="6" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * healthPercent) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-700 dark:text-gray-200">{healthPercent}%</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 relative z-10">
                            <HealthItem label="Logo útulku" checked={profileHealth.hasLogo} />
                            <HealthItem label="Popis a informácie" checked={profileHealth.hasDesc} />
                            <HealthItem label="Poloha na mape" checked={profileHealth.hasLocation} />
                            <HealthItem label="Aktívne zvieratá" checked={profileHealth.activePets} />
                        </div>

                        <button onClick={() => navigate('settings')} className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 shadow-sm text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 group relative z-10">
                            <Settings size={14} className="group-hover:rotate-90 transition duration-300" /> Spravovať profil
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Subcomponents ---

const QuickActionBtn = ({ icon: Icon, label, onClick, primary }: any) => (
    <button
        onClick={onClick}
        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-1 ${primary ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 hover:bg-brand-700' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'}`}
    >
        <Icon size={24} className={primary ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition'} />
        <span className="text-[11px] font-bold uppercase tracking-wide text-center leading-tight">{label}</span>
    </button>
);

const HealthItem = ({ label, checked }: any) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition ${checked ? 'bg-green-50/50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50/50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
        <div className={`p-1 rounded-full ${checked ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200'}`}>
            {checked ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
        </div>
        <span className="text-xs font-bold">{label}</span>
    </div>
);

export default InternalDashboard;
