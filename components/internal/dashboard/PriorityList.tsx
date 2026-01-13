import React from 'react';
import { AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PriorityItem {
    id: string;
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    subtitle: string;
    link: string;
    date?: string;
}

interface PriorityListProps {
    items: PriorityItem[];
}

const PriorityList: React.FC<PriorityListProps> = ({ items }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
            <div className="p-5 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-red-50/50 dark:from-red-900/10 to-transparent">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        <AlertCircle size={18} />
                    </div>
                    Vyžaduje pozornosť
                </h3>
                {items.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{items.length}</span>}
            </div>

            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Všetko vybavené!</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nemáte žiadne urgentné úlohy. 🎉</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(item.link)}
                                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer flex items-center gap-4 group relative overflow-hidden"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-orange-500' : 'bg-yellow-400'}`} />

                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${item.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : item.priority === 'medium' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'}`}>
                                    !
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate">{item.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriorityList;
