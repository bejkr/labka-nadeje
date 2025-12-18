
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Sparkles, Loader2, Info, Video, Film, Star } from 'lucide-react';
import { Pet, PetType, Gender, Size } from '../types';
import { generatePetDescription } from '../services/geminiService';
import { api } from '../services/api';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet?: Pet | null;
  shelterId?: string; // Required for new pets
  onSave: (pet: Pet) => Promise<void>;
  defaultLocation?: string;
}

interface GalleryItem {
    id: string;
    url: string;
    file?: File;
}

const PetFormModal: React.FC<PetFormModalProps> = ({ isOpen, onClose, pet, shelterId, onSave, defaultLocation }) => {
  const [modalTab, setModalTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petTraits, setPetTraits] = useState('');
  const [petBio, setPetBio] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [petStatus, setPetStatus] = useState<Pet['adoptionStatus']>('Available');
  const [petVisible, setPetVisible] = useState(true);
  const [petNeedsFoster, setPetNeedsFoster] = useState(false);
  const [petLocation, setPetLocation] = useState('');
  
  const [petType, setPetType] = useState<PetType>(PetType.DOG);
  const [petGender, setPetGender] = useState<Gender>(Gender.MALE);
  const [petSize, setPetSize] = useState<Size>(Size.MEDIUM);
  
  // Use string for numbers to avoid "0" stuck in input and allow empty state
  const [petAge, setPetAge] = useState<string>('1');
  const [adoptionFee, setAdoptionFee] = useState<string>('0');
  
  const [petVideoUrl, setPetVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Image State - using objects to track files vs existing URLs
  const [mainImage, setMainImage] = useState<{ url: string, file?: File } | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  
  const [health, setHealth] = useState<any>({});
  const [social, setSocial] = useState<any>({});
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize state when pet changes or modal opens
  useEffect(() => {
    if (isOpen) {
        if (pet) {
            setPetName(pet.name);
            setPetBreed(pet.breed);
            setPetTraits(pet.tags.join(', '));
            setPetBio(pet.description);
            setPetNotes(pet.importantNotes || '');
            setPetStatus(pet.adoptionStatus);
            setPetVisible(pet.isVisible);
            setPetNeedsFoster(pet.needsFoster);
            setPetLocation(pet.location || '');
            setAdoptionFee(pet.adoptionFee.toString());
            setPetVideoUrl(pet.videoUrl || '');
            setVideoFile(null); // Reset file input on edit load
            setHealth(pet.health || {});
            setSocial(pet.social || {});
            setPetType(pet.type);
            setPetGender(pet.gender);
            setPetSize(pet.size);
            setPetAge(pet.age.toString());
            
            // Initialize Images
            setMainImage(pet.imageUrl ? { url: pet.imageUrl } : null);
            setGallery(pet.gallery?.map(url => ({ id: Math.random().toString(36), url })) || []);
        } else {
            // Reset for new pet
            setPetName(''); setPetBreed(''); setPetTraits(''); setPetBio(''); setPetNotes('');
            setPetStatus('Available'); setPetVisible(true); setPetNeedsFoster(false);
            setPetLocation(defaultLocation || '');
            setAdoptionFee('0'); setPetVideoUrl(''); setVideoFile(null); setHealth({}); setSocial({});
            setPetType(PetType.DOG); setPetGender(Gender.MALE); setPetSize(Size.MEDIUM); setPetAge('1');
            
            setMainImage(null);
            setGallery([]);
        }
        setModalTab('basic');
    }
  }, [isOpen, pet, defaultLocation]);

  const handleGenerateBio = async () => {
    if (!petName || !petBreed) return;
    setIsGenerating(true);
    const bio = await generatePetDescription(petName, petBreed, petTraits.split(','));
    setPetBio(bio);
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File, index) => {
          const reader = new FileReader();
          reader.onloadend = () => {
             const result = reader.result as string;
             // If main image is empty and this is the first file, set main image
             // Note: using functional state update to access current state safely inside async loop
             if (index === 0 && !mainImage) { 
                 setMainImage(prev => prev || { url: result, file });
             } else {
                 setGallery(prev => [...prev, { id: Math.random().toString(36), url: result, file }]);
             }
          };
          reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 50 * 1024 * 1024) { // 50MB limit check
              alert("Video je príliš veľké. Maximálna veľkosť je 50MB.");
              return;
          }
          setVideoFile(file);
          setPetVideoUrl(''); // Clear URL input if file is selected
      }
  };

  const removeGalleryImage = (id: string) => {
      setGallery(prev => prev.filter(item => item.id !== id));
  };

  const handleSetAsMain = (item: GalleryItem) => {
      // 1. Move current main to gallery (if exists)
      let updatedGallery = [...gallery];
      if (mainImage) {
          updatedGallery.push({
              id: Math.random().toString(36),
              url: mainImage.url,
              file: mainImage.file
          });
      }

      // 2. Remove selected item from gallery list (create new array without it)
      updatedGallery = updatedGallery.filter(i => i.id !== item.id);

      // 3. Update states
      setGallery(updatedGallery);
      setMainImage({ url: item.url, file: item.file });
  };

  const handleSaveClick = async () => {
    if (!petName || !petBreed) {
        alert("Prosím, vyplňte meno a plemeno.");
        return;
    }

    setLoading(true);
    try {
        // 1. Upload Main Image
        let finalMainImageUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1';
        if (mainImage) {
            if (mainImage.file) {
                finalMainImageUrl = await api.uploadFile(mainImage.file, 'pets');
            } else {
                finalMainImageUrl = mainImage.url;
            }
        }

        // 2. Upload Gallery Images
        const finalGallery: string[] = [];
        for (const item of gallery) {
            if (item.file) {
                const url = await api.uploadFile(item.file, 'pets');
                finalGallery.push(url);
            } else {
                finalGallery.push(item.url);
            }
        }

        // 3. Upload Video File (if present)
        let finalVideoUrl = petVideoUrl;
        if (videoFile) {
            finalVideoUrl = await api.uploadFile(videoFile, 'videos');
        }

        const commonData = {
            name: petName, breed: petBreed, type: petType, gender: petGender, size: petSize, 
            age: parseFloat(petAge) || 0,
            location: petLocation,
            tags: petTraits.split(',').map(t => t.trim()).filter(Boolean),
            description: petBio || 'Bez popisu', 
            importantNotes: petNotes, adoptionStatus: petStatus,
            isVisible: petVisible, needsFoster: petNeedsFoster, 
            adoptionFee: parseFloat(adoptionFee) || 0,
            imageUrl: finalMainImageUrl,
            gallery: finalGallery,
            health: { isVaccinated: false, isDewormed: false, isCastrated: false, isChipped: false, hasAllergies: false, ...pet?.health, ...health },
            social: { children: 'Neznáme', dogs: 'Neznáme', cats: 'Neznáme', ...pet?.social, ...social },
            training: { toiletTrained: false, leashTrained: false, carTravel: false, aloneTime: false, ...pet?.training },
            requirements: { activityLevel: 'Stredná', suitableFor: [], unsuitableFor: [], ...pet?.requirements },
            videoUrl: finalVideoUrl,
        };

        let petToSave: Pet;

        if (pet) {
            petToSave = { ...pet, ...commonData } as Pet;
        } else {
            if (!shelterId) throw new Error("Shelter ID is missing for new pet");
            // API handles ID generation
            petToSave = {
                id: '', 
                ...commonData,
                shelterId: shelterId,
                postedDate: new Date().toISOString().split('T')[0],
            } as Pet;
        }

        await onSave(petToSave);
        onClose();
    } catch (e: any) {
        console.error(e);
        alert(`Chyba pri ukladaní: ${e.message || 'Neznáma chyba'}`);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl my-8 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
          <div>
              <h3 className="text-xl font-extrabold text-gray-900">{pet ? 'Upraviť profil' : 'Pridať nové zviera'}</h3>
              <p className="text-sm text-gray-500">Vyplňte údaje o zvierati.</p>
          </div>
          <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-500 p-2 rounded-full border border-gray-200 transition"><X size={20}/></button>
        </div>
        
        <div className="px-6 border-b border-gray-100 flex gap-1 overflow-x-auto bg-white pt-2">
           {[
               { id: 'basic', label: 'Základné' },
               { id: 'details', label: 'Povaha' },
               { id: 'health', label: 'Zdravie' },
               { id: 'story', label: 'Príbeh' }
           ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setModalTab(t.id)} 
                className={`px-4 py-3 text-sm font-bold border-b-2 transition ${modalTab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                  {t.label}
              </button>
           ))}
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
          {/* TAB: BASIC */}
          {modalTab === 'basic' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fotografie</label>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <Info size={14} className="text-brand-500" />
                        Odporúčame: JPG/PNG, max 5MB. Ideálne rozmery: <strong>1080x1080px (štvorec)</strong> alebo na šírku.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square bg-white border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition group"
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition"><Upload className="text-brand-600" size={20} /></div>
                            <span className="text-xs text-gray-500 font-bold group-hover:text-brand-700">Nahrať</span>
                            <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        {mainImage && (
                            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-brand-500 shadow-md group">
                                <img src={mainImage.url} className="w-full h-full object-cover" alt="Main" />
                                <div className="absolute inset-x-0 bottom-0 bg-brand-600/90 text-white text-[10px] font-bold text-center py-1 backdrop-blur-sm">HLAVNÁ</div>
                                <button onClick={() => setMainImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                            </div>
                        )}
                        
                        {gallery.map((item) => (
                            <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group">
                                <img src={item.url} className="w-full h-full object-cover" alt="Gallery" />
                                
                                {/* Delete Button */}
                                <button onClick={() => removeGalleryImage(item.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                                
                                {/* Make Main Button */}
                                <button 
                                    onClick={() => handleSetAsMain(item)}
                                    className="absolute bottom-2 right-2 bg-white/90 text-gray-400 hover:text-brand-500 hover:bg-white p-1.5 rounded-full shadow-sm transition opacity-0 group-hover:opacity-100"
                                    title="Nastaviť ako hlavnú fotku"
                                >
                                    <Star size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Meno</label><input value={petName} onChange={e => setPetName(e.target.value)} type="text" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" placeholder="Napr. Bary"/></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Plemeno</label><input value={petBreed} onChange={e => setPetBreed(e.target.value)} type="text" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" placeholder="Napr. Kríženec"/></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 text-gray-900">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Druh</label>
                        <select value={petType} onChange={e => setPetType(e.target.value as PetType)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                            <option value={PetType.DOG}>Pes</option>
                            <option value={PetType.CAT}>Mačka</option>
                            <option value={PetType.OTHER}>Iné</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Pohlavie</label>
                        <select value={petGender} onChange={e => setPetGender(e.target.value as Gender)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                            <option value={Gender.MALE}>Samec</option>
                            <option value={Gender.FEMALE}>Samica</option>
                        </select>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-gray-900">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Vek (roky)</label>
                        <input 
                            value={petAge} 
                            onChange={e => setPetAge(e.target.value)} 
                            type="number" 
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition" 
                            onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Veľkosť</label>
                        <select value={petSize} onChange={e => setPetSize(e.target.value as Size)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                            <option value={Size.SMALL}>Malý</option>
                            <option value={Size.MEDIUM}>Stredný</option>
                            <option value={Size.LARGE}>Veľký</option>
                        </select>
                     </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Lokalita</label>
                    <input 
                      value={petLocation} 
                      onChange={e => setPetLocation(e.target.value)} 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" 
                      placeholder="Napr. Bratislava - Ružinov"
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Video size={18} className="text-brand-600"/> Video
                    </label>
                    
                    <div className="space-y-4">
                        {/* Option 1: URL */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Odkaz (YouTube/Vimeo)</label>
                            <input 
                                value={petVideoUrl} 
                                onChange={e => { setPetVideoUrl(e.target.value); setVideoFile(null); }} 
                                type="text" 
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 text-sm" 
                                placeholder="https://www.youtube.com/watch?v=..."
                                disabled={!!videoFile}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-400 font-bold uppercase">ALEBO</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {/* Option 2: Upload */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nahrať z počítača</label>
                            <div 
                                onClick={() => videoInputRef.current?.click()}
                                className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${videoFile ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-brand-300'}`}
                            >
                                {videoFile ? (
                                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                                        <Film size={20} />
                                        <span>{videoFile.name}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setVideoFile(null); }} 
                                            className="p-1 hover:bg-green-200 rounded-full"
                                        >
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="text-gray-400 mb-1" size={24} />
                                        <span className="text-sm text-gray-500 font-medium">Kliknite pre výber videa (max 50MB)</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    ref={videoInputRef} 
                                    className="hidden" 
                                    accept="video/*" 
                                    onChange={handleVideoUpload} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900">
                     <label className="block text-sm font-bold text-gray-700 mb-3">Status a Viditeľnosť</label>
                     <div className="flex flex-wrap gap-6">
                         <div className="flex gap-4">
                             <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-300">
                                 <input type="radio" checked={petStatus === 'Available'} onChange={() => setPetStatus('Available')} className="text-brand-600"/> 
                                 <span className="text-sm font-medium">Na adopciu</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-300">
                                 <input type="radio" checked={petStatus === 'Reserved'} onChange={() => setPetStatus('Reserved')} className="text-brand-600"/> 
                                 <span className="text-sm font-medium">Rezervovaný</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-300">
                                 <input type="radio" checked={petStatus === 'Adopted'} onChange={() => setPetStatus('Adopted')} className="text-brand-600"/> 
                                 <span className="text-sm font-medium">Adoptovaný</span>
                             </label>
                         </div>
                         
                         <div className="w-px bg-gray-300 hidden sm:block"></div>

                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={petVisible} onChange={e => setPetVisible(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5" />
                             <span className="text-sm font-bold text-gray-700">Viditeľný</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={petNeedsFoster} onChange={e => setPetNeedsFoster(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5" />
                             <span className="text-sm font-bold text-gray-700">Hľadá dočasku</span>
                         </label>
                     </div>
                </div>
             </div>
          )}
          
          {/* TAB: DETAILS */}
          {modalTab === 'details' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Vlastnosti (oddelené čiarkou)</label>
                      <input 
                        value={petTraits} 
                        onChange={e => setPetTraits(e.target.value)} 
                        type="text" 
                        placeholder="Priateľský, Aktívny, Vhodný k deťom..."
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" 
                      />
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-900">
                     <h4 className="font-bold text-gray-900 mb-4">Sociálne návyky</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Deti</label>
                            <select value={social.children || 'Neznáme'} onChange={e => setSocial({...social, children: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-brand-500 text-gray-900">
                                <option>Vhodný</option><option>Nevhodný</option><option>Opatrne</option><option>Neznáme</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Psi</label>
                            <select value={social.dogs || 'Neznáme'} onChange={e => setSocial({...social, dogs: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-brand-500 text-gray-900">
                                <option>Vhodný</option><option>Nevhodný</option><option>Opatrne</option><option>Neznáme</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mačky</label>
                            <select value={social.cats || 'Neznáme'} onChange={e => setSocial({...social, cats: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-brand-500 text-gray-900">
                                <option>Vhodný</option><option>Nevhodný</option><option>Opatrne</option><option>Neznáme</option>
                            </select>
                         </div>
                     </div>
                  </div>
              </div>
          )}

          {/* TAB: HEALTH */}
          {modalTab === 'health' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-gray-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {['Očkovaný', 'Čipovaný', 'Kastrovaný', 'Odčervený'].map((label, i) => {
                         const keys = ['isVaccinated', 'isChipped', 'isCastrated', 'isDewormed'];
                         const key = keys[i];
                         return (
                            <label key={key} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-200 cursor-pointer bg-white transition shadow-sm">
                                <div className="relative flex items-center">
                                    <input type="checkbox" checked={health[key] || false} onChange={e => setHealth({...health, [key]: e.target.checked})} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300" />
                                </div>
                                <span className="font-bold text-gray-700">{label}</span>
                            </label>
                         );
                     })}
                  </div>
                  
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Adopčný poplatok (€)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={adoptionFee} 
                        onChange={e => setAdoptionFee(e.target.value)} 
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900" 
                        onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()}
                      />
                      <p className="text-xs text-gray-500 mt-2">Zadajte 0 ak je adopcia bezplatná.</p>
                  </div>
              </div>
          )}

          {/* TAB: STORY */}
          {modalTab === 'story' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                      <div className="bg-white p-2 rounded-full shadow-sm text-blue-500"><Sparkles size={20} /></div>
                      <div>
                          <div className="font-bold text-blue-900 mb-1">AI Asistent</div>
                          <p className="text-sm text-blue-800 mb-3 opacity-80">Nechce sa vám písať? Vygenerujte pútavý popis jedným kliknutím.</p>
                          <button onClick={handleGenerateBio} disabled={isGenerating} className="text-xs bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow transition">
                              {isGenerating ? 'Generujem...' : 'Vygenerovať popis'}
                          </button>
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Príbeh (Popis)</label>
                      <textarea 
                         value={petBio} 
                         onChange={e => setPetBio(e.target.value)} 
                         className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl outline-none h-32 focus:ring-2 focus:ring-brand-500 transition"
                         placeholder="Napíšte niečo o zvieratku..."
                      ></textarea>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Interné poznámky / Dôležité info</label>
                      <textarea 
                         value={petNotes} 
                         onChange={e => setPetNotes(e.target.value)} 
                         className="w-full px-4 py-3 bg-white text-gray-900 border border-amber-200 rounded-xl outline-none h-24 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-400 transition"
                         placeholder="Napr. vyžaduje špeciálnu stravu, lieky..."
                      ></textarea>
                  </div>
              </div>
          )}

        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">Zrušiť</button>
            <button onClick={handleSaveClick} disabled={loading} className="px-8 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition transform hover:-translate-y-0.5 flex items-center gap-2">
                {loading && <Loader2 className="animate-spin" size={18}/>}
                {pet ? 'Uložiť zmeny' : 'Vytvoriť profil'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PetFormModal;
