import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building, TreePine, User, Users, Dog, Cat, Rabbit, Armchair, Footprints, Flame, Clock, Heart, Shield, Tent, ArrowRight, ArrowLeft, CheckCircle, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Pet, PetType, Size } from '../types';

// --- QUESTIONNAIRE DATA ---
const QUESTIONS = [
    {
        id: 'living',
        question: "Kde bude váš nový parťák bývať?",
        icon: <Home className="text-brand-600" size={32} />,
        options: [
            { id: 'apartment', label: 'V byte', icon: <Building size={24} />, description: 'Mestské bývanie' },
            { id: 'house_small', label: 'Dom s malým dvorom', icon: <Home size={24} />, description: 'Menšia záhradka' },
            { id: 'house_large', label: 'Dom s veľkou záhradou', icon: <TreePine size={24} />, description: 'Veľa priestoru na behanie' }
        ]
    },
    {
        id: 'household',
        question: "Kto všetko s vami tvorí domácnosť?",
        icon: <Users className="text-brand-600" size={32} />,
        options: [
            { id: 'adults', label: 'Iba ja / My dospeláci', icon: <User size={24} />, description: 'Bez detí' },
            { id: 'kids_small', label: 'Máme malé deti (do 6 rokov)', icon: <Users size={24} />, description: 'Vyžaduje trpezlivého psíka' },
            { id: 'kids_school', label: 'Máme školákov (6+ rokov)', icon: <Users size={24} />, description: 'Deti vedia ako sa správať' }
        ]
    },
    {
        id: 'other_pets',
        question: "Máte už doma nejaké zvieratká?",
        icon: <Dog className="text-brand-600" size={32} />,
        options: [
            { id: 'dog', label: 'Máme psíka', icon: <Dog size={24} />, description: 'Hľadáme kamoša' },
            { id: 'cat', label: 'Máme mačičku', icon: <Cat size={24} />, description: 'Musí zniesť mačky' },
            { id: 'other_none', label: 'Iné / Žiadne', icon: <Rabbit size={24} />, description: 'Sme pripravení na prvého' }
        ]
    },
    {
        id: 'energy',
        question: "Ako najradšej trávite voľný čas?",
        icon: <Flame className="text-brand-600" size={32} />,
        options: [
            { id: 'low', label: 'Pohodička doma & krátke prechádzky', icon: <Armchair size={24} />, description: 'Gaučing je náš šport' },
            { id: 'medium', label: 'Dlhšie prechádzky a výlety', icon: <Footprints size={24} />, description: 'Aktívny životný štýl' },
            { id: 'high', label: 'Beh, túry, stále v pohybe', icon: <Flame size={24} />, description: 'Adrenalín a šport' }
        ]
    },
    {
        id: 'experience',
        question: "Aké sú vaše skúsenosti so psíkmi?",
        icon: <Sparkles className="text-brand-600" size={32} />,
        options: [
            { id: 'beginner', label: 'Bude to môj prvý pes', icon: <CheckCircle size={24} />, description: 'Hľadám nenáročného parťáka' },
            { id: 'intermediate', label: 'Už som psa mal/a', icon: <CheckCircle size={24} />, description: 'Mám základné skúsenosti' },
            { id: 'experienced', label: 'Mám skúsenosti aj s náročnejšou výchovou', icon: <CheckCircle size={24} />, description: 'Trúfam si aj na výzvy' }
        ]
    },
    {
        id: 'time',
        question: "Koľko času bude psík tráviť doma sám?",
        icon: <Clock className="text-brand-600" size={32} />,
        options: [
            { id: 'minimal', label: 'Takmer vôbec (0-4 hodiny)', icon: <Clock size={24} />, description: 'Vždy je niekto doma' },
            { id: 'work', label: 'Počas práce (4-8 hodín)', icon: <Clock size={24} />, description: 'Klasický pracovný režim' },
            { id: 'long', label: 'Viac ako 8 hodín denne', icon: <AlertCircle size={24} />, description: 'Dlhšia samota' }
        ]
    },
    {
        id: 'vibe',
        question: "Čo od psíka najviac očakávate?",
        icon: <Heart className="text-brand-600" size={32} />,
        options: [
            { id: 'cuddle', label: 'Bezpodmienečnú lásku a túlenie', icon: <Heart size={24} />, description: 'Maznáčik' },
            { id: 'guard', label: 'Pocit bezpečia a stráženie', icon: <Shield size={24} />, description: 'Ochranca' },
            { id: 'adventure', label: 'Parťáka na dobrodružstvá', icon: <Tent size={24} />, description: 'Dobrodruh' }
        ]
    }
];

