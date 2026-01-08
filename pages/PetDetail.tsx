import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin, CheckCircle, Heart, Info, Building2,
    X, Stethoscope,
    Dog, XCircle, Share2,
    ArrowLeft, Users, EyeOff, ChevronRight, Home as HomeIcon, Baby
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext';
import { User, AdoptionInquiry, Shelter } from '../types';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

const PetDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentUser, toggleFavorite, isFavorite, userRole } = useAuth();
    const { getPet } = usePets();
    const { addInquiry, showToast } = useApp();

    const pet = getPet(id || '');

    // Modal States
    const [isVirtualAdoptionModalOpen, setIsVirtualAdoptionModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    // Success State for Application
    const [applicationSuccess, setApplicationSuccess] = useState(false);

    const [applicationMessage, setApplicationMessage] = useState('');
    const [isSubmittingApp, setIsSubmittingApp] = useState(false);

    // Gallery Logic
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Shelter State
    const [shelter, setShelter] = useState<Shelter | null>(null);

    // Logic checks
    const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
    const isRegularUser = currentUser && !isShelter;
    const isAlreadyAdopted = isRegularUser && (currentUser as User).virtualAdoptions?.some(a => a.petId === pet?.id);
    const hasAlreadyApplied = isRegularUser && (currentUser as User).applications?.some(app => app.petId === pet?.id);

    // Visibility Check Logic
    const isOwner = currentUser?.id === pet?.shelterId;
    const isAdmin = (currentUser as any)?.isSuperAdmin;
    const isVisible = pet?.isVisible;
    const canView = isVisible || isOwner || isAdmin;

    // Fetch Shelter Details
    useEffect(() => {
        const fetchShelter = async () => {
            if (pet?.shelterId) {
                try {
                    const data = await api.getPublicShelter(pet.shelterId);
                    setShelter(data);
                } catch (e) {
                    console.error("Failed to load shelter info");
                }
            }
        };
        fetchShelter();
    }, [pet?.shelterId]);

    // Reset success state when modal opens
    useEffect(() => {
        if (isApplicationModalOpen) {
            setApplicationSuccess(false);
            setApplicationMessage('');
        }
    }, [isApplicationModalOpen]);

    const photos = useMemo(() => {
        if (!pet) return [];
        return [pet.imageUrl, ...(pet.gallery || [])].filter(Boolean);
    }, [pet]);

    const uniquePhotos = useMemo(() => Array.from(new Set(photos)), [photos]);
    const hasVideo = !!pet?.videoUrl;

    const handlePrevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (uniquePhotos.length === 0) return;
        setLightboxIndex(prev => (prev !== null ? (prev - 1 + uniquePhotos.length) % uniquePhotos.length : null));
    }, [uniquePhotos.length]);

    const handleNextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (uniquePhotos.length === 0) return;
        setLightboxIndex(prev => (prev !== null ? (prev + 1) % uniquePhotos.length : null));
    }, [uniquePhotos.length]);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevImage();
            if (e.key === 'ArrowRight') handleNextImage();
            if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, handlePrevImage, handleNextImage]);


    if (!pet || !canView) {
        return <div className="p-20 text-center text-gray-500 font-medium">{t('petDetail.notFound')} <br /><Link to="/pets" className="text-brand-600 underline mt-4 inline-block">{t('petDetail.backToList')}</Link></div>;
    }

    const getVideoEmbedUrl = (url: string) => {
        let embedUrl = url;
        let isEmbed = false;
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (ytMatch && ytMatch[1]) {
            embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
            isEmbed = true;
        }
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
            isEmbed = true;
        }
        if (isEmbed) {
            const separator = embedUrl.includes('?') ? '&' : '?';
            return `${embedUrl}${separator}autoplay=1&mute=1&background=1&playsinline=1`;
        }
        return url;
    };

    const handleInterestClick = () => {
        if (!currentUser) {
            navigate('/auth');
        } else {
            setIsApplicationModalOpen(true);
        }
    };

    const handleFavoriteToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            showToast(t('petDetail.loginToFavorite'), "info");
            return;
        }
        toggleFavorite(pet.id);
    };

    const handleApplicationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !pet) return;
        setIsSubmittingApp(true);
        const newInquiry: AdoptionInquiry = {
            id: `inq-${Date.now()}`,
            shelterId: pet.shelterId,
            petId: pet.id,
            petName: pet.name,
            applicantName: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || '',
            date: new Date().toISOString(),
            status: 'Nová',
            message: applicationMessage
        };
        try {
            await addInquiry(newInquiry);
            setApplicationSuccess(true);
        } catch (e) {
            showToast(t('petDetail.errorSending'), "error");
        } finally {
            setIsSubmittingApp(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = status === 'Vhodný' ? 'bg-green-100 text-green-700 ring-green-600/20' :
            status === 'Nevhodný' ? 'bg-red-100 text-red-700 ring-red-600/20' :
                status === 'Opatrne' ? 'bg-amber-100 text-amber-700 ring-amber-600/20' : 'bg-gray-100 text-gray-600 ring-gray-600/20';

        const getLabel = (s: string) => {
            if (s === 'Vhodný') return t('petDetail.status.suitable');
            if (s === 'Nevhodný') return t('petDetail.status.unsuitable');
            if (s === 'Opatrne') return t('petDetail.status.careful');
            return s;
        };

        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${styles}`}>
                {getLabel(status)}
            </span>
        );
    };

    const BooleanItem = ({ label, value }: { label: string, value: boolean }) => (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-600 text-sm font-medium">{label}</span>
            {value
                ? <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold"><CheckCircle size={16} className="fill-green-100" /></div>
                : <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium"><XCircle size={16} /></div>
            }
        </div>
    );

    const sidebarContent = (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{pet.name}</h1>
                    <p className="text-gray-500 font-medium">{pet.breed}</p>
                    {!pet.isVisible && (
                        <div className="mt-3 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-gray-200">
                            <EyeOff size={12} /> {t('petDetail.hidden')}
                        </div>
                    )}
                </div>
                <div className="flex justify-center gap-4 mb-8">
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                        <div className="text-xs text-gray-400 font-bold mb-1">{t('petDetail.age')}</div>
                        <div className="font-bold text-gray-900">{t('common.years', { count: pet.age })}</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                        <div className="text-xs text-gray-400 font-bold mb-1">{t('petDetail.gender')}</div>
                        <div className="font-bold text-gray-900">{pet.gender}</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                        <div className="text-xs text-gray-400 font-bold mb-1">{t('petDetail.size')}</div>
                        <div className="font-bold text-gray-900">{pet.size}</div>
                    </div>
                </div>
                {!isShelter ? (
                    <div className="space-y-3">
                        <button
                            onClick={hasAlreadyApplied ? undefined : handleInterestClick}
                            disabled={hasAlreadyApplied || pet.adoptionStatus !== 'Available'}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 ${hasAlreadyApplied
                                ? 'bg-green-100 text-green-700 cursor-default shadow-none'
                                : pet.adoptionStatus !== 'Available'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200'
                                }`}
                        >
                            {hasAlreadyApplied ? <><CheckCircle size={20} /> {t('petDetail.applicationSent')}</> : t('petDetail.interestButton')}
                        </button>
                        {!isAlreadyAdopted && (
                            <button onClick={() => setIsVirtualAdoptionModalOpen(true)} className="w-full py-3 px-6 rounded-2xl font-bold text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition flex items-center justify-center gap-2">
                                <Heart size={18} /> {t('petDetail.virtualAdopt')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500 border border-gray-100">
                        {isOwner ? <>{t('petDetail.ownerEdit')} <Link to="/shelter" className="text-brand-600 font-bold hover:underline">{t('petDetail.edit')}</Link></> : t('petDetail.loginAsUser')}
                    </div>
                )}
                {pet.adoptionFee > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-bold mb-1">{t('petDetail.adoptionFee')}</p>
                        <p className="text-2xl font-extrabold text-gray-900">{pet.adoptionFee} €</p>
                    </div>
                )}
            </div>
            <Link to={`/shelters/${shelter?.slug || pet.shelterId}`} className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-1 shadow-sm overflow-hidden">
                        {shelter?.logoUrl ? <img src={shelter.logoUrl} alt="" className="w-full h-full object-contain" /> : <Building2 size={24} className="text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-400 font-bold mb-0.5">{t('petDetail.shelter')}</div>
                        <h4 className="font-bold text-gray-900 truncate group-hover:text-brand-600">{shelter?.name || t('petDetail.loading')}</h4>
                    </div>
                    <ChevronRight className="text-gray-300" />
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="truncate">{shelter?.location || pet.location}</span>
                </div>
            </Link>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/pets" className="inline-flex items-center text-gray-500 hover:text-brand-600 font-bold transition">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 border border-gray-200">
                            <ArrowLeft size={16} />
                        </div>
                        {t('petDetail.backToList')}
                    </Link>
                    <div className="flex gap-2">
                        <button onClick={() => setIsShareModalOpen(true)} className="p-2.5 bg-white text-gray-600 hover:text-brand-600 rounded-full shadow-sm border border-gray-200 transition"><Share2 size={20} /></button>
                        {!isShelter && (
                            <button onClick={handleFavoriteToggle} className={`p-2.5 rounded-full shadow-sm border transition ${isFavorite(pet.id) ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 border-gray-200 hover:text-red-500'}`}>
                                <Heart size={20} className={isFavorite(pet.id) ? 'fill-current' : ''} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-20">
                    <div className="lg:col-span-2 space-y-8">
                        {/* ... Gallery and Video ... */}
                        <div className={`grid gap-6 ${hasVideo ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            <div className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative flex flex-col h-full ${hasVideo ? 'min-h-[400px]' : 'min-h-[750px]'}`}>
                                <div className="relative flex-1 rounded-2xl overflow-hidden bg-gray-100 group mb-4">
                                    <img src={uniquePhotos[activePhotoIndex]} alt="" className="w-full h-full object-cover cursor-zoom-in absolute inset-0" onClick={() => setLightboxIndex(activePhotoIndex)} />
                                </div>
                                {uniquePhotos.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar mt-auto h-16 flex-shrink-0">
                                        {uniquePhotos.map((img, idx) => (
                                            <button key={idx} onClick={() => setActivePhotoIndex(idx)} className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activePhotoIndex === idx ? 'border-brand-600' : 'border-transparent opacity-70'}`}>
                                                <img src={img} className="w-full h-full object-cover" alt="" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {hasVideo && pet.videoUrl && (
                                <div className="flex flex-col h-full justify-start">
                                    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-black aspect-[9/16] max-h-[450px]">
                                        {pet.videoUrl.includes('youtube') || pet.videoUrl.includes('youtu.be') || pet.videoUrl.includes('vimeo') ? (
                                            <iframe src={getVideoEmbedUrl(pet.videoUrl)} title="Video" className="w-full h-full absolute inset-0" frameBorder="0" allow="autoplay; playsinline" allowFullScreen></iframe>
                                        ) : (
                                            <video controls autoPlay muted loop playsInline className="w-full h-full absolute inset-0 object-cover"><source src={pet.videoUrl} type="video/mp4" /></video>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="block lg:hidden">{sidebarContent}</div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-brand-100 text-brand-600 rounded-xl"><Info size={24} /></div>
                                {t('petDetail.story')}
                            </h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{pet.description}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><HomeIcon size={20} className="text-brand-600" /> {t('petDetail.home')}</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1"><CheckCircle size={12} /> {t('petDetail.suitable')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {pet.requirements?.suitableFor?.map(tag => <span key={tag} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold">{tag}</span>)}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                                        <span className="text-gray-600">{t('petDetail.activity')}</span>
                                        <span className="font-bold text-brand-600">{pet.requirements?.activityLevel}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Users size={20} className="text-brand-600" /> {t('petDetail.compatibility')}</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3 font-medium text-gray-700"><Baby size={18} /> {t('petDetail.children')}</div>
                                        <StatusBadge status={pet.social?.children} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3 font-medium text-gray-700"><Dog size={18} /> {t('petDetail.dogs')}</div>
                                        <StatusBadge status={pet.social?.dogs} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Stethoscope size={20} className="text-brand-600" /> {t('petDetail.health')}</h3>
                                <div className="space-y-1">
                                    <BooleanItem label={t('petDetail.vaccination')} value={!!pet.health?.isVaccinated} />
                                    <BooleanItem label={t('petDetail.castration')} value={!!pet.health?.isCastrated} />
                                    <BooleanItem label={t('petDetail.microchip')} value={!!pet.health?.isChipped} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">{sidebarContent}</div>
                </div>
            </div>

            {isApplicationModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        {applicationSuccess ? (
                            <div className="p-8 flex flex-col items-center text-center">
                                <CheckCircle size={48} className="text-green-600 mb-6" />
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{t('petDetail.success')}</h3>
                                <button onClick={() => setIsApplicationModalOpen(false)} className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700">{t('petDetail.close')}</button>
                            </div>
                        ) : (
                            <form onSubmit={handleApplicationSubmit} className="p-6">
                                <h3 className="text-xl font-bold mb-4">{t('petDetail.applicationTitle')}</h3>
                                <textarea required className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-brand-500 outline-none text-sm" placeholder={t('assistant.placeholder')} value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)}></textarea>
                                <button type="submit" disabled={isSubmittingApp} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-4">{t('petDetail.submit')}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
                    <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxIndex(null)}><X size={36} /></button>
                    <img src={uniquePhotos[lightboxIndex]} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} alt="" />
                </div>
            )}
        </div>
    );
};

export default PetDetailPage;
