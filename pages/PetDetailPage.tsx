
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin, CheckCircle, Heart, Info, Building2,
    X, Stethoscope,
    Dog, XCircle, Share2,
    Facebook, Twitter, Mail, Link as LinkIcon, Copy,
    ArrowLeft, Calendar, Users, Loader2, EyeOff, ArrowRight, Video, Film, ShoppingCart, ChevronLeft, ChevronRight, Home as HomeIcon, Ruler, Baby,
    Car, Moon, Sparkle, Sparkles as SparklesIcon, Footprints, Cat, AlertCircle, Pill, Utensils, Check, User as UserIcon, Send, ShieldCheck, Zap, CreditCard, LogIn, Star,
    Quote, Bookmark, HeartHandshake, TrendingUp, PlusCircle, Bell, BellOff, MessageCircle
} from 'lucide-react';
import VirtualAdoptionModal from '../components/VirtualAdoptionModal';
import SocialShareModal from '../components/SocialShareModal';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext';
import { User, AdoptionInquiry, Shelter, Gender, Size, PetType } from '../types';
import { api } from '../services/api';
import { getMatchAnalysis, translateText } from '../services/geminiService';
import { formatSlovakAge, inflectNameToDative } from '../utils/formatters';
import { useTranslation } from 'react-i18next';
import MiniMap from '../components/MiniMap';

const PetDetailPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, toggleFavorite, isFavorite, userRole } = useAuth();
    const { getPet, pets } = usePets();
    const { addInquiry, showToast } = useApp();

    const pet = getPet(id || '');

    // Modal States
    const [isVirtualAdoptionModalOpen, setIsVirtualAdoptionModalOpen] = useState(false);
    const [isVirtualAdoptionLoginPromptOpen, setIsVirtualAdoptionLoginPromptOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

    // Success State for Application
    const [applicationSuccess, setApplicationSuccess] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [isSubmittingApp, setIsSubmittingApp] = useState(false);

    // Virtual Adoption Selection State
    // Virtual Adoption Selection State
    // Removed unused state vars

    // Gallery Logic
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Shelter State
    const [shelter, setShelter] = useState<Shelter | null>(null);

    // Match Analysis State
    const [matchResult, setMatchResult] = useState<{ score: number, reason: string } | null>(null);
    const [isAnalyzingMatch, setIsAnalyzingMatch] = useState(false);

    // Share Logic
    const [linkCopied, setLinkCopied] = useState(false);

    // Translation Logic
    const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
    const [translatedHealth, setTranslatedHealth] = useState<{ diet?: string, allergies?: string, medication?: string, importantNotes?: string } | null>(null);
    const [isTranslatingDescription, setIsTranslatingDescription] = useState(false);

    // Virtual Parents State
    const [virtualParents, setVirtualParents] = useState<any[]>([]);

    // Logic checks
    const isShelterUser = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
    const isRegularUser = currentUser && !isShelterUser;
    const isAlreadyAdopted = isRegularUser && (currentUser as User).virtualAdoptions?.some(a => a.petId === pet?.id);
    const hasAlreadyApplied = isRegularUser && (currentUser as User).applications?.some(app => app.petId === pet?.id);

    // Visibility Check Logic
    const isOwner = currentUser?.id === pet?.shelterId;
    const isAdmin = (currentUser as any)?.isSuperAdmin;
    const isVisible = pet?.isVisible;
    const canView = isVisible || isOwner || isAdmin;

    // Suggested Pets Logic
    const suggestedPets = useMemo(() => {
        if (!pet) return [];
        return pets
            .filter(p => p.id !== pet.id && p.adoptionStatus === 'Available' && p.isVisible)
            .sort((a, b) => {
                if (a.shelterId === pet.shelterId && b.shelterId !== pet.shelterId) return -1;
                if (a.shelterId !== pet.shelterId && b.shelterId === pet.shelterId) return 1;
                if (a.type === pet.type && b.type !== pet.type) return -1;
                if (a.type !== pet.type && b.type === pet.type) return 1;
                return 0;
            })
            .slice(0, 4);
    }, [pets, pet]);

    useEffect(() => {
        if (!pet) return;
        document.title = `${pet.name} hľadá domov - LabkaNádeje`;
        return () => {
            document.title = 'LabkaNádeje - Adopcia Zvierat';
        };
    }, [pet]);

    useEffect(() => {
        const fetchData = async () => {
            if (pet?.shelterId && id) {
                try {
                    // Fetch shelter info
                    const shelterData = await api.getPublicShelter(pet.shelterId);
                    setShelter(shelterData);

                    // Fetch virtual parents for this pet
                    const allUsers = await api.getAllUsers();
                    const parents = allUsers.filter(u =>
                        u.role === 'user' &&
                        u.virtualAdoptions?.some(va => va.petId === id && va.status === 'active')
                    ).map(u => {
                        const user = u as any; // Cast to access user-specific props safely
                        return {
                            name: user.name,
                            img: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`
                        };
                    });
                    setVirtualParents(parents);

                } catch (e) {
                    console.error("Failed to load shelter info or virtual parents", e);
                }
            }
        };
        fetchData();
    }, [pet?.shelterId, id]);

    useEffect(() => {
        if (pet && currentUser && userRole === 'user' && !isShelterUser) {
            const analyze = async () => {
                setIsAnalyzingMatch(true);
                try {
                    const result = await getMatchAnalysis(pet, currentUser as User);
                    setMatchResult(result);
                } catch (e) {
                    console.error("Match analysis failed", e);
                } finally {
                    setIsAnalyzingMatch(false);
                }
            };
            analyze();
        }
    }, [pet, currentUser, userRole, isShelterUser]);

    useEffect(() => {
        if (!pet) return;

        const translate = async () => {
            if (i18n.language === 'sk') {
                setTranslatedDescription(null);
                setTranslatedHealth(null);
                setIsTranslatingDescription(false); // Validly ensure false
                return;
            }

            setIsTranslatingDescription(true);
            try {
                // Translate description
                const descPromise = translateText(pet.description, i18n.language);

                // Translate health details if they exist
                const healthUpdates: any = {};
                const healthPromises = [];

                if (pet.health?.diet) {
                    healthPromises.push(translateText(pet.health.diet, i18n.language).then(res => healthUpdates.diet = res));
                }
                if (pet.health?.allergiesDescription) {
                    healthPromises.push(translateText(pet.health.allergiesDescription, i18n.language).then(res => healthUpdates.allergies = res));
                }
                if (pet.health?.medication) {
                    healthPromises.push(translateText(pet.health.medication, i18n.language).then(res => healthUpdates.medication = res));
                }
                if (pet.importantNotes) {
                    healthPromises.push(translateText(pet.importantNotes, i18n.language).then(res => healthUpdates.importantNotes = res));
                }

                const [translatedDesc] = await Promise.all([descPromise, ...healthPromises]);

                setTranslatedDescription(translatedDesc);
                setTranslatedHealth(healthUpdates);
            } catch (e) {
                console.error("Translation failed", e);
            } finally {
                setIsTranslatingDescription(false);
            }
        };

        translate();
    }, [pet?.description, pet?.health, i18n.language, pet?.importantNotes]);

    useEffect(() => {
        if (pet?.id) {
            api.incrementPetViews(pet.id);
        }
    }, [pet?.id]);

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
            setIsLoginPromptOpen(true);
        } else {
            setIsApplicationModalOpen(true);
        }
    };

    const handleVirtualAdoptionClick = () => {
        if (!currentUser) {
            setIsVirtualAdoptionLoginPromptOpen(true);
        } else {
            setIsVirtualAdoptionModalOpen(true);
        }
    };

    const handleFavoriteToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            showToast("Pre ukladanie obľúbených sa prosím prihláste.", "info");
            return;
        }

        const wasFavorite = isFavorite(pet.id);
        toggleFavorite(pet.id);
        if (!wasFavorite) {
            showToast(t('petDetail.toast.addedFavorite'), "success");
        } else {
            showToast(t('petDetail.toast.removedFavorite'), "info");
        }
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

    // Payment handler moved to modal component

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        showToast("Odkaz bol skopírovaný.", "success");
    };

    const StatusBadge = ({ status }: { status: string | undefined }) => {
        // If status is "Neznáme" (DB string) or undefined, treat as unknown
        const isUnknown = !status || status === 'Neznáme';
        const safeStatus = isUnknown ? t('petDetail.unknown') : status;

        const styles = safeStatus === 'Vhodný' ? 'bg-green-100 text-green-700 ring-green-600/20' :
            safeStatus === 'Nevhodný' ? 'bg-red-100 text-red-700 ring-red-600/20' :
                safeStatus === 'Opatrne' ? 'bg-amber-100 text-amber-700 ring-amber-600/20' : 'bg-gray-100 text-gray-600 ring-gray-600/20';

        const getLabel = (s: string) => {
            if (s === 'Vhodný') return t('petDetail.status.suitable');
            if (s === 'Nevhodný') return t('petDetail.status.unsuitable');
            if (s === 'Opatrne') return t('petDetail.status.careful');
            if (s === 'Neznáme' || s === t('petDetail.unknown')) return t('petDetail.unknown');
            return s;
        };

        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${styles}`}>
                {getLabel(safeStatus!)}
            </span>
        );
    };

    const getSizeLabel = (s: Size) => {
        if (s === Size.SMALL) return t('petDetail.size.small');
        if (s === Size.MEDIUM) return t('petDetail.size.medium');
        if (s === Size.LARGE) return t('petDetail.size.large');
        return s;
    };

    const getActivityLabel = (level: string | undefined) => {
        if (!level) return t('petDetail.medium');
        // Simple mapping for common Slovak values to keys if needed, 
        // or just return the value if we don't have an enum. 
        // Assuming 'Stredná' is the standard default in DB or UI.
        if (level === 'Stredná') return t('petDetail.activityLevels.medium');
        if (level === 'Nízka') return t('petDetail.activityLevels.low');
        if (level === 'Vysoká') return t('petDetail.activityLevels.high');
        return level;
    };

    const getCompatibilityLabel = (status: string | undefined) => {
        if (!status || status === 'Neznáme') return t('petDetail.unknown');
        if (status === 'Vhodný') return t('petDetail.status.suitable');
        if (status === 'Nevhodný') return t('petDetail.status.unsuitable');
        if (status === 'Opatrne') return t('petDetail.status.careful');
        return status;
    };

    const BooleanItem = ({ label, value, icon: Icon }: { label: string, value: boolean, icon?: any }) => (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                {Icon && <Icon size={16} className="text-gray-400" />}
                {label}
            </div>
            {value
                ? <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold"><CheckCircle size={16} className="fill-green-100" /> {t('common.yes')}</div>
                : <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium"><XCircle size={16} /> {t('common.no')}</div>
            }
        </div>
    );

    const GenderLabel = ({ gender }: { gender: Gender }) => {
        const isMale = gender === Gender.MALE;
        return isMale
            ? <span className="text-blue-500">♂ {t('petDetail.genderLabel.male')}</span>
            : <span className="text-pink-500">♀ {t('petDetail.genderLabel.female')}</span>;
    };

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

                {/* LABKA ZHODA */}
                {isRegularUser && (
                    <div className="mb-8 relative overflow-hidden rounded-[2rem] p-6 bg-white border border-brand-100 shadow-lg shadow-brand-100/50 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                                        <SparklesIcon size={14} />
                                    </div>
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Labka Zhoda</span>
                                </div>
                                {isAnalyzingMatch ? (
                                    <Loader2 size={16} className="animate-spin text-brand-500" />
                                ) : (
                                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${matchResult && matchResult.score > 80 ? 'bg-green-50 text-green-700 border-green-100' : matchResult && matchResult.score > 50 ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        AI Analýza
                                    </div>
                                )}
                            </div>

                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">
                                    {matchResult ? matchResult.score : '--'}%
                                </span>
                                <span className="text-sm font-bold text-gray-400 mb-2">zhoda s vami</span>
                            </div>

                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4 border border-gray-100">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full transition-all duration-1000 relative"
                                    style={{ width: `${matchResult?.score || 0}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                </div>
                            </div>

                            {matchResult?.reason && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        {matchResult.reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-4 mb-8">
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                        <div className="text-xs text-gray-400 font-bold mb-1">{t('petDetail.age')}</div>
                        <div className="font-bold text-gray-900">{t('common.years', { count: pet.age })}</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                        <div className="text-xs text-gray-400 font-bold mb-1">{t('petDetail.gender')}</div>
                        <div className="font-bold text-gray-900">{t(`petDetail.genderLabel.${pet.gender === Gender.MALE ? 'male' : 'female'}`)}</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                        <div className="text-xs text-gray-400 font-bold mb-1">{t('petDetail.size.label')}</div>
                        <div className="font-bold text-gray-900">{getSizeLabel(pet.size)}</div>
                    </div>
                </div>
                {!isShelterUser ? (
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
                        {!isAlreadyAdopted && pet.adoptionStatus === 'Available' && (
                            <button disabled className="w-full py-3 px-6 rounded-2xl font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2">
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
            <Link to={`/shelters/${pet.shelterId}`} className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
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

            <div className="mb-6 mt-6">
                <MiniMap location={shelter?.location || pet.location} className="w-full h-48" />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
                        <SparklesIcon size={16} />
                    </div>
                    {t('petDetail.adoptionProcess.title')}
                </h4>
                <div className="relative">
                    <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gray-100"></div>
                    <div className="space-y-6 relative">
                        {[
                            { title: t('petDetail.adoptionProcess.step1'), desc: t('petDetail.adoptionProcess.step1Desc'), icon: Send, color: "bg-blue-100 text-blue-600" },
                            { title: t('petDetail.adoptionProcess.step2'), desc: t('petDetail.adoptionProcess.step2Desc'), icon: MessageCircle, color: "bg-purple-100 text-purple-600" },
                            { title: t('petDetail.adoptionProcess.step3'), desc: t('petDetail.adoptionProcess.step3Desc'), icon: Users, color: "bg-amber-100 text-amber-600" },
                            { title: t('petDetail.adoptionProcess.step4'), desc: t('petDetail.adoptionProcess.step4Desc'), icon: HomeIcon, color: "bg-green-100 text-green-600" }
                        ].map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${step.color}`}>
                                    <step.icon size={14} />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900">{step.title}</h5>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );



    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-6">
            <Helmet>
                <title>{pet.name} hľadá domov | LabkaNádeje</title>
                <meta name="description" content={`Adoptujte si ${pet.name}! ${pet.breed}, ${pet.age} rokov. ${pet.description.substring(0, 150)}...`} />
                <meta property="og:title" content={`${pet.name} hľadá domov | LabkaNádeje`} />
                <meta property="og:description" content={`Adoptujte si ${pet.name}! ${pet.breed}, ${pet.age} rokov. ${pet.description.substring(0, 150)}...`} />
                <meta property="og:image" content={pet.imageUrl} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="website" />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/pets" className="inline-flex items-center text-gray-500 hover:text-brand-600 font-bold transition">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 border border-gray-200">
                            <ArrowLeft size={16} />
                        </div>
                        {t('petDetail.backToList')}
                    </Link>
                    <div className="flex gap-2">
                        <button onClick={() => setIsShareModalOpen(true)} className="px-4 py-2.5 bg-white text-gray-600 hover:text-brand-600 rounded-full shadow-sm border border-gray-200 transition flex items-center gap-2 font-bold text-sm">
                            <Share2 size={18} />
                            {t('common.share')}
                        </button>
                        {!isShelterUser && (
                            <button onClick={handleFavoriteToggle} className={`p-2.5 rounded-full shadow-sm border transition ${isFavorite(pet.id) ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 border-gray-200 hover:text-red-500'}`}>
                                <Heart size={20} className={isFavorite(pet.id) ? 'fill-current' : ''} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Share Modal */}
                <SocialShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    petName={pet.name}
                    imageUrl={pet.imageUrl}
                    description={pet.description}
                    url={`https://qcwoyklifcekulkhrqmz.supabase.co/functions/v1/share-pet?id=${pet.id}`}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-20">
                    <div className="lg:col-span-2 space-y-8">
                        <div className={`grid gap-6 ${hasVideo ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            <div className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative flex flex-col h-full ${hasVideo ? 'min-h-[400px]' : 'min-h-[850px]'}`}>
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
                                    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-black aspect-[3/4] max-h-[500px]">
                                        {pet.videoUrl.includes('youtube') || pet.videoUrl.includes('youtu.be') || pet.videoUrl.includes('vimeo') ? (
                                            <iframe src={getVideoEmbedUrl(pet.videoUrl)} title="Video" className="w-full h-full absolute inset-0" frameBorder="0" allow="autoplay; playsinline" allowFullScreen></iframe>
                                        ) : (
                                            <video controls autoPlay muted loop playsInline className="w-full h-full absolute inset-0 object-contain bg-black"><source src={pet.videoUrl} type="video/mp4" /></video>
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
                            {pet.importantNotes && (
                                <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl flex gap-4 animate-in slide-in-from-left duration-500">
                                    <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-extrabold text-amber-900 text-sm mb-1">{t('petDetail.importantNotice')}</h4>
                                        <p className="text-amber-800 text-sm leading-relaxed">{translatedHealth?.importantNotes || pet.importantNotes}</p>
                                    </div>
                                </div>
                            )}
                            {isTranslatingDescription ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                        {translatedDescription || pet.description}
                                    </p>
                                    {translatedDescription && i18n.language !== 'sk' && (
                                        <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium text-brand-600">
                                            <SparklesIcon size={12} />
                                            Preložené pomocou AI
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* WALL OF FAME - Only visible if there are virtual parents */}
                        {virtualParents.length > 0 && (
                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-8 shadow-sm border border-pink-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Heart size={120} fill="currentColor" />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                                        <SparklesIcon size={20} className="text-pink-500" />
                                        {t('petDetail.wallOfFame.title', 'Virtuálni rodičia')}
                                    </h2>
                                    <p className="text-sm text-gray-600 font-medium mb-6 max-w-lg">
                                        {t('petDetail.wallOfFame.subtitle', 'Títo úžasní ľudia pomáhajú zabezpečiť šťastný život v útulku.')}
                                    </p>

                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex -space-x-4">
                                            {virtualParents.map((parent, i) => (
                                                <div key={i} className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden relative group cursor-help">
                                                    <img src={parent.img} alt={parent.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        {parent.name}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs font-bold text-gray-500">
                                            {virtualParents.length > 1
                                                ? `+ ${virtualParents.length} ${t('petDetail.supporters', 'podporovateľov')}`
                                                : `${t('petDetail.supporter', 'podporovateľ')}`
                                            }
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-full shadow-sm text-pink-500"><HeartHandshake size={20} /></div>
                                            <p className="text-xs font-medium text-gray-700">
                                                {t('petDetail.joinSupport', 'Pridajte sa k nim a staňte sa virtuálnym rodičom!')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><HomeIcon size={20} className="text-brand-600" /> {t('petDetail.home')}</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1"><CheckCircle size={12} /> {t('petDetail.status.suitable')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {pet.requirements?.suitableFor?.map(tag => <span key={tag} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold">{tag}</span>)}
                                            {(!pet.requirements?.suitableFor || pet.requirements?.suitableFor.length === 0) && <span className="text-xs text-gray-400">{t('petDetail.unspecified')}</span>}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                                        <span className="text-gray-600">{t('petDetail.activity')}</span>
                                        <span className="font-bold text-brand-600">{getActivityLabel(pet.requirements?.activityLevel)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Footprints size={20} className="text-brand-600" /> {t('petDetail.training')}</h3>
                                <div className="space-y-1">
                                    <BooleanItem label={t('petDetail.toiletTrained')} value={!!pet.training?.toiletTrained} icon={Footprints} />
                                    <BooleanItem label={t('petDetail.leash')} value={!!pet.training?.leashTrained} icon={Dog} />
                                    <BooleanItem label={t('petDetail.car')} value={!!pet.training?.carTravel} icon={Car} />
                                    <BooleanItem label={t('petDetail.alone')} value={!!pet.training?.aloneTime} icon={Moon} />
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
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3 font-medium text-gray-700"><Cat size={18} /> {t('petDetail.cats')}</div>
                                        <StatusBadge status={pet.social?.cats} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Stethoscope size={20} className="text-brand-600" /> {t('petDetail.health')}</h3>
                                <div className="space-y-1 mb-4">
                                    <BooleanItem label={t('petDetail.vaccination')} value={!!pet.health?.isVaccinated} />
                                    <BooleanItem label={t('petDetail.microchip')} value={!!pet.health?.isChipped} />
                                    <BooleanItem label={t('petDetail.castration')} value={!!pet.health?.isCastrated} />
                                    <BooleanItem label={t('petDetail.deworming')} value={!!pet.health?.isDewormed} />
                                </div>
                                {(pet.health?.medication || pet.health?.diet || pet.health?.hasAllergies) && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                        <p className="text-[10px] font-bold text-gray-400">{t('petDetail.specialNeeds')}</p>
                                        {pet.health?.hasAllergies && (
                                            <div className="flex items-start gap-2 text-xs">
                                                <AlertCircle size={14} className="text-red-500 mt-0.5" />
                                                <span className="text-gray-600"><strong>{t('petDetail.allergy')}</strong> {translatedHealth?.allergies || pet.health.allergiesDescription || t('common.yes')}</span>
                                            </div>
                                        )}
                                        {pet.health?.medication && (
                                            <div className="flex items-start gap-2 text-xs">
                                                <Pill size={14} className="text-blue-500 mt-0.5" />
                                                <span className="text-gray-600"><strong>{t('petDetail.meds')}</strong> {translatedHealth?.medication || pet.health.medication}</span>
                                            </div>
                                        )}
                                        {pet.health?.diet && (
                                            <div className="flex items-start gap-2 text-xs">
                                                <Utensils size={14} className="text-green-500 mt-0.5" />
                                                <span className="text-gray-600"><strong>{t('petDetail.diet')}</strong> {translatedHealth?.diet || pet.health.diet}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">{sidebarContent}</div>
                </div>

                {/* --- SUGGESTED PETS SECTION --- */}
                {
                    suggestedPets.length > 0 && (
                        <div className="mt-24 pt-16 border-t border-gray-200">
                            <div className="flex items-end justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('petDetail.suggested.title')}</h2>
                                    <p className="text-gray-500 mt-2">{t('petDetail.suggested.subtitle')}</p>
                                </div>
                                <Link to="/pets" className="hidden sm:flex items-center gap-2 text-brand-600 font-bold hover:underline">
                                    {t('petDetail.suggested.viewAll')} <ArrowRight size={18} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {suggestedPets.map(p => (
                                    <Link key={p.id} to={`/pets/${p.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black text-gray-700 shadow-sm border border-gray-100">
                                                {t('common.years', { count: p.age })}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-extrabold text-gray-900 group-hover:text-brand-600 transition truncate">{p.name}</h3>
                                                <div className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{p.type}</div>
                                            </div>
                                            <p className="text-gray-400 text-xs font-bold mb-4">{p.breed}</p>
                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-500">
                                                <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-500" /> {p.location}</span>
                                                <GenderLabel gender={p.gender} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-10 text-center sm:hidden">
                                <Link to="/pets" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg">
                                    Zobraziť všetky <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* --- LOGIN PROMPT MODAL --- */}
            {
                isLoginPromptOpen && (
                    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 text-center">
                                <div className="mx-auto w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-6 border border-brand-100 shadow-sm">
                                    <LogIn size={36} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Musíte sa prihlásiť</h3>
                                <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                                    Pre odoslanie žiadosti o adopciu je potrebné mať overený profil, aby útulok vedel, s kým komunikuje.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/auth')}
                                        className="w-full bg-brand-600 text-white font-black py-4 rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-100 transition transform hover:-translate-y-1"
                                    >
                                        Prihlásiť sa / Registrovať
                                    </button>
                                    <button
                                        onClick={() => setIsLoginPromptOpen(false)}
                                        className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition"
                                    >
                                        Zrušiť
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- VIRTUAL ADOPTION LOGIN PROMPT (WITH BENEFITS) --- */}
            {
                isVirtualAdoptionLoginPromptOpen && (
                    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-10 text-center">
                                <div className="mx-auto w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 mb-6 border border-pink-100 shadow-sm">
                                    <Heart size={40} fill="currentColor" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Pomôžte {inflectNameToDative(pet.name)} na diaľku</h3>
                                <p className="text-sm text-gray-500 font-medium mb-8">
                                    Virtuálna adopcia umožňuje podporiť zvieratko, aj keď si ho nemôžete vziať domov.
                                </p>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 text-left p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm"><Utensils size={20} /></div>
                                        <span className="text-xs font-bold text-gray-700 leading-tight">Zabezpečíte plnú <br />misku krmiva</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-left p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Stethoscope size={20} /></div>
                                        <span className="text-xs font-bold text-gray-700 leading-tight">Umožníte dôležitú <br />veterinárnu starostlivosť</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-left p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-600 shadow-sm"><Star size={20} /></div>
                                        <span className="text-xs font-bold text-gray-700 leading-tight">Darujete šťastnejší <br />život v útulku</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/auth')}
                                        className="w-full bg-brand-600 text-white font-black py-4 rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        <LogIn size={20} />
                                        Prihlásiť sa a pomôcť
                                    </button>
                                    <button
                                        onClick={() => setIsVirtualAdoptionLoginPromptOpen(false)}
                                        className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition"
                                    >
                                        Zatvoriť
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- SHARE MODAL --- */}
            {
                isShareModalOpen && (
                    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Zdieľať profil</h3>
                                        <p className="text-sm text-gray-500 font-medium">Pomôžte {pet.name} nájsť domov.</p>
                                    </div>
                                    <button onClick={() => setIsShareModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition group"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-600 shadow-sm transition">
                                            {linkCopied ? <Check size={20} className="text-green-500" /> : <LinkIcon size={20} />}
                                        </div>
                                        <span className="font-bold text-gray-700 text-sm">{linkCopied ? 'Skopírované!' : 'Kopírovať odkaz'}</span>
                                    </button>

                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 transition group"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm transition">
                                            <Facebook size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700 text-sm">Zdieľať na Facebooku</span>
                                    </a>

                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Pozrite si tohto kamoša na adopciu: ${pet.name}`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-900 transition group"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 shadow-sm transition">
                                            <Twitter size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700 text-sm">Zdieľať na Twitteri / X</span>
                                    </a>

                                    <a
                                        href={`mailto:?subject=${encodeURIComponent(`Adopcia: ${pet.name}`)}&body=${encodeURIComponent(`Ahoj, pozri si toto zvieratko na adopciu: ${window.location.href}`)}`}
                                        className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-brand-200 transition group"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm transition">
                                            <Mail size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700 text-sm">Poslať e-mailom</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- REDESIGNED ADOPTION APPLICATION MODAL --- */}
            {
                isApplicationModalOpen && (
                    <div className="fixed inset-0 z-[120] overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            {applicationSuccess ? (
                                <div className="p-12 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-8 border border-green-100 shadow-inner">
                                        <CheckCircle size={56} />
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Úspešne odoslané!</h3>
                                    <p className="text-gray-500 mb-8 max-sm leading-relaxed">
                                        Vaša žiadosť o adopciu {pet.name} bola doručená útulku. Celú konverzáciu nájdete vo svojom profile.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                        <button onClick={() => navigate('/profile')} className="flex-1 bg-brand-600 text-white font-black py-4 rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-100 transition transform hover:-translate-y-0.5">
                                            Prejsť do profilu
                                        </button>
                                        <button onClick={() => setIsApplicationModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 font-black py-4 rounded-2xl hover:bg-gray-200 transition">
                                            Zavrieť
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleApplicationSubmit}>
                                    <div className="p-8 pb-4 border-b border-gray-50 bg-gray-50/50">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                                                    <img src={pet.imageUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Mám záujem o {pet.name}</h3>
                                                    <p className="text-sm text-gray-500 font-medium">Pošlite útulku vašu nezáväznú žiadosť.</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setIsApplicationModalOpen(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 mb-2 ml-1">{t('petDetail.yourMessage')}</label>
                                            <textarea
                                                required
                                                className="w-full border border-gray-200 rounded-[1.5rem] p-4 h-40 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                                                placeholder={t('petDetail.messagePlaceholder')}
                                                value={applicationMessage}
                                                onChange={(e) => setApplicationMessage(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex-shrink-0">
                                                    {(currentUser as User).avatarUrl ? <img src={(currentUser as User).avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="p-2 text-gray-300" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-800">{(currentUser as User).name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                        <Mail size={10} /> {(currentUser as User).email}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingApp || !applicationMessage.trim()}
                                                className="w-full sm:w-auto bg-brand-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
                                            >
                                                {isSubmittingApp ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                                {t('petDetail.submit')}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            {/* --- REDESIGNED VIRTUAL ADOPTION MODAL --- */}
            <VirtualAdoptionModal
                isOpen={isVirtualAdoptionModalOpen}
                onClose={() => setIsVirtualAdoptionModalOpen(false)}
                pet={pet!}
                onSuccess={() => {
                    showToast(t('petDetail.toast.virtualAdoptionSuccess') || "Ďakujeme za vašu podporu!", "success");
                }}
            />

            <SocialShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                petName={pet.name}
                imageUrl={pet.imageUrl}
                description={pet.description}
                hashtags={['#labkanadeje', `#${pet.type === PetType.DOG ? 'pes' : 'macka'}`, '#adopcia', `#${pet.breed.replace(/\s+/g, '')}`]}
                url={`https://qcwoyklifcekulkhrqmz.supabase.co/functions/v1/share-pet?id=${pet.id}`}
            />

            {
                lightboxIndex !== null && (
                    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
                        <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxIndex(null)}><X size={36} /></button>
                        <img src={uniquePhotos[lightboxIndex]} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} alt="" />
                    </div>
                )
            }
        </div >
    );
};

export default PetDetailPage;