const SmartMatch: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0 = Intro, 1-7 = Questions, 8 = Results
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<{ pet: Pet; score: number; reasons: string[] }[]>([]);

    // --- MATCHING LOGIC ---
    const calculateMatches = async () => {
        setLoading(true);
        try {
            // 1. Fetch ALL pets (in production this should be a backend filter, but MVP is client-side)
            const allPets = await api.getPets();
            const dogs = allPets.filter(p => p.type === PetType.DOG && p.adoptionStatus === 'Available');

            const scoredPets = dogs.map(pet => {
                let score = 0;
                let reasons: string[] = [];
                let veto = false;

                // --- VETO FILTERS (The Hard "No") ---

                // 1. Apartment Veto
                if (answers['living'] === 'apartment') {
                    if (pet.size === Size.LARGE) {
                        // Soft veto for large dogs in apartment unless specified suitable
                        // Checking tags or requirements
                        if (!pet.requirements.suitableFor.includes('Byt')) veto = true;
                    }
                    if (pet.requirements.unsuitableFor.includes('Byt')) veto = true;
                }

                // 2. Kids Veto
                if (answers['household']?.startsWith('kids')) {
                    if (pet.social.children === 'Nevhodný') veto = true;
                    if (answers['household'] === 'kids_small' && pet.social.children === 'Opatrne') veto = true; // Strict for small kids
                }

                // 3. Cats/Dogs Veto
                if (answers['other_pets'] === 'cat' && pet.social.cats === 'Nevhodný') veto = true;
                if (answers['other_pets'] === 'dog' && pet.social.dogs === 'Nevhodný') veto = true;

                // 4. Time/Puppy Veto
                // If alone for >8 hours, puppies (<1y) are a bad idea
                if (answers['time'] === 'long' && pet.age < 1) veto = true;


                // --- SCORING (The Soft "Yes") ---
                if (!veto) {
                    // Base Score
                    score = 10;

                    // Activity Match
                    const userEnergy = answers['energy']; // low, medium, high
                    const petActivity = pet.requirements.activityLevel; // Nízka, Stredná, Vysoká

                    if (
                        (userEnergy === 'low' && petActivity === 'Nízka') ||
                        (userEnergy === 'medium' && petActivity === 'Stredná') ||
                        (userEnergy === 'high' && petActivity === 'Vysoká')
                    ) {
                        score += 5;
                        reasons.push("Má ideálnu úroveň energie pre váš štýl.");
                    } else if (
                        (userEnergy === 'low' && petActivity === 'Stredná') ||
                        (userEnergy === 'medium' && (petActivity === 'Nízka' || petActivity === 'Vysoká'))
                    ) {
                        score += 2; // Close match
                    } else {
                        score -= 2; // Mismatch (e.g. Low Energy user + High Energy dog)
                    }

                    // Experience Match
                    if (answers['experience'] === 'beginner') {
                        if (pet.requirements.suitableFor.includes('Začiatočník')) {
                            score += 5;
                            reasons.push("Skvelá voľba pre prvého psíka.");
                        }
                        if (pet.requirements.suitableFor.includes('Skúsený')) {
                            veto = true; // VETO: Beginner shouldn't have "Expert only" dog
                        }
                    }

                    // Vibe Match
                    if (answers['vibe'] === 'cuddle') {
                        // Check description or tags for keywords (MVP approach)
                        if (pet.tags.some(t => ['Mojkáč', 'Pokojný', 'Priateľský'].includes(t)) || pet.description.toLowerCase().includes('mojk') || pet.description.toLowerCase().includes('túl')) {
                            score += 3;
                            reasons.push("Presne ten mojkáč, ktorého hľadáte.");
                        }
                    }
                    if (answers['vibe'] === 'guard') {
                        if (pet.tags.includes('Strážny') || pet.description.toLowerCase().includes('stráž')) {
                            score += 3;
                            reasons.push("Váš verný ochranca.");
                        }
                    }
                    if (answers['vibe'] === 'adventure') {
                        if (petActivity === 'Vysoká' || pet.tags.includes('Aktívny')) {
                            score += 3;
                            reasons.push("Pripravený na každé dobrodružstvo.");
                        }
                    }

                    // Housing Bonus
                    if (answers['living'] === 'house_large' && pet.size === Size.LARGE) {
                        score += 2; // Big dogs happy in big gardens
                        reasons.push("Má rád priestor, ktorý mu ponúkate.");
                    }
                    if (answers['living'] === 'apartment' && pet.size === Size.SMALL) {
                        score += 2; // Small dogs happy in apartments
                        reasons.push("Ideálna veľkosť do bytu.");
                    }
                    if (answers['living'] === 'house_small' && pet.size === Size.MEDIUM) {
                        score += 1;
                        reasons.push("Vhodný do domu s menším dvorom.");
                    }

                    // Children Bonus
                    if (answers['household']?.startsWith('kids')) {
                        if (pet.social.children === 'Vhodný') {
                            score += 2;
                            reasons.push("Má rád deti.");
                        }
                    }

                    // Dog Friend Bonus
                    if (answers['other_pets'] === 'dog' && pet.social.dogs === 'Vhodný') {
                        score += 2;
                        reasons.push("Bude si rozumieť s vaším psíkom.");
                    }

                    // Cat Friend Bonus
                    if (answers['other_pets'] === 'cat' && pet.social.cats === 'Vhodný') {
                        score += 2;
                        reasons.push("Znesie sa aj s mačkami.");
                    }

                    // Alone Time Bonus
                    if (answers['time'] === 'work') {
                        if (pet.training.aloneTime) {
                            score += 2;
                            reasons.push("Zvláda samotu kým ste v práci.");
                        } else if (pet.age > 2) {
                            reasons.push("Dospelý pes, ktorý vie na vás počkať.");
                        }
                    }
                }

                return { pet, score, reasons, veto };
            });

            // Filter Vetos and Sort
            const finalResults = scoredPets
                .filter(item => !item.veto)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5); // Top 5

            setMatches(finalResults);
            setStep(8); // Go to results
        } catch (e) {
            console.error(e);
            alert("Nepodarilo sa načítať psíkov. Skúste to prosím neskôr.");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionId: string) => {
        const currentQ = QUESTIONS[step - 1];
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));

        // Auto-advance
        if (step < QUESTIONS.length) {
            setStep(prev => prev + 1);
        } else {
            calculateMatches();
        }
    };

    // --- RENDERERS ---

    if (step === 0) {
        // INTRO SCREEN
        return (
            <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12 text-center">
                        <div className="bg-brand-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="text-brand-600" size={40} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            Nájdite parťáka, <span className="text-brand-600">ktorý k vám sadne</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Zabudnite na zdĺhavé hľadanie. Odpovedzte na <strong className="text-brand-600">7 jednoduchých otázok</strong> o vašom životnom štýle a my vám ukážeme psíkov, ktorí by u vás boli najšťastnejší.
                        </p>
                        <button
                            onClick={() => setStep(1)}
                            className="bg-brand-600 text-white text-xl font-bold py-4 px-10 rounded-full hover:bg-brand-700 shadow-lg shadow-brand-200 hover:-translate-y-1 transition transform flex items-center mx-auto gap-3"
                        >
                            Spustiť kvíz <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 8) {
        // RESULTS SCREEN
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Našli sme pre vás tieto poklady! 🎉</h2>
                        <p className="text-gray-600">Na základe vašich odpovedí si myslíme, že by ste si rozumeli s týmito chlpáčmi.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48} /></div>
                    ) : matches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matches.map(({ pet, score, reasons }) => (
                                <div key={pet.id} className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition transform hover:-translate-y-1">
                                    <div className="relative h-64 overflow-hidden">
                                        <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-brand-700 font-black text-sm shadow-sm flex items-center gap-1">
                                            <Sparkles size={14} /> {score > 15 ? 'Super Zhoda' : 'Zhoda'}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-2xl font-black text-gray-900">{pet.name}</h3>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">{pet.age} roky</span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{pet.description}</p>

                                        <div className="bg-brand-50 rounded-xl p-3 mb-6">
                                            <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                <CheckCircle size={12} /> Prečo vy dvaja?
                                            </h4>
                                            <ul className="space-y-1">
                                                {reasons.map((r, i) => (
                                                    <li key={i} className="text-sm text-brand-900 leading-snug">• {r}</li>
                                                ))}
                                                {reasons.length === 0 && <li className="text-sm text-brand-900">Vyzerá to na skvelý balanc pováh!</li>}
                                            </ul>
                                        </div>

                                        <div className="mt-auto">
                                            <button
                                                onClick={() => navigate(`/pets/${pet.id}`)}
                                                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition"
                                            >
                                                Zobraziť profil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-sm max-w-2xl mx-auto">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Dog className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Zatiaľ sme nenašli dokonalú zhodu</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">Ale láska je nevyspytateľná! Skúste upraviť svoje odpovede alebo si pozrite všetkých psíkov.</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setStep(0)} className="text-brand-600 font-bold hover:underline">Skúsiť znova</button>
                                <button onClick={() => navigate('/pets')} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-700">Všetci psíkovia</button>
                            </div>
                        </div>
                    )}

                    {matches.length > 0 && (
                        <div className="mt-12 text-center">
                            <p className="text-gray-500 mb-4">Nevybrali ste si? Láska je nevyspytateľná.</p>
                            <button onClick={() => navigate('/pets')} className="text-gray-900 font-bold border-b-2 border-gray-200 hover:border-brand-500 transition pb-1">Pozrieť všetkých psíkov</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // QUESTION UI
    const currentQ = QUESTIONS[step - 1];
    const progress = ((step - 1) / QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            {/* Header */}
            <div className="w-full max-w-2xl mb-8 flex items-center justify-between pt-4">
                <button onClick={() => { if (step > 1) setStep(s => s - 1); else setStep(0); }} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition">
                    <ArrowLeft size={24} />
                </button>
                <div className="h-2 flex-1 mx-6 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-sm font-bold text-gray-400 w-8 text-right">{step}/{QUESTIONS.length}</div>
            </div>

            {/* Card */}
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 md:p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="bg-brand-50 p-4 rounded-full mb-4 ring-8 ring-brand-50/50">
                            {currentQ.icon}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{currentQ.question}</h2>
                    </div>

                    <div className="grid gap-4">
                        {currentQ.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionSelect(option.id)}
                                className="group relative flex items-center p-4 md:p-5 border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all duration-200 text-left"
                            >
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-500 group-hover:text-brand-600 shadow-sm border border-gray-100 group-hover:scale-110 transition mr-5 shrink-0">
                                    {option.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-gray-900 group-hover:text-brand-800">{option.label}</div>
                                    <div className="text-sm text-gray-500 group-hover:text-brand-600/80">{option.description}</div>
                                </div>
                                <div className="absolute right-5 opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight className="text-brand-500" size={20} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartMatch;
