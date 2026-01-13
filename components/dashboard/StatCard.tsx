import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: {
        bg: string;
        text: string;
    };
    subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-bold mb-1">{label}</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
                {subtext && <p className={`text-xs mt-2 font-medium ${color.text}`}>{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

export default StatCard;
