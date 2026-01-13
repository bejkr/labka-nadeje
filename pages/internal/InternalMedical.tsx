
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { MedicalRecord, Pet } from '../../types';
import { DataTable } from '../../components/internal/DataTable';
import MedicalRecordModal from '../../components/internal/MedicalRecordModal';
import { Plus, Syringe, Calendar, FileText, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

const InternalMedical: React.FC = () => {
    const { currentUser } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<Partial<MedicalRecord> | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const loadRecords = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const data = await api.getMedicalRecords(currentUser.id);
            setRecords(data);
        } catch (e) {
            console.error("Failed to load medical records", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [currentUser]);

    const handleEdit = (record: any) => {
        setSelectedRecord({
            id: record.id,
            petId: record.pet_id,
            date: record.date,
            type: record.type,
            title: record.title,
            description: record.description,
            vetName: record.vet_name,
            cost: record.cost,
            nextDueDate: record.next_due_date
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Naozaj chcete vymazať tento záznam?')) {
            try {
                await api.deleteMedicalRecord(id);
                loadRecords();
            } catch (e) {
                alert('Chyba pri mazaní');
            }
        }
    };

    const columns = [
        {
            header: 'Dátum',
            accessorKey: 'date',
            cell: (row: any) => <span className="font-mono text-gray-600 dark:text-gray-400 font-bold">{format(new Date(row.date), 'd.M.yyyy')}</span>,
            sortable: true
        },
        {
            header: 'Zviera',
            accessorKey: 'pets.name',
            cell: (row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {row.pets?.name?.substring(0, 1)}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-gray-200">{row.pets?.name || 'Neznáme'}</span>
                </div>
            ),
            sortable: true
        },
        {
            header: 'Typ',
            accessorKey: 'type',
            cell: (row: any) => <MedicalTypeBadge type={row.type} />,
            sortable: true
        },
        {
            header: 'Popis',
            accessorKey: 'title',
            cell: (row: any) => (
                <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{row.title}</div>
                    {row.description && <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{row.description}</div>}
                </div>
            )
        },
        {
            header: 'Termín',
            accessorKey: 'next_due_date',
            cell: (row: any) => {
                if (!row.next_due_date) return <span className="text-gray-300 dark:text-gray-600 text-xs">-</span>;
                const date = new Date(row.next_due_date);
                const isOverdue = date < new Date();
                return (
                    <span className={`flex items-center gap-1 text-xs font-bold ${isOverdue ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded' : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded'}`}>
                        <Calendar size={12} />
                        {format(date, 'd.M.yyyy')}
                    </span>
                );
            },
            sortable: true
        },
        {
            header: '',
            cell: (row: any) => (
                <div className="flex gap-1 justify-end">
                    <button onClick={() => handleEdit(row)} className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-bold text-xs">Upraviť</button>
                    <button onClick={() => handleDelete(row.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-bold text-xs">Zmazať</button>
                </div>
            )
        }
    ];

    // Filtered Records
    const filteredRecords = records.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.pets?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Upcoming logic
    const upcomingCount = records.filter(r => r.next_due_date && new Date(r.next_due_date) > new Date()).length;
    const overdueCount = records.filter(r => r.next_due_date && new Date(r.next_due_date) < new Date()).length;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Zdravotné záznamy</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Centrálny prehľad úkonov a termínov.</p>
                </div>
                <button
                    onClick={() => { setSelectedRecord(undefined); setShowModal(true); }}
                    className="bg-brand-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 dark:shadow-none active:scale-95"
                >
                    <Plus size={20} /> <span className="hidden sm:inline">Nový záznam</span> <span className="sm:hidden">Nový</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    icon={Syringe}
                    value={records.length}
                    label="Celkovo záznamov"
                    color="blue"
                />
                <StatsCard
                    icon={Calendar}
                    value={upcomingCount}
                    label="Plánované úkony"
                    color="orange"
                />
                <StatsCard
                    icon={AlertTriangle}
                    value={overdueCount}
                    label="Po termíne"
                    color="red"
                    alert={overdueCount > 0}
                />
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                {/* Search / Filters Bar */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Hľadať záznam, zviera..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                    <DataTable
                        data={filteredRecords}
                        columns={columns}
                        hideSearch // We have our own search above
                    />
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredRecords.length === 0 && (
                        <div className="p-8 text-center text-gray-400 font-medium">Žiadne záznamy.</div>
                    )}
                    {filteredRecords.map((record, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition active:bg-gray-100 dark:active:bg-gray-600" onClick={() => handleEdit(record)}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{format(new Date(record.date), 'd.M.')}</span>
                                    <MedicalTypeBadge type={record.type} compact />
                                </div>
                                {record.next_due_date && (
                                    <div className={`text-[10px] font-bold flex items-center gap-1 ${new Date(record.next_due_date) < new Date() ? 'text-red-500 dark:text-red-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                        <Calendar size={10} /> {format(new Date(record.next_due_date), 'd.M.')}
                                    </div>
                                )}
                            </div>

                            <h3 className="font-bold text-gray-900 dark:text-white mb-0.5">{record.title}</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">{record.description || 'Bez popisu'}</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-[8px] font-bold text-brand-600 dark:text-brand-400">
                                            {record.pets?.name?.substring(0, 1) || '?'}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{record.pets?.name || 'Neznáme'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {/* Action buttons could go here, but clicking the row edits it */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <MedicalRecordModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={loadRecords}
                initialData={selectedRecord}
                shelterId={currentUser?.id}
            />
        </div>
    );
};

// --- Subcomponents ---

const StatsCard = ({ icon: Icon, value, label, color, alert }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
        red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
        <div className={`p-4 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition ${colors[color]} flex items-center gap-4 relative overflow-hidden`}>
            {alert && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
            <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-sm">
                <Icon size={20} />
            </div>
            <div>
                <div className="text-2xl font-black leading-none mb-1">{value}</div>
                <div className="text-[10px] font-bold uppercase opacity-80">{label}</div>
            </div>
        </div>
    );
};

const MedicalTypeBadge = ({ type, compact }: { type: string, compact?: boolean }) => {
    const types = {
        vaccination: { label: 'Očkovanie', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Syringe },
        surgery: { label: 'Operácia', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
        checkup: { label: 'Kontrola', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
        other: { label: 'Iné', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: FileText }
    };
    const t = types[type as keyof typeof types] || types.other;
    const Icon = t.icon;

    if (compact) {
        return (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${t.color}`}>
                <Icon size={10} /> {t.label}
            </span>
        );
    }

    return (
        <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit ${t.color}`}>
            <Icon size={12} /> {t.label}
        </span>
    );
};

export default InternalMedical;
