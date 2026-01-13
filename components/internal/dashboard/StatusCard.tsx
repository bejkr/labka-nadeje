import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
    alert?: boolean;
    onClick?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ label, value, icon: Icon, color, alert, onClick }) => {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:border-blue-200 dark:hover:border-blue-700',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:border-green-200 dark:hover:border-green-700',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:border-orange-200 dark:hover:border-orange-700',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:border-red-200 dark:hover:border-red-700',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:border-purple-200 dark:hover:border-purple-700',
        gray: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600',
    };

    return (
        <div
            onClick={onClick}
            className={`p-5 rounded-2xl border border-transparent dark:border-gray-800 transition-all duration-200 cursor-pointer ${colors[color]} relative group hover:-translate-y-1 hover:shadow-lg`}
        >
            {alert && (
                <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}

            <div className="flex flex-col h-full justify-between">
                <Icon size={24} className="mb-3 opacity-80" />
                <div>
                    <div className="text-3xl font-black leading-none mb-1 tracking-tight">{value}</div>
                    <div className="text-[11px] uppercase font-bold opacity-70 leading-tight tracking-wide">{label}</div>
                </div>
            </div>
        </div>
    );
};

export default StatusCard;
