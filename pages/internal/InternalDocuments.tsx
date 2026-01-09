
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { ShelterDocument, Shelter } from '../../types';
import { FileText, Upload, Trash2, Download, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const InternalDocuments: React.FC = () => {
    const { currentUser, refreshUser } = useAuth();
    const [documents, setDocuments] = useState<ShelterDocument[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (currentUser && (currentUser as any).documents) {
            setDocuments((currentUser as any).documents);
        }
    }, [currentUser]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !currentUser) return;

        setUploading(true);
        const newDocs: ShelterDocument[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Path: shelter_id/filename
                const path = `${currentUser.id}/${Date.now()}_${file.name}`;

                await api.uploadShelterDocument(path, file);
                const url = api.getShelterDocumentUrl(path);

                newDocs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    url: url,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                });
            }

            // Update profile
            const updatedDocs = [...documents, ...newDocs];
            await api.updateShelterDocuments(currentUser.id, updatedDocs);
            setDocuments(updatedDocs);
            await refreshUser(); // Sync context

        } catch (e) {
            console.error(e);
            alert("Chyba pri nahrávaní súboru");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!currentUser || !window.confirm("Naozaj chcete zmazať tento dokument?")) return;

        try {
            const updatedDocs = documents.filter(d => d.id !== docId);
            await api.updateShelterDocuments(currentUser.id, updatedDocs);
            setDocuments(updatedDocs);
            await refreshUser();
        } catch (e) {
            alert("Chyba pri mazaní");
        }
    };

    // Drag handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const getIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="text-purple-500" size={24} />;
        if (type.includes('pdf')) return <FileText className="text-red-500" size={24} />;
        return <File className="text-blue-500" size={24} />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dokumenty</h1>
                    <p className="text-gray-500 text-sm">Zmluvy, formuláre a interné súbory</p>
                </div>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">Kliknite pre nahranie alebo potiahnite súbory sem</p>
                        <p className="text-sm text-gray-500">PDF, JPG, PNG, DOCX (max 10MB)</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className="mt-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-brand-700 transition"
                    >
                        Vybrať súbory
                    </label>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                    <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group flex items-start gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {getIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate" title={doc.name}>{doc.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <span>{formatSize(doc.size)}</span>
                                <span>•</span>
                                <span>{format(new Date(doc.uploadedAt), 'd.M.yyyy')}</span>
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 rounded-lg"
                                title="Stiahnuť"
                            >
                                <Download size={18} />
                            </a>
                            <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Zmazať"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Žiadne dokumenty</h3>
                    <p className="text-gray-500">Zatiaľ ste nenahrali žiadne súbory.</p>
                </div>
            )}
        </div>
    );
};

export default InternalDocuments;
