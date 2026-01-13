import React, { useState, useRef } from 'react';
import { Sparkles, Camera, Save, Loader2, X } from 'lucide-react';
import { Pet } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { usePets } from '../../contexts/PetContext';
import { api } from '../../services/api';

interface UpdatesManagerProps {
    pets: Pet[];
}

const UpdatesManager: React.FC<UpdatesManagerProps> = ({ pets }) => {
    const [selectedPetId, setSelectedPetId] = useState<string>(pets.length > 0 ? pets[0].id : '');
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateContent, setUpdateContent] = useState('');
    const [updateImage, setUpdateImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { showToast } = useApp();
    const { refreshPets } = usePets();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUpdateImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPetId || !updateTitle || !updateContent) {
            showToast('Vyplňte všetky povinné polia.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            let imageUrl = '';

            if (updateImage) {
                try {
                    imageUrl = await api.uploadFile(updateImage, 'images', 'updates');
                } catch (uploadError: any) {
                    console.error("Upload failed:", uploadError);
                    throw new Error("Nepodarilo sa nahrať obrázok. Skúste to znova.");
                }
            } else if (previewUrl && !updateImage) {
                imageUrl = previewUrl;
            }

            const newUpdate = {
                title: updateTitle,
                content: updateContent,
                imageUrl: imageUrl,
                type: 'status'
            };

            await api.addPetUpdate(selectedPetId, newUpdate);

            showToast('Aktualizácia bola úspešne pridaná.', 'success');
            setUpdateTitle('');
            setUpdateContent('');
            setUpdateImage(null);
            setPreviewUrl('');

            await refreshPets();
        } catch (error: any) {
            console.error(error);
            showToast(error.message || 'Nepodarilo sa pridať aktualizáciu.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedPet = pets.find(p => p.id === selectedPetId);

    // Sort pets alphabetically
    const sortedPets = [...pets].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Správa noviniek</h2>
                <p className="text-gray-500 text-sm font-medium">Informujte virtuálnych rodičov o tom, čo sa deje s ich zverencami.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* FORM - Left Side */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Vyberte zviera</label>
                                <select
                                    value={selectedPetId}
                                    onChange={(e) => setSelectedPetId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 font-bold transition"
                                >
                                    {sortedPets.map(pet => (
                                        <option key={pet.id} value={pet.id}>{pet.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nadpis aktualizácie</label>
                                <input
                                    type="text"
                                    value={updateTitle}
                                    onChange={(e) => setUpdateTitle(e.target.value)}
                                    placeholder="Napr. Prvá prechádzka, Hľadáme domov..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 font-bold placeholder-gray-400 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Obsah</label>
                                <textarea
                                    value={updateContent}
                                    onChange={(e) => setUpdateContent(e.target.value)}
                                    placeholder="Napíšte krátky text o tom, čo sa stalo..."
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 font-medium placeholder-gray-400 min-h-[120px] transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fotografia (nepovinné)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition duration-300 group text-center"
                                >
                                    {previewUrl ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setUpdateImage(null); setPreviewUrl(''); }}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-600 transition backdrop-blur-sm"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition duration-300">
                                                <Camera size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">Kliknite pre nahranie fotky</p>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG do 5MB</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-brand-600 text-white py-4 rounded-xl font-black text-base hover:bg-brand-700 transition shadow-lg shadow-brand-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Odoslať novinku</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* VISUAL PREVIEW - Right Side */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24">
                        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-brand-500" /> Náhľad zobrazenia
                        </h3>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                            {/* Simulate Timeline Item */}
                            <div className="p-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-brand-500 mb-1"></div>
                                        <div className="w-0.5 flex-1 bg-brand-100"></div>
                                    </div>
                                    <div className="flex-1 pb-8">
                                        <p className="text-xs font-bold text-gray-400 mb-1">Práve teraz</p>
                                        <h4 className="font-bold text-gray-900 text-lg mb-2">{updateTitle || 'Nadpis novinky...'}</h4>
                                        {previewUrl && (
                                            <div className="aspect-video rounded-xl overflow-hidden mb-3 shadow-sm">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {updateContent || 'Tu sa zobrazí text vašej novinky tak, ako ho uvidia podporovatelia...'}
                                        </p>

                                        {selectedPet && (
                                            <div className="mt-4 flex items-center gap-2 p-2 bg-gray-50 rounded-lg max-w-fit">
                                                <img src={selectedPet.imageUrl} className="w-6 h-6 rounded-full object-cover" alt="" />
                                                <span className="text-xs font-bold text-gray-600">{selectedPet.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs font-medium">
                            💡 <strong>Tip:</strong> Pravidelné aktualizácie zvyšujú šancu na virtuálnu adopciu až o 40%.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatesManager;
