
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Shelter } from '../types';
import { api } from '../services/api';

type UserRole = 'user' | 'shelter';

interface AuthContextType {
  currentUser: User | Shelter | null;
  userRole: UserRole | null;
  
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (name: string, email: string, password?: string) => Promise<void>;
  registerShelter: (name: string, location: string, email: string, password?: string) => Promise<void>;

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

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
        try {
            const user = await api.getCurrentSession();
            if (user) {
                setCurrentUser(user);
                setUserRole(user.role);
            }
        } catch (e) {
            console.error("Error restoring session:", e);
        }
    };
    initSession();
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
        console.error(e);
        return false;
    }
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
    setUserRole(null);
  };

  const registerUser = async (name: string, email: string, password?: string) => {
     const user = await api.register(email, password || 'password', { role: 'user', name });
     if (user) {
         setCurrentUser(user);
         setUserRole('user');
     }
  };

  const registerShelter = async (name: string, location: string, email: string, password?: string) => {
     // Passing location as part of name or handled in update, but simple for now
     const user = await api.register(email, password || 'password', { role: 'shelter', name });
     if (user) {
         // Update location immediately as it's not in metadata
         await api.updateProfile(user.id, { location } as Shelter, 'shelter');
         setCurrentUser({ ...user, location } as Shelter);
         setUserRole('shelter');
     }
  };

  // --- User Specific Actions ---
  const isRegularUser = (user: any): user is User => user?.role === 'user';

  const updateUserProfile = async (data: Partial<User> | Partial<Shelter>) => {
    if (!currentUser) return;
    try {
        await api.updateProfile(currentUser.id, data, currentUser.role);
        // Cast to union type to satisfy TS
        setCurrentUser({ ...currentUser, ...data } as User | Shelter);
    } catch (e) {
        console.error("Update failed", e);
        throw e;
    }
  };

  const toggleFavorite = async (petId: string) => {
    if (!isRegularUser(currentUser)) return;
    const isFav = currentUser.favorites.includes(petId);
    
    // Optimistic UI update
    const newFavorites = isFav 
        ? currentUser.favorites.filter(id => id !== petId) 
        : [...currentUser.favorites, petId];
    
    setCurrentUser({ ...currentUser, favorites: newFavorites });

    // API call
    try {
        await api.toggleFavorite(currentUser.id, petId, isFav);
    } catch (e) {
        // Revert on error would go here
        console.error(e);
    }
  };

  const adoptVirtually = async (petId: string, amount: number) => {
      if (!isRegularUser(currentUser)) return;
      try {
          await api.adoptVirtually(currentUser.id, petId, amount);
          // Refresh session to get updated ID if needed, or optimistic:
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
      currentUser, userRole, 
      login, logout, registerUser, registerShelter, updateUserProfile,
      adoptVirtually, updateAdoptionAmount, cancelAdoption, toggleFavorite, isFavorite 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
