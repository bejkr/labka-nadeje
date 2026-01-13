import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Info, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { AdoptionInquiry } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { sk } from 'date-fns/locale';

interface NotificationsPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    onCountChange?: (count: number) => void;
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ isOpen, onClose, onCountChange }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // Persist read notifications
    const [readIds, setReadIds] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem('read_notifications');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const navigate = useNavigate();

    const loadNotifications = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // 1. Fetch Real Inquiries
            const inquiries = await api.getInquiries();
            const pendingInquiries = inquiries
                .filter(i => i.status === 'Nová')
                .map(i => ({
                    id: i.id,
                    type: 'inquiry',
                    title: 'Nová žiadosť o adopciu',
                    message: `${i.applicantName} má záujem o ${i.petName}`,
                    date: i.date,
                    read: readIds.includes(i.id),
                    link: `/internal/adoptions/${i.id}`,
                    icon: MessageSquare,
                    color: 'text-blue-500 bg-blue-50'
                }));

            // 2. Mock System Notifications (for demo)
            const systemNotifications = [
                {
                    id: 'sys-1',
                    type: 'system',
                    title: 'Vitajte v novom dizajne',
                    message: 'Vyskúšajte nový tmavý režim (čoskoro).',
                    date: new Date().toISOString(),
                    read: readIds.includes('sys-1'),
                    link: null,
                    icon: Info,
                    color: 'text-purple-500 bg-purple-50'
                }
            ];

            const allDetails = [...pendingInquiries, ...systemNotifications].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setNotifications(allDetails);
            if (onCountChange) onCountChange(allDetails.filter(n => !n.read).length);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Poll every 60s
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, [currentUser, readIds]); // Re-run when readIds change to update UI

    const handleItemClick = (notification: any) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    const markAsRead = (id: string) => {
        if (readIds.includes(id)) return;
        const newIds = [...readIds, id];
        setReadIds(newIds);
        localStorage.setItem('read_notifications', JSON.stringify(newIds));
    };

    const markAllRead = () => {
        const allIds = notifications.map(n => n.id);
        const newIds = [...new Set([...readIds, ...allIds])];
        setReadIds(newIds);
        localStorage.setItem('read_notifications', JSON.stringify(newIds));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (onCountChange) onCountChange(0);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-30" onClick={onClose} />
            <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-gray-900 font-bold bg-gray-50/50">
                    <span>Upozornenia</span>
                    {notifications.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-bold">
                            Označiť všetko ako prečítané
                        </button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Načítavam...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Bell size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Žiadne nové upozornenia</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`p-4 hover:bg-gray-50 transition cursor-pointer flex gap-3 ${!item.read ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                        <item.icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-bold ${!item.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {item.title}
                                            </h4>
                                            {!item.read && <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(item.id);
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 transition"
                                                    title="Označiť ako prečítané"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                            </div>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                                        <div className="text-[10px] text-gray-400 mt-2 font-medium">
                                            {(() => {
                                                const d = new Date(item.date);
                                                return isValid(d) ? formatDistanceToNow(d, { addSuffix: true, locale: sk }) : 'Pred chvíľou';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsPopover;
