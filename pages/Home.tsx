
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, PawPrint, Heart, Building2, User, Calendar, Gift,
  ShieldCheck, Star, Home as HomeIcon, Cat, Dog, Sparkles,
  ShoppingBag, Stethoscope, ExternalLink, MapPin, Facebook,
  Instagram, Search as SearchIcon, Zap, Utensils, Shield, Megaphone,
  Award, FileCheck, MessageCircle, Users
} from 'lucide-react';
import { usePets } from '../contexts/PetContext';
import { useAuth } from '../contexts/AuthContext';
import { PetType, BlogPost, PromoSlide } from '../types';
import AdBanner from '../components/AdBanner';
import PetCardImageSlider from '../components/PetCardImageSlider';
import { api } from '../services/api';
import { formatSlovakAge } from '../utils/formatters';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

// Visual styles configuration to maintain the aesthetic design
const SLIDE_STYLES = [
  {
    blobColor: 'bg-brand-200',
    accentColor: 'text-brand-600',
    blobPos: 'top-0 right-0',
    secondaryBlob: 'bg-yellow-200',
    tertiaryBlob: 'bg-pink-200'
  },
  {
    blobColor: 'bg-blue-200',
    accentColor: 'text-blue-600',
    blobPos: 'bottom-0 left-0',
    secondaryBlob: 'bg-indigo-200',
    tertiaryBlob: 'bg-cyan-200'
  },
  {
    blobColor: 'bg-green-200',
    accentColor: 'text-green-600',
    blobPos: 'top-1/2 left-1/2',
    secondaryBlob: 'bg-lime-200',
    tertiaryBlob: 'bg-emerald-200'
  }
];

// Fallback Mock Data for the Ads Slider if DB is empty
const MOCK_PROMO_SLIDES: PromoSlide[] = [
  {
    id: "1",
    badge: "Partner",
    title: "Prémiové krmivo HappyPaw",
    description: "Doprajte svojmu chlpáčovi to najlepšie. Vyvážené zloženie, čerstvé mäso a vitamíny pre dlhý život. Teraz so zľavou 20% na prvý nákup.",
    cta: "Kúpiť so zľavou",
    link: "#",
    imageUrl: "https://images.unsplash.com/photo-1589924691195-41432c84c161?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    iconType: "shopping"
  },
  {
    id: "2",
    badge: "Služby",
    title: "Veterinárna Klinika Nonstop",
    description: "Sme tu pre vás 24/7. Moderné vybavenie, skúsený tím a citlivý prístup ku každému pacientovi. Preventívne prehliadky zdarma pre adoptované zvieratá.",
    cta: "Objednať sa online",
    link: "#",
    imageUrl: "https://images.unsplash.com/photo-1628009368231-76033527212e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    iconType: "health"
  }
];
const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '10 tipov pre prvého psíka',
    summary: 'Príchod nového člena rodiny je vzrušujúci, ale aj náročný. Pripravili sme pre vás zoznam vecí, na ktoré by ste nemali zabudnúť.',
    content: [],
    imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    date: new Date().toISOString(),
    author: 'Tím Labka'
  },
  {
    id: '2',
    title: 'Prečo adoptovať staršieho psa?',
    summary: 'Šteniatka sú roztomilé, ale starší psíkovia majú svoje nezameniteľné čaro. Sú pokojnejší, vďačnejší a často už majú hygienické návyky.',
    content: [],
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: 'Jana z útulku'
  },
  {
    id: '3',
    title: 'Ako kŕmiť pre zdravú srsť',
    summary: 'Strava má obrovský vplyv na zdravie a vzhľad vášho miláčika. Pozreli sme sa na to, ktoré vitamíny a minerály sú kľúčové.',
    content: [],
    imageUrl: 'https://images.unsplash.com/photo-1589924691195-41432c84c161?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: 'MVDr. Novák'
  }
];

const ICON_MAP = {
  shopping: ShoppingBag,
  health: Stethoscope,
  shield: ShieldCheck,
  star: Star
};

