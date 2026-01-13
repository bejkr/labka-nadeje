import React, { useState } from 'react';
import { Plus, Upload, Search, Filter, Eye, EyeOff, Send, Pencil, Trash2, Calendar, Check, X } from 'lucide-react';
import { Pet, PetType } from '../../types';
import { useApp } from '../../contexts/AppContext';
import ConfirmationModal from '../ConfirmationModal';
import SocialShareModal from '../SocialShareModal';
import { formatSlovakAge } from '../../utils/formatters';

interface PetManagerProps {
    pets: Pet[];
    onAdd: () => void;
    onImport: () => void;
    onEdit: (pet: Pet) => void;
    onDelete: (id: string) => Promise<void>;
}

const PetManager: React.FC<PetManagerProps> = ({ pets, onAdd, onImport, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Reserved' | 'Adopted'>('All');
    const [visibilityFilter, setVisibilityFilter] = useState<'All' | 'Visible' | 'Hidden'>('All');

    const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
    const [shareModalPet, setShareModalPet] = useState<Pet | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { showToast } = useApp();

    const filteredPets = pets.filter(pet => {
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' ? true : pet.adoptionStatus === statusFilter;
        const matchesVisibility = visibilityFilter === 'All' ? true :
            (visibilityFilter === 'Visible' ? pet.isVisible : !pet.isVisible);

        return matchesSearch && matchesStatus && matchesVisibility;
    });

    const confirmDelete = async () => {
        if (!petToDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(petToDelete.id);
            showToast(`Profil ${petToDelete.name} bol úspešne vymazaný.`, 'success');
            setPetToDelete(null);
        } catch (e: any) {
            showToast(e.message || "Nepodarilo sa vymazať zviera.", 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRowClick = (petId: string) => {
        window.open(`#/pets/${petId}`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Správa zvierat</h2>
                    <p className="text-gray-500 text-sm font-medium">Spravujte profily vašich zverencov.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={onAdd} className="flex-1 sm:flex-none justify-center bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 transition flex items-center gap-2 font-bold shadow-lg shadow-brand-200 active:scale-95 duration-200">
                        <Plus size={20} /> <span className="hidden sm:inline">Pridať zviera</span><span className="sm:hidden">Pridať</span>
                    </button>
                    <button onClick={onImport} className="flex-none bg-white text-gray-700 border border-gray-200 px-3 sm:px-5 py-2.5 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-bold">
                        <Upload size={20} /> <span className="hidden sm:inline">Import CSV</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Hľadať podľa mena..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 transition font-medium"
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0">
                        <div className="relative min-w-[140px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-700 font-bold appearance-none cursor-pointer"
                            >
                                <option value="All">Všetky statusy</option>
                                <option value="Available">Na adopciu</option>
                                <option value="Reserved">Rezervované</option>
                                <option value="Adopted">Adoptované</option>
                            </select>
                        </div>

                        <div className="relative min-w-[140px]">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {visibilityFilter === 'Visible' ? <Eye size={16} /> : visibilityFilter === 'Hidden' ? <EyeOff size={16} /> : <Eye size={16} />}
                            </div>
                            <select
                                value={visibilityFilter}
                                onChange={(e) => setVisibilityFilter(e.target.value as any)}
                                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-700 font-bold appearance-none cursor-pointer"
                            >
                                <option value="All">Všetky</option>
                                <option value="Visible">Verejné</option>
                                <option value="Hidden">Skryté</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-500">Zviera</th>
                                <th className="px-6 py-4 font-bold text-gray-500">Detaily</th>
                                <th className="px-6 py-4 font-bold text-gray-500">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-500">Viditeľnosť</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-right">Akcia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPets.map(pet => (
                                <tr key={pet.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleRowClick(pet.id)}>
                                        <div className="flex items-center gap-4 group/link">
                                            <img src={pet.imageUrl} alt={pet.name} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover/link:scale-105 transition-all duration-300" />
                                            <div>
                                                <div className="font-bold text-gray-900 text-base group-hover/link:text-brand-600 transition">{pet.name}</div>
                                                <div className="text-xs text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-1">{pet.breed}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 cursor-pointer" onClick={() => handleRowClick(pet.id)}>
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 font-bold text-gray-700"><Calendar size={14} className="text-gray-400" /> {formatSlovakAge(pet.age)}</span>
                                            <span className="text-xs text-gray-400 font-medium">{pet.gender === 'Male' ? 'Samec' : 'Samica'}, {pet.size}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleRowClick(pet.id)}>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${pet.adoptionStatus === 'Available' ? 'bg-green-50 text-green-600 border-green-200' :
                                                pet.adoptionStatus === 'Reserved' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                            }`}>
                                            {pet.adoptionStatus === 'Available' ? 'Na adopciu' :
                                                pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleRowClick(pet.id)}>
                                        {pet.isVisible
                                            ? <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold"><Eye size={14} /> Verejný</div>
                                            : <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold"><EyeOff size={14} /> Skrytý</div>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShareModalPet(pet); }}
                                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                                                title="Zdieľať"
                                            >
                                                <Send size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(pet); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Upraviť"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPetToDelete(pet); }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Vymazať"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPets.length === 0 && (
                    <div className="p-12 text-center text-gray-400 bg-gray-50/50">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">Nenašli sa žiadne zvieratá</h3>
                        <p className="text-sm">Skúste zmeniť filtre alebo hľadaný výraz.</p>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredPets.map(pet => (
                    <div key={pet.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition duration-200" onClick={() => handleRowClick(pet.id)}>
                        <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-black text-gray-900 text-lg truncate pr-2">{pet.name}</h3>
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(pet); }} className="text-gray-400 p-1">
                                        <Pencil size={16} />
                                    </button>
                                </div>
                                <div className="text-xs font-bold text-brand-600 mb-2">{pet.breed}</div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${pet.adoptionStatus === 'Available' ? 'bg-green-50 text-green-600 border-green-200' :
                                            pet.adoptionStatus === 'Reserved' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                        {pet.adoptionStatus === 'Available' ? 'Na adopciu' :
                                            pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                                    </span>
                                    {pet.isVisible ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                                            <Eye size={10} /> Public
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                                            <EyeOff size={10} /> Hidden
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                            <div className="text-xs font-bold text-gray-500">
                                {formatSlovakAge(pet.age)} • {pet.gender === 'Male' ? 'Samec' : 'Samica'}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShareModalPet(pet); }}
                                    className="p-2 text-gray-400 hover:text-brand-600 bg-gray-50 rounded-lg"
                                >
                                    <Send size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPetToDelete(pet); }}
                                    className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredPets.length === 0 && (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Search className="mx-auto mb-2 opacity-50" size={24} />
                        <p className="text-sm font-bold">Žiadne výsledky</p>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!petToDelete}
                onClose={() => setPetToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Vymazať inzerát?"
                message={`Naozaj chcete natrvalo vymazať profil ${petToDelete?.name}?`}
                confirmText="Vymazať profil"
            />

            {shareModalPet && (
                <SocialShareModal
                    isOpen={!!shareModalPet}
                    onClose={() => setShareModalPet(null)}
                    petName={shareModalPet.name}
                    imageUrl={shareModalPet.imageUrl}
                    description={shareModalPet.description}
                    hashtags={['#labkanadeje', `#${shareModalPet.type === PetType.DOG ? 'pes' : 'macka'}`, '#adopcia', `#${shareModalPet.breed.replace(/\s+/g, '')}`]}
                    url={`https://labkanadeje.sk/#/pets/${shareModalPet.id}`}
                />
            )}
        </div>
    );
};

export default PetManager;
