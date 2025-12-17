import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, CheckCircle, Heart, Info, Building2, 
  AlertTriangle, CreditCard, X, ZoomIn, Stethoscope, 
  Activity, Baby, Dog, Cat, XCircle, PlayCircle, Share2,
  Facebook, Twitter, Mail, Link as LinkIcon, Copy, Check, MessageCircle,
  LogIn, Send, ChevronRight, FileText, ArrowLeft, Calendar, Users, ShieldCheck, Star, Loader2, EyeOff, ArrowRight, Video, Image, Play, Volume2, VolumeX, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext'; 
import { User, AdoptionInquiry, Shelter } from '../types';
import { api } from '../services/api';

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
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false); 

  // Success State for Application
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const [copySuccess, setCopySuccess] = useState(false);
  
  const [donationAmount, setDonationAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [isRedirectingToPay, setIsRedirectingToPay] = useState(false);

  // Gallery Logic
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Shelter State
  const [shelter, setShelter] = useState<Shelter | null>(null);

  // Logic checks
  const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
  const isRegularUser = currentUser && !isShelter;
  const isAlreadyAdopted = isRegularUser && (currentUser as User).virtualAdoptions?.some(a => a.petId === pet?.id);
  
  // Check if user already sent an application for this pet
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
  }, [pet]);

  // Reset success state when modal opens
  useEffect(() => {
      if (isApplicationModalOpen) {
          setApplicationSuccess(false);
          setApplicationMessage('');
      }
  }, [isApplicationModalOpen]);

  // Logic for Similar Pets
  const similarPets = useMemo(() => {
    if (!pet) return [];
    
    // 1. Try to find pets of SAME TYPE first
    let matches = pets.filter(p => 
        p.id !== pet.id && 
        p.type === pet.type && 
        p.adoptionStatus === 'Available' &&
        p.isVisible
    );

    // 2. If not enough (less than 3), fill with ANY available pets
    if (matches.length < 3) {
        const others = pets.filter(p => 
            p.id !== pet.id && 
            p.type !== pet.type && 
            p.adoptionStatus === 'Available' &&
            p.isVisible
        );
        matches = [...matches, ...others];
    }

    return matches.slice(0, 3);
  }, [pet, pets]);

  // --- Logic for Gallery (Separate Photos and Video) ---
  const photos = useMemo(() => {
      if (!pet) return [];
      return [pet.imageUrl, ...(pet.gallery || [])].filter(Boolean);
  }, [pet]);
  
  const uniquePhotos = useMemo(() => Array.from(new Set(photos)), [photos]);
  const hasVideo = !!pet?.videoUrl;

  // --- Lightbox Navigation ---
  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      setLightboxIndex(prev => (prev !== null ? (prev - 1 + uniquePhotos.length) % uniquePhotos.length : null));
  }, [uniquePhotos.length]);

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      setLightboxIndex(prev => (prev !== null ? (prev + 1) % uniquePhotos.length : null));
  }, [uniquePhotos.length]);

  // Keyboard support for Lightbox
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
    return <div className="p-20 text-center text-gray-500 font-medium">Zvieratko sa nenašlo alebo nie je verejne dostupné. <br/><Link to="/pets" className="text-brand-600 underline mt-4 inline-block">Späť na zoznam</Link></div>;
  }

  // --- Helper to parse video URL ---
  const getVideoEmbedUrl = (url: string) => {
      let embedUrl = url;
      let isEmbed = false;

      // Handle standard YouTube links
      const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (ytMatch && ytMatch[1]) {
          embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
          isEmbed = true;
      }
      // Handle Vimeo (Basic)
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
          embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
          isEmbed = true;
      }

      // Append Autoplay params if it is an embed
      if (isEmbed) {
          const separator = embedUrl.includes('?') ? '&' : '?';
          return `${embedUrl}${separator}autoplay=1&mute=1&background=1&playsinline=1`;
      }
      
      return url; // Return original for raw mp4 or unknown types
  };

  // --- Handlers ---

  const handleInterestClick = () => {
    if (!currentUser) {
      setIsLoginPromptOpen(true);
    } else {
      setIsApplicationModalOpen(true);
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
        showToast("Chyba pri odosielaní", "error");
    } finally {
        setIsSubmittingApp(false);
    }
  };

  const handleDonate = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : donationAmount;
    if (finalAmount > 0) {
      setIsRedirectingToPay(true);
      try {
        // Získame URL na Stripe Checkout
        const checkoutUrl = await api.createPaymentSession(pet.id, finalAmount);
        
        // Presmerovanie
        window.location.href = checkoutUrl;
      } catch (e) {
        showToast("Chyba pri presmerovaní na platobnú bránu", "error");
        setIsRedirectingToPay(false);
      }
    }
  };

  const currentUrl = window.location.href;
  const shareText = `Pozri sa na tohto úžasného miláčika menom ${pet.name} na LabkaNádeje!`;

  const socialLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(`Adopcia: ${pet.name}`)}&body=${encodeURIComponent(shareText + '\n\n' + currentUrl)}`
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      showToast("Odkaz skopírovaný do schránky", "info");
      setTimeout(() => setCopySuccess(false), 2000);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = status === 'Vhodný' ? 'bg-green-100 text-green-700 ring-green-600/20' : 
                  status === 'Nevhodný' ? 'bg-red-100 text-red-700 ring-red-600/20' : 
                  status === 'Opatrne' ? 'bg-amber-100 text-amber-700 ring-amber-600/20' : 'bg-gray-100 text-gray-600 ring-gray-600/20';
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${styles}`}>
            {status}
        </span>
    );
  };

  const BooleanItem = ({ label, value }: { label: string, value: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
        <span className="text-gray-600 text-sm font-medium">{label}</span>
        {value 
          ? <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold"><CheckCircle size={16} className="fill-green-100" /> Áno</div> 
          : <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium"><XCircle size={16} /> Nie</div>
        }
    </div>
  );

  // Reuseable Sidebar Content (To use in both Mobile and Desktop views)
  const sidebarContent = (
    <div className="space-y-6">
        {/* Main Info Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{pet.name}</h1>
                <p className="text-gray-500 font-medium flex items-center gap-1.5">
                    {pet.breed}
                </p>
                {/* Admin/Owner Warning for Hidden Pets */}
                {!pet.isVisible && (
                    <div className="mt-3 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-gray-200">
                        <EyeOff size={12}/> Skrytý inzerát (vidíte len vy)
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-4 mb-8">
                 <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl min-w-[80px]">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Vek</div>
                    <div className="font-bold text-gray-900">{pet.age} {pet.age === 1 ? 'rok' : 'rokov'}</div>
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

            {/* ADOPTION BUTTONS - Hidden for Shelters */}
            {!isShelter ? (
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
                        <button 
                            onClick={() => setIsVirtualAdoptionModalOpen(true)}
                            className="w-full py-3 px-6 rounded-2xl font-bold text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition flex items-center justify-center gap-2"
                        >
                            <Heart size={18} /> Virtuálne adoptovať
                        </button>
                    )}
                    
                    {isAlreadyAdopted && (
                        <Link to="/profile" className="block w-full text-center py-3 px-6 rounded-2xl font-bold text-green-700 bg-green-50 border border-green-100 hover:bg-green-100 transition">
                            Spravovať adopciu
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500 border border-gray-100">
                    {isOwner ? (
                        <>Toto je váš inzerát. <Link to="/shelter" className="text-brand-600 font-bold hover:underline">Upraviť v Dashboarde</Link></>
                    ) : (
                        "Ste prihlásený ako útulok. Pre adopciu sa prosím prihláste ako bežný užívateľ."
                    )}
                </div>
            )}

            {pet.adoptionFee > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Adopčný poplatok</p>
                    <p className="text-2xl font-extrabold text-gray-900">{pet.adoptionFee} €</p>
                </div>
            )}
        </div>

        {/* Shelter Info */}
        <Link to={`/shelters/${pet.shelterId}`} className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-1 shadow-sm group-hover:border-brand-200 transition">
                    {shelter?.logoUrl ? (
                        <img src={shelter.logoUrl} alt={shelter.name} className="w-full h-full object-contain" />
                    ) : (
                        <Building2 size={24} className="text-gray-300" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-0.5">Útulok</div>
                    <h4 className="font-bold text-gray-900 truncate group-hover:text-brand-600 transition">{shelter?.name || 'Načítavam...'}</h4>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-brand-600" />
            </div>
            
            <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl">
                    <MapPin size={16} className="text-gray-400"/>
                    <span className="truncate">{shelter?.location || pet.location}</span>
                </div>
            </div>
        </Link>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
            <Link to="/pets" className="inline-flex items-center text-gray-500 hover:text-brand-600 font-bold transition">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 border border-gray-200">
                     <ArrowLeft size={16} />
                </div>
                Späť na zoznam
            </Link>
            
            <div className="flex gap-2">
                 <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2.5 bg-white text-gray-600 hover:text-brand-600 rounded-full shadow-sm border border-gray-200 transition"
                    title="Zdieľať"
                 >
                     <Share2 size={20} />
                 </button>
                 
                 {!isShelter && (
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(pet.id);
                            if (!isFavorite(pet.id)) showToast("Pridané do obľúbených", "success");
                        }}
                        className={`p-2.5 rounded-full shadow-sm border transition ${
                            isFavorite(pet.id) 
                            ? 'bg-red-50 text-red-500 border-red-100' 
                            : 'bg-white text-gray-400 border-gray-200 hover:text-red-500'
                        }`}
                        title="Pridať do obľúbených"
                     >
                        <Heart size={20} className={isFavorite(pet.id) ? 'fill-current' : ''} />
                     </button>
                 )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-20">
            
            {/* LEFT COLUMN: Gallery & Main Content */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* SPLIT MEDIA SECTION */}
                <div className={`grid gap-6 ${hasVideo ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    
                    {/* LEFT SIDE: PHOTOS (Responsive height: smaller if video exists, larger if not) */}
                    <div className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative flex flex-col h-full ${hasVideo ? 'min-h-[300px]' : 'min-h-[500px]'}`}>
                        <div className="relative flex-1 rounded-2xl overflow-hidden bg-gray-100 group mb-4">
                            <img 
                                src={uniquePhotos[activePhotoIndex]} 
                                alt={pet.name} 
                                className="w-full h-full object-cover cursor-zoom-in transition duration-500 absolute inset-0"
                                onClick={() => setLightboxIndex(activePhotoIndex)}
                            />
                            <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                                {pet.needsFoster && (
                                    <span className="px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-lg">
                                        Hľadá dočasku
                                    </span>
                                )}
                                {pet.adoptionStatus !== 'Available' && (
                                    <span className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg ${
                                        pet.adoptionStatus === 'Reserved' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-white'
                                    }`}>
                                        {pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                                    </span>
                                )}
                            </div>
                            <button 
                                onClick={() => setLightboxIndex(activePhotoIndex)}
                                className="absolute bottom-4 right-4 p-2 bg-white/90 rounded-full shadow-sm text-gray-700 hover:text-brand-600 transition opacity-0 group-hover:opacity-100"
                            >
                                <ZoomIn size={20} />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {uniquePhotos.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-1 px-1 custom-scrollbar mt-auto h-16 flex-shrink-0">
                                {uniquePhotos.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActivePhotoIndex(idx)}
                                        className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                                            activePhotoIndex === idx ? 'border-brand-600 ring-2 ring-brand-100 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: VIDEO (Reels Format Optimized - Reduced max-height) */}
                    {hasVideo && pet.videoUrl && (
                        <div className="flex flex-col h-full justify-start">
                            <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-black aspect-[9/16] max-h-[450px] mx-auto md:mx-0 md:w-full md:max-w-xs lg:max-w-full">
                                {/* Try iframe first for YouTube/Vimeo */}
                                {pet.videoUrl.includes('youtube') || pet.videoUrl.includes('youtu.be') || pet.videoUrl.includes('vimeo') ? (
                                    <iframe 
                                        src={getVideoEmbedUrl(pet.videoUrl)}
                                        title="Pet Video"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; playsinline"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    /* Fallback to standard video tag for direct MP4 links/uploads */
                                    <video 
                                        controls 
                                        autoPlay 
                                        muted 
                                        loop 
                                        playsInline 
                                        className="w-full h-full absolute inset-0 object-cover"
                                    >
                                        <source src={pet.videoUrl} type="video/mp4" />
                                        Váš prehliadač nepodporuje video tag.
                                    </video>
                                )}
                                
                                {/* Overlay Controls Hint (Optional) */}
                                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm p-1.5 rounded-full text-white/70 pointer-events-none">
                                    <VolumeX size={16} />
                                </div>
                            </div>
                            <div className="mt-3 text-center md:text-left">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                    <Video size={14} className="text-brand-500" /> Video ukážka
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* MOBILE ONLY: Sidebar content shown below gallery */}
                <div className="block lg:hidden">
                    {sidebarContent}
                </div>

                {/* ABOUT & STORY */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
                            <Info size={24} />
                        </div>
                        Môj príbeh
                    </h2>
                    <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed">
                        <p className="whitespace-pre-wrap">{pet.description}</p>
                    </div>

                    {pet.importantNotes && (
                        <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4 items-start">
                            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h4 className="font-bold text-amber-900 mb-1">Dôležité upozornenie</h4>
                                <p className="text-amber-800 text-sm leading-relaxed">{pet.importantNotes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* DETAILS GRID */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Requirements */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                             <Home size={20} className="text-brand-600" /> Ideálny domov
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-1"><CheckCircle size={12}/> Vhodný pre</div>
                                <div className="flex flex-wrap gap-2">
                                    {pet.requirements.suitableFor.length > 0 ? pet.requirements.suitableFor.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">{tag}</span>
                                    )) : <span className="text-gray-400 text-sm">-</span>}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1"><XCircle size={12}/> Nevhodný pre</div>
                                <div className="flex flex-wrap gap-2">
                                    {pet.requirements.unsuitableFor.length > 0 ? pet.requirements.unsuitableFor.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100">{tag}</span>
                                    )) : <span className="text-gray-400 text-sm">-</span>}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Úroveň aktivity</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        pet.requirements.activityLevel === 'Vysoká' ? 'bg-orange-100 text-orange-700' :
                                        pet.requirements.activityLevel === 'Stredná' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {pet.requirements.activityLevel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compatibility */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users size={20} className="text-brand-600" /> Znášanlivosť
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 font-medium text-gray-700"><Baby size={18} className="text-gray-400"/> Deti</div>
                                <StatusBadge status={pet.social.children} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 font-medium text-gray-700"><Dog size={18} className="text-gray-400"/> Psi</div>
                                <StatusBadge status={pet.social.dogs} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 font-medium text-gray-700"><Cat size={18} className="text-gray-400"/> Mačky</div>
                                <StatusBadge status={pet.social.cats} />
                            </div>
                        </div>
                    </div>

                    {/* Health */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Stethoscope size={20} className="text-brand-600" /> Zdravotný stav
                        </h3>
                        <div className="space-y-1">
                            <BooleanItem label="Očkovanie" value={pet.health.isVaccinated} />
                            <BooleanItem label="Odčervenie" value={pet.health.isDewormed} />
                            <BooleanItem label="Kastrácia" value={pet.health.isCastrated} />
                            <BooleanItem label="Čipovanie" value={pet.health.isChipped} />
                        </div>
                        {pet.health.hasAllergies && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
                                <strong>Alergie:</strong> {pet.health.allergiesDescription}
                            </div>
                        )}
                    </div>
                     
                    {/* Training */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-brand-600" /> Výchova
                        </h3>
                        <div className="space-y-1">
                            <BooleanItem label="Hygienické návyky" value={pet.training.toiletTrained} />
                            <BooleanItem label="Chôdza na vodítku" value={pet.training.leashTrained} />
                            <BooleanItem label="Cestovanie autom" value={pet.training.carTravel} />
                            <BooleanItem label="Zvláda samotu" value={pet.training.aloneTime} />
                        </div>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: Sticky Sidebar (Desktop Only) */}
            <div className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
                {sidebarContent}
            </div>
        </div>

        {/* --- SIMILAR PETS SECTION --- */}
        {similarPets.length > 0 && (
            <section className="border-t border-gray-200 pt-16 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Mohlo by vás zaujímať</h2>
                        <p className="mt-2 text-gray-500">Ďalšie zvieratká, ktoré hľadajú domov.</p>
                    </div>
                    <Link to="/pets" className="hidden sm:flex items-center text-brand-600 font-bold hover:text-brand-700 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow transition">
                        Všetky zvieratá <ArrowRight size={20} className="ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {similarPets.map((simPet) => (
                        <Link key={simPet.id} to={`/pets/${simPet.id}`} className="group block h-full">
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col transform hover:-translate-y-1">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img 
                                        src={simPet.imageUrl} 
                                        alt={simPet.name} 
                                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold text-gray-800 shadow-sm">
                                        {simPet.age} {simPet.age === 1 ? 'rok' : 'rokov'}
                                    </div>
                                    <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider">
                                        {simPet.breed}
                                    </div>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-brand-600 transition">{simPet.name.replace(/\*\*/g, '')}</h3>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                                            <MapPin size={14} className="mr-1.5" />
                                            {simPet.location}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition shadow-sm">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

      </div>

      {/* 1. Login Required Prompt Modal */}
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                 <LogIn className="text-brand-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vyžaduje sa prihlásenie</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Aby ste mohli odoslať žiadosť o adopciu a kontaktovať útulok, musíte mať vytvorený účet.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={() => navigate('/auth')}
                    className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition"
                 >
                    Prihlásiť / Registrovať
                 </button>
                 <button 
                    onClick={() => setIsLoginPromptOpen(false)}
                    className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                 >
                    Zrušiť
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 2. Adoption Application Form Modal */}
      {isApplicationModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
               
               {applicationSuccess ? (
                   /* SUCCESS STATE */
                   <div className="p-8 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
                       <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                           <CheckCircle size={48} className="text-green-600" />
                       </div>
                       <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Žiadosť odoslaná!</h3>
                       <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                           Ďakujeme za záujem. Vaša správa bola úspešne doručená útulku <strong>{shelter?.name}</strong>.
                       </p>
                       
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full mb-8 text-left flex items-start gap-3">
                           <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm"><FileText size={20}/></div>
                           <div>
                               <p className="font-bold text-gray-900 text-sm">Čo teraz?</p>
                               <p className="text-xs text-gray-500 mt-1">Útulok vás bude kontaktovať na váš email alebo telefón. Stav žiadosti môžete sledovať vo svojom profile.</p>
                           </div>
                       </div>

                       <div className="flex flex-col gap-3 w-full">
                           <button 
                               onClick={() => navigate('/profile')}
                               className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-200"
                           >
                               Prejsť do profilu
                           </button>
                           <button 
                               onClick={() => setIsApplicationModalOpen(false)}
                               className="w-full bg-white text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition"
                           >
                               Zavrieť okno
                           </button>
                       </div>
                   </div>
               ) : (
                   /* FORM STATE */
                   <>
                       <div className="bg-brand-600 p-6 text-white flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">Žiadosť o adopciu: {pet.name}</h3>
                            <p className="text-brand-100 text-sm mt-1">Útulok vás bude kontaktovať na základe tejto správy.</p>
                          </div>
                          <button onClick={() => setIsApplicationModalOpen(false)} className="text-white hover:bg-brand-700 rounded-full p-1"><X size={20}/></button>
                       </div>
                       <form onSubmit={handleApplicationSubmit} className="p-6">
                           <div className="mb-4">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Vaša správa pre útulok</label>
                              <textarea 
                                required
                                className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-white text-gray-900 resize-none"
                                placeholder="Dobrý deň, mám vážny záujem o adopciu. Bývam v dome so záhradou..."
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                              ></textarea>
                           </div>
                           
                           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 text-sm text-blue-800">
                              <h4 className="font-bold flex items-center gap-2 mb-1"><Info size={16}/> Čo sa stane potom?</h4>
                              <p>Útulok dostane vašu správu spolu s vašimi kontaktnými údajmi z profilu (Email, Telefón). Odpoveď dostanete emailom.</p>
                           </div>

                           <button 
                             type="submit"
                             disabled={isSubmittingApp}
                             className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
                           >
                             {isSubmittingApp ? 'Odosielam...' : <><Send size={18} /> Odoslať nezáväznú žiadosť</>}
                           </button>
                       </form>
                   </>
               )}
           </div>
        </div>
      )}

      {/* 3. Virtual Adoption Modal */}
      {isVirtualAdoptionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Virtuálna adopcia</h3>
                <p className="text-brand-100 text-sm mt-1">Podporte {pet.name} mesačným príspevkom.</p>
              </div>
              <button onClick={() => setIsVirtualAdoptionModalOpen(false)} className="text-white hover:bg-brand-700 rounded-full p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Vyberte výšku príspevku:</label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[5, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => { setDonationAmount(amount); setCustomAmount(''); }}
                    className={`py-3 rounded-xl border-2 font-bold transition ${
                      donationAmount === amount && !customAmount
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-brand-200'
                    }`}
                  >
                    {amount} €
                  </button>
                ))}
              </div>

              <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Alebo zadajte vlastnú sumu:</label>
                 <div className="relative">
                   <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Iná suma"
                    className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                   />
                   <span className="absolute right-4 top-3 text-gray-500 font-bold">€</span>
                 </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg mb-6">
                <Info size={16} className="flex-shrink-0" />
                Budete presmerovaný na bezpečnú platobnú bránu Stripe.
              </div>

              <button 
                onClick={handleDonate}
                disabled={isRedirectingToPay}
                className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isRedirectingToPay ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Prejsť k platbe</>}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 4. Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Zdieľať {pet.name}</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                      <Facebook size={24} />
                      <span className="text-xs font-bold">Facebook</span>
                  </a>
                  <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition">
                      <MessageCircle size={24} />
                      <span className="text-xs font-bold">WhatsApp</span>
                  </a>
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 text-black hover:bg-gray-200 transition">
                      <Twitter size={24} />
                      <span className="text-xs font-bold">Twitter</span>
                  </a>
                  <a href={socialLinks.email} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition">
                      <Mail size={24} />
                      <span className="text-xs font-bold">Email</span>
                  </a>
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Kopírovať odkaz</label>
                 <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate flex items-center gap-2">
                        <LinkIcon size={14} className="text-gray-400 flex-shrink-0" />
                        {currentUrl}
                    </div>
                    <button 
                        onClick={copyToClipboard}
                        className={`p-2 rounded-lg border transition ${copySuccess ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {copySuccess ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Lightbox / Gallery Modal (For photos only) */}
      {lightboxIndex !== null && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setLightboxIndex(null)}
        >
            <button 
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-[101]"
                onClick={() => setLightboxIndex(null)}
            >
                <X size={36} />
            </button>
            
            {uniquePhotos.length > 1 && (
                <>
                    <button 
                        onClick={handlePrevImage} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-[101]"
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <button 
                        onClick={handleNextImage} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-[101]"
                    >
                        <ChevronRight size={48} />
                    </button>
                </>
            )}
            
            <img 
                src={uniquePhotos[lightboxIndex]} 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200" 
                onClick={(e) => e.stopPropagation()} 
                alt="Enlarged view"
            />
        </div>
      )}
      
      {/* Helper Component for Icon - Home */}
      <div className="hidden">
        <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
             <Info size={24} />
        </div>
        <Home size={20} className="text-brand-600" />
      </div>

    </div>
  );
};

// Helper Icon
const Home = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
)

export default PetDetailPage;