const COLOR_MAP = {
  shopping: { bg: "bg-orange-50", text: "text-orange-600" },
  health: { bg: "bg-blue-50", text: "text-blue-600" },
  shield: { bg: "bg-green-50", text: "text-green-600" },
  star: { bg: "bg-purple-50", text: "text-purple-600" }
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { pets } = usePets();
  const { userRole, currentUser } = useAuth();
  const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';

  // Blog posts state
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  // Promo Slides State
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>([]);
  // Platform Stats - Fixed numbers per user request (too slow to load dynamically)
  const [stats] = useState({ waiting: 18, adopted: '10+', shelters: 4 });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await api.getBlogPosts(3);
        if (posts.length > 0) {
          setRecentPosts(posts);
        } else {
          setRecentPosts(MOCK_BLOG_POSTS);
        }

        const slides = await api.getPromoSlides();
        if (slides.length > 0) {
          setPromoSlides(slides);
        } else {
          setPromoSlides(MOCK_PROMO_SLIDES);
        }

        // Stats are now hardcoded
      } catch (error) {
        console.error("Failed to load home data", error);
        setPromoSlides(MOCK_PROMO_SLIDES);
        setRecentPosts(MOCK_BLOG_POSTS);
      }
    };
    fetchData();
  }, []);

  // Get top 3-5 available pets for the hero slider
  const heroPets = useMemo(() => {
    return pets
      .filter(p => p.adoptionStatus === 'Available' && p.isVisible && p.imageUrl)
      .slice(0, 5); // Take up to 5 pets
  }, [pets]);

  const moveHeroPets = useMemo(() => {
    return pets
      .filter(p => p.adoptionStatus === 'Available' && p.isVisible && p.imageUrl)
      .slice(0, 5);
  }, [pets]); // Keeping hero stable for now, or could randomize too if desired.

  const featuredPets = useMemo(() => {
    const available = pets.filter(p => p.adoptionStatus === 'Available' && p.isVisible);
    // Fisher-Yates shuffle
    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 6);
  }, [pets]);
  const fosterPets = pets.filter(p => p.needsFoster && p.isVisible).slice(0, 3);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate Hero slides
  useEffect(() => {
    if (heroPets.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPets.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPets.length]);



  // Helper to determine icon based on pet type
  const getPetIcon = (type: PetType) => {
    switch (type) {
      case PetType.DOG: return Dog;
      case PetType.CAT: return Cat;
      default: return PawPrint;
    }
  };

  // Safe Image Optimization Helper
  const getOptimizedImageUrl = (url: string, width: number = 800) => {
    if (!url) return '';
    if (url.includes('images.unsplash.com')) {
      // If it already has params, we want to replace/append carefully.
      // Easiest strategy for Unsplash: strip existing params and add our own, 
      // OR parse it. But stripping is safer to enforce size.
      // However, some IDs need the params? No, Unsplash source usually works with just the path.
      // Let's try to append cleanly.
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}auto=format&fit=crop&w=${width}&q=80&format=webp`;
    }
    return url;
  };


  return (
    <div className="overflow-x-hidden">
      <SEO />
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-brand-50 pt-16 pb-32 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-yellow-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Text & CTA */}
            <div className="text-center lg:text-left animate-in slide-in-from-bottom-10 duration-700">

              <h1 className="text-4xl lg:text-7xl font-black text-gray-900 tracking-tighter mb-8 leading-[1.1]">
                {t('home.heroTitleStart')} <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500">
                  {t('home.heroTitleEnd')}
                  <svg className="absolute w-full h-4 -bottom-2 left-0 text-brand-200/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {t('home.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mb-14">
                <Link
                  to="/pets"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-all shadow-[0_10px_40px_-10px_rgba(234,88,12,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(234,88,12,0.6)] transform hover:-translate-y-1"
                >
                  <SearchIcon size={22} className="mr-2 group-hover:scale-110 transition-transform" />
                  {t('home.heroButton')}
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                {!isShelter && (
                  <Link
                    to="/match"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-brand-900 bg-white border-2 border-brand-100 hover:bg-brand-50 hover:border-brand-200 transition-all shadow-lg shadow-brand-100/50 hover:shadow-xl hover:-translate-y-1 gap-2"
                  >
                    <Sparkles size={20} className="text-brand-600" />
                    <span>Labka Match</span>
                    <span className="hidden lg:inline bg-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ml-1">Kvíz</span>
                  </Link>
                )}
                {isShelter && (
                  <Link
                    to="/shelter"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition shadow-sm hover:shadow-md"
                  >
                    Môj Dashboard
                  </Link>
                )}
              </div>

              {/* REPLACEMENT: Quick Categories instead of Social Proof */}
              <div className="flex flex-col items-center lg:items-start gap-4 animate-in fade-in duration-1000 delay-500">
                <p className="text-[10px] font-black text-gray-400 ml-1">{t('home.quickSearch.title')}</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <Link to="/pets?type=Pes" className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 hover:text-brand-600 hover:shadow-md transition group">
                    <div className="p-1.5 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition"><Dog size={16} className="text-brand-600" /></div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-brand-700 transition">{t('home.quickSearch.dogs')}</span>
                  </Link>
                  <Link to="/pets?type=Mačka" className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 hover:text-brand-600 hover:shadow-md transition group">
                    <div className="p-1.5 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition"><Cat size={16} className="text-orange-600" /></div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-brand-700 transition">{t('home.quickSearch.cats')}</span>
                  </Link>
                  <Link to="/pets" className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 hover:text-brand-600 hover:shadow-md transition group">
                    <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition"><PawPrint size={16} className="text-gray-400" /></div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-brand-700 transition">{t('home.quickSearch.all')}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Slider (REAL PETS) */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              {heroPets.length > 0 ? (
                <div className="relative w-full max-w-lg aspect-square">

                  {/* Dynamic Blobs based on active slide color */}
                  {heroPets.map((_, index) => {
                    const style = SLIDE_STYLES[index % SLIDE_STYLES.length];
                    return (
                      <div key={`blob-${index}`} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}>
                        <div className={`absolute inset-4 ${style.blobColor} rounded-full animate-blob mix-blend-multiply filter blur-xl opacity-70`}></div>
                        <div className={`absolute top-0 -right-4 w-72 h-72 ${style.secondaryBlob} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000`}></div>
                        <div className={`absolute -bottom-8 left-20 w-72 h-72 ${style.tertiaryBlob} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000`}></div>
                      </div>
                    );
                  })}

                  {/* Stacked Images for Fade Effect */}
                  {heroPets.map((pet, index) => {
                    const isActive = currentSlide === index;
                    const style = SLIDE_STYLES[index % SLIDE_STYLES.length];
                    const PetIcon = getPetIcon(pet.type);

                    return (
                      <Link
                        to={`/pets/${pet.id}`}
                        key={pet.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${isActive ? 'opacity-100 scale-100 z-10 pointer-events-auto' : 'opacity-0 scale-95 z-0 pointer-events-none'
                          }`}
                      >
                        <img
                          src={getOptimizedImageUrl(pet.imageUrl, 800)}
                          alt={pet.name}
                          className="w-full h-full object-cover rounded-[3rem] shadow-2xl rotate-3 border-4 border-white hover:rotate-0 transition-transform duration-500"
                        />

                        {/* Info Card 1 - Top Left */}
                        <div className={`absolute top-10 -left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow transition-transform duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                          <div className={`bg-gray-100 p-2 rounded-full ${style.accentColor}`}>
                            <PetIcon size={24} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold">{t('common.name')}</p>
                            <p className="text-lg font-extrabold text-gray-900">{pet.name.replace(/\*\*/g, '')}</p>
                          </div>
                        </div>

                        {/* Info Card 2 - Bottom Right */}
                        <div className={`absolute bottom-10 -right-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow animation-delay-2000 transition-transform duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                          <div className={`bg-gray-100 p-2 rounded-full ${style.accentColor}`}>
                            <Sparkles size={24} fill="currentColor" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold">{t('common.years', { count: pet.age })}</p>
                            <p className="text-sm font-extrabold text-gray-900">{pet.breed}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Navigation Dots */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                    {heroPets.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-brand-600 w-8' : 'bg-gray-300 hover:bg-brand-400'
                          }`}
                      />
                    ))}
                  </div>

                </div>
              ) : (
                // Empty State Placeholder if no pets loaded yet
                <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
                  <div className="absolute inset-4 bg-gray-100 rounded-full animate-pulse"></div>
                  <div className="z-10 text-center">
                    <PawPrint size={48} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 font-bold">Načítavam chlpáčov...</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full leading-none z-10">
          <svg className="block w-full h-12 md:h-24 lg:h-32 text-white" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats / Info Banner */}
      <section className="bg-white pb-20 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-brand-100 text-brand-600 rounded-2xl mb-4">
                <PawPrint size={32} />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{stats.waiting}</h3>
              <p className="text-gray-600 font-medium">{t('home.stats.waiting')}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-brand-100 text-brand-600 rounded-2xl mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{stats.adopted}</h3>
              <p className="text-gray-600 font-medium">{t('home.stats.adopted')}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-brand-100 text-brand-600 rounded-2xl mb-4">
                <Building2 size={32} />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{stats.shelters}</h3>
              <p className="text-gray-600 font-medium">{t('home.stats.shelters')}</p>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Pets (Urgent) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('home.featured.title')}</h2>
              <p className="mt-2 text-gray-600">{t('home.featured.subtitle')}</p>
            </div>
            <Link to="/pets" className="hidden sm:flex items-center text-brand-600 font-bold hover:text-brand-700 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow transition">
              {t('home.featured.viewAll')} <ArrowRight size={20} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPets.map((pet, index) => (
              <div key={pet.id} className={`group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 ${index >= 3 ? 'hidden md:block' : ''}`}>
                <PetCardImageSlider pet={pet} aspectRatio="aspect-square" />

                <Link to={`/pets/${pet.slug || pet.id}`} className="block p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-brand-600 transition">{pet.name.replace(/\*\*/g, '')}</h3>
                    <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-lg">{pet.breed}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {pet.description.replace(/\*\*/g, '')}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-400 text-xs font-bold">
                      <MapPin size={14} className="mr-1.5" />
                      {pet.location}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition shadow-sm">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Mobile CTA Button */}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/pets" className="inline-flex items-center text-brand-600 font-bold hover:text-brand-700 bg-white border border-gray-100 px-6 py-3 rounded-full shadow-sm hover:shadow transition w-full justify-center">
              {t('home.featured.viewAll')} <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-50/50 rounded-full blur-3xl mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('home.howItWorks.title')}</h2>
            <p className="text-xl text-gray-600 leading-relaxed">{t('home.howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-brand-200 to-gray-200 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl border-2 border-gray-100 shadow-xl flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 group-hover:border-brand-200 group-hover:text-brand-700 transition duration-300">
                <SearchIcon size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('home.howItWorks.step1Title')}</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                {t('home.howItWorks.step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl border-2 border-gray-100 shadow-xl flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 group-hover:border-brand-200 group-hover:text-brand-700 transition duration-300">
                <MessageCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('home.howItWorks.step2Title')}</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                {t('home.howItWorks.step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl border-2 border-gray-100 shadow-xl flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 group-hover:border-brand-200 group-hover:text-brand-700 transition duration-300">
                <HomeIcon size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('home.howItWorks.step3Title')}</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                {t('home.howItWorks.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Temporary Foster Care Section */}
      {fosterPets.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <HomeIcon className="text-indigo-600" size={32} />
                  {t('home.foster.title')}
                </h2>
                <p className="mt-2 text-gray-600">
                  {t('home.foster.description')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fosterPets.map((pet) => (
                <div key={pet.id} className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-indigo-100 ring-1 ring-indigo-50 transform hover:-translate-y-1">
                  <PetCardImageSlider pet={pet} aspectRatio="aspect-square" showAgeBadge={false} />

                  {/* Needs specific override for the badge if needed, but the slider has default badges. Foster badge is unique. */}
                  {/* Since PetCardImageSlider encapsulates badges, the foster badge "Dočasná opatera" won't show unless I add it to props or overlay it locally. The slider has `relative` so I can't easily overlay from outside without z-index hacks. I will add children prop or customBadges prop later if needed, but for now the user asked for arrows. I'll stick to standard badges. */}

                  <Link to={`/pets/${pet.id}`} className="block p-6 bg-indigo-50/30">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition">{pet.name.replace(/\*\*/g, '')}</h3>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">{pet.breed}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {pet.description.replace(/\*\*/g, '')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                      <div className="flex items-center text-gray-400 text-xs font-bold">
                        <MapPin size={14} className="mr-1.5" />
                        {pet.location}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Media Community Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{t('home.community.title')}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-lg">
            {t('home.community.description')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="https://www.facebook.com/profile.php?id=61584849571446" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#1877F2] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                <Facebook size={24} />
              </div>
              <span>{t('home.community.facebook')}</span>
            </a>
            <a href="https://www.instagram.com/labka_nadeje/" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                <Instagram size={24} />
              </div>
              <span>{t('home.community.instagram')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* LABKA MATCH PROMO SECTION */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 rounded-[3rem] bg-white/5 border border-white/10 p-8 md:p-16 backdrop-blur-sm">

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6 border border-brand-500/30">
                <Sparkles size={14} />
                Novinka
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Neviete si vybrať? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Nechajte to na Labka Match</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl">
                Odpovedzte na 7 jednoduchých otázok o vašom životnom štýle a naša umelá inteligencia vám nájde parťáka, ktorý k vám sadne ako uliaty.
              </p>
              <Link
                to="/match"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-brand-500/25 transform hover:-translate-y-1"
              >
                Spustiť Labka Match <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>

            <div className="w-full md:w-1/3 relative">
              <div className="aspect-square bg-gradient-to-tr from-brand-500 to-purple-600 rounded-full blur-3xl opacity-20 absolute inset-0 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <HomeIcon size={20} />
                    </div>
                    <div className="h-2 w-32 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Dog size={20} />
                    </div>
                    <div className="h-2 w-40 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-24 bg-brand-500 rounded-lg"></div>
                      <div className="h-8 w-8 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Blog Teaser Section - ORANGE MODE */}
      <section className="py-24 bg-brand-600 text-white relative overflow-hidden">
        {/* Abstract shapes for texture */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-yellow-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t('home.blog.title')}</h2>
            <p className="text-xl text-brand-100">{t('home.blog.subtitle')}</p>
          </div>

          {recentPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
              {recentPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="flex flex-col bg-white overflow-hidden rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-transparent group h-full">
                  <div className="flex-shrink-0 h-52 overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition z-10"></div>
                    <img className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" src={getOptimizedImageUrl(post.imageUrl, 600)} alt={post.title} />
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-brand-600 mb-3">
                        {t('home.blog.tips')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition">
                        {post.title}
                      </p>
                      <p className="mt-4 text-sm text-gray-500 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center pt-6 border-t border-gray-100">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100">
                          <User size={18} />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-bold text-gray-900">
                          {post.author}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5 font-medium">
                          <Calendar size={12} className="mr-1" />
                          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('sk-SK')}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-brand-100 bg-brand-700/30 rounded-2xl border border-dashed border-brand-400">
              {t('home.blog.empty')}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link to="/blog" className="inline-flex items-center px-8 py-3 rounded-full border border-brand-400 text-white font-bold hover:bg-brand-700 transition bg-transparent backdrop-blur-sm">
              {t('home.blog.viewAll')} <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>



      {/* WHY TO ADOPT SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Prečo dať šancu útulkáčovi?</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Adopcia nie je len o získaní domáceho miláčika. Je to rozhodnutie, ktoré mení životy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-orange-50 rounded-[2.5rem] p-8 text-center hover:-translate-y-2 transition duration-300">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 shadow-md border-4 border-white">
                <img
                  src={getOptimizedImageUrl("https://images.unsplash.com/photo-1527362950785-f487a7c1fe48", 300)}
                  alt="Dva životy"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Zachránite dva životy</h3>
              <p className="text-gray-600 leading-relaxed">Adopciou jedného zvieratka uvoľníte miesto v útulku pre ďalšie, ktoré potrebuje pomoc. Stávate sa hrdinom pre dvoch.</p>
            </div>

            <div className="bg-blue-50 rounded-[2.5rem] p-8 text-center hover:-translate-y-2 transition duration-300">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 shadow-md border-4 border-white">
                <img
                  src={getOptimizedImageUrl("https://images.unsplash.com/photo-1510771463146-e89e6e86560e", 300)}
                  alt="Sloboda"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Bojujete proti množiarňam</h3>
              <p className="text-gray-600 leading-relaxed">Adopciou nepodporujete neetický chov a množiarne. Dávate hlas tým, ktorí ho nemajú.</p>
            </div>

            <div className="bg-purple-50 rounded-[2.5rem] p-8 text-center hover:-translate-y-2 transition duration-300">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 shadow-md border-4 border-white">
                <img
                  src={getOptimizedImageUrl("https://images.unsplash.com/photo-1518717758536-85ae29035b6d", 300)}
                  alt="Láska"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Láska bez podmienok</h3>
              <p className="text-gray-600 leading-relaxed">Útulkáči vedia byť neuveriteľne vďační. Získate verného parťáka, ktorý vás bude ľúbiť celým srdcom.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PARTNERS & OFFERS SECTION (GRID) --- */}
      <section className="py-24 bg-white border-t border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl mb-4 text-brand-600">
              <Megaphone size={24} />
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('home.partners.title')}</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">{t('home.partners.subtitle')}</p>
          </div>

          <div className={`grid gap-8 ${promoSlides.length === 1 ? 'grid-cols-1 max-w-6xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
            {promoSlides.map((slide, index) => {
              const colors = COLOR_MAP[slide.iconType as keyof typeof COLOR_MAP] || COLOR_MAP.star;
              const Icon = ICON_MAP[slide.iconType as keyof typeof ICON_MAP] || Star;
              const isSingle = promoSlides.length === 1;

              return (
                <div key={slide.id} className={`group flex ${isSingle ? 'flex-col md:flex-row' : 'flex-col'} bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-brand-100 transition-all duration-500 transform hover:-translate-y-2`}>
                  {/* Card Header / Image */}
                  <div className={`relative overflow-hidden ${isSingle ? 'h-64 md:h-96 md:w-1/2' : 'h-64'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                    <img
                      src={getOptimizedImageUrl(slide.imageUrl, 800)}
                      alt={slide.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6 z-20">
                      <span className="bg-white/90 backdrop-blur-md text-gray-900 text-xs font-black px-4 py-2 rounded-xl shadow-sm flex items-center gap-2">
                        <Icon size={14} className={colors.text} />
                        {slide.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className={`p-8 ${isSingle ? 'md:p-12 justify-center md:w-1/2' : 'flex-1'} flex flex-col relative`}>
                    <h3 className={`${isSingle ? 'text-3xl md:text-4xl' : 'text-2xl'} font-black text-gray-900 mb-4 leading-tight group-hover:text-brand-600 transition-colors`}>
                      {slide.title}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8 line-clamp-3">
                      {slide.description}
                    </p>

                    <div className={`mt-auto ${isSingle ? '' : 'pt-8 border-t border-gray-50'} flex items-center justify-between`}>
                      <a
                        href={slide.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${colors.bg} ${colors.text} group-hover:bg-brand-600 group-hover:text-white`}
                      >
                        {slide.cta} <ArrowRight size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {promoSlides.length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
              Žiadne aktívne ponuky momentálne.
            </div>
          )}
        </div>
      </section>

      {/* --- REIMAGINED VIRTUAL ADOPTION SECTION --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-orange-800 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-[120px] animate-pulse delay-700"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

            <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">

              {/* Content Side */}
              <div className="lg:col-span-7">


                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight">
                  {t('home.virtualAdoption.title')}
                </h2>

                <p className="text-brand-100 text-xl md:text-2xl mb-12 leading-relaxed font-medium">
                  {t('home.virtualAdoption.description')}
                </p>

                {/* Impact Micro-cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                  <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition group">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Award size={20} className="text-yellow-200" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Sieň Slávy</h4>
                    <p className="text-xs text-brand-200 leading-tight">Vaše meno bude navždy svietiť na našej stene pomoci.</p>
                  </div>
                  <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition group">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FileCheck size={20} className="text-blue-200" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Certifikát</h4>
                    <p className="text-xs text-brand-200 leading-tight">Získate oficiálny certifikát virtuálneho rodiča.</p>
                  </div>
                  <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition group">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Heart size={20} className="text-pink-200" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Láska a Správy</h4>
                    <p className="text-xs text-brand-200 leading-tight">Pravidelné fotky a novinky zo života chlpáča.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-center">
                  <button
                    disabled
                    className="inline-flex items-center justify-center px-10 py-5 bg-white/10 text-white/50 font-black text-xs rounded-2xl cursor-not-allowed border-2 border-white/10"
                  >
                    {t('home.virtualAdoption.select')} <span className="ml-3 px-2 py-0.5 bg-white/20 rounded text-[10px] text-white">Čoskoro</span>
                  </button>
                  <button
                    disabled
                    className="inline-flex items-center justify-center px-10 py-5 bg-transparent text-white/30 font-black text-xs rounded-2xl cursor-not-allowed border-2 border-white/10"
                  >
                    {t('home.virtualAdoption.howItWorks')}
                  </button>
                </div>
              </div>

              {/* Visual Side (Mock UI Card) */}
              <div className="lg:col-span-5 relative hidden lg:block">
                <div className="relative group">
                  {/* Shadow pulse */}
                  <div className="absolute inset-0 bg-brand-400 rounded-[2.5rem] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>

                  {/* The "Virtual Parent" Promo Card */}
                  <div className="relative bg-white rounded-[2.5rem] p-6 shadow-2xl text-gray-900 transform rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden border-4 border-white/20">

                    <div className="relative h-64 rounded-3xl overflow-hidden mb-6">
                      <img
                        src="https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&format=webp"
                        alt="Caked dog"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-lg">
                        {t('home.virtualAdoption.mock.needs')}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-black tracking-tight text-gray-900">Bak</h3>
                          <p className="text-xs font-bold text-gray-400">Kríženec • 8 rokov</p>
                        </div>
                        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner">
                          <Heart size={24} fill="currentColor" />
                        </div>
                      </div>

                      {/* Progress Simulation */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 mb-2">
                          <span>{t('home.virtualAdoption.mock.fulfillment')}</span>
                          <span className="text-brand-600">65%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-600 w-[65%] rounded-full shadow-[0_0_10px_rgba(234,88,12,0.3)]"></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-${i * 100 + 100} flex items-center justify-center text-[10px] font-bold text-white`}>
                              <User size={14} />
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-gray-500">{t('home.virtualAdoption.mock.parents')}</span>
                      </div>
                    </div>

                    {/* Glass effect overlays */}
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand-500/20 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div >
  );
};

export default HomePage;
