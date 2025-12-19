
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, CheckCircle, Heart, Info, Building2, 
  X, Stethoscope, 
  Dog, XCircle, Share2,
  Facebook, Twitter, Mail, Link as LinkIcon, Copy,
  ArrowLeft, Calendar, Users, Loader2, EyeOff, ArrowRight, Video, Film, ShoppingCart, ChevronLeft, ChevronRight, Home as HomeIcon, Ruler, Baby,
  Car, Moon, Sparkles as SparklesIcon, Footprints, Cat, AlertCircle, Pill, Utensils, Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext'; 
import { User, AdoptionInquiry, Shelter, Gender } from '../types';
import { api } from '../services/api';
import { getMatchAnalysis } from '../services/geminiService';

const PetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, toggleFavorite, isFavorite, userRole } = useAuth();
  const { getPet, pets } = usePets(); 
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

  // Match Analysis State
  const [matchResult, setMatchResult] = useState<{ score: number, reason: string } | null>(null);
  const [isAnalyzingMatch, setIsAnalyzingMatch] = useState(false);

  // Share Logic
  const [linkCopied, setLinkCopied] = useState(false);

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

  // Dynamická správa metadát pre sociálne siete
  useEffect(() => {
    if (!pet) return;

    const title = `${pet.name} hľadá domov - LabkaNádeje`;
    const description = `Adoptujte si zvieratko ${pet.name}. Plemeno: ${pet.breed}, Vek: ${pet.age} r., Lokalita: ${pet.location}. Pozrite si celý profil na LabkaNádeje.`;
    const imageUrl = pet.imageUrl;
    const url = window.location.href;

    // Aktualizácia titulku karty prehliadača
    document.title = title;

    // Funkcia na update/vytvorenie meta tagu
    const updateMeta = (name: string, content: string, property: boolean = false) => {
      let element = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (property) element.setAttribute('property', name);
        else element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Open Graph (Facebook, LinkedIn, etc.)
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', imageUrl, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', 'website', true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', imageUrl);

    // Cleanup pri odchode zo stránky (vrátenie na pôvodné)
    return () => {
      document.title = 'LabkaNádeje - Adopcia Zvierat';
    };
  }, [pet]);

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

  // Match Analysis Logic
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

  // Increment view count
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
    return <div className="p-20 text-center text-gray-500 font-medium">Zvieratko sa nenašlo. <br/><Link to="/pets" className="text-brand-600 underline mt-4 inline-block">Späť na zoznam</Link></div>;
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
      showToast("Pre ukladanie obľúbených sa prosím prihláste.", "info");
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
        showToast("Chyba pri odosielaní", "error");
    } finally {
        setIsSubmittingApp(false);
    }
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      showToast("Odkaz bol skopírovaný.", "success");
  };

  const StatusBadge = ({ status }: { status: string | undefined }) => {
    const safeStatus = status || 'Neznáme';
    const styles = safeStatus === 'Vhodný' ? 'bg-green-100 text-green-700 ring-green-600/20' : 
                  safeStatus === 'Nevhodný' ? 'bg-red-100 text-red-700 ring-red-600/20' : 
                  safeStatus === 'Opatrne' ? 'bg-amber-100 text-amber-700 ring-amber-600/20' : 'bg-gray-100 text-gray-600 ring-gray-600/20';
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${styles}`}>
            {safeStatus}
        </span>
    );
  };

  const BooleanItem = ({ label, value, icon: Icon }: { label: string, value: boolean, icon?: any }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
            {Icon && <Icon size={16} className="text-gray-400" />}
            {label}
        </div>
        {value 
          ? <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold"><CheckCircle size={16} className="fill-green-100" /> Áno</div> 
          : <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium"><XCircle size={16} /> Nie</div>
        }
    </div>
  );

  const GenderLabel = ({ gender }: { gender: Gender }) => (
    gender === Gender.MALE ? <span className="text-blue-500">♂ Samec</span> : <span className="text-pink-500">♀ Samica</span>
  );

  const sidebarContent = (
    <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{pet.name}</h1>
                <p className="text-gray-500 font-medium">{pet.breed}</p>
                {!pet.isVisible && (
                    <div className="mt-3 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-gray-200">
                        <EyeOff size={12}/> Skrytý inzerát
                    </div>
                )}
            </div>

            {/* LABKA ZHODA */}
            {isRegularUser && (
              <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Labka Zhoda</span>
                  {isAnalyzingMatch ? (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  ) : (
                    <span className={`text-xl font-black ${matchResult && matchResult.score > 70 ? 'text-green-600' : 'text-gray-900'}`}>
                      {matchResult ? `${matchResult.score}%` : '--%'}
                    </span>
                  )}
                </div>
                
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gray-900 transition-all duration-1000" 
                    style={{ width: `${matchResult?.score || 0}%` }}
                  ></div>
                </div>

                {matchResult?.reason && (
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    {matchResult.reason}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-center gap-4 mb-8">
                 <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Vek</div>
                    <div className="font-bold text-gray-900">{pet.age} r.</div>
                 </div>
                 <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Pohlavie</div>
                    <div className="font-bold text-gray-900">{pet.gender}</div>
                 </div>
                 <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Veľkosť</div>
                    <div className="font-bold text-gray-900">{pet.size}</div>
                 </div>
            </div>
            {!isShelterUser ? (
                <div className="space-y-3">
                    <button 
                        onClick={hasAlreadyApplied ? undefined : handleInterestClick}
                        disabled={hasAlreadyApplied || pet.adoptionStatus !== 'Available'}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 ${
                            hasAlreadyApplied 
                            ? 'bg-green-100 text-green-700 cursor-default shadow-none'
                            : pet.adoptionStatus !== 'Available'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200'
                        }`}
                    >
                        {hasAlreadyApplied ? <><CheckCircle size={20}/> Žiadosť odoslaná</> : 'Mám záujem o adopciu'}
                    </button>
                    {!isAlreadyAdopted && (
                        <button onClick={() => setIsVirtualAdoptionModalOpen(true)} className="w-full py-3 px-6 rounded-2xl font-bold text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition flex items-center justify-center gap-2">
                            <Heart size={18} /> Virtuálne adoptovať
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500 border border-gray-100">
                    {isOwner ? <>Váš inzerát. <Link to="/shelter" className="text-brand-600 font-bold hover:underline">Upraviť</Link></> : "Prihláste sa ako používateľ."}
                </div>
            )}
            {pet.adoptionFee > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Adopčný poplatok</p>
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
                    <div className="text-xs text-gray-400 font-bold uppercase mb-0.5">Útulok</div>
                    <h4 className="font-bold text-gray-900 truncate group-hover:text-brand-600">{shelter?.name || 'Načítavam...'}</h4>
                </div>
                <ChevronRight className="text-gray-300" />
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl text-sm">
                <MapPin size={16} className="text-gray-400"/>
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
                Späť na zoznam
            </Link>
            <div className="flex gap-2">
                 <button onClick={() => setIsShareModalOpen(true)} className="p-2.5 bg-white text-gray-600 hover:text-brand-600 rounded-full shadow-sm border border-gray-200 transition"><Share2 size={20} /></button>
                 {!isShelterUser && (
                     <button onClick={handleFavoriteToggle} className={`p-2.5 rounded-full shadow-sm border transition ${isFavorite(pet.id) ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 border-gray-200 hover:text-red-500'}`}>
                        <Heart size={20} className={isFavorite(pet.id) ? 'fill-current' : ''} />
                     </button>
                 )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-20">
            <div className="lg:col-span-2 space-y-8">
                <div className={`grid gap-6 ${hasVideo ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    <div className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative flex flex-col h-full ${hasVideo ? 'min-h-[300px]' : 'min-h-[500px]'}`}>
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
                        Môj príbeh
                    </h2>
                    {pet.importantNotes && (
                        <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl flex gap-4 animate-in slide-in-from-left duration-500">
                            <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                            <div>
                                <h4 className="font-extrabold text-amber-900 text-sm uppercase tracking-wider mb-1">Dôležité upozornenie</h4>
                                <p className="text-amber-800 text-sm leading-relaxed">{pet.importantNotes}</p>
                            </div>
                        </div>
                    )}
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">{pet.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><HomeIcon size={20} className="text-brand-600" /> Domov</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-1"><CheckCircle size={12}/> Vhodný</div>
                                <div className="flex flex-wrap gap-2">
                                    {pet.requirements?.suitableFor?.map(tag => <span key={tag} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">{tag}</span>)}
                                    {(!pet.requirements?.suitableFor || pet.requirements?.suitableFor.length === 0) && <span className="text-xs text-gray-400">Nešpecifikované</span>}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                                <span className="text-gray-600">Úroveň aktivity</span>
                                <span className="font-bold text-brand-600">{pet.requirements?.activityLevel || 'Stredná'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Footprints size={20} className="text-brand-600" /> Výchova</h3>
                        <div className="space-y-1">
                            <BooleanItem label="Hygienické návyky" value={!!pet.training?.toiletTrained} icon={Footprints} />
                            <BooleanItem label="Chôdza na vodítku" value={!!pet.training?.leashTrained} icon={Dog} />
                            <BooleanItem label="Zvláda cestu autom" value={!!pet.training?.carTravel} icon={Car} />
                            <BooleanItem label="Zvláda samotu" value={!!pet.training?.aloneTime} icon={Moon} />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Users size={20} className="text-brand-600" /> Znášanlivosť</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 font-medium text-gray-700"><Baby size={18}/> Deti</div>
                                <StatusBadge status={pet.social?.children} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 font-medium text-gray-700"><Dog size={18}/> Psi</div>
                                <StatusBadge status={pet.social?.dogs} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 font-medium text-gray-700"><Cat size={18}/> Mačky</div>
                                <StatusBadge status={pet.social?.cats} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Stethoscope size={20} className="text-brand-600" /> Zdravie</h3>
                        <div className="space-y-1 mb-4">
                            <BooleanItem label="Očkovanie" value={!!pet.health?.isVaccinated} />
                            <BooleanItem label="Čipovanie" value={!!pet.health?.isChipped} />
                            <BooleanItem label="Kastrácia" value={!!pet.health?.isCastrated} />
                            <BooleanItem label="Odčervenie" value={!!pet.health?.isDewormed} />
                        </div>
                        {(pet.health?.medication || pet.health?.diet || pet.health?.hasAllergies) && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Špeciálne potreby</p>
                                {pet.health?.hasAllergies && (
                                    <div className="flex items-start gap-2 text-xs">
                                        <AlertCircle size={14} className="text-red-500 mt-0.5" />
                                        <span className="text-gray-600"><strong>Alergia:</strong> {pet.health.allergiesDescription || 'Áno'}</span>
                                    </div>
                                )}
                                {pet.health?.medication && (
                                    <div className="flex items-start gap-2 text-xs">
                                        <Pill size={14} className="text-blue-500 mt-0.5" />
                                        <span className="text-gray-600"><strong>Lieky:</strong> {pet.health.medication}</span>
                                    </div>
                                )}
                                {pet.health?.diet && (
                                    <div className="flex items-start gap-2 text-xs">
                                        <Utensils size={14} className="text-green-500 mt-0.5" />
                                        <span className="text-gray-600"><strong>Strava:</strong> {pet.health.diet}</span>
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
        {suggestedPets.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
             <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-gray-900">Možno hľadáte práve ich</h2>
                  <p className="text-gray-500 mt-2">Ďalšie zvieratká, ktoré čakajú na svoju šancu.</p>
                </div>
                <Link to="/pets" className="hidden sm:flex items-center gap-2 text-brand-600 font-bold hover:underline">
                  Všetky zvieratá <ArrowRight size={18}/>
                </Link>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedPets.map(p => (
                  <Link key={p.id} to={`/pets/${p.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase text-gray-700 shadow-sm border border-gray-100">
                             {p.age} {p.age === 1 ? 'rok' : 'r.'}
                          </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="font-extrabold text-gray-900 group-hover:text-brand-600 transition truncate">{p.name}</h3>
                             <div className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase">{p.type}</div>
                          </div>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-tight mb-4">{p.breed}</p>
                          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-500">
                             <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-500"/> {p.location}</span>
                             <GenderLabel gender={p.gender} />
                          </div>
                      </div>
                  </Link>
                ))}
             </div>
             <div className="mt-10 text-center sm:hidden">
                <Link to="/pets" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg">
                   Zobraziť všetky <ArrowRight size={16}/>
                </Link>
             </div>
          </div>
        )}
      </div>

      {/* --- SHARE MODAL --- */}
      {isShareModalOpen && (
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
      )}

      {isApplicationModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
               {applicationSuccess ? (
                   <div className="p-8 flex flex-col items-center text-center">
                       <CheckCircle size={48} className="text-green-600 mb-6" />
                       <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Odoslané!</h3>
                       <button onClick={() => setIsApplicationModalOpen(false)} className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700">Zavrieť</button>
                   </div>
               ) : (
                   <form onSubmit={handleApplicationSubmit} className="p-6">
                       <h3 className="text-xl font-bold mb-4">Žiadosť o adopciu</h3>
                       <textarea required className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-brand-500 outline-none text-sm" placeholder="Vaša správa..." value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)}></textarea>
                       <button type="submit" disabled={isSubmittingApp} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2">
                           {isSubmittingApp && <Loader2 className="animate-spin" size={18}/>}
                           Odoslať
                       </button>
                   </form>
               )}
           </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
            <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxIndex(null)}><X size={36} /></button>
            <img src={uniquePhotos[lightboxIndex]} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} alt="" />
        </div>
      )}
    </div>
  );
};

export default PetDetailPage;
