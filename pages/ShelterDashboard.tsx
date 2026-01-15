
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Dog, MessageSquare, Building,
    Sparkles, LogOut, Menu, X, ChartColumn
} from 'lucide-react';

import { usePets } from '../contexts/PetContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Pet, AdoptionInquiry, Shelter } from '../types';

import PetFormModal from '../components/PetFormModal';
import PetImportModal from '../components/PetImportModal';
import ConfirmationModal from '../components/ConfirmationModal';

// New Modular Components
import AnalyticsSummary from '../components/dashboard/AnalyticsSummary';
import PetManager from '../components/dashboard/PetManager';
import InquiryManager from '../components/dashboard/InquiryManager';
import UpdatesManager from '../components/dashboard/UpdatesManager';
import InternalSettings from './internal/InternalSettings';
import InternalDocuments from './internal/InternalDocuments';

// Define Dashboard Tabs
type TabType = 'overview' | 'pets' | 'inquiries' | 'updates' | 'settings' | 'documents';

const ShelterDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data States
    const { pets, refreshPets, deletePet } = usePets();
    const { currentUser, logout, refreshUser } = useAuth();
    const { showToast } = useApp();
    const navigate = useNavigate();

    // Specific Data
    const [inquiries, setInquiries] = useState<AdoptionInquiry[]>([]);
    const [seenInquiryIds, setSeenInquiryIds] = useState<string[]>([]);
    const [virtualParentsCount, setVirtualParentsCount] = useState(0);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingPet, setEditingPet] = useState<Pet | undefined>(undefined);

    // --- Effects ---

    useEffect(() => {
        if (!currentUser) {
            navigate('/auth');
            return;
        }
        if (currentUser.role !== 'shelter') {
            navigate('/profile');
            return;
        }

        const loadData = async () => {
            setIsLoadingData(true);
            try {
                // 1. Inquiries
                const inqs = await api.getInquiries();
                const shelterInqs = inqs.filter(i => i.shelterId === currentUser.id);
                setInquiries(shelterInqs);

                // 2. Virtual Parents Stats
                const vpCount = await api.getShelterVirtualAdoptionsCount(currentUser.id);
                setVirtualParentsCount(vpCount);

                // 3. Refresh user profile to get verification update
                await refreshUser();
            } catch (e) {
                console.error("Dashboard load error", e);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [currentUser, navigate]);

    // Handle session storage for seen inquiries
    useEffect(() => {
        try {
            const seen = JSON.parse(sessionStorage.getItem('seenInquiryIds') || '[]');
            setSeenInquiryIds(seen);
        } catch (e) { }
    }, []);

    // --- Actions ---

    const markInquiryAsRead = (id: string) => {
        if (!seenInquiryIds.includes(id)) {
            const newSeen = [...seenInquiryIds, id];
            setSeenInquiryIds(newSeen);
            sessionStorage.setItem('seenInquiryIds', JSON.stringify(newSeen));
        }
    };

    const handleEditPet = (pet: Pet) => {
        setEditingPet(pet);
        setIsFormOpen(true);
    };

    const handleFormSuccess = async () => {
        setIsFormOpen(false);
        setEditingPet(undefined);
        await refreshPets();
        showToast(editingPet ? 'Profil zvieratka bol aktualizovaný.' : 'Nové zvieratko bolo pridané.', 'success');
    };

    const handlePetDelete = async (id: string) => {
        await deletePet(id);
        await refreshPets(); // Explicit refresh
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPet(undefined);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    if (!currentUser || currentUser.role !== 'shelter') return null;
    const shelter = currentUser as Shelter;
    const shelterPets = pets.filter(p => p.shelterId === shelter.id);

    // --- Render ---

    const menuItems = [
        { id: 'overview', label: 'Prehľad', icon: LayoutDashboard },
        { id: 'pets', label: 'Správa zvierat', icon: Dog },
        { id: 'inquiries', label: 'Dopyty', icon: MessageSquare },
        { id: 'updates', label: 'Novinky', icon: Sparkles },
        { id: 'documents', label: 'Dokumenty', icon: Building },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col
                transform transition-transform duration-300 ease-in-out lg:transform-none shadow-2xl lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 text-brand-600 mb-8">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                            <LayoutDashboard size={22} />
                        </div>
                        <div>
                            <div className="font-black text-xl tracking-tight text-gray-900">Labka<span className="text-brand-600">Admin</span></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                        <img
                            src={shelter.logoUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100"}
                            alt="Logo"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{shelter.name}</div>
                            <div className="text-xs text-brand-600 font-medium truncate">Online</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-sm
                                    ${isActive
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-brand-600'
                                    }
                                `}
                            >
                                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                                {item.label}
                                {item.id === 'inquiries' && (
                                    (() => {
                                        // Calc unread count
                                        const count = inquiries.filter(i => {
                                            const hasChatUnread = (i as any).hasUnreadMessages === true;
                                            const isNewAndNotSeen = i.status === 'Nová' && !seenInquiryIds.includes(i.id);
                                            return hasChatUnread || isNewAndNotSeen;
                                        }).length;
                                        return count > 0 ? (
                                            <span className="ml-auto bg-white text-brand-600 text-[10px] px-1.5 py-0.5 rounded-md min-w-[20px] text-center shadow-sm">
                                                {count}
                                            </span>
                                        ) : null;
                                    })()
                                )}
                            </button>
                        );
                    })}

                    <div className="pt-8 mt-4 border-t border-gray-100">
                        <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nastavenia</div>
                        <button
                            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm
                                ${activeTab === 'settings'
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            <Building size={20} className={activeTab === 'settings' ? 'text-white' : 'text-gray-400'} /> Profil útulku
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition font-medium text-sm"
                        >
                            <LogOut size={20} className="text-gray-400 group-hover:text-red-600" /> Odhlásiť sa
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-30 sticky top-0">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                    <div className="font-black text-gray-900">Labka<span className="text-brand-600">Admin</span></div>
                    <div className="w-8"></div> {/* Spacer for alignment */}
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto h-full">
                        {activeTab === 'overview' && (
                            <AnalyticsSummary
                                shelter={shelter}
                                pets={shelterPets}
                                inquiries={inquiries}
                                seenInquiryIds={seenInquiryIds}
                                onNavigate={(tab) => setActiveTab(tab as TabType)}
                            />
                        )}

                        {activeTab === 'pets' && (
                            <PetManager
                                pets={shelterPets}
                                onAdd={() => { setEditingPet(undefined); setIsFormOpen(true); }}
                                onImport={() => setIsImportOpen(true)}
                                onEdit={handleEditPet}
                                onDelete={handlePetDelete}
                            />
                        )}

                        {activeTab === 'inquiries' && (
                            <InquiryManager
                                inquiries={inquiries}
                                updateStatus={api.updateInquiryStatus}
                                markInquiryAsRead={markInquiryAsRead}
                                shelter={shelter}
                                seenInquiryIds={seenInquiryIds}
                            />
                        )}

                        {activeTab === 'updates' && (
                            <UpdatesManager pets={shelterPets} />
                        )}

                        {activeTab === 'documents' && (
                            <InternalDocuments />
                        )}

                        {activeTab === 'settings' && (
                            <InternalSettings />
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            <PetFormModal
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                pet={editingPet}
                onSave={handleFormSuccess}
            />

            <PetImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={refreshPets}
            />
        </div>
    );
};

export default ShelterDashboard;
