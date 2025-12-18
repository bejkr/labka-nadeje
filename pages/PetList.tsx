import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, MapPin, Calendar, Ruler, Tag, X, Heart, Activity, ArrowRight, Dog, Cat, ChevronDown, ChevronUp } from 'lucide-react';
import { PetType, Size, Gender } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext';
import AdBanner from '../components/AdBanner';

const PetListPage: React.FC = () => {
  const { toggleFavorite, isFavorite, userRole, currentUser } = useAuth();
  const { pets } = usePets(); 
  const { showToast } = useApp();
  const navigate = useNavigate();
  
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  
  // State for collapsible mobile filters
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Robust check for shelter role
  const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    pets.forEach(pet => pet.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [pets]);

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      // Basic visibility check - hides hidden pets from public list
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
  };

  const handleFavoriteClick = (e: React.MouseEvent, petId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      showToast("Pre ukladanie obľúbených sa prosím prihláste.", "info");
      return;
    }
    
    toggleFavorite(petId);
    if (!isFavorite(petId)) {
      showToast("Pridané do obľúbených", "success");
    }
  };

  // Calculate active filters count for badge
  const activeFiltersCount = [
    filterType !== 'all',
    filterLocation !== '',
    filterAge !== 'all',
    filterSize !== 'all',
    filterTag !== 'all'
  ].filter(Boolean).length;

  // Helper for Gender Icon
  const GenderIcon = ({ gender }: { gender: Gender }) => (
      gender === Gender.MALE ? <span className="text-blue-500">♂</span> : <span className="text-pink-500">♀</span>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Naši zverenci</h1>
          <p className="mt-2 md:mt-4 text-lg md:text-xl text-gray-500">
            Vyberte si kritériá a nájdite svojho vysnívaného parťáka.
          </p>
        </div>

        {/* Filters Container */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-8 border border-gray-100 sticky top-20 z-30 backdrop-blur-xl bg-white/95 transition-all duration-300">
          
          {/* Header & Mobile Toggle */}
          <div className="flex items-center justify-between mb-2 md:mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Filter className="text-brand-600" size={20} />
              <span>Filtrovať</span>
              {activeFiltersCount > 0 && (
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            
            {/* Mobile Toggle Button */}
            <div className="flex items-center gap-3 md:hidden">
                {activeFiltersCount > 0 && (
                   <button 
                    onClick={resetFilters}
                    className="text-xs text-red-500 font-bold hover:underline"
                   >
                     Vymazať
                   </button>
                )}
                <button 
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition"
                >
                  {isFiltersOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
            </div>

            {/* Desktop Clear Button (Hidden on Mobile Header) */}
            {activeFiltersCount > 0 && (
               <button 
                onClick={resetFilters}
                className="hidden md:flex text-sm text-red-500 hover:text-red-700 items-center gap-1 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition"
               >
                 <X size={16} /> Vymazať filtre
               </button>
            )}
          </div>
          
          {/* Collapsible Grid */}
          <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 ${isFiltersOpen ? 'grid' : 'hidden'} md:grid`}>
            
            {/* Type */}
            <div className="relative col-span-1">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-medium transition hover:bg-white text-sm"
              >
                <option value="all">Druh (Všetky)</option>
                <option value={PetType.DOG}>Psy</option>
                <option value={PetType.CAT}>Mačky</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                <Dog size={14} />
              </div>
            </div>

            {/* Location (Full width on mobile) */}
            <div className="relative col-span-2 md:col-span-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <MapPin size={16} />
              </div>
              <input
                type="text"
                placeholder="Lokalita"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 font-medium transition hover:bg-white text-sm"
              />
            </div>

            {/* Age */}
            <div className="relative col-span-1">
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-medium transition hover:bg-white text-sm"
              >
                <option value="all">Vek (Všetky)</option>
                <option value="baby">Mláďa (&lt; 1 r.)</option>
                <option value="young">Mladý (1-5 r.)</option>
                <option value="adult">Dospelý (5-10 r.)</option>
                <option value="senior">Senior (10+ r.)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                <Calendar size={14} />
              </div>
            </div>

            {/* Size */}
            <div className="relative col-span-1">
              <select
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-medium transition hover:bg-white text-sm"
              >
                <option value="all">Veľkosť (Všetky)</option>
                <option value={Size.SMALL}>{Size.SMALL}</option>
                <option value={Size.MEDIUM}>{Size.MEDIUM}</option>
                <option value={Size.LARGE}>{Size.LARGE}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                <Ruler size={14} />
              </div>
            </div>

            {/* Tags / Temperament (Full width on mobile to avoid cut text) */}
            <div className="relative col-span-2 md:col-span-1">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 font-medium transition hover:bg-white text-sm"
              >
                <option value="all">Povaha (Všetky)</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                <Tag size={14} />
              </div>
            </div>

          </div>
        </div>

        {/* Grid */}
        {filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredPets.map((pet, index) => (
              <React.Fragment key={pet.id}>
                
                {/* Insert Ad Banner after every 8 items */}
                {index > 0 && index % 8 === 0 && (
                    <div className="col-span-full">
                        <AdBanner 
                            type="adsense" 
                            slotId="1234567890" 
                            className="bg-white"
                        />
                    </div>
                )}

                <Link to={`/pets/${pet.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-brand-100 transform hover:-translate-y-1">
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                            src={pet.imageUrl}
                            alt={pet.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        
                        {/* Status Badge */}
                        {pet.adoptionStatus !== 'Available' ? (
                             <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg ${
                                    pet.adoptionStatus === 'Reserved' 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-gray-800 text-white'
                                }`}>
                                    {pet.adoptionStatus === 'Reserved' ? 'Rezervovaný' : 'Adoptovaný'}
                                </span>
                             </div>
                        ) : pet.needsFoster && (
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg bg-indigo-600 text-white">
                                    Hľadá dočasku
                                </span>
                            </div>
                        )}

                        {/* Favorite Button */}
                        {!isShelter && (
                            <button 
                                onClick={(e) => handleFavoriteClick(e, pet.id)}
                                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md transition-all shadow-md z-10 group/btn"
                            >
                                <Heart 
                                size={18} 
                                className={`transition-colors ${isFavorite(pet.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 group-hover/btn:text-red-500'}`} 
                                />
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-brand-600 transition mb-0.5">{pet.name}</h3>
                                    <span className="text-sm font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-block">
                                        {pet.breed}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Attributes Row */}
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-4 bg-gray-50 p-2 rounded-xl">
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                                <Calendar size={12} className="text-brand-400"/> {pet.age} {pet.age === 1 ? 'rok' : 'r.'}
                            </span>
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                                <GenderIcon gender={pet.gender} /> {pet.gender}
                            </span>
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100 ml-auto">
                                {pet.size}
                            </span>
                        </div>

                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                            {pet.description.replace(/\*\*/g, '')}
                        </p>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center text-gray-500 text-xs font-medium gap-1.5 truncate max-w-[70%]">
                                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{pet.location}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-sm">
                                <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                </Link>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
            <Dog size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Nenašli sa žiadne zvieratká</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">Skúste zmeniť kritériá vyhľadávania alebo odstrániť filtre.</p>
            <button 
              onClick={resetFilters}
              className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-100"
            >
              Vymazať filtre
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetListPage;