
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Calendar, Ruler, Tag, X, Heart, Activity, ArrowRight, Dog, Cat, ChevronDown, ChevronUp, Sparkles as SparklesIcon, ExternalLink } from 'lucide-react';
import PetCardSkeleton from '../components/skeletons/PetCardSkeleton';
import { PetType, Size, Gender } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext';
import { formatSlovakAge } from '../utils/formatters';

const PetListPage: React.FC = () => {
  const { toggleFavorite, isFavorite, userRole, currentUser } = useAuth();
  const { pets, loading } = usePets();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && (typeParam === PetType.DOG || typeParam === PetType.CAT)) {
      setFilterType(typeParam);
    } else {
      setFilterType('all');
    }
  }, [searchParams]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    pets.forEach(pet => pet.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [pets]);

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      if (!pet.isVisible) return false;

      const matchesType = filterType === 'all' || pet.type === filterType;
      const matchesLocation = filterLocation === '' || pet.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchesSize = filterSize === 'all' || pet.size === filterSize;
      const matchesTag = filterTag === 'all' || pet.tags.includes(filterTag);

      let matchesAge = true;
      if (filterAge === 'baby') matchesAge = pet.age < 1;
      else if (filterAge === 'young') matchesAge = pet.age >= 1 && pet.age < 5;
      else if (filterAge === 'adult') matchesAge = pet.age >= 5 && pet.age < 10;
      else if (filterAge === 'senior') matchesAge = pet.age >= 10;

      return matchesType && matchesLocation && matchesSize && matchesTag && matchesAge;
    });
  }, [pets, filterType, filterLocation, filterAge, filterSize, filterTag]);

  const resetFilters = () => {
    setFilterType('all');
    setFilterLocation('');
    setFilterAge('all');
    setFilterSize('all');
    setFilterTag('all');
    navigate('/pets');
  };

  const handleFavoriteClick = (e: React.MouseEvent, petId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      showToast("Pre ukladanie obľúbených sa prosím prihláste.", "info");
      return;
    }

    const wasFavorite = isFavorite(petId);
    toggleFavorite(petId);
    if (!wasFavorite) {
      showToast("Pridané do obľúbených", "success");
    } else {
      showToast("Odstránené z obľúbených", "info");
    }
  };

  const activeFiltersCount = [
    filterType !== 'all',
    filterLocation !== '',
    filterAge !== 'all',
    filterSize !== 'all',
    filterTag !== 'all'
  ].filter(Boolean).length;

  const GenderIcon = ({ gender }: { gender: Gender }) => (
    gender === Gender.MALE ? <span className="text-blue-500">♂</span> : <span className="text-pink-500">♀</span>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">Naši zverenci</h1>
          <p className="mt-2 md:mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Vyberte si kritériá a nájdite svojho vysnívaného parťáka.
          </p>
        </div>

        <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 sticky top-20 z-30 backdrop-blur-xl bg-white/95 transition-all duration-300 ${isScrolled ? 'py-3 px-4 shadow-lg ring-1 ring-black/5' : 'p-4 md:p-6 mb-8'
          }`}>
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'md:hidden mb-0 pb-0 border-0' : 'mb-2 md:mb-4 pb-2 border-b border-gray-100'
            }`}>
            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <Filter className="text-brand-600" size={20} />
              <span className="text-sm">Filtrovať</span>
              {activeFiltersCount > 0 && (
                <span className="bg-brand-100 text-brand-700 text-xs font-black px-2 py-0.5 rounded-full ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 md:hidden">
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-red-500 font-bold hover:underline">Vymazať</button>
              )}
              <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition">
                {isFiltersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="hidden md:flex text-xs text-red-500 hover:text-red-700 items-center gap-1 font-black bg-red-50 px-3 py-1.5 rounded-xl transition">
                <X size={16} /> Vymazať filtre
              </button>
            )}
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 ${isFiltersOpen ? 'grid' : 'hidden'} md:grid`}>
            <div className="relative col-span-1">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-bold transition hover:bg-white text-sm"
              >
                <option value="all">Druh (Všetky)</option>
                <option value={PetType.DOG}>Psy</option>
                <option value={PetType.CAT}>Mačky</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <Dog size={16} />
              </div>
            </div>

            <div className="relative col-span-2 md:col-span-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <MapPin size={16} />
              </div>
              <input
                type="text"
                placeholder="Lokalita"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 font-bold transition hover:bg-white text-sm"
              />
            </div>

            <div className="relative col-span-1">
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-bold transition hover:bg-white text-sm"
              >
                <option value="all">Vek (Všetky)</option>
                <option value="baby">Mláďa (&lt; 1 r.)</option>
                <option value="young">Mladý (1-5 r.)</option>
                <option value="adult">Dospelý (5-10 r.)</option>
                <option value="senior">Senior (10+ r.)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <Calendar size={16} />
              </div>
            </div>

            <div className="relative col-span-1">
              <select
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-bold transition hover:bg-white text-sm"
              >
                <option value="all">Veľkosť (Všetky)</option>
                <option value={Size.SMALL}>{Size.SMALL}</option>
                <option value={Size.MEDIUM}>{Size.MEDIUM}</option>
                <option value={Size.LARGE}>{Size.LARGE}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <Ruler size={16} />
              </div>
            </div>

            <div className="relative col-span-2 md:col-span-1">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-bold transition hover:bg-white text-sm"
              >
                <option value="all">Povaha (Všetky)</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <Tag size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-gray-600 font-medium">
            Nájdených <span className="text-brand-600 font-extrabold">{filteredPets.length}</span> zvierat
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <PetCardSkeleton key={i} />
            ))
          ) : filteredPets.map((pet) => {
            const isFav = isFavorite(pet.id);
            return (
              <Link
                key={pet.id}
                to={`/pets/${pet.slug || pet.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-xl text-[10px] font-black text-gray-800 shadow-sm border border-gray-100">
                      {formatSlovakAge(pet.age)}
                    </div>
                  </div>

                  {!isShelter && (
                    <button
                      onClick={(e) => handleFavoriteClick(e, pet.id)}
                      className={`absolute top-4 left-4 p-2 rounded-xl transition-all shadow-md backdrop-blur-sm border ${isFav
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-white/80 text-gray-400 border-white hover:bg-white hover:text-red-500'
                        }`}
                    >
                      <Heart size={18} className={isFav ? 'fill-current' : ''} />
                    </button>
                  )}

                  {pet.adoptionStatus !== 'Available' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                      <span className={`px-4 py-2 rounded-2xl font-black text-xs shadow-xl ${pet.adoptionStatus === 'Reserved' ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                        {pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-brand-600 transition truncate">{pet.name.replace(/\*\*/g, '')}</h3>
                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                      <GenderIcon gender={pet.gender} />
                    </div>
                  </div>

                  <p className="text-xs font-bold text-gray-400 mb-3 truncate">{pet.breed}</p>

                  <p className="text-gray-500 text-[13px] font-medium line-clamp-2 mb-4 leading-relaxed">
                    {pet.description.replace(/\*\*/g, '')}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {pet.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-[11px] font-bold">
                      <MapPin size={12} className="mr-1 text-brand-500" />
                      {pet.location}
                    </div>
                    <div className="flex items-center text-brand-600 font-black text-xs group-hover:gap-2 transition-all">
                      Detail <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredPets.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <Dog size={64} className="mx-auto text-gray-200 mb-6" />
            <h2 className="text-2xl font-black text-gray-900">Nenašli sme žiadnych chlpáčov</h2>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Skúste zmeniť filtre alebo vymazať vyhľadávanie.</p>
            <button onClick={resetFilters} className="mt-8 px-8 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition shadow-lg shadow-brand-200">Resetovať filtre</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetListPage;
