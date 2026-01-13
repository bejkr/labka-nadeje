import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, CheckCircle, Dog, MessageSquare } from 'lucide-react';
import { Shelter, Pet, AdoptionInquiry } from '../../types';
import StatCard from './StatCard';

interface AnalyticsSummaryProps {
    shelter: Shelter;
    pets: Pet[];
    inquiries: AdoptionInquiry[];
    seenInquiryIds: string[];
    onNavigate: (tab: string) => void;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ shelter, pets, inquiries, seenInquiryIds, onNavigate }) => {
    const activePets = pets.filter(p => p.adoptionStatus === 'Available').length;

    const newInquiries = inquiries.filter(i => {
        const hasChatUnread = (i as any).hasUnreadMessages === true;
        const isNewAndNotSeen = i.status === 'Nová' && !seenInquiryIds.includes(i.id);
        return hasChatUnread || isNewAndNotSeen;
    }).length;

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

            days.push({
                name: date.toLocaleDateString('sk-SK', { weekday: 'short' }),
                inquiries: inquiriesCount
            });
        }
        return days;
    }, [inquiries]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Status Alert */}
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

            {/* Welcome */}
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Vitajte späť! 👋</h2>
                <p className="text-gray-500 font-medium">Tu je prehľad toho, čo sa deje vo vašom útulku.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => onNavigate('pets')} className="cursor-pointer active:scale-95 transition duration-200">
                    <StatCard
                        label="Aktívne zvieratá"
                        value={activePets}
                        icon={Dog}
                        color={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
                        subtext="Na adopciu"
                    />
                </div>
                <div onClick={() => onNavigate('inquiries')} className="cursor-pointer active:scale-95 transition duration-200">
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
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Aktivita za posledných 7 dní</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="inquiries" name="Dopyty" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorInq)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Inquiries List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Nedávne dopyty</h3>
                    <div className="space-y-4">
                        {inquiries.slice(0, 4).map(inq => {
                            const hasChatUnread = (inq as any).hasUnreadMessages === true;
                            const isNewNotSeen = inq.status === 'Nová' && !seenInquiryIds.includes(inq.id);
                            const isUnread = hasChatUnread || isNewNotSeen;

                            return (
                                <div key={inq.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer" onClick={() => onNavigate('inquiries')}>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm relative shrink-0">
                                        {inq.applicantName ? inq.applicantName.charAt(0) : '?'}
                                        {isUnread && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full border-2 border-white animate-pulse"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'} truncate`}>{inq.applicantName}</p>
                                        <p className="text-xs text-gray-500 truncate">Záujem o: <span className="text-brand-600 font-medium">{inq.petName}</span></p>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{inq.date ? new Date(inq.date).toLocaleDateString('sk-SK', { day: '2-digit', month: 'short' }) : ''}</span>
                                </div>
                            );
                        })}
                        {inquiries.length === 0 && <p className="text-sm text-gray-500 text-center py-4 italic">Žiadne nové správy.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSummary;
