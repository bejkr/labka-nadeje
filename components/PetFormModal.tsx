
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Sparkles, Loader2, Info, Video, Film, Star, Footprints, Dog, Car, Moon, CheckCircle, Pill, Utensils, AlertCircle } from 'lucide-react';
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
    const [petTraitsState, setPetTraitsState] = useState('');
    const [petBio, setPetBio] = useState('');
    const [petNotes, setPetNotes] = useState('');
    const [petStatus, setPetStatus] = useState<Pet['adoptionStatus']>('Available');
    const [petVisible, setPetVisible] = useState(true);
    const [petNeedsFoster, setPetNeedsFoster] = useState(false);
    const [petLocation, setPetLocation] = useState('');

    const [petType, setPetType] = useState<PetType>(PetType.DOG);
    const [petGender, setPetGender] = useState<Gender>(Gender.MALE);
    const [petSize, setPetSize] = useState<Size>(Size.MEDIUM);

    const [petAge, setPetAge] = useState<string>('1');
    const [adoptionFee, setAdoptionFee] = useState<string>('0');

    const [petVideoUrl, setPetVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const [mainImage, setMainImage] = useState<{ url: string, file?: File } | null>(null);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);

    const [health, setHealth] = useState<any>({
        isVaccinated: false,
        isDewormed: false,
        isCastrated: false,
        isChipped: false,
        hasAllergies: false,
        allergiesDescription: '',
        medication: '',
        diet: ''
    });

    const [social, setSocial] = useState<any>({});

    const [training, setTraining] = useState({
        toiletTrained: false,
        leashTrained: false,
        carTravel: false,
        aloneTime: false
    });

    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (pet) {
                setPetName(pet.name || '');
                setPetBreed(pet.breed || '');
                setPetTraitsState(Array.isArray(pet.tags) ? pet.tags.join(', ') : '');
                setPetBio(pet.description || '');
                setPetNotes(pet.importantNotes || '');
                setPetStatus(pet.adoptionStatus || 'Available');
                setPetVisible(pet.isVisible !== false);
                setPetNeedsFoster(!!pet.needsFoster);
                setPetLocation(pet.location || '');
                setAdoptionFee((pet.adoptionFee ?? 0).toString());
                setPetVideoUrl(pet.videoUrl || '');
                setVideoFile(null);
                setHealth({
                    isVaccinated: !!pet.health?.isVaccinated,
                    isDewormed: !!pet.health?.isDewormed,
                    isCastrated: !!pet.health?.isCastrated,
                    isChipped: !!pet.health?.isChipped,
                    hasAllergies: !!pet.health?.hasAllergies,
                    allergiesDescription: pet.health?.allergiesDescription || '',
                    medication: pet.health?.medication || '',
                    diet: pet.health?.diet || ''
                });
                setSocial(pet.social || {});
                setTraining({
                    toiletTrained: !!pet.training?.toiletTrained,
                    leashTrained: !!pet.training?.leashTrained,
                    carTravel: !!pet.training?.carTravel,
                    aloneTime: !!pet.training?.aloneTime
                });
                setPetType(pet.type || PetType.DOG);
                setPetGender(pet.gender || Gender.MALE);
                setPetSize(pet.size || Size.MEDIUM);
                setPetAge((pet.age ?? 0).toString());

                setMainImage(pet.imageUrl ? { url: pet.imageUrl } : null);
                setGallery(pet.gallery?.map(url => ({ id: Math.random().toString(36), url })) || []);
            } else {
                setPetName(''); setPetBreed(''); setPetTraitsState(''); setPetBio(''); setPetNotes('');
                setPetStatus('Available'); setPetVisible(true); setPetNeedsFoster(false);
                setPetLocation(defaultLocation || '');
                setAdoptionFee('0'); setPetVideoUrl(''); setVideoFile(null);
                setHealth({
                    isVaccinated: false, isDewormed: false, isCastrated: false, isChipped: false,
                    hasAllergies: false, allergiesDescription: '', medication: '', diet: ''
                });
                setSocial({});
                setTraining({ toiletTrained: false, leashTrained: false, carTravel: false, aloneTime: false });
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
        const bio = await generatePetDescription(petName, petBreed, petTraitsState.split(','));
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
            if (file.size > 50 * 1024 * 1024) {
                alert("Video je príliš veľké. Maximálna veľkosť je 50MB.");
                return;
            }
            setVideoFile(file);
            setPetVideoUrl('');
        }
    };

    const removeGalleryImage = (id: string) => {
        setGallery(prev => prev.filter(item => item.id !== id));
    };

    const handleSetAsMain = (item: GalleryItem) => {
        let updatedGallery = [...gallery];
        if (mainImage) {
            updatedGallery.push({
                id: Math.random().toString(36),
                url: mainImage.url,
                file: mainImage.file
            });
        }
        updatedGallery = updatedGallery.filter(i => i.id !== item.id);
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
            let finalMainImageUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1';
            if (mainImage) {
                if (mainImage.file) {
                    finalMainImageUrl = await api.uploadFile(mainImage.file, 'images', 'pets');
                } else {
                    finalMainImageUrl = mainImage.url;
                }
            }

            const finalGallery: string[] = [];
            for (const item of gallery) {
                if (item.file) {
                    const url = await api.uploadFile(item.file, 'images', 'pets');
                    finalGallery.push(url);
                } else {
                    finalGallery.push(item.url);
                }
            }

            let finalVideoUrl = petVideoUrl;
            if (videoFile) {
                finalVideoUrl = await api.uploadFile(videoFile, 'images', 'videos');
            }

            const commonData = {
                name: petName, breed: petBreed, type: petType, gender: petGender, size: petSize,
                age: parseFloat(petAge) || 0,
                location: petLocation,
                tags: petTraitsState.split(',').map(t => t.trim()).filter(Boolean),
                description: petBio || 'Bez popisu',
                importantNotes: petNotes, adoptionStatus: petStatus,
                isVisible: petVisible, needsFoster: petNeedsFoster,
                adoptionFee: parseFloat(adoptionFee) || 0,
                imageUrl: finalMainImageUrl,
                gallery: finalGallery,
                health: { ...health },
                social: { children: 'Neznáme', dogs: 'Neznáme', cats: 'Neznáme', ...social },
                training: { ...training },
                requirements: { activityLevel: 'Stredná', suitableFor: [], unsuitableFor: [], ...pet?.requirements },
                videoUrl: finalVideoUrl,
            };

            let petToSave: Pet;
            if (pet) {
                petToSave = { ...pet, ...commonData } as Pet;
            } else {
                if (!shelterId) throw new Error("Shelter ID is missing for new pet");
                petToSave = {
                    id: '',
                    ...commonData,
                    shelterId: shelterId,
                    postedDate: new Date().toISOString().split('T')[0],
                    views: 0
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
                    <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-500 p-2 rounded-full border border-gray-200 transition"><X size={20} /></button>
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
                                            <button onClick={() => setMainImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
                                        </div>
                                    )}
                                    {gallery.map((item) => (
                                        <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group">
                                            <img src={item.url} className="w-full h-full object-cover" alt="Gallery" />
                                            <button onClick={() => removeGalleryImage(item.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
                                            <button onClick={() => handleSetAsMain(item)} className="absolute bottom-2 right-2 bg-white/90 text-gray-400 hover:text-brand-500 hover:bg-white p-1.5 rounded-full shadow-sm transition opacity-0 group-hover:opacity-100"><Star size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Meno <span className="text-red-500">*</span></label><input value={petName} onChange={e => setPetName(e.target.value)} type="text" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" placeholder="Napr. Bary" /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Plemeno <span className="text-red-500">*</span></label><input value={petBreed} onChange={e => setPetBreed(e.target.value)} type="text" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" placeholder="Napr. Kríženec" /></div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-gray-900">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Druh <span className="text-red-500">*</span></label>
                                    <select value={petType} onChange={e => setPetType(e.target.value as PetType)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                                        <option value={PetType.DOG}>Pes</option>
                                        <option value={PetType.CAT}>Mačka</option>
                                        <option value={PetType.OTHER}>Iné</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Pohlavie <span className="text-red-500">*</span></label>
                                    <select value={petGender} onChange={e => setPetGender(e.target.value as Gender)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                                        <option value={Gender.MALE}>Samec</option>
                                        <option value={Gender.FEMALE}>Samica</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-gray-900">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Vek (roky) <span className="text-red-500">*</span></label>
                                    <input value={petAge} onChange={e => setPetAge(e.target.value)} type="number" min="0" step="0.1" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition" onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Veľkosť <span className="text-red-500">*</span></label>
                                    <select value={petSize} onChange={e => setPetSize(e.target.value as Size)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                                        <option value={Size.SMALL}>Malý</option>
                                        <option value={Size.MEDIUM}>Stredný</option>
                                        <option value={Size.LARGE}>Veľký</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Lokalita <span className="text-red-500">*</span></label>
                                <input value={petLocation} onChange={e => setPetLocation(e.target.value)} type="text" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" placeholder="Napr. Bratislava - Ružinov" />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Video size={18} className="text-brand-600" /> Video</label>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Odkaz (YouTube/Vimeo)</label>
                                        <input value={petVideoUrl} onChange={e => { setPetVideoUrl(e.target.value); setVideoFile(null); }} type="text" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 text-sm" placeholder="https://www.youtube.com/watch?v=..." disabled={!!videoFile} />
                                    </div>
                                    <div className="flex items-center gap-3"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs text-gray-400 font-bold">ALEBO</span><div className="h-px bg-gray-200 flex-1"></div></div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Nahrať z počítača</label>
                                        <div onClick={() => videoInputRef.current?.click()} className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${videoFile ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-brand-300'}`}>
                                            {videoFile ? (
                                                <div className="flex items-center gap-2 text-green-700 font-bold text-sm"><Film size={20} /><span>{videoFile.name}</span><button onClick={(e) => { e.stopPropagation(); setVideoFile(null); }} className="p-1 hover:bg-green-200 rounded-full"><X size={14} /></button></div>
                                            ) : (
                                                <><Upload className="text-gray-400 mb-1" size={24} /><span className="text-sm text-gray-500 font-medium">Kliknite pre výber videa (max 50MB)</span></>
                                            )}
                                            <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Status a Viditeľnosť</label>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-300">
                                            <input type="radio" checked={petStatus === 'Available'} onChange={() => setPetStatus('Available')} className="text-brand-600" />
                                            <span className="text-sm font-medium">Na adopciu</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-300">
                                            <input type="radio" checked={petStatus === 'Reserved'} onChange={() => setPetStatus('Reserved')} className="text-brand-600" />
                                            <span className="text-sm font-medium">Rezervovaný</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-300">
                                            <input type="radio" checked={petStatus === 'Adopted'} onChange={() => setPetStatus('Adopted')} className="text-brand-600" />
                                            <span className="text-sm font-medium">Adoptovaný</span>
                                        </label>
                                    </div>
                                    <div className="w-px bg-gray-300 hidden sm:block"></div>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={petVisible} onChange={e => setPetVisible(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5" /><span className="text-sm font-bold text-gray-700">Viditeľný</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={petNeedsFoster} onChange={e => setPetNeedsFoster(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5" /><span className="text-sm font-bold text-gray-700">Hľadá dočasku</span></label>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalTab === 'details' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Vlastnosti (oddelené čiarkou)</label>
                                <input value={petTraitsState} onChange={e => setPetTraitsState(e.target.value)} type="text" placeholder="Priateľský, Aktívny, Vhodný k deťom..." className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition" />
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-900">
                                <h4 className="font-bold text-gray-900 mb-4">Sociálne návyky</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Deti</label>
                                        <select value={social.children || 'Neznáme'} onChange={e => setSocial({ ...social, children: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-brand-500 text-gray-900"><option>Vhodný</option><option>Nevhodný</option><option>Opatrne</option><option>Neznáme</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Psy</label>
                                        <select value={social.dogs || 'Neznáme'} onChange={e => setSocial({ ...social, dogs: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-brand-500 text-gray-900"><option>Vhodný</option><option>Nevhodný</option><option>Opatrne</option><option>Neznáme</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Mačky</label>
                                        <select value={social.cats || 'Neznáme'} onChange={e => setSocial({ ...social, cats: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-brand-500 text-gray-900"><option>Vhodný</option><option>Nevhodný</option><option>Opatrne</option><option>Neznáme</option></select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2"><CheckCircle size={18} className="text-brand-600" /><h4 className="font-bold text-gray-900">Výchova a návyky</h4></div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: 'toiletTrained', label: 'Hygienické návyky', icon: Footprints },
                                        { id: 'leashTrained', label: 'Chôdza na vodítku', icon: Dog },
                                        { id: 'carTravel', label: 'Cesta autom', icon: Car },
                                        { id: 'aloneTime', label: 'Zvláda samotu', icon: Moon }
                                    ].map((item) => (
                                        <label key={item.id} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-brand-50 cursor-pointer transition">
                                            <input
                                                type="checkbox"
                                                checked={(training as any)[item.id]}
                                                onChange={e => setTraining({ ...training, [item.id]: e.target.checked })}
                                                className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                                            />
                                            <div className="flex items-center gap-2">
                                                <item.icon size={18} className="text-gray-400" />
                                                <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: HEALTH */}
                    {modalTab === 'health' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-gray-900">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'isVaccinated', label: 'Očkovaný' },
                                    { id: 'isChipped', label: 'Čipovaný' },
                                    { id: 'isCastrated', label: 'Kastrovaný' },
                                    { id: 'isDewormed', label: 'Odčervený' }
                                ].map((item) => (
                                    <label key={item.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-200 cursor-pointer bg-white transition shadow-sm">
                                        <input type="checkbox" checked={health[item.id] || false} onChange={e => setHealth({ ...health, [item.id]: e.target.checked })} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300" />
                                        <span className="font-bold text-gray-700">{item.label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-base"><AlertCircle size={20} className="text-brand-600" /> Špeciálne zdravotné potreby</h4>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-red-200 transition">
                                        <input type="checkbox" checked={health.hasAllergies} onChange={e => setHealth({ ...health, hasAllergies: e.target.checked })} className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                                        <span className="text-sm font-bold text-gray-700">Má alergie</span>
                                    </label>

                                    {health.hasAllergies && (
                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Popis alergií</label>
                                            <input value={health.allergiesDescription} onChange={e => setHealth({ ...health, allergiesDescription: e.target.value })} type="text" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder="Napr. kuracie mäso, pele, určité lieky..." />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 flex items-center gap-1"><Pill size={12} className="text-blue-500" /> Lieky</label>
                                            <input value={health.medication} onChange={e => setHealth({ ...health, medication: e.target.value })} type="text" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder="Napr. pol tablety denne na srdce..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 flex items-center gap-1"><Utensils size={12} className="text-green-500" /> Špeciálna strava / Diéta</label>
                                            <input value={health.diet} onChange={e => setHealth({ ...health, diet: e.target.value })} type="text" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm" placeholder="Napr. gastro diéta, iba mokrá strava..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Adopčný poplatok (€)</label>
                                <input type="number" min="0" value={adoptionFee} onChange={e => setAdoptionFee(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900" onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()} />
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
                                    <div className="font-bold text-blue-900 mb-1">Labka Asistent</div>
                                    <p className="text-sm text-blue-800 mb-3 opacity-80">Nechce sa vám písať? Vygenerujte pútavý popis jedným kliknutím.</p>
                                    <button onClick={handleGenerateBio} disabled={isGenerating} className="text-xs bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow transition">{isGenerating ? 'Generujem...' : 'Vygenerovať popis'}</button>
                                </div>
                            </div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Príbeh (Popis) <span className="text-red-500">*</span></label><textarea value={petBio} onChange={e => setPetBio(e.target.value)} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl outline-none h-32 focus:ring-2 focus:ring-brand-500 transition" placeholder="Napíšte niečo o zvieratku..."></textarea></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Interné poznámky / Dôležité info</label><textarea value={petNotes} onChange={e => setPetNotes(e.target.value)} className="w-full px-4 py-3 bg-white text-gray-900 border border-amber-200 rounded-xl outline-none h-24 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-400 transition" placeholder="Napr. vyžaduje špeciálnu stravu, lieky..."></textarea></div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">Zrušiť</button>
                    <button onClick={handleSaveClick} disabled={loading} className="px-8 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition transform hover:-translate-y-0.5 flex items-center gap-2">{loading && <Loader2 className="animate-spin" size={18} />}{pet ? 'Uložiť zmeny' : 'Vytvoriť profil'}</button>
                </div>
            </div>
        </div>
    );
};

export default PetFormModal;
