
import React from 'react';
import { usePets } from '../../contexts/PetContext';
import { DataTable } from '../../components/internal/DataTable';
import { Pet, PetType } from '../../types';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { formatSlovakAge } from '../../utils/formatters';

const InternalPetList: React.FC = () => {
    const { pets } = usePets();

    const columns = [
        {
            header: 'Zviera',
            accessorKey: 'name' as keyof Pet,
            cell: (pet: Pet) => (
                <div className="flex items-center gap-3">
                    <img src={pet.imageUrl} className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                    <div>
                        <div className="font-bold text-gray-900">{pet.name}</div>
                        <div className="text-xs text-gray-400">{pet.breed}</div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            header: 'ID',
            accessorKey: 'internalId' as keyof Pet, // Will match the new field
            cell: (pet: Pet) => <span className="font-mono text-xs text-gray-500">{pet.internalId || pet.id.substring(0, 6)}</span>,
            sortable: true
        },
        {
            header: 'Vek',
            accessorKey: 'age' as keyof Pet,
            cell: (pet: Pet) => formatSlovakAge(pet.age),
            sortable: true
        },
        {
            header: 'Status',
            accessorKey: 'adoptionStatus' as keyof Pet,
            cell: (pet: Pet) => (
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${pet.adoptionStatus === 'Available' ? 'bg-green-100 text-green-700' :
                        pet.adoptionStatus === 'Adopted' ? 'bg-gray-100 text-gray-600' :
                            'bg-orange-100 text-orange-700'
                    }`}>
                    {pet.adoptionStatus}
                </span>
            ),
            sortable: true
        },
        {
            header: 'Viditeľnosť',
            cell: (pet: Pet) => pet.isVisible ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-gray-400" />
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evidencia zvierat</h1>
                    <p className="text-gray-500 text-sm">Kompletný zoznam zvierat v útulku</p>
                </div>
                <button className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-brand-700 transition">
                    <Plus size={18} /> Nový príjem
                </button>
            </div>

            <DataTable
                data={pets}
                columns={columns}
                searchPlaceholder="Hľadať podľa mena, čipu..."
            />
        </div>
    );
};

export default InternalPetList;
