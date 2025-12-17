
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdoptionInquiry, ToastMessage, ToastType } from '../types';
import { ToastContainer } from '../components/Toast';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { usePets } from './PetContext';

interface AppContextType {
  inquiries: AdoptionInquiry[];
  addInquiry: (inquiry: AdoptionInquiry) => Promise<void>;
  updateInquiryStatus: (id: string, status: AdoptionInquiry['status']) => void;
  
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inquiries, setInquiries] = useState<AdoptionInquiry[]>([]);
  const { currentUser } = useAuth(); // Depend on auth to reload inquiries
  const { refreshPets } = usePets(); // Depend on pets to reload pet statuses
  
  // Load inquiries for shelter if logged in
  useEffect(() => {
     if (!currentUser) return; // Wait for login
     
     const loadInquiries = async () => {
         try {
             const data = await api.getInquiries();
             setInquiries(data);
         } catch (e) {
             console.error("Failed to load inquiries", e);
         }
     };
     loadInquiries();
  }, [currentUser]);

  const addInquiry = async (inquiry: AdoptionInquiry) => {
    try {
        await api.createInquiry(inquiry);
        // We don't necessarily need to add to local state if we are a User, 
        // but let's keep it consistent
        setInquiries(prev => [inquiry, ...prev]);
    } catch (e: any) {
        console.error(e);
        const msg = e.message || "Nepodarilo sa odoslať správu";
        showToast(msg, "error");
        throw e; // Re-throw so component knows it failed
    }
  };

  const updateInquiryStatus = async (id: string, status: AdoptionInquiry['status']) => {
    try {
        await api.updateInquiryStatus(id, status);
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
        
        // If approved, refresh the pet list to show 'Reserved' status
        if (status === 'Schválená') {
            await refreshPets();
            showToast("Žiadosť schválená. Zviera označené ako rezervované.", "success");
        }
    } catch (e) {
        console.error(e);
        showToast("Chyba pri aktualizácii statusu", "error");
    }
  };

  // --- Toast State ---
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
      inquiries, addInquiry, updateInquiryStatus,
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
