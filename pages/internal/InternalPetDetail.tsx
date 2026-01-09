import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePets } from '../../contexts/PetContext';
import { useAuth } from '../../contexts/AuthContext';
import { Pet, PetType, Gender } from '../../types';
import {
    ChevronLeft, Save, Share2, MoreVertical, Camera,
    Activity, Calendar, FileText, CheckCircle2, AlertTriangle,
    Eye, EyeOff, Trash2, Heart, Syringe, Clock
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

    const location = useLocation();

    // Initial Load
    useEffect(() => {
        if (id === 'new') {
            // ... (keep existing new pet logic)
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
                health: {
                    isVaccinated: false,
                    isDewormed: false,
                    isCastrated: false,
                    isChipped: false,
                    hasAllergies: false
                },
                social: {
                    children: 'Neznáme',
                    dogs: 'Neznáme',
                    cats: 'Neznáme'
                },
                training: {
                    toiletTrained: false,
                    leashTrained: false,
                    carTravel: false,
                    aloneTime: false
                },
                requirements: {
                    activityLevel: 'Stredná',
                    suitableFor: [],
                    unsuitableFor: []
                },
                tags: [],
                adoptionFee: 0
            } as any);
            setIsEditing(true);
        } else if (id && pets.length > 0) {
            const found = pets.find(p => p.id === id);
            if (found) {
                setPet(found);
                // Check if directed to edit
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
                await addPet(pet as Pet);
                navigate(-1); // Go back or to the new ID if possible (limit of basic context)
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
            // Handle nested paths like 'health.isVaccinated'
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...(prev as any)[parent],
                        [child]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });
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

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('..')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition">
                    <ChevronLeft size={20} /> Späť na zoznam
                </button>
                <div className="flex items-center gap-3">
                    {id !== 'new' && (
                        <>
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Share2 size={18} /> Zdieľať
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 size={18} /> Zmazať
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
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-100 border border-gray-100 flex flex-col md:flex-row gap-8">
                {/* Photo Upload Placeholder */}
                <div className="flex-shrink-0">
                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-lg group cursor-pointer">
                        {pet.imageUrl ? (
                            <img src={pet.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300 flex-col gap-2">
                                <Camera size={32} />
                                {isEditing && <span className="text-[10px] uppercase font-bold text-gray-400">Zmeniť</span>}
                            </div>
                        )}
                        {/* Fake Upload Overlay */}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs" onClick={() => {
                                const url = prompt("Zadajte URL obrázka (dočasné riešenie):", "https://images.unsplash.com/photo-1543466835-00a7907e9de1");
                                if (url) handleChange('imageUrl', url);
                            }}>
                                Nahrať foto
                            </div>
                        )}
                    </div>
                </div>

                {/* Info / Inputs */}
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="w-full max-w-lg">
                            <div className="flex items-center gap-3 mb-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={pet.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className="text-3xl font-black text-gray-900 border-b-2 border-gray-200 focus:border-brand-500 bg-transparent w-full focus:outline-none"
                                        placeholder="Meno zvieraťa"
                                    />
                                ) : (
                                    <h1 className="text-3xl font-black text-gray-900">{pet.name}</h1>
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
                                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5"><Calendar size={16} /> {formatSlovakAge(pet.age || 0)}</span>
                                    <span className="flex items-center gap-1.5"><Activity size={16} /> {pet.breed}</span>
                                    <span className="flex items-center gap-1.5 text-gray-400"><Clock size={16} /> {daysInShelter} dní v útulku</span>
                                </div>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="text-right">
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Kvalita profilu</div>
                                <div className="text-xl font-black text-gray-900">{qualityScore}%</div>
                            </div>
                        )}
                    </div>

                    {/* Quick Toggles */}
                    <div className="pt-4 border-t border-gray-50">
                        <div
                            onClick={() => isEditing && handleChange('isVisible', !pet.isVisible)}
                            className={`
                                relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer group
                                ${pet.isVisible
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                }
                                ${!isEditing && 'cursor-default pointer-events-none'}
                            `}
                        >
                            <div className="p-3 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                                        ${pet.isVisible ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}
                                    `}>
                                        {pet.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </div>
                                    <div>
                                        <div className={`font-black text-sm ${pet.isVisible ? 'text-green-800' : 'text-gray-700'}`}>
                                            Zobraziť na Labka Nádeje
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">
                                            {pet.isVisible ? 'Profil je verejne dostupný' : 'Profil je skrytý pred verejnosťou'}
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className={`
                                        w-12 h-6 rounded-full p-1 transition-colors relative
                                        ${pet.isVisible ? 'bg-green-500' : 'bg-gray-300'}
                                    `}>
                                        <div className={`
                                            w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                                            ${pet.isVisible ? 'translate-x-6' : 'translate-x-0'}
                                        `} />
                                    </div>
                                )}
                            </div>

                            {/* Background Pattern */}
                            {pet.isVisible && (
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-100 rounded-full opacity-50 blur-xl pointer-events-none" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 flex items-center gap-6 overflow-x-auto">
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
                        <div className="space-y-6">
                            <Section title="O zvierati">
                                {isEditing ? (
                                    <textarea
                                        className="w-full min-h-[150px] p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                        value={pet.description}
                                        onChange={e => handleChange('description', e.target.value)}
                                        placeholder="Napíšte príbeh a popis zvieraťa..."
                                    />
                                ) : (
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{pet.description}</p>
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
                        <div className="space-y-6">
                            <Section title="Zdravotný záznam">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {isEditing ? (
                                        <>
                                            <FormToggle label="Očkovanie" checked={pet.health?.isVaccinated || false} onChange={v => handleChange('health.isVaccinated', v)} />
                                            <FormToggle label="Kastrácia" checked={pet.health?.isCastrated || false} onChange={v => handleChange('health.isCastrated', v)} />
                                            <FormToggle label="Čipovanie" checked={pet.health?.isChipped || false} onChange={v => handleChange('health.isChipped', v)} />
                                            <FormToggle label="Odčervenie" checked={pet.health?.isDewormed || false} onChange={v => handleChange('health.isDewormed', v)} />
                                        </>
                                    ) : (
                                        healthMetrics.map((m, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border ${m.value ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} flex flex-col items-center justify-center text-center`}>
                                                <m.icon size={24} className={`mb-2 ${m.value ? 'text-green-600' : 'text-red-400'}`} />
                                                <span className="text-xs font-bold uppercase text-gray-500">{m.label}</span>
                                                <span className={`text-lg font-black ${m.value ? 'text-green-700' : 'text-red-700'}`}>{m.value ? 'ÁNO' : 'NIE'}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {!isEditing && (
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center text-gray-500">
                                        Modul zdravotných záznamov (očkovania, operácie) bude dostupný čoskoro.
                                    </div>
                                )}
                            </Section>
                        </div>
                    )}
                </div>

                {/* Sidebar (Right 1/3) */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Dôležité</h3>
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
                                        <span className="text-gray-500">ID čip</span>
                                        <span className="font-mono font-bold text-gray-900">{pet.chipNumber || 'Nezadané'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Dátum príjmu</span>
                                        <span className="font-bold text-gray-900">{format(parseISO(pet.intakeDate || pet.postedDate || new Date().toISOString()), 'd.M.yyyy')}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Pohlavie</span>
                                        <span className="font-bold text-gray-900">{pet.gender}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                        <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><AlertTriangle size={18} /> Interné poznámky</h3>
                        {isEditing ? (
                            <textarea
                                className="w-full min-h-[80px] p-3 bg-orange-100 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-orange-700 italic"
                                value={pet.internalNotes || ''}
                                onChange={e => handleChange('internalNotes', e.target.value)}
                                placeholder="Pridajte interné poznámky..."
                            />
                        ) : (
                            <p className="text-sm text-orange-700 italic">
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
    if (status === 'Available') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Adopted') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
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
        className={`flex items-center gap-2 px-1 py-4 border-b-2 transition font-bold text-sm ${active ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const Section = ({ title, children }: any) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-4">{title}</h3>
        {children}
    </div>
);

const AttributeBox = ({ label, value }: any) => (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase">{label}</div>
        <div className="font-bold text-gray-800">{value || 'Nezadané'}</div>
    </div>
);

// Form Components
const FormInput = ({ label, value, onChange, type = "text" }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
    </div>
);

const FormSelect = ({ label, value, onChange, options }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat pr-10"
        >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FormToggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-white transition">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" />
    </label>
);

export default InternalPetDetail;
