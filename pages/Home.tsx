
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PawPrint, Heart, Building2, User, Calendar, Gift, ShieldCheck, Star, Home as HomeIcon, Cat, Dog, Sparkles, ShoppingBag, Stethoscope, ExternalLink, MapPin, Facebook, Instagram } from 'lucide-react';
import { usePets } from '../contexts/PetContext';
import { useAuth } from '../contexts/AuthContext';
import { PetType, BlogPost, PromoSlide } from '../types';
import AdBanner from '../components/AdBanner';
import { api } from '../services/api';

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
  const { pets } = usePets();
  const { userRole, currentUser } = useAuth();
  const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
  
  // Blog posts state
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  // Promo Slides State
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await api.getBlogPosts();
        setRecentPosts(posts.slice(0, 3));
        
        const slides = await api.getPromoSlides();
        if (slides.length > 0) {
            setPromoSlides(slides);
        } else {
            setPromoSlides(MOCK_PROMO_SLIDES);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
        setPromoSlides(MOCK_PROMO_SLIDES);
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

  const featuredPets = pets.filter(p => p.adoptionStatus === 'Available' && p.isVisible).slice(0, 3);
  const fosterPets = pets.filter(p => p.needsFoster && p.isVisible).slice(0, 3);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Promo Slider State
  const [currentPromo, setCurrentPromo] = useState(0);

  // Auto-rotate Hero slides
  useEffect(() => {
    if (heroPets.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPets.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPets.length]);

  // Auto-rotate Promo slides
  useEffect(() => {
    if (promoSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promoSlides.length);
    }, 6000); // Slower rotation for reading text
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  // Helper to determine icon based on pet type
  const getPetIcon = (type: PetType) => {
    switch (type) {
        case PetType.DOG: return Dog;
        case PetType.CAT: return Cat;
        default: return PawPrint;
    }
  };

  return (
    <div className="overflow-x-hidden">
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
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
                Nájdi svojho <br />
                <span className="relative inline-block text-brand-600">
                  najlepšieho priateľa
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                     <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Spojili sme srdcia útulkov s tými vašimi. Tisíce zvierat čakajú na druhú šancu. 
                Adoptujte, podporte alebo sa staňte dočasným domovom.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link
                  to="/pets"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-brand-600 hover:bg-brand-700 transition shadow-xl shadow-brand-200 transform hover:-translate-y-1"
                >
                  <SearchIcon className="mr-2" size={20} />
                  Hľadať zvieratko
                </Link>
                {!isShelter && (
                  <Link
                    to="/auth"
                    state={{ role: 'shelter' }} 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm hover:shadow-md"
                  >
                    Pre útulky
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

              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                            <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="User" />
                        </div>
                    ))}
                 </div>
                 <div className="text-left">
                    <div className="flex items-center text-yellow-400">
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                    </div>
                    <p className="text-xs font-bold text-gray-500">1200+ úspešných adopcií</p>
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
                             className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${
                               isActive ? 'opacity-100 scale-100 z-10 pointer-events-auto' : 'opacity-0 scale-95 z-0 pointer-events-none'
                             }`}
                           >
                              <img 
                                  src={pet.imageUrl} 
                                  alt={pet.name} 
                                  className="w-full h-full object-cover rounded-[3rem] shadow-2xl rotate-3 border-4 border-white hover:rotate-0 transition-transform duration-500"
                              />

                              {/* Info Card 1 - Top Left */}
                              <div className={`absolute top-10 -left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow transition-transform duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                                  <div className={`bg-gray-100 p-2 rounded-full ${style.accentColor}`}>
                                      <PetIcon size={24} />
                                  </div>
                                  <div>
                                      <p className="text-xs text-gray-500 font-bold uppercase">Meno</p>
                                      <p className="text-lg font-extrabold text-gray-900">{pet.name.replace(/\*\*/g, '')}</p>
                                  </div>
                              </div>

                               {/* Info Card 2 - Bottom Right */}
                               <div className={`absolute bottom-10 -right-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow animation-delay-2000 transition-transform duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                                  <div className={`bg-gray-100 p-2 rounded-full ${style.accentColor}`}>
                                      <Sparkles size={24} fill="currentColor"/>
                                  </div>
                                  <div>
                                      <p className="text-xs text-gray-500 font-bold uppercase">{pet.age} {pet.age === 1 ? 'rok' : 'rokov'}</p>
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
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              currentSlide === index ? 'bg-brand-600 w-8' : 'bg-gray-300 hover:bg-brand-400'
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
              <h3 className="text-4xl font-extrabold text-gray-900 mb-1">500+</h3>
              <p className="text-gray-600 font-medium">Zvierat čaká na domov</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-brand-100 text-brand-600 rounded-2xl mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-1">1200+</h3>
              <p className="text-gray-600 font-medium">Úspešných adopcií ročne</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-brand-100 text-brand-600 rounded-2xl mb-4">
                <Building2 size={32} />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-1">40+</h3>
              <p className="text-gray-600 font-medium">Zapojených útulkov</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pets (Urgent) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Hľadajú domov urgentne</h2>
              <p className="mt-2 text-gray-600">Tieto zvieratká čakajú už príliš dlho.</p>
            </div>
            <Link to="/pets" className="hidden sm:flex items-center text-brand-600 font-bold hover:text-brand-700 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow transition">
              Zobraziť všetky <ArrowRight size={20} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPets.map((pet) => (
              <Link key={pet.id} to={`/pets/${pet.id}`} className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                      src={pet.imageUrl} 
                      alt={pet.name} 
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold text-gray-800 shadow-sm">
                      {pet.age} {pet.age === 1 ? 'rok' : 'rokov'}
                    </div>
                    {pet.adoptionStatus === 'Reserved' && (
                        <div className="absolute top-4 left-4">
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg">Rezervovaný</span>
                        </div>
                    )}
                </div>
                
                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-brand-600 transition">{pet.name.replace(/\*\*/g, '')}</h3>
                      <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-lg uppercase tracking-wide">{pet.breed}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {pet.description.replace(/\*\*/g, '')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                         <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <MapPin size={14} className="mr-1.5" />
                            {pet.location}
                         </div>
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition shadow-sm">
                            <ArrowRight size={16} />
                         </div>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Temporary Foster Care Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                 <HomeIcon className="text-indigo-600" size={32} />
                 Hľadajú dočasnú opateru
              </h2>
              <p className="mt-2 text-gray-600">
                Pomôžte zvieratám, ktoré potrebujú individuálnu starostlivosť alebo sa zotavujú po zákroku.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fosterPets.length > 0 ? fosterPets.map((pet) => (
              <Link key={pet.id} to={`/pets/${pet.id}`} className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-indigo-100 ring-1 ring-indigo-50 transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={pet.imageUrl} 
                      alt={pet.name} 
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-md uppercase tracking-wide">
                      Dočasná opatera
                    </div>
                </div>
                <div className="p-6 bg-indigo-50/30">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition">{pet.name.replace(/\*\*/g, '')}</h3>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg uppercase tracking-wide">{pet.breed}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {pet.description.replace(/\*\*/g, '')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                         <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <MapPin size={14} className="mr-1.5" />
                            {pet.location}
                         </div>
                         <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">
                            <ArrowRight size={16} />
                         </div>
                    </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-3 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">Momentálne nehľadáme dočasnú opateru pre žiadne zvieratko.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Success Story CTA */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            <div className="md:w-1/2 relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Happy dog adoption" 
                className="rounded-3xl shadow-lg w-full object-cover h-80 border-4 border-gray-800"
              />
            </div>
            <div className="md:w-1/2 relative z-10">
              <div className="inline-block bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">Príbeh mesiaca</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Bella našla domov po 3 rokoch</h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                "Nikdy sme si nemysleli, že starší psík nám prinesie toľko radosti. Bella je dokonalá." - rodina Kováčová.
                Príbehy ako tento sú možné vďaka vašej podpore.
              </p>
              <Link 
                to="/blog"
                className="inline-flex items-center font-bold text-white hover:text-brand-400 text-lg group transition"
              >
                Čítať viac príbehov <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Community Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Staňte sa súčasťou našej komunity</h2>
           <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-lg">
             Sledujte nás na sociálnych sieťach pre denné dávky roztomilosti, úspešné príbehy adopcií a novinky z útulkov.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#1877F2] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                    <Facebook size={24} />
                  </div>
                  <span>Sledovať na Facebooku</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                    <Instagram size={24} />
                  </div>
                  <span>Sledovať na Instagrame</span>
              </a>
           </div>
        </div>
      </section>

      {/* Blog Teaser Section - DARK MODE */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-600 rounded-full blur-[120px] opacity-20"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Najnovšie z blogu</h2>
            <p className="text-xl text-gray-400">Užitočné rady, tipy a novinky zo sveta zvierat.</p>
          </div>
          
          {recentPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
               {recentPosts.map((post) => (
                 <Link key={post.id} to={`/blog/${post.id}`} className="flex flex-col bg-white overflow-hidden rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-700 group h-full">
                   <div className="flex-shrink-0 h-52 overflow-hidden relative">
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition z-10"></div>
                     <img className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" src={post.imageUrl} alt={post.title} />
                   </div>
                   <div className="flex-1 p-8 flex flex-col justify-between">
                     <div className="flex-1">
                       <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3">
                         Tipy & Triky
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
            <div className="text-center py-12 text-gray-400 bg-gray-800 rounded-2xl border border-dashed border-gray-700">
                Zatiaľ žiadne články.
            </div>
          )}

          <div className="mt-16 text-center">
            <Link to="/blog" className="inline-flex items-center px-8 py-3 rounded-full border border-gray-700 text-white font-bold hover:bg-gray-800 transition bg-transparent backdrop-blur-sm">
              Zobraziť všetky články <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- PROMO SLIDER SECTION --- */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Naši partneri a ponuky</h2>
                <p className="text-gray-500 mt-2">Doprajte svojim miláčikom to najlepšie a podporte našu komunitu.</p>
            </div>

            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-auto md:h-[450px]">
                {promoSlides.map((slide, index) => {
                    const colors = COLOR_MAP[slide.iconType || 'star'] || COLOR_MAP.star;
                    const Icon = ICON_MAP[slide.iconType || 'star'] || Star;

                    return (
                        <div 
                            key={slide.id}
                            className={`absolute inset-0 flex flex-col md:flex-row transition-opacity duration-1000 ${index === currentPromo ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            {/* Left Content */}
                            <div className={`md:w-1/2 p-8 md:p-12 flex flex-col justify-center ${colors.bg}`}>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="bg-white/80 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-gray-100">
                                        {slide.badge}
                                    </span>
                                </div>
                                
                                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                                    {slide.title}
                                </h3>
                                
                                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                    {slide.description}
                                </p>
                                
                                <div>
                                    <a 
                                        href={slide.link} 
                                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <Icon size={20} className={colors.text ? "" : "text-brand-400"} />
                                        {slide.cta}
                                    </a>
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className="md:w-1/2 relative h-64 md:h-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none md:hidden"></div>
                                <img 
                                    src={slide.imageUrl} 
                                    alt={slide.title} 
                                    className="w-full h-full object-cover transition-transform duration-[10s] ease-linear scale-100"
                                    style={{ transform: index === currentPromo ? 'scale(1.1)' : 'scale(1)' }}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Slider Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
                    {promoSlides.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentPromo(idx)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentPromo === idx ? 'bg-gray-900 w-8' : 'bg-gray-400/50 hover:bg-gray-600'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Virtual Adoption Banner (Only visible for non-shelters) */}
      {!isShelter && (
        <section className="bg-brand-600 py-24 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-yellow-400 opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                <div className="flex-1">
                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-md border border-white/20">
                    <Gift size={32} className="text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                    Nemôžete si vziať <br/> zvieratko domov?
                </h2>
                <p className="text-brand-100 text-xl max-w-2xl mb-10 leading-relaxed">
                    Staňte sa virtuálnym rodičom! Pravidelným mesačným príspevkom zabezpečíte stravu, veterinárnu starostlivosť a šťastnejší život pre psíka alebo mačičku, ktorá stále čaká na svoj ozajstný domov.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link 
                    to="/pets" 
                    className="px-8 py-4 bg-white text-brand-600 font-extrabold rounded-full hover:bg-gray-100 transition shadow-xl hover:-translate-y-1 transform"
                    >
                    Vybrať zvieratko na podporu
                    </Link>
                    <Link 
                    to="/support" 
                    className="px-8 py-4 bg-transparent text-white font-extrabold rounded-full hover:bg-white/10 transition border-2 border-white/30 hover:border-white"
                    >
                    Viac o virtuálnej adopcii
                    </Link>
                </div>
                </div>
                
                <div className="hidden md:block w-1/3 relative">
                    <div className="absolute inset-0 bg-brand-900 rounded-full blur-[60px] opacity-40"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                        alt="Pug looking cute" 
                        className="relative rounded-[2rem] shadow-2xl rotate-6 hover:rotate-0 transition duration-700 border-8 border-white/10"
                    />
                </div>
            </div>
            </div>
        </section>
      )}
    </div>
  );
};

// Helper component for icon
const SearchIcon = ({ size, className }: { size: number, className?: string }) => (
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
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
)

export default HomePage;
