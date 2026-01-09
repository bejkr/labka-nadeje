
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AdoptionInquiry, InquiryMessage } from '../../types';
import {
    ArrowLeft, User, MapPin, Home, Briefcase, Calendar,
    MessageSquare, Send, CheckCircle2, XCircle, FileText,
    Printer, Phone, Mail
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdoptionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Detail ID (inquiry ID)
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [inquiry, setInquiry] = useState<AdoptionInquiry | null>(null);
    const [messages, setMessages] = useState<InquiryMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadData = async () => {
        if (!id) return;
        try {
            // Need a way to get single inquiry. For now, we fetch all and find (not efficient but API limitation)
            // Ideally: api.getInquiry(id)
            const allInquiries = await api.getInquiries();
            const found = allInquiries.find(i => i.id === id);

            if (found) {
                setInquiry(found);
                const msgs = await api.getInquiryMessages(found.id);
                setMessages(msgs);
                // Mark as read
                if (currentUser) {
                    await api.markMessagesAsRead(found.id, currentUser.id);
                }
            } else {
                alert("Žiadosť sa nenašla");
                navigate(-1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, currentUser]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !inquiry) return;

        try {
            const msg = await api.sendInquiryMessage(inquiry.id, newMessage);
            setMessages([...messages, msg]);
            setNewMessage('');
        } catch (err) {
            console.error(err);
            alert("Správu sa nepodarilo odoslať");
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!inquiry) return;
        try {
            await api.updateInquiryStatus(inquiry.id, newStatus);
            setInquiry({ ...inquiry, status: newStatus as any });
        } catch (e) {
            alert("Chyba pri zmene stavu");
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Načítavam detail...</div>;
    if (!inquiry) return null;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 overflow-hidden">

            {/* LEFT COLUMN: Chat & Discussion */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition text-gray-500">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 className="font-bold text-gray-900">{inquiry.applicantName}</h2>
                            <p className="text-xs text-gray-500">Záujem o: <span className="font-bold text-brand-600">{inquiry.petName}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${inquiry.status === 'Schválená' ? 'bg-green-100 text-green-700' :
                                inquiry.status === 'Zamietnutá' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-50 text-blue-700'
                            }`}>
                            {inquiry.status}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {/* Initial Inquiry Message */}
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
                            <p className="text-sm font-bold text-gray-900 mb-1">Úvodná správa</p>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{inquiry.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">{format(parseISO(inquiry.date), 'd. M. yyyy HH:mm')}</span>
                        </div>
                    </div>

                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUser?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[75%] text-sm ${isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] mt-1 block ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                                        {format(parseISO(msg.createdAt), 'HH:mm')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Napíšte správu..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button type="submit" className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT COLUMN: Details & Actions */}
            <div className="w-full md:w-96 flex flex-col gap-6 overflow-y-auto pr-1">

                {/* Actions Card */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Akcie</h3>
                    <div className="space-y-2">
                        {inquiry.status !== 'Schválená' && (
                            <button
                                onClick={() => handleStatusChange('Schválená')}
                                className="w-full py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} /> Schváliť adopciu
                            </button>
                        )}
                        {inquiry.status !== 'Zamietnutá' && (
                            <button
                                onClick={() => handleStatusChange('Zamietnutá')}
                                className="w-full py-2.5 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} /> Zamietnuť
                            </button>
                        )}
                        <hr className="border-gray-100 my-2" />
                        <button className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition flex items-center justify-center gap-2">
                            <FileText size={18} /> Vygenerovať zmluvu
                        </button>
                    </div>
                </div>

                {/* Applicant Info */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <User size={18} className="text-gray-400" /> O záujemcovi
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                                {inquiry.applicantName.substring(0, 1)}
                            </div>
                            <div>
                                <div className="font-bold">{inquiry.applicantName}</div>
                                <div className="text-xs text-gray-500">Registrovaný používateľ</div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <a href={`mailto:${inquiry.email}`} className="hover:text-brand-600 underline">{inquiry.email}</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <a href={`tel:${inquiry.phone}`} className="hover:text-brand-600 underline">{inquiry.phone}</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                {inquiry.applicantDetails?.location || 'Lokalita neuvedená'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questionnaire Answers (If available) */}
                {inquiry.applicantDetails?.household && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Home size={18} className="text-gray-400" /> Domácnosť
                        </h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Typ bývania:</dt>
                                <dd className="font-medium text-gray-900">{inquiry.applicantDetails.household.housingType}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Deti:</dt>
                                <dd className="font-medium text-gray-900">{inquiry.applicantDetails.household.hasChildren ? 'Áno' : 'Nie'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Iné zvieratá:</dt>
                                <dd className="font-medium text-gray-900">{inquiry.applicantDetails.household.hasOtherPets ? 'Áno' : 'Nie'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Práca:</dt>
                                <dd className="font-medium text-gray-900 truncate max-w-[150px]">{inquiry.applicantDetails.household.workMode}</dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdoptionDetail;
