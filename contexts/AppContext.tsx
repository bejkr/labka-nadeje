
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AdoptionInquiry, ToastMessage, ToastType } from '../types';
import { ToastContainer } from '../components/Toast';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { usePets } from './PetContext';

interface AppContextType {
  inquiries: AdoptionInquiry[];
  unreadCount: number;
  seenInquiryIds: string[];
  addInquiry: (inquiry: AdoptionInquiry) => Promise<void>;
  updateInquiryStatus: (id: string, status: AdoptionInquiry['status']) => Promise<void>;
  markInquiryAsRead: (id: string) => void;
  refreshInquiries: () => Promise<void>;

  toasts: ToastMessage[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SEEN_INQUIRIES_KEY = 'labka_seen_inquiries';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inquiries, setInquiries] = useState<AdoptionInquiry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [seenInquiryIds, setSeenInquiryIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(SEEN_INQUIRIES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const { currentUser } = useAuth();
  const { refreshPets } = usePets();
  const isFetchingRef = useRef(false);

  // Persist seen IDs
  useEffect(() => {
    localStorage.setItem(SEEN_INQUIRIES_KEY, JSON.stringify(seenInquiryIds));
  }, [seenInquiryIds]);

  const loadInquiries = async () => {
    if (!currentUser || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const data = await api.getInquiries();
      setInquiries(data);
    } catch (e) {
      console.error("Failed to load inquiries", e);
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    if (currentUser) {
      loadInquiries();
    } else {
      setInquiries([]);
    }
  }, [currentUser?.id]);

  // Background sync for notifications
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      loadInquiries();
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Notification logic calculation
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const count = inquiries.filter(inq => {
      // 1. Explicit unread chat messages (always trigger notification)
      const hasChatUnread = (inq as any).hasUnreadMessages === true;
      if (hasChatUnread) return true;

      // 2. Status changes that haven't been "seen" yet
      const isNotAcknowledged = !seenInquiryIds.includes(inq.id);
      if (isNotAcknowledged) {
        // Shelters see new inquiries
        if (currentUser.role === 'shelter' && inq.status === 'Nová') return true;
        // Users see when shelter has changed status (it's not 'Nová' anymore)
        if (currentUser.role === 'user' && inq.status !== 'Nová') return true;
      }

      return false;
    }).length;

    setUnreadCount(count);
  }, [inquiries, currentUser, seenInquiryIds]);

  const addInquiry = async (inquiry: AdoptionInquiry) => {
    try {
      await api.createInquiry(inquiry);
      await loadInquiries();
    } catch (e: any) {
      console.error(e);
      const msg = e.message || "Nepodarilo sa odoslať správu";
      showToast(msg, "error");
      throw e;
    }
  };

  const updateInquiryStatus = async (id: string, status: AdoptionInquiry['status']) => {
    try {
      await api.updateInquiryStatus(id, status);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));

      if (status === 'Schválená') {
        const inquiry = inquiries.find(i => i.id === id);
        if (inquiry && inquiry.petId) {
          await api.updatePetStatus(inquiry.petId, 'Adopted');
          await refreshPets();
          showToast("Žiadosť schválená. Zvieratko bolo označené ako ADOPTOVANÉ.", "success");
        }
      }
    } catch (e: any) {
      console.error("Update status error:", e);
      showToast(e.message || "Chyba pri aktualizácii statusu", "error");
      throw e;
    }
  };

  const markInquiryAsRead = (id: string) => {
    if (!currentUser) return;

    // Immediate UI Feedback: clear local unread flag
    setInquiries(prev => prev.map(inq =>
      inq.id === id
        ? { ...inq, hasUnreadMessages: false } as any
        : inq
    ));

    // Add to seen IDs if not already there
    setSeenInquiryIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });

    // Async sync with DB to mark messages as read physically
    api.markMessagesAsRead(id, currentUser.id).catch(err => console.error("Sync error", err));

    // For shelters: opening a 'New' inquiry automatically marks it as 'Contacted'
    const inquiry = inquiries.find(i => i.id === id);
    if (currentUser.role === 'shelter' && inquiry?.status === 'Nová') {
      // Use silent update to avoid UI errors on auto-action
      api.updateInquiryStatus(id, 'Kontaktovaný')
        .then(() => {
          setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'Kontaktovaný' } : i));
        })
        .catch(err => {
          console.warn("Auto-update of status failed (likely permissions), ignoring:", err);
        });
    }
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      inquiries, unreadCount, seenInquiryIds, addInquiry, updateInquiryStatus, markInquiryAsRead, refreshInquiries: loadInquiries,
      toasts, showToast, removeToast
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
