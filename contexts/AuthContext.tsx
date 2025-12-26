import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Shelter } from '../types';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';

type UserRole = 'user' | 'shelter';

interface AuthContextType {
  currentUser: User | Shelter | null;
  userRole: UserRole | null;
  isRecoveringPassword: boolean;
  isLoading: boolean;
  
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  registerUser: (name: string, email: string, password?: string) => Promise<any>;
  registerShelter: (name: string, location: string, email: string, password?: string) => Promise<any>;

  updateUserProfile: (data: Partial<User> | Partial<Shelter>) => Promise<void>;
  adoptVirtually: (petId: string, amount: number) => void;
  updateAdoptionAmount: (petId: string, amount: number) => void;
  cancelAdoption: (petId: string) => void;
  toggleFavorite: (petId: string) => void;
  isFavorite: (petId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | Shelter | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load the profile from database based on an active session
  const syncProfile = async (session: any) => {
    if (!session?.user) {
      setCurrentUser(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.getCurrentSession(session);
      if (profile) {
        setCurrentUser(profile);
        setUserRole(profile.role);
      } else {
        // If Auth exists but profile doesn't, it might still be creating or there's an RLS issue
        console.warn("AuthContext: Session exists but profile fetch returned null.");
        setCurrentUser(null);
        setUserRole(null);
      }
    } catch (err) {
      console.error("AuthContext: Sync profile failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncProfile(session);
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        syncProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRole(null);
        setIsRecoveringPassword(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
        const user = await api.login(email, password);
        if (user) {
            setCurrentUser(user);
            setUserRole(user.role);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Login failed:", e);
        return false;
    }
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
    setUserRole(null);
    setIsRecoveringPassword(false);
  };

  const resetPassword = async (email: string) => {
    await api.resetPassword(email);
  };

  const updatePassword = async (password: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Relácia pre zmenu hesla nie je aktívna. Prosím, kliknite na odkaz v e-maile znova.");
    }
    
    await api.updatePassword(password);
    setIsRecoveringPassword(false);
  };

  const registerUser = async (name: string, email: string, password?: string) => {
     const result = await api.register(email, password || 'password', { role: 'user', name });
     if (result.user) {
         setCurrentUser(result.user);
         setUserRole('user');
     }
     return result;
  };

  const registerShelter = async (name: string, location: string, email: string, password?: string) => {
     const result = await api.register(email, password || 'password', { role: 'shelter', name });
     if (result.user) {
         await api.updateProfile(result.user.id, { location } as Shelter, 'shelter');
         const updatedUser = { ...result.user, location } as Shelter;
         setCurrentUser(updatedUser);
         setUserRole('shelter');
         return { ...result, user: updatedUser };
     }
     return result;
  };

  const isRegularUser = (user: any): user is User => user?.role === 'user';

  const updateUserProfile = async (data: Partial<User> | Partial<Shelter>) => {
    if (!currentUser) return;
    try {
        await api.updateProfile(currentUser.id, data, currentUser.role);
        // Refresh local state after update
        const refreshed = await api.getCurrentSession();
        if (refreshed) {
          setCurrentUser(refreshed);
        }
    } catch (e) {
        console.error("Update profile failed", e);
        throw e;
    }
  };

  const toggleFavorite = async (petId: string) => {
    if (!isRegularUser(currentUser)) return;
    const isFav = currentUser.favorites.includes(petId);
    const newFavorites = isFav 
        ? currentUser.favorites.filter(id => id !== petId) 
        : [...currentUser.favorites, petId];
    
    setCurrentUser({ ...currentUser, favorites: newFavorites });

    try {
        await api.toggleFavorite(currentUser.id, petId, isFav);
    } catch (e) {
        console.error("Failed to sync favorites:", e);
        const revertedFavorites = isFav 
            ? [...currentUser.favorites, petId]
            : currentUser.favorites.filter(id => id !== petId);
        setCurrentUser({ ...currentUser, favorites: revertedFavorites });
    }
  };

  const adoptVirtually = async (petId: string, amount: number) => {
      if (!isRegularUser(currentUser)) return;
      try {
          await api.adoptVirtually(currentUser.id, petId, amount);
          const newAdoption = { petId, amount, startDate: new Date().toISOString() };
          setCurrentUser({ ...currentUser, virtualAdoptions: [...currentUser.virtualAdoptions, newAdoption] });
      } catch (e) { console.error(e); }
  };

  const updateAdoptionAmount = async (petId: string, amount: number) => {
      if (!isRegularUser(currentUser)) return;
      try {
          await api.updateVirtualAdoption(currentUser.id, petId, amount);
          const updated = currentUser.virtualAdoptions.map(a => a.petId === petId ? { ...a, amount } : a);
          setCurrentUser({ ...currentUser, virtualAdoptions: updated });
      } catch (e) { console.error(e); }
  };

  const cancelAdoption = async (petId: string) => {
      if (!isRegularUser(currentUser)) return;
      try {
          await api.cancelVirtualAdoption(currentUser.id, petId);
          const updated = currentUser.virtualAdoptions.filter(a => a.petId !== petId);
          setCurrentUser({ ...currentUser, virtualAdoptions: updated });
      } catch (e) { console.error(e); }
  };

  const isFavorite = (petId: string) => {
    return isRegularUser(currentUser) ? currentUser.favorites.includes(petId) : false;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, userRole, isRecoveringPassword, isLoading,
      login, logout, resetPassword, updatePassword, registerUser, registerShelter, updateUserProfile,
      adoptVirtually, updateAdoptionAmount, cancelAdoption, toggleFavorite, isFavorite 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};