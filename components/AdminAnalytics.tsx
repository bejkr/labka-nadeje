import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Shelter, Pet } from '../types';
import { Users, Building2, Dog, CheckCircle, TrendingUp, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface AdminAnalyticsProps {
    shelters: Shelter[];
    pets: Pet[];
    onVerify: (id: string, currentStatus: boolean | undefined) => void;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ shelters, pets, onVerify }) => {
    // Stats Calculation
    const totalShelters = shelters.length;
    const verifiedShelters = shelters.filter(s => s.isVerified).length;
    const pendingShelters = shelters.filter(s => !s.isVerified);
    const totalPets = pets.length;
    const adoptedPets = pets.filter(p => p.adoptionStatus === 'Adopted').length;
    const adoptionRate = totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0;

    // 1. Top 5 Shelters by Views
    const topShelters = [...shelters]
        .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
        .slice(0, 5)
        .map(s => ({
            name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
            views: s.stats?.views || 0
        }));

    // 2. Top 5 Pets by Views
    const topPets = [...pets]
        // @ts-ignore - views might be missing on type if not updated yet, but API returns it
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            views: (p as any).views || 0
        }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className="text-brand-600 font-medium">
                        {payload[0].value} vhľadov
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 mb-10">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Registrované Útulky</p>
                        <h3 className="text-3xl font-black text-gray-900">{totalShelters}</h3>
                        <p className="text-green-500 text-xs font-bold mt-1 flex items-center gap-1"><CheckCircle size={10} /> {verifiedShelters} overených</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Building2 size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Spolu zvierat</p>
                        <h3 className="text-3xl font-black text-gray-900">{totalPets}</h3>
                        <p className="text-gray-400 text-xs font-bold mt-1">Hľadajúcich domov</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                        <Dog size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Miera Adopcie</p>
                        <h3 className="text-3xl font-black text-gray-900">{adoptionRate}%</h3>
                        <p className="text-gray-400 text-xs font-bold mt-1">{adoptedPets} adoptovaných</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 blur-[40px] opacity-20 rounded-full"></div>
                    <div>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Čaká na overenie</p>
                        <h3 className="text-3xl font-black text-gray-900">{pendingShelters.length}</h3>
                        <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} /> Vyžaduje akciu</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                        <ShieldAlert size={24} />
                    </div>
                </div>
            </div>

            {/* Pending Verifications Widget */}
            {pendingShelters.length > 0 && (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={20} />
                            Čakajú na overenie ({pendingShelters.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingShelters.slice(0, 3).map(shelter => (
                            <div key={shelter.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                        {shelter.logoUrl ? <img src={shelter.logoUrl} className="w-full h-full object-cover rounded-xl" alt="" /> : <Building2 size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{shelter.name}</h4>
                                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><Users size={12} /> {shelter.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onVerify(shelter.id, shelter.isVerified)}
                                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-brand-600 transition shadow-lg shadow-gray-200"
                                >
                                    Overiť teraz
                                </button>
                            </div>
                        ))}
                    </div>
                    {pendingShelters.length > 3 && (
                        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-500">A ďalších {pendingShelters.length - 3} čakajúcich...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Shelters Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Top 5 Útulkov (Zobrazenia)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topShelters} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 8 }} />
                                <Bar dataKey="views" radius={[8, 8, 8, 8]} barSize={40}>
                                    {topShelters.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#c7d2fe'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Pets Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Top 5 Zvierat (Zobrazenia)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topPets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 8 }} />
                                <Bar dataKey="views" radius={[8, 8, 8, 8]} barSize={40}>
                                    {topPets.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ea580c' : '#fed7aa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
