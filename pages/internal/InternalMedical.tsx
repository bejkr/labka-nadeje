
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { MedicalRecord, Pet } from '../../types';
import { DataTable } from '../../components/internal/DataTable';
import MedicalRecordModal from '../../components/internal/MedicalRecordModal';
import { Plus, Syringe, Calendar, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

const InternalMedical: React.FC = () => {
    const { currentUser } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<Partial<MedicalRecord> | undefined>(undefined);

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
            cell: (row: any) => <span className="font-mono text-gray-600">{format(new Date(row.date), 'd. M. yyyy')}</span>,
            sortable: true
        },
        {
            header: 'Zviera',
            accessorKey: 'pets.name',
            cell: (row: any) => <span className="font-bold text-gray-900">{row.pets?.name || 'Neznáme'}</span>,
            sortable: true
        },
        {
            header: 'Typ',
            accessorKey: 'type',
            cell: (row: any) => {
                const types = {
                    vaccination: { label: 'Očkovanie', color: 'bg-blue-100 text-blue-700', icon: Syringe },
                    surgery: { label: 'Operácia', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
                    checkup: { label: 'Kontrola', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
                    other: { label: 'Iné', color: 'bg-gray-100 text-gray-700', icon: FileText }
                };
                const t = types[row.type as keyof typeof types] || types.other;
                const Icon = t.icon;
                return (
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit ${t.color}`}>
                        <Icon size={12} /> {t.label}
                    </span>
                );
            },
            sortable: true
        },
        {
            header: 'Popis',
            accessorKey: 'title',
            cell: (row: any) => (
                <div>
                    <div className="font-medium text-gray-900">{row.title}</div>
                    {row.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.description}</div>}
                </div>
            )
        },
        {
            header: 'Ďalší termín',
            accessorKey: 'next_due_date',
            cell: (row: any) => {
                if (!row.next_due_date) return <span className="text-gray-300">-</span>;
                const date = new Date(row.next_due_date);
                const isOverdue = date < new Date();
                return (
                    <span className={`flex items-center gap-1 text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                        <Calendar size={12} />
                        {format(date, 'd. M. yyyy')}
                    </span>
                );
            },
            sortable: true
        },
        {
            header: 'Akcie',
            cell: (row: any) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-brand-600 hover:underline text-xs font-bold">Upraviť</button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-400 hover:text-red-600 text-xs">Zmazať</button>
                </div>
            )
        }
    ];

    // Upcoming logic (simple filter for now)
    const upcomingCount = records.filter(r => r.next_due_date && new Date(r.next_due_date) > new Date()).length;
    const overdueCount = records.filter(r => r.next_due_date && new Date(r.next_due_date) < new Date()).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Zdravotné záznamy</h1>
                    <p className="text-gray-500 text-sm">Centrálny prehľad úkonov a termínov</p>
                </div>
                <button
                    onClick={() => { setSelectedRecord(undefined); setShowModal(true); }}
                    className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-brand-700 transition shadow-sm"
                >
                    <Plus size={18} /> Nový záznam
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Syringe size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{records.length}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Celkovo záznamov</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{upcomingCount}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Plánované úkony</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{overdueCount}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Po termíne</div>
                    </div>
                </div>
            </div>

            <DataTable
                data={records}
                columns={columns}
                searchPlaceholder="Hľadať záznam, zviera..."
            />

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

export default InternalMedical;
