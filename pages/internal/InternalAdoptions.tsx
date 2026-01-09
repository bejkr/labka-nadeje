
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { AdoptionInquiry } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, MessageSquare, Clock, CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const COLUMN_STATUSES = [
    { id: 'Nová', label: 'Nové žiadosti', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'Kontaktovaný', label: 'Kontaktovaní', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { id: 'Pohovor', label: 'Pohovor / Návšteva', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'Schválená', label: 'Schválené', color: 'bg-green-50 border-green-200 text-green-700' },
    { id: 'Zamietnutá', label: 'Zamietnuté', color: 'bg-gray-50 border-gray-200 text-gray-500' }
];

const InternalAdoptions: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState<AdoptionInquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadInquiries = async () => {
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
        // Optimistic update
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as any } : i));
        try {
            await api.updateInquiryStatus(id, newStatus);
        } catch (e) {
            console.error("Failed to update status");
            loadInquiries(); // Revert on error
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Načítavam adopcie...</div>;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Adopčný proces</h1>
                    <p className="text-gray-500 text-sm">Manažment záujemcov a adopcií</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadInquiries} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                        Obnoviť
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-6 h-full min-w-[1200px] pb-4">
                    {COLUMN_STATUSES.map(col => (
                        <div key={col.id} className="w-80 flex flex-col flex-shrink-0">
                            <div className={`p-3 rounded-t-xl border-b-2 font-bold flex justify-between items-center ${col.color.replace('bg-', 'border-').replace('text-', 'bg-').split(' ')[0]} ${col.color}`}>
                                <span>{col.label}</span>
                                <span className="bg-white/50 px-2 py-0.5 rounded text-xs">
                                    {inquiries.filter(i => i.status === col.id).length}
                                </span>
                            </div>
                            <div className="bg-gray-50/50 flex-1 rounded-b-xl border border-t-0 border-gray-100 p-2 overflow-y-auto space-y-3">
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
                </div>
            </div>
        </div>
    );
};

const AdoptionCard = ({ inquiry, onStatusChange, onClick }: { inquiry: AdoptionInquiry, onStatusChange: (id: string, s: string) => void, onClick: () => void }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-mono">{format(parseISO(inquiry.date), 'd.M.')}</span>
                {/* Status Dropdown (propagated click prevention) */}
                <div onClick={e => e.stopPropagation()} className="relative">
                    <select
                        value={inquiry.status}
                        onChange={(e) => onStatusChange(inquiry.id, e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                    >
                        {COLUMN_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </div>
            </div>

            <h4 className="font-bold text-gray-900 mb-0.5">{inquiry.applicantName}</h4>
            <p className="text-sm text-brand-600 font-medium mb-2 flex items-center gap-1">
                <span className="text-gray-400 font-normal">má záujem o</span> {inquiry.petName}
            </p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                    {(inquiry as any).hasUnreadMessages && (
                        <span className="flex items-center gap-1 text-brand-600 font-bold animate-pulse">
                            <MessageSquare size={14} /> 1
                        </span>
                    )}
                    {!((inquiry as any).hasUnreadMessages) && (
                        <span className="flex items-center gap-1">
                            <MessageSquare size={14} /> 0
                        </span>
                    )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition text-brand-600 font-bold flex items-center gap-1">
                    Detail <ChevronRight size={14} />
                </div>
            </div>
        </div>
    );
};

export default InternalAdoptions;
