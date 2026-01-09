
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Stethoscope, AlertCircle } from 'lucide-react';
import { usePets } from '../../contexts/PetContext';
import { api } from '../../services/api';
import { MedicalRecord, Pet } from '../../types';

interface MedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: Partial<MedicalRecord>;
    shelterId?: string;
}

const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({ isOpen, onClose, onSave, initialData, shelterId }) => {
    const { pets } = usePets();
    const [loading, setLoading] = useState(false);

    // Filter pets to only show those for this shelter
    const shelterPets = React.useMemo(() => {
        if (!shelterId) return pets;
        return pets.filter(p => p.shelterId === shelterId);
    }, [pets, shelterId]);

    const [formData, setFormData] = useState<Partial<MedicalRecord>>({
        petId: '',
        date: new Date().toISOString().split('T')[0],
        type: 'vaccination',
        title: '',
        description: '',
        vetName: '',
        cost: 0,
        nextDueDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
                    nextDueDate: initialData.nextDueDate ? initialData.nextDueDate.split('T')[0] : ''
                });
            } else {
                // Reset form
                setFormData({
                    petId: '',
                    date: new Date().toISOString().split('T')[0],
                    type: 'vaccination',
                    title: '',
                    description: '',
                    vetName: '',
                    cost: 0,
                    nextDueDate: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const validate = () => {
        if (!formData.petId) return "Vyberte zviera";
        if (!formData.title) return "Zadajte názov úkonu";
        if (!formData.date) return "Zadajte dátum";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validate();
        if (error) {
            alert(error);
            return;
        }

        setLoading(true);
        try {
            const recordData = {
                pet_id: formData.petId,
                date: formData.date,
                type: formData.type,
                title: formData.title,
                description: formData.description,
                vet_name: formData.vetName,
                cost: formData.cost,
                next_due_date: formData.nextDueDate || null
            };

            if (initialData?.id) {
                await api.updateMedicalRecord(initialData.id, recordData);
            } else {
                await api.createMedicalRecord(recordData);
            }
            onSave();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert("Chyba pri ukladaní záznamu");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Stethoscope className="text-brand-600" />
                        {initialData?.id ? 'Upraviť záznam' : 'Nový zdravotný záznam'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

                    {/* Pet Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zviera</label>
                        <select
                            value={formData.petId}
                            onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
                            disabled={!!initialData?.id} // Disable changing pet on edit
                            required
                        >
                            <option value="">Vyberte zviera...</option>
                            {shelterPets.map(pet => (
                                <option key={pet.id} value={pet.id}>{pet.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dátum</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Typ úkonu</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition"
                            >
                                <option value="vaccination">Očkovanie</option>
                                <option value="surgery">Operácia / Kastrácia</option>
                                <option value="checkup">Vyšetrenie</option>
                                <option value="medication">Medikácia</option>
                                <option value="chip">Čipovanie</option>
                                <option value="other">Iné</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Názov úkonu</label>
                        <input
                            type="text"
                            placeholder="Napr. Vakcína DHPPi, Kastrácia..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka / Popis</label>
                        <textarea
                            rows={3}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition"
                            placeholder="Detaily o úkone, použité liečivá..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Veterinár / Klinika</label>
                            <input
                                type="text"
                                value={formData.vetName || ''}
                                onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition"
                                placeholder="MVDr. Jozef..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cena (€)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.cost || ''}
                                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 transition"
                            />
                        </div>
                    </div>

                    <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
                        <label className="block text-sm font-bold text-brand-800 mb-1 flex items-center gap-2">
                            <Calendar size={16} /> Nasledujúca kontrola / Preočkovanie
                        </label>
                        <input
                            type="date"
                            value={formData.nextDueDate || ''}
                            onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                            className="w-full p-3 bg-white border border-brand-200 text-brand-900 rounded-lg outline-none focus:border-brand-500 transition"
                        />
                        <p className="text-xs text-brand-600 mt-1">Ak vyplníte, systém vás upozorní pred týmto dátumom.</p>
                    </div>

                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition"
                    >
                        Zrušiť
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Ukladám...' : <><Save size={18} /> Uložiť záznam</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordModal;
