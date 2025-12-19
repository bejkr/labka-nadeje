
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User as UserIcon } from 'lucide-react';
import { InquiryMessage, User } from '../types';
import { api } from '../services/api';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages(true);
    const interval = setInterval(() => {
        loadMessages(false);
    }, 10000); 
    return () => clearInterval(interval);
  }, [inquiryId]);

  const loadMessages = async (shouldScroll = false) => {
    try {
        const dbMessages = await api.getInquiryMessages(inquiryId);
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
            allMessages = [firstMsg, ...dbMessages];
        }

        setMessages(allMessages);
        setLoading(false);
        if (shouldScroll) { scrollToBottom(); }
    } catch (e) { console.error("Failed to load messages", e); }
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
        alert("Nepodarilo sa odoslať správu.");
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

  return (
    <div className={`flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ${className || 'h-[400px]'}`}>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                    
                    // Alignment logic based on inverted prop
                    const justifyClass = inverted 
                        ? (isMe ? 'flex-row' : 'flex-row-reverse') 
                        : (isMe ? 'flex-row-reverse' : 'flex-row');
                    
                    const bubbleStyle = inverted
                        ? (isMe ? 'bg-brand-600 text-white rounded-bl-none ml-2' : 'bg-white text-gray-800 border border-gray-200 rounded-br-none mr-2')
                        : (isMe ? 'bg-brand-600 text-white rounded-br-none mr-2' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none ml-2');

                    const avatarUrl = isMe ? myAvatarUrl : otherAvatarUrl;

                    return (
                        <div key={msg.id || index} className={`flex items-end gap-2 ${justifyClass}`}>
                            {renderAvatar(avatarUrl)}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${bubbleStyle}`}>
                                <p className="leading-relaxed">{msg.content}</p>
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

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
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
