
import React, { useState, useMemo } from 'react';
import { usePets } from '../../contexts/PetContext';
import { Pet, PetType, Gender } from '../../types';
import {
    Plus, Eye, EyeOff, Filter, Search, MoreHorizontal,
    AlertTriangle, CheckCircle2, Clock, Image as ImageIcon,
    FileText, Trash2, Tag, Share2, ChevronDown, ArrowUpDown, Edit2
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

    // --- UI Variables ---

    const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || alertFilter;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evidencia zvierat</h1>
                    <p className="text-gray-500 text-sm">Spravujte zoznam zvierat, ich statusy a profily.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        id="csv-upload"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                Papa.parse(file, {
                                    header: true,
                                    skipEmptyLines: true,
                                    complete: async (results) => {
                                        let successCount = 0;
                                        let errorCount = 0;

                                        for (const row of results.data as any[]) {
                                            try {
                                                // Map keys from Slovak to Internal
                                                // Expected Columns: Meno, Druh, Plemeno, Vek, Pohlavie, Popis

                                                if (!row['Meno']) {
                                                    console.warn('Skipping row without name:', row);
                                                    errorCount++;
                                                    continue;
                                                }

                                                const newPet: any = {
                                                    name: row['Meno'],
                                                    type: row['Druh'] || PetType.DOG,
                                                    breed: row['Plemeno'] || 'Kríženec',
                                                    age: row['Vek'] ? Number(row['Vek']) : 0,
                                                    gender: row['Pohlavie'] === 'Samica' ? Gender.FEMALE : Gender.MALE,
                                                    size: 'Stredný', // Default
                                                    location: currentUser?.location || '',
                                                    description: row['Popis'] || 'Bez popisu.',
                                                    adoptionStatus: 'Available',
                                                    shelterId: currentUser?.id,
                                                    postedDate: new Date().toISOString(),
                                                    isVisible: true, // Default per recent change
                                                    health: {
                                                        isVaccinated: false,
                                                        isDewormed: false,
                                                        isCastrated: false,
                                                        isChipped: false,
                                                        hasAllergies: false
                                                    },
                                                    social: {
                                                        children: 'Neznáme',
                                                        dogs: 'Neznáme',
                                                        cats: 'Neznáme'
                                                    },
                                                    training: {
                                                        toiletTrained: false,
                                                        leashTrained: false,
                                                        carTravel: false,
                                                        aloneTime: false
                                                    },
                                                    requirements: {
                                                        activityLevel: 'Stredná',
                                                        suitableFor: [],
                                                        unsuitableFor: []
                                                    },
                                                    tags: [],
                                                    adoptionFee: 0
                                                };

                                                await addPet(newPet);
                                                successCount++;
                                            } catch (e) {
                                                console.error('Error importing row:', row, e);
                                                errorCount++;
                                            }
                                        }

                                        alert(`Import dokončený!\n\nÚspešne pridané: ${successCount}\nChyby/Preskočené: ${errorCount}`);
                                        // Reset input logic if needed, but simple alert is fine for now
                                    },
                                    error: (err) => {
                                        console.error(err);
                                        alert('Chyba pri čítaní súboru');
                                    }
                                });
                            }
                        }}
                    />
                    <label
                        htmlFor="csv-upload"
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer"
                    >
                        <Upload size={18} /> Import Excel/CSV
                    </label>
                    <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition flex items-center gap-2">
                        <FileText size={18} /> Export
                    </button>
                    <button
                        onClick={() => navigate('new')}
                        className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200"
                    >
                        <Plus size={18} /> Nový príjem
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Hľadať podľa mena, čipu, plemena..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none hover:bg-white transition cursor-pointer"
                    >
                        <option value="all">Všetky statusy</option>
                        <option value="Available">Na adopciu</option>
                        <option value="Reserved">Rezervované</option>
                        <option value="Adopted">Adoptované</option>
                        <option value="Quarantine">Karanténa</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none hover:bg-white transition cursor-pointer"
                    >
                        <option value="all">Všetky druhy</option>
                        <option value="Pes">Psy</option>
                        <option value="Mačka">Mačky</option>
                    </select>

                    <button
                        onClick={() => setAlertFilter(!alertFilter)}
                        className={`px-4 py-2.5 border rounded-xl text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${alertFilter ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-white'}`}
                    >
                        <AlertTriangle size={16} />
                        Vyžaduje pozornosť
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setAlertFilter(false); }}
                            className="px-3 text-sm text-gray-500 hover:text-red-500 font-medium whitespace-nowrap"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                                        checked={selectedIds.size === filteredPets.length && filteredPets.length > 0}
                                        onChange={toggleAll}
                                    />
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition group" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">Zviera <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition group" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-1">Status <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition group" onClick={() => handleSort('quality')}>
                                    <div className="flex items-center gap-1">Kvalita profilu <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition group" onClick={() => handleSort('days')}>
                                    <div className="flex items-center gap-1">Dní v útulku <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-4 py-3 text-right">Akcie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        Nenašli sa žiadne zvieratá zodpovedajúce filtrom.
                                    </td>
                                </tr>
                            ) : (
                                filteredPets.map(pet => {
                                    const isSelected = selectedIds.has(pet.id);
                                    return (
                                        <tr
                                            key={pet.id}
                                            className={`hover:bg-gray-50 transition group ${isSelected ? 'bg-brand-50/30' : ''}`}
                                        >
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(pet.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4 cursor-pointer" onClick={() => navigate(`${pet.id}`)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                                        {pet.imageUrl ? (
                                                            <img src={pet.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="w-6 h-6 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 group-hover:text-brand-600 transition flex items-center gap-2">
                                                            {pet.name}
                                                            {!pet.isVisible && <EyeOff size={14} className="text-gray-400" />}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                                            <span>{pet.breed}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                            <span>{formatSlovakAge(pet.age)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <StatusBadge status={pet.adoptionStatus} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1 max-w-[120px]">
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${pet.metrics.qualityScore > 80 ? 'bg-green-500' : pet.metrics.qualityScore > 50 ? 'bg-orange-400' : 'bg-red-500'}`}
                                                            style={{ width: `${pet.metrics.qualityScore}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
                                                        <span>{pet.metrics.qualityScore}%</span>
                                                        {pet.metrics.missingFields.length > 0 && <span className="text-red-500">{pet.metrics.missingFields.length} chýb</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-700">{pet.metrics.daysInShelter} dní</div>
                                                <div className="text-xs text-gray-400">{format(parseISO(pet.intakeDate || pet.postedDate), 'd.M.yyyy')}</div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`${pet.id}`, { state: { edit: true } });
                                                        }}
                                                        className="p-2 hover:bg-brand-50 rounded-lg text-gray-400 hover:text-brand-600 transition"
                                                        title="Upraviť"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveActionMenu(activeActionMenu === pet.id ? null : pet.id);
                                                            }}
                                                            className={`p-2 rounded-lg transition ${activeActionMenu === pet.id ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>

                                                        {activeActionMenu === pet.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveActionMenu(null); }}></div>
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`${pet.id}`);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                                                                    >
                                                                        <Eye size={16} /> Zobraziť
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`${pet.id}`, { state: { edit: true } });
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                                                                    >
                                                                        <Edit2 size={16} /> Upraviť
                                                                    </button>
                                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('Naozaj zmazať?')) {
                                                                                await deletePet(pet.id);
                                                                            }
                                                                            setActiveActionMenu(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 size={16} /> Zmazať
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Batch Actions Bar - Floating Bottom */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-2 border-r border-gray-700 pr-6">
                        <div className="bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {selectedIds.size}
                        </div>
                        <span className="text-sm font-bold">Vybrané</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <BatchActionBtn icon={Eye} label="Publikovať" />
                        <BatchActionBtn icon={EyeOff} label="Skryť" />
                        <BatchActionBtn icon={Tag} label="Zmeniť status" />
                        <BatchActionBtn icon={Share2} label="Kampaň" />
                        <div className="w-px h-6 bg-gray-700 mx-2"></div>
                        <BatchActionBtn icon={Trash2} label="Zmazať" danger />
                    </div>

                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="ml-2 p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Helpers ---

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        'Available': 'bg-green-100 text-green-700 border-green-200',
        'Reserved': 'bg-orange-100 text-orange-700 border-orange-200',
        'Adopted': 'bg-blue-100 text-blue-700 border-blue-200',
        'Quarantine': 'bg-red-100 text-red-700 border-red-200', // Example
    };

    // Fallback
    const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${style} inline-flex items-center gap-1.5`}>
            {status === 'Available' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>}
            {status}
        </span>
    );
};

const BatchActionBtn = ({ icon: Icon, label, danger }: any) => (
    <button className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition ${danger ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}>
        <Icon size={18} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default InternalPetList;
