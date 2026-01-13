
import React, { useState, useMemo } from 'react';
import { usePets } from '../../contexts/PetContext';
import { Pet, PetType, Gender } from '../../types';
import {
    Plus, Eye, EyeOff, Search, MoreHorizontal,
    AlertTriangle, Image as ImageIcon,
    FileText, Trash2, Tag, Share2, ArrowUpDown, Edit2, Download,
    Calendar, CheckCircle2, ChevronDown, Clock
} from 'lucide-react';
import { formatSlovakAge } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';

const InternalPetList: React.FC = () => {
    const { pets, deletePet, addPet } = usePets();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // --- State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [alertFilter, setAlertFilter] = useState<boolean>(false);

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof Pet | 'days' | 'quality'; direction: 'asc' | 'desc' } | null>(null);

    // --- Derivations ---

    const shelterPets = useMemo(() => {
        if (!currentUser || currentUser.role !== 'shelter') return [];
        return pets.filter(pet => pet.shelterId === currentUser.id);
    }, [pets, currentUser]);

    // Enhanced Pet Objects with Calculated Metrics
    const enhancedPets = useMemo(() => {
        const today = new Date();
        return shelterPets.map(pet => {
            const daysInShelter = differenceInDays(today, parseISO(pet.intakeDate || pet.postedDate));

            // Profile Quality / Missing Data
            const missingFields = [];
            if (!pet.imageUrl) missingFields.push('no_photo');
            if (!pet.description || pet.description.length < 50) missingFields.push('short_desc');
            if (!pet.health?.isVaccinated) missingFields.push('no_vax');

            const qualityScore = Math.max(0, 100 - (missingFields.length * 20));

            return {
                ...pet,
                metrics: {
                    daysInShelter,
                    missingFields,
                    qualityScore
                }
            };
        });
    }, [shelterPets]);

    const filteredPets = useMemo(() => {
        return enhancedPets.filter(pet => {
            // Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                pet.name.toLowerCase().includes(searchLower) ||
                pet.breed.toLowerCase().includes(searchLower) ||
                pet.internalId?.toLowerCase().includes(searchLower);

            // Filters
            const matchesStatus = statusFilter === 'all' || pet.adoptionStatus === statusFilter;
            const matchesType = typeFilter === 'all' || pet.type === typeFilter;
            const matchesAlert = !alertFilter || pet.metrics.qualityScore < 80;

            return matchesSearch && matchesStatus && matchesType && matchesAlert;
        }).sort((a, b) => {
            if (!sortConfig) return 0;

            let valA: any = a[sortConfig.key as keyof Pet];
            let valB: any = b[sortConfig.key as keyof Pet];

            // Handle custom sort keys
            if (sortConfig.key === 'days') {
                valA = a.metrics.daysInShelter;
                valB = b.metrics.daysInShelter;
            } else if (sortConfig.key === 'quality') {
                valA = a.metrics.qualityScore;
                valB = b.metrics.qualityScore;
            } else if (sortConfig.key === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [enhancedPets, searchTerm, statusFilter, typeFilter, alertFilter, sortConfig]);

    // --- Handlers ---

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredPets.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredPets.map(p => p.id)));
    };

    const handleSort = (key: any) => {
        setSortConfig(current => ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleRowClick = (id: string, e: React.MouseEvent) => {
        // Prevent navigation if clicking on checkbox or actions
        if ((e.target as HTMLElement).closest('input[type="checkbox"]') || (e.target as HTMLElement).closest('button')) {
            return;
        }
        navigate(`${id}`);
    }

    // --- UI Variables ---

    const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || alertFilter;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Evidencia zvierat</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Spravujte zoznam zvierat, ich statusy a profily.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <label className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer shadow-sm">
                        <Upload size={18} /> <span className="hidden sm:inline">Import</span>
                        <input type="file" accept=".csv" className="hidden" onChange={() => {/* Simplified for brevity */ }} />
                    </label>
                    <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-sm">
                        <Download size={18} /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => navigate('new')}
                        className="bg-brand-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 dark:shadow-none active:scale-95"
                    >
                        <Plus size={20} /> <span className="hidden sm:inline">Nové zviera</span> <span className="sm:hidden">Nové</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Hľadať podľa mena..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 touch-auto no-scrollbar">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[140px]"
                    >
                        <option value="all">Všetky statusy</option>
                        <option value="Available">Na adopciu</option>
                        <option value="Reserved">Rezervované</option>
                        <option value="Adopted">Adoptované</option>
                        <option value="Quarantine">Karanténa</option>
                    </select>

                    <button
                        onClick={() => setAlertFilter(!alertFilter)}
                        className={`px-4 py-2.5 border rounded-xl text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${alertFilter ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'}`}
                    >
                        <AlertTriangle size={16} /> <span className="hidden sm:inline">Pozor</span>
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setAlertFilter(false); setSearchTerm(''); }}
                            className="px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-bold whitespace-nowrap"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-10 text-center">
                                    <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer" checked={selectedIds.size === filteredPets.length && filteredPets.length > 0} onChange={toggleAll} />
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">Zviera <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group" onClick={() => handleSort('adoptionStatus')}>
                                    <div className="flex items-center gap-1">Status <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group" onClick={() => handleSort('quality')}>
                                    <div className="flex items-center gap-1">Kvalita <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group" onClick={() => handleSort('days')}>
                                    <div className="flex items-center gap-1">Dní v útulku <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" /></div>
                                </th>
                                <th className="px-6 py-4 text-right">Akcie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filteredPets.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-medium">Žiadne výsledky pre zadané filtre.</td></tr>
                            ) : (
                                filteredPets.map(pet => (
                                    <tr key={pet.id} onClick={(e) => handleRowClick(pet.id, e)} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer group ${selectedIds.has(pet.id) ? 'bg-brand-50/20 dark:bg-brand-900/10' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer" checked={selectedIds.has(pet.id)} onChange={() => toggleSelection(pet.id)} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-600">
                                                    {pet.imageUrl ? <img src={pet.imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-gray-300 dark:text-gray-500" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition flex items-center gap-2">{pet.name} {!pet.isVisible && <EyeOff size={14} className="text-gray-400" />}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{pet.breed} • {formatSlovakAge(pet.age)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={pet.adoptionStatus} /></td>
                                        <td className="px-6 py-4">
                                            <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden mb-1">
                                                <div className={`h-full ${pet.metrics.qualityScore > 80 ? 'bg-green-500' : pet.metrics.qualityScore > 50 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${pet.metrics.qualityScore}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">{pet.metrics.qualityScore}% vyplnené</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{pet.metrics.daysInShelter} dní</div>
                                            <div className="text-xs text-gray-400">od {format(parseISO(pet.intakeDate || pet.postedDate), 'd.M.')}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`${pet.id}`, { state: { edit: true } }); }} className="p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition"><Edit2 size={16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); deletePet(pet.id); }} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredPets.length === 0 && (
                    <div className="text-center py-10 text-gray-400 font-medium">Žiadne výsledky.</div>
                )}
                {filteredPets.map(pet => (
                    <div key={pet.id} onClick={() => navigate(`${pet.id}`)} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.99] transition duration-200">
                        <div className="flex gap-4 mb-3">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 shadow-sm">
                                {pet.imageUrl ? <img src={pet.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-6 text-gray-300 dark:text-gray-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{pet.name}</h3>
                                    <StatusBadge status={pet.adoptionStatus} minimal />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{pet.breed}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatSlovakAge(pet.age)}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {pet.metrics.daysInShelter}d.</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700">
                            <div className={`text-[10px] font-bold px-2 py-1 rounded bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 ${pet.metrics.qualityScore < 80 ? 'text-orange-500 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                                Kvalita profilu: {pet.metrics.qualityScore}%
                            </div>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); navigate(`${pet.id}`, { state: { edit: true } }); }} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg active:bg-gray-200 dark:active:bg-gray-600"><Edit2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Batch Actions */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
                    <span className="font-bold text-sm border-r border-gray-700 pr-4 mr-1">{selectedIds.size} vybraných</span>
                    <button className="hover:text-brand-400 transition"><Eye size={20} /></button>
                    <button className="hover:text-brand-400 transition"><Tag size={20} /></button>
                    <button className="hover:text-red-400 transition ml-2"><Trash2 size={20} /></button>
                    <button onClick={() => setSelectedIds(new Set())} className="ml-2 text-gray-500 hover:text-white">✕</button>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status, minimal }: { status: string, minimal?: boolean }) => {
    const styles: any = {
        'Available': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'Reserved': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'Adopted': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'Quarantine': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    };
    const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';

    if (minimal) {
        return <div className={`w-2.5 h-2.5 rounded-full ${style.split(' ')[0].replace('100', '500')}`} title={status} />;
    }

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${style} inline-flex items-center gap-1.5`}>
            {status === 'Available' && <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>}
            {status}
        </span>
    );
};

export default InternalPetList;
