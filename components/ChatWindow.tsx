
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User as UserIcon, AlertCircle } from 'lucide-react';
import { InquiryMessage, User } from '../types';
import { api } from '../services/api';
import { useApp } from '../contexts/AppContext';

interface ChatWindowProps {
    inquiryId: string;
    currentUser: User | any;
    className?: string;
    inverted?: boolean; // Flipping alignment (Sent = Left, Received = Right)
    myAvatarUrl?: string;
    otherAvatarUrl?: string;
    initialMessage?: {
        content: string;
        date: string;
        senderId?: string;
    };
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    inquiryId,
    currentUser,
    className,
    inverted = false,
    myAvatarUrl,
    otherAvatarUrl,
    initialMessage
}) => {
    const [messages, setMessages] = useState<InquiryMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { markInquiryAsRead } = useApp();

    useEffect(() => {
        setError(null);
        setLoading(true);
        loadMessages(false);

        const interval = setInterval(() => {
            loadMessages(false);
        }, 8000);

        return () => clearInterval(interval);
    }, [inquiryId]);

    const loadMessages = async (shouldScroll = false) => {
        try {
            const dbMessages = await api.getInquiryMessages(inquiryId);

            // Auto-mark as read only if there are NEW unread messages from the other person
            const hasNewUnreadFromOther = dbMessages.some(m => !m.isRead && m.senderId !== currentUser.id);
            if (hasNewUnreadFromOther) {
                markInquiryAsRead(inquiryId);
            }

            let allMessages = [...dbMessages];

            if (initialMessage && initialMessage.content) {
                const firstMsg: InquiryMessage = {
                    id: 'initial-msg',
                    inquiryId: inquiryId,
                    senderId: initialMessage.senderId || 'applicant-placeholder',
                    content: initialMessage.content,
                    createdAt: initialMessage.date,
                    isRead: true
                };

                // Avoid duplicates - check if initial message is already in DB (fuzzy timestamp match)
                const initialDate = new Date(initialMessage.date).getTime();
                const isAlreadyInDb = dbMessages.some(m => {
                    const dbDate = new Date(m.createdAt).getTime();
                    const timeDiff = Math.abs(dbDate - initialDate);
                    // Content match and time strictly close (< 5s) or identical
                    return m.content === initialMessage.content && timeDiff < 5000;
                });

                if (!isAlreadyInDb) {
                    allMessages = [firstMsg, ...dbMessages];
                }
            }

            // Ensure chronological order regardless of source
            allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            setMessages(allMessages);
            setError(null);
        } catch (e) {
            console.error("Failed to load messages", e);
            if (shouldScroll) setError("Nepodarilo sa načítať správy. Skúste to znova.");
        } finally {
            setLoading(false);
            if (shouldScroll) { scrollToBottom(); }
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const msg = await api.sendInquiryMessage(inquiryId, newMessage);
            setMessages(prev => [...prev, msg]);
            setNewMessage('');
            scrollToBottom();
            // Mark as acknowledged when sending a message
            markInquiryAsRead(inquiryId);
        } catch (e: any) {
            console.error("Send message error:", e);
            alert("Nepodarilo sa odoslať správu. Skontrolujte pripojenie.");
        } finally {
            setSending(false);
        }
    };

    const renderAvatar = (url?: string) => {
        return (
            <div className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                {url ? (
                    <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <UserIcon size={18} className="text-gray-300" />
                )}
            </div>
        );
    };

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 p-8 text-center ${className || 'h-[400px]'}`}>
                <AlertCircle className="text-red-500 mb-4" size={40} />
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={() => loadMessages(true)} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-700 transition">Skúsiť znova</button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ${className || 'h-[400px]'}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        <Loader2 className="animate-spin" size={24} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Zatiaľ žiadne správy.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser.id;

                        // Alignment logic based on inverted prop
                        const justifyClass = inverted
                            ? (isMe ? 'flex-row' : 'flex-row-reverse')
                            : (isMe ? 'flex-row-reverse' : 'flex-row');

                        const bubbleStyle = inverted
                            ? (isMe ? 'bg-brand-600 text-white rounded-bl-none ml-2' : 'bg-white text-gray-800 border border-gray-200 rounded-br-none mr-2')
                            : (isMe ? 'bg-brand-600 text-white rounded-br-none mr-2' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none ml-2');

                        const avatarUrl = isMe ? myAvatarUrl : otherAvatarUrl;

                        return (
                            <div key={msg.id || index} className={`flex items-end gap-2 ${justifyClass} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                                {renderAvatar(avatarUrl)}
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${bubbleStyle}`}>
                                    <p className="leading-relaxed break-words">{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.id === 'initial-msg' && ` • ${new Date(msg.createdAt).toLocaleDateString()}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Napíšte správu..."
                    className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 transition flex-shrink-0"
                >
                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
