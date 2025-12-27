
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Building2, MapPin, Mail, Phone, Clock, CreditCard,
    CheckCircle, Dog, Gift, LayoutGrid, Heart, Globe,
    Facebook, Instagram, ExternalLink, Copy, Check, ShoppingCart, Info, AlertCircle, ChevronRight, PawPrint
} from 'lucide-react';
import { api } from '../services/api';
import { Shelter, Pet, ShelterSupply } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from 'react-i18next';

const ShelterDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { toggleFavorite, isFavorite, userRole, currentUser } = useAuth();
    const { showToast } = useApp();

    // Robust check for shelter role
    const isShelterUser = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';

    const [shelter, setShelter] = useState<Shelter | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [supplies, setSupplies] = useState<ShelterSupply[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pets' | 'about' | 'help'>('pets');
    const [copied, setCopied] = useState(false);
    const [addressCopied, setAddressCopied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Increment views
                api.incrementShelterViews(id);

                const shelterData = await api.getPublicShelter(id);
                const petsData = await api.getPetsByShelter(id);
                const suppliesData = await api.getSupplies(id);

                setShelter(shelterData);
                setPets(petsData);
                setSupplies(suppliesData);
            } catch (e) {
                console.error("Error fetching shelter data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const copyIban = () => {
        if (shelter?.bankAccount) {
            navigator.clipboard.writeText(shelter.bankAccount);
            setCopied(true);
            showToast(t('shelterDetail.copyIban'), "success");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const copyAddress = () => {
        // Prefer full shipping address, fallback to location
        const addressToCopy = shelter?.shippingAddress || shelter?.location;
        if (addressToCopy) {
            navigator.clipboard.writeText(addressToCopy);
            setAddressCopied(true);
            showToast(t('shelterDetail.copyAddress'), "success");
            setTimeout(() => setAddressCopied(false), 2000);
        }
    };

    const ensureUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!shelter) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                    <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('shelterDetail.notFound')}</h2>
                    <p className="text-gray-500 mb-6">{t('shelterDetail.removed')}</p>
                    <Link to="/" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition">
                        {t('shelterDetail.backHome')}
                    </Link>
                </div>
            </div>
        );
    }

    const hasSocials = shelter.socials && (shelter.socials.facebook || shelter.socials.instagram || shelter.socials.website);

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">

            {/* 1. HERO HEADER */}
            <div className="relative bg-white pb-8">
                {/* New Enhanced Background Pattern - Solid Orange with Scattered Paws */}
                <div className="absolute inset-0 h-56 bg-brand-600 overflow-hidden border-b border-brand-700">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-4 left-[5%] opacity-[0.08] transform -rotate-12 scale-150"><PawPrint size={64} className="text-white fill-current" /></div>
                        <div className="absolute top-20 right-[10%] opacity-[0.04] transform rotate-45 scale-[2]"><PawPrint size={72} className="text-white fill-current" /></div>
                        <div className="absolute bottom-10 left-[15%] opacity-[0.06] transform rotate-12 scale-110"><PawPrint size={48} className="text-white fill-current" /></div>
                        <div className="absolute top-1/2 right-[25%] opacity-[0.03] transform -rotate-90 scale-150"><PawPrint size={56} className="text-white fill-current" /></div>
                        <div className="absolute -top-10 right-[40%] opacity-[0.05] transform rotate-[160deg] scale-[2.5]"><PawPrint size={80} className="text-white fill-current" /></div>
                        <div className="absolute bottom-4 right-[5%] opacity-[0.07] transform -rotate-12 scale-150"><PawPrint size={64} className="text-white fill-current" /></div>
                        <div className="absolute top-10 left-[35%] opacity-[0.03] transform rotate-[30deg] scale-125"><PawPrint size={40} className="text-white fill-current" /></div>
                        <div className="absolute -bottom-10 left-[45%] opacity-[0.05] transform -rotate-45 scale-150"><PawPrint size={90} className="text-white fill-current" /></div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-24">
                    <div className="bg-white rounded-[3rem] shadow-2xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-center gap-8 border border-white/20 relative mt-8">

                        {/* Logo - Properly contained */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2.5rem] p-1 shadow-2xl border-4 border-white flex-shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105">
                            {shelter.logoUrl ? (
                                <img src={shelter.logoUrl} alt={shelter.name} className="w-full h-full object-contain p-1" />
                            ) : (
                                <Building2 size={48} className="text-gray-200" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                            {shelter.name}
                                        </h1>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-500 font-bold text-[11px] mt-4">
                                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><MapPin size={16} className="text-brand-600" /> {shelter.location}</span>
                                        {shelter.isVerified && (
                                            <span className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100">
                                                <CheckCircle size={16} className="fill-green-200 text-green-600" /> {t('shelterDetail.verified')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!isShelterUser && (
                                    <div className="flex gap-3 justify-center md:justify-end mt-4 md:mt-0 flex-shrink-0">
                                        <button
                                            onClick={() => setActiveTab('help')}
                                            className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-brand-700 transition shadow-xl shadow-brand-200 flex items-center gap-3 transform hover:-translate-y-1 active:scale-95"
                                        >
                                            <Heart size={20} fill="currentColor" className="text-brand-300" />
                                            {t('shelterDetail.supportButton')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN LAYOUT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (Content) - 8/12 */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Custom Tab Navigation */}
                        <div className="flex items-center border-b border-gray-200 overflow-x-auto bg-white/50 backdrop-blur-sm sticky top-20 z-20 rounded-t-3xl px-4">
                            <button
                                onClick={() => setActiveTab('pets')}
                                className={`px-6 py-5 text-[11px] font-black border-b-4 transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'pets'
                                    ? 'border-brand-600 text-brand-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                                    }`}
                            >
                                <LayoutGrid size={18} /> {t('shelterDetail.tabs.pets')} ({pets.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`px-6 py-5 text-[11px] font-black border-b-4 transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'about'
                                    ? 'border-brand-600 text-brand-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                                    }`}
                            >
                                <Building2 size={18} /> {t('shelterDetail.tabs.about')}
                            </button>
                            {!isShelterUser && (
                                <button
                                    onClick={() => setActiveTab('help')}
                                    className={`px-6 py-5 text-[11px] font-black border-b-4 transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'help'
                                        ? 'border-brand-600 text-brand-600'
                                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                                        }`}
                                >
                                    <Gift size={18} /> {t('shelterDetail.tabs.help')}
                                </button>
                            )}
                        </div>

                        {/* --- TAB CONTENT: PETS --- */}
                        {activeTab === 'pets' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {pets.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {pets.map(pet => {
                                            const isFav = isFavorite(pet.id);
                                            return (
                                                <Link key={pet.id} to={`/pets/${pet.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
                                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                                        <img
                                                            src={pet.imageUrl}
                                                            alt={pet.name}
                                                            className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                                        />

                                                        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start">
                                                            {pet.adoptionStatus !== 'Available' ? (
                                                                <span className={`px-3 py-1 rounded-xl font-black text-[9px] shadow-lg border ${pet.adoptionStatus === 'Reserved'
                                                                    ? 'bg-orange-600 text-white border-orange-500'
                                                                    : 'bg-gray-700 text-white border-gray-600'
                                                                    }`}>
                                                                    {pet.adoptionStatus === 'Reserved' ? t('petStatus.reserved') : t('petStatus.adopted')}
                                                                </span>
                                                            ) : (
                                                                <span></span> /* Spacer */
                                                            )}

                                                            {!isShelterUser && (
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); toggleFavorite(pet.id); }}
                                                                    className={`p-2.5 rounded-2xl transition-all shadow-lg border ${isFav
                                                                        ? 'bg-red-50 text-red-500 border-red-200'
                                                                        : 'bg-white/80 text-gray-400 border-white hover:bg-white hover:text-red-500'
                                                                        }`}
                                                                >
                                                                    <Heart
                                                                        size={18}
                                                                        className={isFav ? 'fill-current' : ''}
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                                                            <h3 className="text-2xl font-black text-white mb-0.5 tracking-tight">{pet.name.replace(/\*\*/g, '')}</h3>
                                                            <p className="text-white/70 text-xs font-bold">{pet.breed}</p>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 flex-1 flex flex-col">
                                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed font-medium">
                                                            {pet.description.replace(/\*\*/g, '')}
                                                        </p>

                                                        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                                                            <div className="flex gap-2">
                                                                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg border border-gray-100">{t('common.years', { count: pet.age })}</span>
                                                                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg border border-gray-100">{pet.gender}</span>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200">
                                            <Dog size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{t('shelterDetail.noPets')}</h3>
                                        <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">{t('shelterDetail.noPetsDesc')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- TAB CONTENT: ABOUT --- */}
                        {activeTab === 'about' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                                    <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4 tracking-tight">
                                        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><Building2 size={24} /></div>
                                        {t('shelterDetail.storyTitle')}
                                    </h3>
                                    <div className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                                        {shelter.description || t('shelterDetail.noStory')}
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:border-brand-200 transition-colors">
                                        <div className="text-5xl font-black text-brand-600 mb-2 tracking-tighter group-hover:scale-110 transition-transform">{shelter.stats.adoptions}</div>
                                        <div className="text-[10px] font-black text-gray-400">{t('shelterDetail.stats.adopted')}</div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:border-blue-200 transition-colors">
                                        <div className="text-5xl font-black text-blue-600 mb-2 tracking-tighter group-hover:scale-110 transition-transform">{shelter.stats.currentAnimals}</div>
                                        <div className="text-[10px] font-black text-gray-400">{t('shelterDetail.stats.care')}</div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:border-green-200 transition-colors">
                                        <div className="text-5xl font-black text-green-600 mb-2 tracking-tighter group-hover:scale-110 transition-transform">{shelter.stats.views || 0}</div>
                                        <div className="text-[10px] font-black text-gray-400">{t('shelterDetail.stats.views')}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB CONTENT: HELP --- */}
                        {activeTab === 'help' && !isShelterUser && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Donation "Credit Card" Design */}
                                <div className="bg-gray-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600 opacity-20 rounded-full blur-[100px] -mr-16 -mt-16 transition-all group-hover:opacity-30"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-16">
                                            <div>
                                                <h3 className="text-3xl font-black mb-2 tracking-tight">{t('shelterDetail.financeTitle')}</h3>
                                                <p className="text-gray-400 text-base font-medium">{t('shelterDetail.financeDesc')}</p>
                                            </div>
                                            <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10"><CreditCard size={32} className="text-brand-500" /></div>
                                        </div>

                                        {shelter.bankAccount ? (
                                            <div>
                                                <label className="text-[10px] font-black text-gray-500 mb-4 block">{t('shelterDetail.iban')}</label>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                                    <code className="font-mono text-xl md:text-2xl text-white bg-white/5 p-4 rounded-2xl border border-white/5 break-all">
                                                        {shelter.bankAccount}
                                                    </code>
                                                    <button
                                                        onClick={copyIban}
                                                        className="p-5 bg-brand-600 hover:bg-brand-700 rounded-2xl transition-all text-white shadow-xl shadow-brand-900/40 flex-shrink-0 active:scale-95"
                                                        title="Kopírovať IBAN"
                                                    >
                                                        {copied ? <Check size={24} className="text-green-300" /> : <Copy size={24} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 text-gray-400 text-center font-medium italic">
                                                {t('shelterDetail.finance.noAccount') || "Útulok zatiaľ nezverejnil číslo účtu. Kontaktujte ich prosím priamo pre informácie o darovaní."}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Material Supplies List */}
                                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                                <Gift className="text-brand-600" size={24} /> {t('shelterDetail.materialHelp')}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">{t('shelterDetail.materialDesc')}</p>
                                        </div>
                                        <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] font-black">{t('shelterDetail.suppliesCount', { count: supplies.length })}</span>
                                    </div>

                                    {/* Tip for donors */}
                                    {supplies.length > 0 && (
                                        <div className="p-6 m-8 mb-4 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4 shadow-inner">
                                            <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm flex-shrink-0"><Info size={20} /></div>
                                            <div className="flex-1">
                                                <p className="text-blue-900 text-sm font-black mb-2">{t('shelterDetail.donorTip')}:</p>
                                                <p className="text-blue-800/80 text-xs leading-relaxed mb-4 font-medium">
                                                    {t('shelterDetail.tipDesc')}:
                                                </p>
                                                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-blue-100 w-fit max-w-full group">
                                                    <code className="text-xs font-bold text-gray-600 truncate">
                                                        {shelter.shippingAddress || shelter.location}
                                                    </code>
                                                    <button
                                                        onClick={copyAddress}
                                                        className="text-blue-400 hover:text-blue-600 transition flex-shrink-0 p-1 hover:bg-blue-50 rounded-lg"
                                                        title="Kopírovať adresu"
                                                    >
                                                        {addressCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-8">
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {supplies.length > 0 ? supplies.map(item => (
                                                <li key={item.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group border-l-4" style={{ borderLeftColor: item.priority === 'Vysoká' ? '#ef4444' : item.priority === 'Stredná' ? '#f59e0b' : '#10b981' }}>
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${item.priority === 'Vysoká' ? 'bg-red-50 text-red-600' :
                                                                item.priority === 'Stredná' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                                                }`}>
                                                                {item.priority === 'Vysoká' ? t('shelterDetail.priority.high') : item.priority === 'Stredná' ? t('shelterDetail.priority.medium') : t('shelterDetail.priority.low')}
                                                            </span>
                                                        </div>
                                                        <span className="font-extrabold text-gray-800 group-hover:text-brand-600 transition text-lg">{item.item}</span>
                                                    </div>

                                                    {item.link ? (
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-2 bg-gray-900 text-white w-full py-3 rounded-xl text-[10px] font-black hover:bg-brand-600 transition shadow-lg active:scale-95"
                                                        >
                                                            <ShoppingCart size={14} /> {t('shelterDetail.buyOnline')}
                                                        </a>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2 text-gray-400 bg-gray-50 py-3 rounded-xl text-[10px] font-black border border-gray-100 cursor-default">
                                                            <MapPin size={14} /> {t('shelterDetail.deliverPerson')}
                                                        </div>
                                                    )}
                                                </li>
                                            )) : (
                                                <li className="col-span-full p-20 text-center text-gray-400 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                                                    <Gift size={32} className="mx-auto mb-4 opacity-30" />
                                                    <p className="font-medium">{t('shelterDetail.noSupplies')}</p>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Sticky Sidebar) - 4/12 */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Contact Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-24 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-125 transition-transform duration-700"></div>

                            <h3 className="font-black text-gray-900 text-xl mb-8 pb-4 border-b border-gray-50 relative z-10 tracking-tight">{t('shelterDetail.contactTitle')}</h3>

                            <div className="space-y-8 relative z-10">
                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center group-hover/item:bg-brand-600 group-hover/item:text-white transition duration-300 shadow-sm">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-black mb-1">{t('shelterDetail.email')}</div>
                                        <a href={`mailto:${shelter.email}`} className="text-gray-800 font-extrabold hover:text-brand-600 transition break-all text-sm">
                                            {shelter.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover/item:bg-blue-600 group-hover/item:text-white transition duration-300 shadow-sm">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-black mb-1">{t('shelterDetail.phone')}</div>
                                        <a href={`tel:${shelter.phone}`} className="text-gray-800 font-extrabold hover:text-blue-600 transition text-sm">
                                            {shelter.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center group-hover/item:bg-gray-800 group-hover/item:text-white transition duration-300 shadow-sm">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-black mb-1">{t('shelterDetail.hours')}</div>
                                        <p className="text-gray-800 font-bold text-sm whitespace-pre-line leading-relaxed">
                                            {shelter.openingHours || t('shelterDetail.hoursFallback') || "Dohodou / Po tel. dohovore"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {hasSocials ? (
                                <div className="mt-12 pt-8 border-t border-gray-50 relative z-10">
                                    <p className="text-[9px] text-center text-gray-400 font-black mb-6">{t('shelterDetail.followUs')}</p>
                                    <div className="flex justify-center gap-4">
                                        {shelter.socials?.facebook && (
                                            <a href={ensureUrl(shelter.socials.facebook)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-200" title="Facebook">
                                                <Facebook size={20} />
                                            </a>
                                        )}
                                        {shelter.socials?.instagram && (
                                            <a href={ensureUrl(shelter.socials.instagram)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all shadow-sm hover:shadow-pink-200" title="Instagram">
                                                <Instagram size={20} />
                                            </a>
                                        )}
                                        {shelter.socials?.website && (
                                            <a href={ensureUrl(shelter.socials.website)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-all shadow-sm" title="Web">
                                                <Globe size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-12 pt-8 border-t border-gray-50 text-center relative z-10">
                                    <p className="text-[9px] text-gray-400 font-black">{t('shelterDetail.noSocials')}</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ShelterDetailPage;
