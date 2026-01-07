import React, { useState } from 'react';
import { PetType, Gender, Size } from '../types';
import { X, Bell, Check, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface PetAlertFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const PetAlertForm: React.FC<PetAlertFormProps> = ({ onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState<PetType | ''>('');
    const [breed, setBreed] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setIsSubmitting(true);
        try {
            const filters = {
                types: selectedType ? [selectedType] : undefined,
                breeds: breed ? [breed] : undefined,
                locations: location ? [location] : undefined,
            };

            // Call API to save alert (We need to add this method to api.ts later)
            // For now, assume direct supabase call or extend api
            await api.createPetAlert({ name, filters });
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Chyba pri ukladaní upozornenia.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Nové upozornenie</h2>
                        <p className="text-gray-500 text-sm font-medium">Dostávajte e-maily o nových zvieratkách.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">Názov hľadania</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Napr. Zlatý Retriever v Bratislave"
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:bg-white focus:border-brand-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">Druh</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as PetType)}
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:bg-white focus:border-brand-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Všetky</option>
                                {Object.values(PetType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">Lokalita</label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Napr. Košice"
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:bg-white focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">Plemeno (Voliteľné)</label>
                        <input
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                            placeholder="Napr. Labrador"
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:bg-white focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-xl hover:shadow-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Ukladám...' : <><Save size={18} /> Uložiť upozornenie</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PetAlertForm;
