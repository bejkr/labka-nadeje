import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { parsePetsCSV, ParseResult } from '../services/importService';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Pet } from '../types';

interface PetImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PetImportModal: React.FC<PetImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Partial<Pet>[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [step, setStep] = useState<'upload' | 'preview' | 'uploading'>('upload');
    const [isDragOver, setIsDragOver] = useState(false);

    // Default location to shelter's location if available
    const SHELTER_LOCATION = (currentUser as any)?.location || '';

    if (!isOpen) return null;

    const handleFile = async (selectedFile: File) => {
        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            setErrors(['Prosím vložte súbor typu CSV.']);
            return;
        }
        setFile(selectedFile);
        const result = await parsePetsCSV(selectedFile);

        // Enrich data with defaults
        const enrichedData = result.data.map(p => ({
            ...p,
            location: p.location || SHELTER_LOCATION // Use shelter location if pet location is missing
        }));

        setParsedData(enrichedData);
        setErrors(result.errors);
        setStep('preview');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) return;
        setStep('uploading');
        try {
            await api.createBulkPets(parsedData);
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            setErrors(['Chyba pri nahrávaní: ' + (e as any).message]);
            setStep('preview');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Upload className="text-brand-600" /> Import zvierat z CSV
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {step === 'upload' && (
                        <div
                            className={`border-3 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-300 hover:bg-white'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('csv-upload-input')?.click()}
                        >
                            <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6">
                                <FileText size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Kliknite alebo presuňte CSV súbor sem</h3>
                            <p className="text-gray-500 max-w-sm">
                                Podporujeme štandardný formát. <br />
                                <span className="text-xs mt-2 block bg-gray-100 p-2 rounded">Meno, Druh, Plemeno, Vek, Pohlavie...</span>
                            </p>
                            <input
                                id="csv-upload-input"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                            />
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">Náhľad importu</h3>
                                    <p className="text-sm text-gray-500">Našli sme {parsedData.length} zvierat</p>
                                </div>
                                {errors.length > 0 && (
                                    <div className="flex items-center text-red-600 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg">
                                        <AlertCircle size={16} className="mr-2" />
                                        {errors.length} chýb (budú ignorované)
                                    </div>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-3 font-bold">Meno</th>
                                            <th className="p-3 font-bold">Druh</th>
                                            <th className="p-3 font-bold">Plemeno</th>
                                            <th className="p-3 font-bold">Vek</th>
                                            <th className="p-3 font-bold">Popis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {parsedData.map((pet, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="p-3 font-bold text-gray-900">{pet.name}</td>
                                                <td className="p-3">{pet.type}</td>
                                                <td className="p-3">{pet.breed}</td>
                                                <td className="p-3">{pet.age} rokov</td>
                                                <td className="p-3 text-gray-500 max-w-xs truncate">{pet.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {step === 'uploading' && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-brand-600 w-16 h-16 mb-6" />
                            <h3 className="text-xl font-bold text-gray-900">Nahrávam zvieratká...</h3>
                            <p className="text-gray-500">Prosím čakajte, toto môže chvíľu trvať.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition"
                        disabled={step === 'uploading'}
                    >
                        Zrušiť
                    </button>
                    {step === 'preview' && (
                        <button
                            onClick={handleUpload}
                            disabled={parsedData.length === 0}
                            className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
                        >
                            <CheckCircle size={20} />
                            Potvrdiť Import ({parsedData.length})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PetImportModal;
