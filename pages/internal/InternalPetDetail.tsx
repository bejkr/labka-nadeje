import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePets } from '../../contexts/PetContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Pet, PetType, Gender, Shelter } from '../../types';
import {
    ChevronLeft, Save, Share2, MoreVertical, Camera,
    Activity, Calendar, FileText, CheckCircle2, AlertTriangle,
    Eye, EyeOff, Trash2, Heart, Syringe, Clock, X, Upload
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { sk } from 'date-fns/locale';

const InternalPetDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { pets, updatePet, addPet, deletePet } = usePets();
    const { currentUser } = useAuth();

    // State
    const [pet, setPet] = useState<Partial<Pet> | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'gallery' | 'timeline'>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoPostToSocials, setAutoPostToSocials] = useState(false);

    const location = useLocation();

    // Initial Load
    useEffect(() => {
        if (id === 'new') {
            setPet({
                name: '',
                type: PetType.DOG,
                breed: '',
                age: 0,
                gender: Gender.MALE,
                size: 'Stredný',
                location: currentUser?.location || '',
                description: '',
                adoptionStatus: 'Available',
                shelterId: currentUser?.id,
                postedDate: new Date().toISOString(),
                isVisible: true,
                health: { isVaccinated: false, isDewormed: false, isCastrated: false, isChipped: false, hasAllergies: false },
                social: { children: 'Neznáme', dogs: 'Neznáme', cats: 'Neznáme' },
                training: { toiletTrained: false, leashTrained: false, carTravel: false, aloneTime: false },
                requirements: { activityLevel: 'Stredná', suitableFor: [], unsuitableFor: [] },
                tags: [],
                adoptionFee: 0,
                gallery: []
            } as any);
            setIsEditing(true);
        } else if (id && pets.length > 0) {
            const found = pets.find(p => p.id === id);
            if (found) {
                setPet(found);
                if ((location.state as any)?.edit) {
                    setIsEditing(true);
                }
            }
        }
    }, [id, pets, currentUser, location]);

    // Handlers
    const handleSave = async () => {
        if (!pet || !pet.name) return alert('Meno je povinné');
        setLoading(true);
        try {
            if (id === 'new') {
                await addPet(pet as Pet, autoPostToSocials);
                navigate(-1);
            } else {
                await updatePet(pet as Pet);
                setIsEditing(false);
            }
        } catch (e) {
            console.error(e);
            alert('Chyba pri ukladaní');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Naozaj chcete zmazať toto zviera?')) return;
        if (pet?.id) {
            await deletePet(pet.id);
            navigate('..');
        }
    };

    const handleChange = (field: string, value: any) => {
        setPet(prev => {
            if (!prev) return null;
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return { ...prev, [parent]: { ...(prev as any)[parent], [child]: value } };
            }
            return { ...prev, [field]: value };
        });
    };

    // Gallery Helpers
    const handleAddImage = () => {
        const url = prompt("Zadajte URL obrázka (dočasné riešenie):");
        if (url) {
            const newGallery = [...(pet?.gallery || []), url];
            handleChange('gallery', newGallery);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newGallery = (pet?.gallery || []).filter((_, i) => i !== index);
        handleChange('gallery', newGallery);
    };

    if (!pet) return <div className="p-12 text-center text-gray-500">Načítavam...</div>;

    // Calculations
    const daysInShelter = differenceInDays(new Date(), parseISO(pet.intakeDate || pet.postedDate || new Date().toISOString()));
    const qualityScore = calculateQualityScore(pet as Pet);

    const healthMetrics = [
        { label: 'Očkovanie', value: pet.health?.isVaccinated, icon: Syringe },
        { label: 'Kastrácia', value: pet.health?.isCastrated, icon: Activity },
        { label: 'Čipovanie', value: pet.health?.isChipped, icon: FileText },
    ];

    // Timeline Generation
    const timelineEvents = [
        { date: pet.postedDate || new Date().toISOString(), title: 'Vytvorenie profilu', type: 'create', icon: Star },
        ...(pet.updates || []).map((u: any) => ({ date: u.date, title: u.title, type: 'update', icon: RefreshCw })),
        ...(pet.medicalRecords || []).map((m: any) => ({ date: m.date, title: `Veterina: ${m.title}`, type: 'medical', icon: Syringe })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('..')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition">
                    <ChevronLeft size={20} /> Späť na zoznam
                </button>
                <div className="flex items-center gap-3">
                    {id !== 'new' && (
                        <>
                            <button
                                onClick={() => {
                                    const isConnected = (currentUser as unknown as Shelter).socialsAuth?.facebook?.linked || (currentUser as unknown as Shelter).socialsAuth?.instagram?.linked;
                                    if (!isConnected) {
                                        alert("Najprv si musíte prepojiť sociálne siete v nastaveniach.");
                                        navigate('/internal/settings');
                                        return;
                                    }
                                    if (confirm("Naozaj chcete zdieľať toto zvieratko na sociálne siete?")) {
                                        api.sharePet(id!)
                                            .then(() => alert("Úspešne zdieľané!"))
                                            .catch(e => { console.error(e); alert("Chyba pri zdieľaní."); });
                                    }
                                }}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Share2 size={18} /> <span className="hidden sm:inline">Zdieľať</span>
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 size={18} /> <span className="hidden sm:inline">Zmazať</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={loading}
                        className="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} /> {loading ? 'Ukladám...' : isEditing ? 'Uložiť zmeny' : 'Upraviť údaje'}
                    </button>
                </div>
            </div>

            {/* Main Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-8">
                {/* Photo Upload Placeholder */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg group cursor-pointer">
                        {pet.imageUrl ? (
                            <img src={pet.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-500 flex-col gap-2">
                                <Camera size={32} />
                                {isEditing && <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Zmeniť</span>}
                            </div>
                        )}
                        {/* Fake Upload Overlay */}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs" onClick={() => {
                                const url = prompt("Zadajte URL titulného obrázka:", "https://images.unsplash.com/photo-1543466835-00a7907e9de1");
                                if (url) handleChange('imageUrl', url);
                            }}>
                                Nahrať foto
                            </div>
                        )}
                    </div>
                </div>

                {/* Info / Inputs */}
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="w-full max-w-lg">
                            <div className="flex items-center gap-3 mb-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={pet.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className="text-3xl font-black text-gray-900 dark:text-white border-b-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 bg-transparent w-full focus:outline-none"
                                        placeholder="Meno zvieraťa"
                                    />
                                ) : (
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">{pet.name}</h1>
                                )}

                                {!isEditing && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(pet.adoptionStatus || 'Available')}`}>
                                        {pet.adoptionStatus}
                                    </span>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <FormSelect label="Druh" value={pet.type} onChange={v => handleChange('type', v)} options={Object.values(PetType)} />
                                    <FormInput label="Plemeno" value={pet.breed} onChange={v => handleChange('breed', v)} />
                                    <FormInput label="Vek (roky)" type="number" value={pet.age} onChange={v => handleChange('age', Number(v))} />
                                    <FormSelect label="Pohlavie" value={pet.gender} onChange={v => handleChange('gender', v)} options={Object.values(Gender)} />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium flex-wrap">
                                    <span className="flex items-center gap-1.5"><Calendar size={16} /> {formatSlovakAge(pet.age || 0)}</span>
                                    <span className="flex items-center gap-1.5"><Activity size={16} /> {pet.breed}</span>
                                    <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500"><Clock size={16} /> {daysInShelter} dní v útulku</span>
                                </div>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="text-right hidden md:block">
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Kvalita profilu</div>
                                <div className="text-xl font-black text-gray-900 dark:text-white">{qualityScore}%</div>
                            </div>
                        )}
                    </div>

                    {/* Quick Toggles */}
                    <div className="pt-4 border-t border-gray-50 dark:border-gray-700">
                        <div
                            onClick={() => isEditing && handleChange('isVisible', !pet.isVisible)}
                            className={`
                                relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer group
                                ${pet.isVisible
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                }
                                ${!isEditing && 'cursor-default pointer-events-none'}
                            `}
                        >
                            <div className="p-3 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                                        ${pet.isVisible ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}
                                    `}>
                                        {pet.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </div>
                                    <div>
                                        <div className={`font-black text-sm ${pet.isVisible ? 'text-green-800 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            Zobraziť na Labka Nádeje
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {pet.isVisible ? 'Profil je verejne dostupný' : 'Profil je skrytý pred verejnosťou'}
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className={`
                                        w-12 h-6 rounded-full p-1 transition-colors relative
                                        ${pet.isVisible ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                                    `}>
                                        <div className={`
                                            w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                                            ${pet.isVisible ? 'translate-x-6' : 'translate-x-0'}
                                        `} />
                                    </div>
                                )}
                            </div>

                            {pet.isVisible && (
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full opacity-50 blur-xl pointer-events-none" />
                            )}
                        </div>

                        {/* Social Auto-Post Toggle (New Pet Only) */}
                        {id === 'new' && (
                            <div className="mt-4">
                                <div
                                    onClick={() => {
                                        const isConnected = (currentUser as unknown as Shelter).socialsAuth?.facebook?.linked || (currentUser as unknown as Shelter).socialsAuth?.instagram?.linked;
                                        if (isConnected) {
                                            setAutoPostToSocials(!autoPostToSocials);
                                        } else {
                                            alert("Najprv si musíte prepojiť sociálne siete v nastaveniach profilu.");
                                            navigate('/internal/settings');
                                        }
                                    }}
                                    className={`
                                        relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer group
                                        ${autoPostToSocials
                                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                        }
                                    `}
                                >
                                    <div className="p-3 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                                                ${autoPostToSocials ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}
                                            `}>
                                                <Share2 size={20} />
                                            </div>
                                            <div>
                                                <div className={`font-black text-sm ${autoPostToSocials ? 'text-pink-800 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    Zdieľať na sociálne siete
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    {((currentUser as unknown as Shelter).socialsAuth?.facebook?.linked || (currentUser as unknown as Shelter).socialsAuth?.instagram?.linked)
                                                        ? (autoPostToSocials ? 'Automaticky vytvorí príspevok' : 'Nezdieľať automaticky')
                                                        : 'Nie je pripojené (Kliknite pre nastavenie)'
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`
                                            w-12 h-6 rounded-full p-1 transition-colors relative
                                            ${autoPostToSocials ? 'bg-pink-500' : ((currentUser as unknown as Shelter).socialsAuth?.facebook?.linked || (currentUser as unknown as Shelter).socialsAuth?.instagram?.linked) ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700 opacity-50'}
                                        `}>
                                            <div className={`
                                                w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                                                ${autoPostToSocials ? 'translate-x-6' : 'translate-x-0'}
                                            `} />
                                        </div>
                                    </div>
                                </div>
                                {!((currentUser as unknown as Shelter).socialsAuth?.facebook?.linked || (currentUser as unknown as Shelter).socialsAuth?.instagram?.linked) && (
                                    <div className="flex items-center gap-2 mt-2 px-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                                        <AlertTriangle size={12} />
                                        <span>Pre zdieľanie si najprv prepojte účty v <span onClick={(e) => { e.stopPropagation(); navigate('/internal/settings'); }} className="underline cursor-pointer hover:text-orange-700">nastaveniach</span>.</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex items-center gap-6 overflow-x-auto no-scrollbar">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Prehľad" icon={FileText} />
                <TabButton active={activeTab === 'health'} onClick={() => setActiveTab('health')} label="Zdravie" icon={Activity} />
                <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} label="Galéria" icon={Camera} />
                <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label="Časová os" icon={Calendar} />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Section title="O zvierati">
                                {isEditing ? (
                                    <textarea
                                        className="w-full min-h-[150px] p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed text-gray-900 dark:text-gray-100"
                                        value={pet.description}
                                        onChange={e => handleChange('description', e.target.value)}
                                        placeholder="Napíšte príbeh a popis zvieraťa..."
                                    />
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{pet.description || 'Žiadny popis.'}</p>
                                )}
                            </Section>

                            <Section title="Vlastnosti a povaha">
                                <div className="grid grid-cols-2 gap-4">
                                    {isEditing ? (
                                        <>
                                            <FormSelect label="Aktivita" value={pet.requirements?.activityLevel} onChange={v => handleChange('requirements.activityLevel', v)} options={['Nízka', 'Stredná', 'Vysoká']} />
                                            <FormSelect label="Psy" value={pet.social?.dogs} onChange={v => handleChange('social.dogs', v)} options={['Vhodný', 'Nevhodný', 'Opatrne', 'Neznáme']} />
                                            <FormSelect label="Deti" value={pet.social?.children} onChange={v => handleChange('social.children', v)} options={['Vhodný', 'Nevhodný', 'Opatrne', 'Neznáme']} />
                                            <FormToggle label="Hygienické návyky" checked={pet.training?.toiletTrained || false} onChange={v => handleChange('training.toiletTrained', v)} />
                                        </>
                                    ) : (
                                        <>
                                            <AttributeBox label="Aktivita" value={pet.requirements?.activityLevel} />
                                            <AttributeBox label="Vhodný k iným psom" value={pet.social?.dogs} />
                                            <AttributeBox label="Vhodný k deťom" value={pet.social?.children} />
                                            <AttributeBox label="Hygiena" value={pet.training?.toiletTrained ? 'Zvládnutá 100%' : 'Vo výcviku'} />
                                        </>
                                    )}
                                </div>
                            </Section>
                        </div>
                    )}

                    {activeTab === 'health' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Section title="Zdravotný záznam">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {isEditing ? (
                                        <>
                                            <FormToggle label="Očkovanie" checked={pet.health?.isVaccinated || false} onChange={v => handleChange('health.isVaccinated', v)} />
                                            <FormToggle label="Kastrácia" checked={pet.health?.isCastrated || false} onChange={v => handleChange('health.isCastrated', v)} />
                                            <FormToggle label="Čipovanie" checked={pet.health?.isChipped || false} onChange={v => handleChange('health.isChipped', v)} />
                                            <FormToggle label="Odčervenie" checked={pet.health?.isDewormed || false} onChange={v => handleChange('health.isDewormed', v)} />
                                        </>
                                    ) : (
                                        healthMetrics.map((m, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border ${m.value ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900'} flex flex-col items-center justify-center text-center`}>
                                                <m.icon size={24} className={`mb-2 ${m.value ? 'text-green-600 dark:text-green-400' : 'text-red-400'}`} />
                                                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{m.label}</span>
                                                <span className={`text-lg font-black ${m.value ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{m.value ? 'ÁNO' : 'NIE'}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {!isEditing && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                                        Modul zdravotných záznamov (očkovania, operácie) bude dostupný čoskoro.
                                    </div>
                                )}
                            </Section>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Section title="Galéria">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {pet.gallery?.map((url: string, index: number) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <img src={url} className="w-full h-full object-cover" />
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <button
                                            onClick={handleAddImage}
                                            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 gap-2"
                                        >
                                            <Upload size={24} />
                                            <span className="text-xs font-bold uppercase">Pridať foto</span>
                                        </button>
                                    )}
                                </div>
                                {(!pet.gallery || pet.gallery.length === 0) && !isEditing && (
                                    <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                                        <Camera size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>Žiadne ďalšie fotografie.</p>
                                    </div>
                                )}
                            </Section>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Section title="Časová os">
                                <div className="border-l-2 border-gray-100 dark:border-gray-700 ml-4 space-y-8 pl-8 relative">
                                    {timelineEvents.map((event, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-100 dark:border-gray-700 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">{format(parseISO(event.date), 'd. MMMM yyyy', { locale: sk })}</div>
                                            <div className="font-bold text-gray-900 dark:text-white">{event.title}</div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </div>
                    )}
                </div>

                {/* Sidebar (Right 1/3) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Dôležité</h3>
                        <div className="space-y-4">
                            {isEditing ? (
                                <>
                                    <FormInput label="Číslo čipu" value={pet.chipNumber || ''} onChange={v => handleChange('chipNumber', v)} />
                                    <FormInput label="Interné ID" value={pet.internalId || ''} onChange={v => handleChange('internalId', v)} />
                                    <FormSelect label="Status adopcie" value={pet.adoptionStatus} onChange={v => handleChange('adoptionStatus', v)} options={['Available', 'Pending', 'Adopted']} />
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">ID čip</span>
                                        <span className="font-mono font-bold text-gray-900 dark:text-white">{pet.chipNumber || 'Nezadané'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Dátum príjmu</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{format(parseISO(pet.intakeDate || pet.postedDate || new Date().toISOString()), 'd.M.yyyy')}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Pohlavie</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{pet.gender}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6">
                        <h3 className="font-bold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2"><AlertTriangle size={18} /> Interné poznámky</h3>
                        {isEditing ? (
                            <textarea
                                className="w-full min-h-[80px] p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-orange-700 dark:text-orange-300 italic"
                                value={pet.internalNotes || ''}
                                onChange={e => handleChange('internalNotes', e.target.value)}
                                placeholder="Pridajte interné poznámky..."
                            />
                        ) : (
                            <p className="text-sm text-orange-700 dark:text-orange-300 italic">
                                {pet.internalNotes || 'Žiadne interné poznámky.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helpers

const calculateQualityScore = (pet: Pet) => {
    let score = 100;
    if (!pet.imageUrl) score -= 30;
    if (!pet.description || pet.description.length < 100) score -= 20;
    if (!pet.health?.isVaccinated) score -= 10;
    if (!pet.social?.dogs) score -= 10;
    return Math.max(0, score);
};

const getStatusColor = (status: string) => {
    if (status === 'Available') return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900';
    if (status === 'Adopted') return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900';
};

const formatSlovakAge = (age: number) => {
    if (age < 1) return 'Šteňa';
    if (age === 1) return '1 rok';
    if (age > 1 && age < 5) return `${age} roky`;
    return `${age} rokov`;
};

// Subcomponents

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-1 py-4 border-b-2 transition font-bold text-sm whitespace-nowrap ${active ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const Section = ({ title, children }: any) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">{title}</h3>
        {children}
    </div>
);

const AttributeBox = ({ label, value }: any) => (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
        <div className="text-xs font-bold text-gray-400 uppercase">{label}</div>
        <div className="font-bold text-gray-800 dark:text-gray-100">{value || 'Nezadané'}</div>
    </div>
);

// Form Components
const FormInput = ({ label, value, onChange, type = "text" }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
        />
    </div>
);

const FormSelect = ({ label, value, onChange, options }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat pr-10 text-gray-900 dark:text-white"
        >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FormToggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
    </label>
);

// Icons for Timeline
import { Star, RefreshCw } from 'lucide-react';

export default InternalPetDetail;
