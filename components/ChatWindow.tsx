
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { InquiryMessage, User } from '../types';
import { api } from '../services/api';

interface ChatWindowProps {
  inquiryId: string;
  currentUser: User | any; 
  className?: string;
  initialMessage?: {
      content: string;
      date: string;
      senderId?: string; // Optional, defaults to 'applicant'
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ inquiryId, currentUser, className, initialMessage }) => {
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial load with scroll
    loadMessages(true);
    
    // Polling without scroll
    const interval = setInterval(() => {
        loadMessages(false);
    }, 10000); 
    
    return () => clearInterval(interval);
  }, [inquiryId]);

  const loadMessages = async (shouldScroll = false) => {
    try {
        const dbMessages = await api.getInquiryMessages(inquiryId);
        
        // If we have an initial message (from the inquiry form), prepend it
        let allMessages = [...dbMessages];
        
        if (initialMessage && initialMessage.content) {
            const firstMsg: InquiryMessage = {
                id: 'initial-msg',
                inquiryId: inquiryId,
                senderId: initialMessage.senderId || 'applicant-placeholder', // Needs to NOT match currentUser.id if viewed by Shelter
                content: initialMessage.content,
                createdAt: initialMessage.date,
                isRead: true
            };
            allMessages = [firstMsg, ...dbMessages];
        }

        setMessages(allMessages);
        setLoading(false);
        
        if (shouldScroll) {
            scrollToBottom();
        }
    } catch (e) {
        console.error("Failed to load messages", e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
        const msg = await api.sendInquiryMessage(inquiryId, newMessage);
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
        scrollToBottom();
    } catch (e) {
        console.error(e);
        alert("Nepodarilo sa odoslať správu.");
    } finally {
        setSending(false);
    }
  };

  return (
    <div className={`flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ${className || 'h-[400px]'}`}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
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
                    return (
                        <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                isMe 
                                ? 'bg-brand-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                            }`}>
                                <p>{msg.content}</p>
                                <span className={`text-[10px] block mt-1 ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {msg.id === 'initial-msg' && ` • ${new Date(msg.createdAt).toLocaleDateString()}`}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Napíšte správu..."
                className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <button 
                type="submit" 
                disabled={sending || !newMessage.trim()}
                className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 transition"
            >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
        </form>
    </div>
  );
};

export default ChatWindow;
