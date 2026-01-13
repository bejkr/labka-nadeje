
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { AdoptionInquiry } from '../../types';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const COLUMN_STATUSES = [
    { id: 'Nová', label: 'Nové žiadosti', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' },
    { id: 'Kontaktovaný', label: 'Kontaktovaní', color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400' },
    { id: 'Pohovor', label: 'Pohovor / Návšteva', color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400' },
    { id: 'Schválená', label: 'Schválené', color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' },
    { id: 'Zamietnutá', label: 'Zamietnuté', color: 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-400' }
];

const InternalAdoptions: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState<AdoptionInquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadInquiries = async () => {
        setLoading(true);
        try {
            const data = await api.getInquiries();
            setInquiries(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInquiries();
    }, [currentUser]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as any } : i));
        try {
            await api.updateInquiryStatus(id, newStatus);
        } catch (e) {
            console.error("Failed to update status");
            loadInquiries();
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 gap-4">
            <RefreshCw className="animate-spin text-brand-500" size={32} />
            <span className="font-medium animate-pulse">Načítavam dáta...</span>
        </div>
    );

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6 px-1">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Adopčný proces</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium hidden sm:block">Prehľad fáz adopcie a manažment záujemcov.</p>
                </div>
                <button
                    onClick={loadInquiries}
                    className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm hover:text-brand-600 dark:hover:text-brand-400 active:scale-95"
                    title="Obnoviť dáta"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-4 sm:gap-6 h-full min-w-[320px] pb-4 snap-x snap-mandatory sm:snap-none">
                    {/* Columns */}
                    {COLUMN_STATUSES.map(col => (
                        <div key={col.id} className="w-[85vw] sm:w-80 flex flex-col flex-shrink-0 snap-center h-full">
                            <div className={`p-4 rounded-t-2xl border-b-2 font-bold flex justify-between items-center ${col.color.replace('bg-', 'border-').replace('text-', 'bg-').split(' ')[0]} ${col.color}`}>
                                <h3 className="text-sm font-black uppercase tracking-wide">{col.label}</h3>
                                <span className="bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-md text-xs font-black shadow-sm min-w-[24px] text-center">
                                    {inquiries.filter(i => i.status === col.id).length}
                                </span>
                            </div>

                            <div className="bg-gray-50/50 dark:bg-gray-800/50 flex-1 rounded-b-2xl border border-t-0 border-gray-200 dark:border-gray-700 p-3 overflow-y-auto custom-scrollbar space-y-3 shadow-inner">
                                {inquiries.filter(i => i.status === col.id).length === 0 && (
                                    <div className="text-center py-10 text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                        <Layers size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs font-bold uppercase">Žiadne položky</p>
                                    </div>
                                )}
                                {inquiries.filter(i => i.status === col.id).map(item => (
                                    <AdoptionCard
                                        key={item.id}
                                        inquiry={item}
                                        onStatusChange={handleStatusChange}
                                        onClick={() => navigate(`${item.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* Spacer for right padding on mobile */}
                    <div className="w-4 sm:hidden flex-shrink-0" />
                </div>
            </div>

            <div className="text-center sm:hidden text-xs font-bold text-gray-400 mt-2 flex items-center justify-center gap-1 animate-pulse">
                <span>← Potiahni pre viac fáz →</span>
            </div>
        </div>
    );
};

const AdoptionCard = ({ inquiry, onStatusChange, onClick }: { inquiry: AdoptionInquiry, onStatusChange: (id: string, s: string) => void, onClick: () => void }) => {
    return (
        <div
            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer active:scale-[0.98]"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                    {format(parseISO(inquiry.date), 'd.MMM')}
                </span>

                {/* Status Dropdown (propagated click prevention) */}
                <div onClick={e => e.stopPropagation()} className="relative">
                    <select
                        value={inquiry.status}
                        onChange={(e) => onStatusChange(inquiry.id, e.target.value)}
                        className="text-[10px] uppercase font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer hover:border-brand-300 transition shadow-sm w-[20px] sm:w-auto overflow-hidden text-transparent sm:text-gray-600 dark:sm:text-gray-400 appearance-none sm:appearance-auto"
                        title="Zmeniť status"
                    >
                        {/* Mobile hack: icon only on small screens via CSS/layout trickery if needed, but select usually handles itself. For now standard select. */}
                        {COLUMN_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center sm:hidden">
                        <RefreshCw size={12} className="text-gray-400" />
                    </div>
                </div>
            </div>

            <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1 truncate pr-2">{inquiry.applicantName}</h4>
            <div className="text-xs text-brand-600 dark:text-brand-400 font-bold mb-3 flex items-center gap-1 truncate opacity-90">
                {inquiry.petName}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                    {(inquiry as any).hasUnreadMessages ? (
                        <span className="flex items-center gap-1 text-white bg-brand-500 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm animate-pulse">
                            <MessageSquare size={10} fill="currentColor" /> 1
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-gray-300 dark:text-gray-600">
                            <MessageSquare size={12} /> 0
                        </span>
                    )}
                </div>
                <div className="text-gray-300 dark:text-gray-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition font-bold flex items-center gap-0.5 text-[10px] uppercase tracking-wide">
                    Detail <ChevronRight size={12} />
                </div>
            </div>
        </div>
    );
};

export default InternalAdoptions;
