import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shelter, Pet } from '../types';

interface AdminAnalyticsProps {
    shelters: Shelter[];
    pets: Pet[];
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ shelters, pets }) => {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Shelters Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top 5 Útulkov (Zobrazenia)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topShelters} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                            <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                                {topShelters.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ea580c' : '#fb923c'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Pets Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top 5 Zvierat (Zobrazenia)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topPets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                            <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                                {topPets.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#60a5fa'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
