
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Pet, AdoptionInquiry, MedicalRecord } from '../../types';
import {
    LayoutDashboard, Users, AlertCircle, Clock, FileText,
    Settings, Plus, ChevronRight, CheckCircle2, XCircle,
    Activity, MessageSquare, ImageOff, Heart, AlertTriangle, Dog
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { sk } from 'date-fns/locale';

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
                // Parallel fetch for dashboard data
                const [petsData, inquiriesData, medicalData] = await Promise.all([
                    api.getPetsByShelter(currentUser.id),
                    api.getInquiries(),
                    api.getMedicalRecords(currentUser.id)
                ]);
                setData({
                    pets: petsData,
                    inquiries: inquiriesData,
                    medical: medicalData,
                    loading: false
                });
            } catch (e) {
                console.error("Dashboard load failed", e);
                setData(prev => ({ ...prev, loading: false }));
            }
        };
        loadData();
    }, [currentUser]);

    // --- Calculations ---

    const today = new Date();

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
            priority: 'high',
            title: `Nová žiadosť: ${i.petName}`,
            subtitle: i.applicantName,
            link: 'adoptions', // Simplified relative link
            date: i.date
        })),
        ...(missingPhotos > 0 ? [{
            id: 'photos',
            type: 'photo',
            priority: 'medium',
            title: `${missingPhotos} zvierat bez fotky`,
            subtitle: 'Pridajte fotky pre vyššiu šancu na adopciu',
            link: 'pets',
            date: new Date().toISOString()
        }] : []),
        ...longStayPets.map(p => ({
            id: p.id,
            type: 'stagnant',
            priority: 'low',
            title: `Dlho v útulku: ${p.name}`,
            subtitle: 'Zvážte aktualizáciu profilu',
            link: 'pets',
            date: p.postedDate
        }))
    ].slice(0, 5); // Limit to top 5

    // 3. Mini Graphs (Synthesized Data for Demo)
    // Generating last 14 days activity array based on real inquiry dates
    const activityTrend = Array.from({ length: 14 }).map((_, i) => {
        const d = subDays(today, i);
        return data.inquiries.filter(inq => format(parseISO(inq.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).length;
    }).reverse();

    // Mocking "Adopted last 30 days" - strictly we need Date of adoption, using Update date or created date for now
    const adopted30d = data.pets.filter(p => p.adoptionStatus === 'Adopted' && isAfter(parseISO(p.postedDate), subDays(new Date(), 30))).length;

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

    if (data.loading) return <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4"><Activity className="animate-spin text-brand-500" /> Načítavam dáta...</div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* 1. STATUS SNAPSHOT (KPI Cards) */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold text-gray-900">Prehľad útulku</h2>
                    <span className="text-sm font-medium text-gray-400">{format(today, 'd. MMMM yyyy', { locale: sk })}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatusCard label="Spolu zvierat" value={totalAnimals} icon={Dog} color="blue" onClick={() => navigate('pets')} />
                    <StatusCard label="Na adopciu" value={availableAnimals} icon={Heart} color="green" onClick={() => navigate('pets')} />
                    <StatusCard label="Čaká na schválenie" value={pendingAdoptions} icon={FileText} color="orange" onClick={() => navigate('adoptions')} />
                    <StatusCard label="V liečení" value={underCare} icon={Activity} color="red" onClick={() => navigate('medical')} />
                    <StatusCard label="Dní v útulku (avg)" value={avgDays || '-'} icon={Clock} color="purple" onClick={() => navigate('pets')} />
                    <StatusCard label="Chýba fotka" value={missingPhotos} icon={ImageOff} color="gray" alert={missingPhotos > 0} onClick={() => navigate('pets')} />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COL: Priority & Trends */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 2. PRIORITY LIST */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <AlertCircle size={18} className="text-red-500" />
                                Vyžaduje pozornosť
                            </h3>
                            {priorityItems.length > 0 && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{priorityItems.length}</span>}
                        </div>
                        <div className="divide-y divide-gray-100">
                            {priorityItems.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">Všetko v poriadku, žiadne urgentné úlohy. 🎉</div>
                            ) : (
                                priorityItems.map((item, idx) => (
                                    <div key={idx} onClick={() => navigate(item.link)} className="p-4 hover:bg-gray-50 transition cursor-pointer flex items-center gap-4 group">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-orange-500' : 'bg-yellow-400'}`} />
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900 text-sm group-hover:text-brand-600">{item.title}</div>
                                            <div className="text-xs text-gray-500">{item.subtitle}</div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 3. TRENDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Aktivita žiadostí (14 dní)</h3>
                            <div className="h-24 flex items-end gap-1">
                                {activityTrend.map((val, i) => (
                                    <div key={i} className="flex-1 bg-brand-100 rounded-t-sm hover:bg-brand-200 transition relative group" style={{ height: `${Math.max(val * 10, 10)}%` }}>
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                            {val}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-center">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Mesačná bilancia</h3>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-3xl font-black text-gray-900">+{data.pets.filter(p => isAfter(parseISO(p.postedDate), subDays(today, 30))).length}</div>
                                    <div className="text-xs text-gray-500 font-bold">NOVÉ ZVIERATÁ</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-brand-600">{adopted30d}</div>
                                    <div className="text-xs text-gray-500 font-bold">ADOPTOVANÉ</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-green-500 h-full rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <div className="text-center text-xs text-gray-400 mt-2 font-medium">Úspešnosť adopcií tento mesiac</div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COL: Actions, Timeline, Profile */}
                <div className="space-y-6">

                    {/* 5. QUICK ACTIONS */}
                    <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={18} /> Rýchle akcie</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickActionBtn icon={Plus} label="Nové zviera" onClick={() => navigate('pets')} />
                            <QuickActionBtn icon={FileText} label="Nahrať dok." onClick={() => navigate('documents')} />
                            <QuickActionBtn icon={Heart} label="Adopcie" onClick={() => navigate('adoptions')} />
                            <QuickActionBtn icon={Activity} label="Refresh" onClick={() => window.location.reload()} secondary />
                        </div>
                    </div>

                    {/* 6. PROFILE HEALTH */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Profil</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-black ${healthPercent === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {healthPercent}%
                            </span>
                        </div>
                        <div className="space-y-3 mb-4">
                            {!profileHealth.hasLogo && <div className="text-xs text-red-500 font-medium flex items-center gap-1"><XCircle size={12} /> Chýba logo</div>}
                            {!profileHealth.hasDesc && <div className="text-xs text-red-500 font-medium flex items-center gap-1"><XCircle size={12} /> Chýba popis</div>}
                            {!profileHealth.activePets && <div className="text-xs text-orange-500 font-medium flex items-center gap-1"><AlertTriangle size={12} /> Žiadne aktívne zvieratá</div>}
                            {healthPercent === 100 && <div className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Všetko vyplnené</div>}
                        </div>
                        {healthPercent < 100 && (
                            <button onClick={() => navigate('settings')} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold transition">
                                Doplniť údaje
                            </button>
                        )}
                    </div>

                    {/* 4. INTERNAL TIMELINE */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm max-h-[400px] overflow-y-auto">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-gray-400" /> Aktivita tímu</h3>
                        <div className="space-y-6 relative border-l border-gray-100 ml-1.5 pl-6 pb-2">
                            {timeline.map((item, idx) => (
                                <div key={idx} className="relative">
                                    <div className={`absolute -left-[30px] top-0 w-3 h-3 rounded-full border-2 border-white ring-1 ring-gray-100 ${item.type === 'inquiry' ? 'bg-blue-500' : item.type === 'medical' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-0.5">{format(parseISO(item.date), 'dd.MM HH:mm')}</div>
                                    <div className="text-sm font-bold text-gray-800">{item.title}</div>
                                    <div className="text-xs text-gray-500">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Subcomponents ---

const StatusCard = ({ label, value, icon: Icon, color, alert, onClick }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        orange: 'bg-orange-50 text-orange-700',
        red: 'bg-red-50 text-red-700',
        purple: 'bg-purple-50 text-purple-700',
        gray: 'bg-gray-50 text-gray-600',
    };
    return (
        <div onClick={onClick} className={`p-4 rounded-2xl border border-transparent hover:border-gray-200 hover:shadow-md transition cursor-pointer ${colors[color]} relative group`}>
            {alert && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
            <Icon size={20} className="mb-2 opacity-80" />
            <div className="text-2xl font-black leading-none mb-1">{value}</div>
            <div className="text-[10px] uppercase font-bold opacity-70 leading-tight">{label}</div>
        </div>
    );
};

const QuickActionBtn = ({ icon: Icon, label, onClick, secondary }: any) => (
    <button onClick={onClick} className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition ${secondary ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-900/20'}`}>
        <Icon size={20} />
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </button>
);

export default InternalDashboard;
