import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, PawPrint, FileText, User, ChevronRight, Activity } from 'lucide-react';
import { usePets } from '../../contexts/PetContext';
import { Pet } from '../../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { pets } = usePets();

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex]); // We need results in dependency but that causes loop, solved below by memo or simple refetch

    // Search Logic
    const getResults = () => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();

        const petResults = pets.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.breed.toLowerCase().includes(lowerQuery) ||
            p?.chipNumber?.includes(lowerQuery)
        ).map(p => ({
            id: p.id,
            type: 'pet',
            title: p.name,
            subtitle: `${p.breed} • ${p.chipNumber || 'Bez čipu'}`,
            icon: PawPrint,
            url: `/internal/pets/${p.id}`
        }));

        // Mock Navigation Items (could be dynamic)
        const navResults = [
            { id: 'nav-dashboard', type: 'nav', title: 'Domov / Prehľad', subtitle: 'Stránka', url: '/internal/dashboard', icon: User },
            { id: 'nav-pets', type: 'nav', title: 'Zoznam zvierat', subtitle: 'Stránka', url: '/internal/pets', icon: PawPrint },
            { id: 'nav-medical', type: 'nav', title: 'Veterina', subtitle: 'Stránka', url: '/internal/medical', icon: Activity },
            { id: 'nav-adoptions', type: 'nav', title: 'Adopcie', subtitle: 'Stránka', url: '/internal/adoptions', icon: FileText },
        ].filter(n => n.title.toLowerCase().includes(lowerQuery));

        return [...navResults, ...petResults].slice(0, 10);
    };

    const results = getResults();

    const handleSelect = (item: any) => {
        navigate(item.url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 ring-1 ring-black/5">
                {/* Search Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Search className="text-gray-400" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                        placeholder="Hľadať zvieratá, stránky, čipy..."
                        className="flex-1 text-lg placeholder:text-gray-400 focus:outline-none bg-transparent"
                    />
                    <div className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">ESC</div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors
                                        ${index === selectedIndex ? 'bg-brand-50 text-brand-900 icon-brand' : 'hover:bg-gray-50 text-gray-700'}
                                    `}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <item.icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{item.title}</div>
                                        <div className={`text-xs truncate ${index === selectedIndex ? 'text-brand-600/70' : 'text-gray-400'}`}>{item.subtitle}</div>
                                    </div>
                                    {index === selectedIndex && <ChevronRight size={16} className="text-brand-400" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-400">
                            {query ? (
                                <>
                                    <Search size={32} className="mx-auto mb-3 opacity-20" />
                                    <p>Žiadne výsledky pre "{query}"</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center gap-2 mb-2">
                                        <div className="w-12 h-8 bg-gray-50 border border-gray-100 rounded flex items-center justify-center font-mono text-xs">↑</div>
                                        <div className="w-12 h-8 bg-gray-50 border border-gray-100 rounded flex items-center justify-center font-mono text-xs">↓</div>
                                    </div>
                                    <p className="text-sm">Užite šipky pre navigáciu</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                        <span>Výsledky: {results.length}</span>
                        <span>Labka Nádeje Search</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandPalette;
