import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pet } from '../types';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';

interface PetContextType {
  pets: Pet[];
  loading: boolean;
  updatePet: (updatedPet: Pet) => Promise<void>;
  addPet: (newPet: Pet, autoPostToSocials?: boolean) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  getPet: (id: string) => Pet | undefined;
  refreshPets: () => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPets = async () => {
    setLoading(true);
    try {
      const data = await api.getPets();
      setPets(data);
    } catch (e) {
      console.error("Failed to load pets", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pets on mount
  useEffect(() => {
    loadPets();

    // Listen for auth changes to re-fetch pets (important for RLS visibility)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadPets();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updatePet = async (updatedPet: Pet) => {
    try {
      await api.updatePet(updatedPet);
      await loadPets();
    } catch (e: any) {
      console.error("Update pet failed", e);
      alert(`Chyba pri ukladaní: ${e.message || e.error_description || 'Neznáma chyba'}`);
    }
  };

  const addPet = async (newPet: Pet, autoPostToSocials?: boolean) => {
    try {
      await api.createPet(newPet, undefined, autoPostToSocials);
      await loadPets();
    } catch (e) {
      console.error("Add pet failed", e);
      alert("Chyba pri vytváraní");
    }
  };

  const deletePet = async (petId: string) => {
    try {
      await api.deletePet(petId);
      await loadPets();
    } catch (e: any) {
      console.error("PetContext Delete Error:", e);
      throw e;
    }
  };

  const getPet = (idOrSlug: string) => {
    return pets.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  };

  return (
    <PetContext.Provider value={{ pets, loading, updatePet, addPet, deletePet, getPet, refreshPets: loadPets }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePets = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
};