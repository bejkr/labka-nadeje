
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { useApp } from '../contexts/AppContext';
import { User, AdoptionInquiry } from '../types';
import { api } from '../services/api';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Loader2, CheckCircle, Mail, User as UserIcon, X } from 'lucide-react';

const AdoptionInquiryPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { getPet } = usePets();
    const { addInquiry, showToast } = useApp();

    const pet = getPet(id || '');

    // Form State
    const [applicationMessage, setApplicationMessage] = useState('');
    const [isSubmittingApp, setIsSubmittingApp] = useState(false);
    const [applicationSuccess, setApplicationSuccess] = useState(false);

    // Guest State
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    // Detailed Questionnaire State
    const [housingType, setHousingType] = useState<'byt' | 'dom'>('byt');
    const [ownership, setOwnership] = useState<'vlastne' | 'prenajom'>('vlastne');
    const [landlordPermission, setLandlordPermission] = useState(false);
    const [hasGarden, setHasGarden] = useState(false);

    const [hoursAlone, setHoursAlone] = useState('');
    const [careAbility, setCareAbility] = useState<'ano' | 'nie'>('ano');
    const [caregiver, setCaregiver] = useState('');

    const [experience, setExperience] = useState<'ziadne' | 'pes' | 'macka' | 'ine'>('ziadne');
    const [experienceDetails, setExperienceDetails] = useState('');

    const [childrenInHousehold, setChildrenInHousehold] = useState('');
    const [otherPets, setOtherPets] = useState('');
    const [familyAgreement, setFamilyAgreement] = useState(false);

    const [motivation, setMotivation] = useState('');
    const [expectations, setExpectations] = useState<string[]>([]);

    useEffect(() => {
        if (!pet) {
            // Wait for pets to load or redirect if not found
            // Assuming usePets loads pets, if not found after some time, could redirect.
            // For now, simple check.
        }
    }, [pet]);

    if (!pet) {
        return <div className="p-20 text-center text-gray-500 font-medium">Načítavam...</div>;
    }

    const handleApplicationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pet) return;
        setIsSubmittingApp(true);

        try {
            let applicantId = currentUser?.id;
            let applicantName = currentUser?.name || guestName;
            let applicantEmail = currentUser?.email || guestEmail;
            let applicantPhone = currentUser?.phone || guestPhone;

            // Secret registration for guest
            if (!currentUser) {
                try {
                    const randomPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
                    const { user } = await useAuth().registerUser(applicantName, applicantEmail, randomPassword);
                    if (user) {
                        applicantId = user.id;
                    }
                } catch (regError: any) {
                    console.log("Secret registration skipped/failed:", regError);
                }
            }

            // Format the detailed message
            const formattedMessage = `
📝 ŽIADOSŤ O ADOPCIU - DOTAZNÍK

🟠 PODMIENKY A PROSTREDIE
--------------------------------
🏠 Bývanie: ${housingType === 'byt' ? 'Byt' : 'Dom'} (${ownership === 'vlastne' ? 'Vlastné' : 'Prenájom'})
✅ Povolenie majiteľa (ak nájom): ${ownership === 'prenajom' ? (landlordPermission ? 'ÁNO' : 'NIE') : 'N/A (Vlastné)'}
🌳 Dvor/Záhrada: ${hasGarden ? 'ÁNO' : 'NIE'}

4️⃣ Čas a starostlivosť
--------------------------------
⏰ Hodín denne samo: ${hoursAlone || 'Neuvedené'}
🚶 Čas na venčenie/starostlivosť: ${careAbility === 'ano' ? 'ÁNO' : 'NIE'}
👤 Hlavný opatrovateľ: ${caregiver || 'Neuvedené'}

🟡 SKÚSENOSTI A RODINA
--------------------------------
🐾 Skúsenosti: ${experience}
📖 Detaily skúseností / Výchova:
${experienceDetails || 'Bez popisu'}

👨‍👩‍👧‍👦 Domácnosť:
- Deti: ${childrenInHousehold || 'Žiadne'}
- Iné zvieratá: ${otherPets || 'Žiadne'}
✅ Súhlas členov domácnosti: ${familyAgreement ? 'ÁNO' : 'NIE'}

🟢 MOTIVÁCIA A OČAKÁVANIA
--------------------------------
💭 Motivácia (Prečo toto zviera?):
${motivation || 'Neuvedené'}

🎯 Očakávania:
${expectations.join(', ') || 'Neuvedené'}

📩 Pôvodná správa / Poznámka:
${applicationMessage}
            `.trim();

            const newInquiry: AdoptionInquiry = {
                id: `inq-${Date.now()}`,
                shelterId: pet.shelterId,
                petId: pet.id,
                petName: pet.name,
                applicantName: applicantName,
                email: applicantEmail,
                phone: applicantPhone,
                date: new Date().toISOString(),
                status: 'Nová',
                message: formattedMessage
            };

            await addInquiry(newInquiry);
            setApplicationSuccess(true);
            window.scrollTo(0, 0);
        } catch (e: any) {
            console.error(e);
            showToast(t('petDetail.errorSending') + ": " + e.message, "error");
        } finally {
            setIsSubmittingApp(false);
        }
    };

    if (applicationSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-xl overflow-hidden p-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-8 border border-green-100 shadow-inner">
                        <CheckCircle size={56} />
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Úspešne odoslané!</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto">
                        Vaša žiadosť o adopciu <strong>{pet.name}</strong> bola doručená útulku. Budú vás kontaktovať ohľadom ďalšieho postupu.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                        {currentUser && (
                            <button onClick={() => navigate('/profile')} className="flex-1 bg-brand-600 text-white font-black py-4 rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-100 transition transform hover:-translate-y-0.5">
                                Prejsť do profilu
                            </button>
                        )}
                        <button onClick={() => navigate(`/pets/${id}`)} className="flex-1 bg-gray-100 text-gray-700 font-black py-4 rounded-2xl hover:bg-gray-200 transition">
                            Späť na zvieratko
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-6">
            <SEOHead
                title={`Žiadosť o adopciu: ${pet.name}`}
                description={`Vyplňte formulár pre záujem o adopciu zvieratka ${pet.name}.`}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link to={`/pets/${id}`} className="bg-white p-2.5 rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-brand-600 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900">Nezáväzná žiadosť o adopciu</h1>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header with Pet Info */}
                    <div className="p-8 pb-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border-2 border-white flex-shrink-0">
                            <img src={pet.imageUrl} className="w-full h-full object-cover" alt={pet.name} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-brand-600 mb-0.5">Žiadate o adopciu</div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{pet.name}</h2>
                            <p className="text-sm text-gray-400 font-medium mt-1">{pet.breed} • {pet.age} rokov</p>
                        </div>
                    </div>

                    <form onSubmit={handleApplicationSubmit} className="p-8 space-y-8">

                        {/* 0. Guest Info (Create Account) */}
                        {!currentUser && (
                            <section className="space-y-4">
                                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm">0</span>
                                    Kontaktné údaje
                                </h3>
                                <div className="grid grid-cols-1 gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-50">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-2 ml-1">Vaše celé meno</label>
                                        <input type="text" required className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm font-medium bg-white" placeholder="Janko Hraško" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 mb-2 ml-1">Váš email</label>
                                            <input type="email" required className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm font-medium bg-white" placeholder="janko@email.sk" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 mb-2 ml-1">Telefón</label>
                                            <input type="tel" required className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm font-medium bg-white" placeholder="+421 900 000 000" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 1. Conditions */}
                        <section className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4 border-orange-100 text-sm flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">1</span>
                                🟠 PODMIENKY A PROSTREDIE
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Typ bývania</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setHousingType('byt')} className={`flex-1 py-3 rounded-xl text-sm border font-medium transition ${housingType === 'byt' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-4 ring-orange-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Byt</button>
                                        <button type="button" onClick={() => setHousingType('dom')} className={`flex-1 py-3 rounded-xl text-sm border font-medium transition ${housingType === 'dom' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-4 ring-orange-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Dom</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Vlastníctvo</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setOwnership('vlastne')} className={`flex-1 py-3 rounded-xl text-sm border font-medium transition ${ownership === 'vlastne' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-4 ring-orange-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Vlastné</button>
                                        <button type="button" onClick={() => setOwnership('prenajom')} className={`flex-1 py-3 rounded-xl text-sm border font-medium transition ${ownership === 'prenajom' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-4 ring-orange-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Podnájom</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 bg-gray-50/50 transition">
                                    <input type="checkbox" checked={landlordPermission} onChange={e => setLandlordPermission(e.target.checked)} className="rounded-md text-brand-600 focus:ring-brand-500 w-5 h-5 border-gray-300" />
                                    <span className="text-sm text-gray-700 font-medium">Má zviera povolené bývanie? (ak podnájom)</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 bg-gray-50/50 transition">
                                    <input type="checkbox" checked={hasGarden} onChange={e => setHasGarden(e.target.checked)} className="rounded-md text-brand-600 focus:ring-brand-500 w-5 h-5 border-gray-300" />
                                    <span className="text-sm text-gray-700 font-medium">Máte dvor / záhradu?</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2">Koľko hodín bude denne samo?</label>
                                    <input type="text" value={hoursAlone} onChange={e => setHoursAlone(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none" placeholder="napr. 4-6 hodín" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2">Kto sa bude o zviera starať?</label>
                                    <input type="text" value={caregiver} onChange={e => setCaregiver(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none" placeholder="ja, partner, celá rodina..." />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 bg-gray-50/50 mt-2 transition">
                                <input type="checkbox" checked={careAbility === 'ano'} onChange={e => setCareAbility(e.target.checked ? 'ano' : 'nie')} className="rounded-md text-brand-600 focus:ring-brand-500 w-5 h-5 border-gray-300" />
                                <span className="text-sm text-gray-700 font-medium">Máte dostatok času na venčenie a starostlivosť?</span>
                            </label>
                        </section>

                        {/* 2. Experience & Family */}
                        <section className="space-y-4 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4 border-yellow-100 text-sm flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">2</span>
                                🟡 SKÚSENOSTI A RODINA
                            </h4>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Skúsenosti so zvieratami</label>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {['ziadne', 'pes', 'macka', 'ine'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setExperience(type as any)}
                                            className={`px-6 py-3 rounded-xl text-sm border font-medium whitespace-nowrap transition ${experience === type ? 'bg-yellow-50 border-yellow-200 text-yellow-700 ring-4 ring-yellow-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {type === 'ziadne' ? 'Žiadne' : type === 'pes' ? 'Pes' : type === 'macka' ? 'Mačka' : 'Iné'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Aké máte skúsenosti s výchovou?</label>
                                <textarea value={experienceDetails} onChange={e => setExperienceDetails(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm h-24 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none" placeholder="Opíšte vaše predchádzajúce skúsenosti so zvieratami..." />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2">Deti v domácnosti (vek)</label>
                                    <input type="text" value={childrenInHousehold} onChange={e => setChildrenInHousehold(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none" placeholder="napr. 10r, 5r" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2">Iné zvieratá (druh/povaha)</label>
                                    <input type="text" value={otherPets} onChange={e => setOtherPets(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none" placeholder="pes (samček), mačka..." />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 bg-gray-50/50 mt-2 transition">
                                <input type="checkbox" required checked={familyAgreement} onChange={e => setFamilyAgreement(e.target.checked)} className="rounded-md text-brand-600 focus:ring-brand-500 w-5 h-5 border-gray-300" />
                                <span className="text-sm text-gray-700 font-medium">Súhlasia všetci členovia domácnosti s adopciou?</span>
                            </label>
                        </section>

                        {/* 3. Motivation */}
                        <section className="space-y-4 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4 border-green-100 text-sm flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">3</span>
                                🟢 MOTIVÁCIA A OČAKÁVANIA
                            </h4>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Prečo práve toto zviera? (Motivácia)</label>
                                <textarea required value={motivation} onChange={e => setMotivation(e.target.value)} className="w-full border border-gray-200 rounded-xl p-4 h-32 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none" placeholder="Čo vás oslovilo na tomto zvieratku? Prečo teraz?" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Čo očakávate od adopcie?</label>
                                <div className="flex flex-wrap gap-2">
                                    {['spoločnosť', 'aktívny parťák', 'pokojný spoločník', 'strážca', 'iné'].map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                if (expectations.includes(opt)) setExpectations(prev => prev.filter(p => p !== opt));
                                                else setExpectations(prev => [...prev, opt]);
                                            }}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${expectations.includes(opt) ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200' : 'bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Other Notes */}
                        <section className="pt-6 border-t border-gray-100">
                            <label className="block text-xs font-black text-gray-400 mb-2 ml-1">Ďalšie poznámky / Správa</label>
                            <textarea
                                className="w-full border border-gray-200 rounded-2xl p-4 h-32 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                                placeholder={t('petDetail.messagePlaceholder')}
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                            ></textarea>
                        </section>

                        {/* Submit */}
                        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            {currentUser ? (
                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-white flex-shrink-0">
                                        {(currentUser as User).avatarUrl ? <img src={(currentUser as User).avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="p-1.5 text-gray-300" />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-800">{(currentUser as User).name}</div>
                                        <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                            <Mail size={10} /> {(currentUser as User).email}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 max-w-[200px]">
                                    Odoslaním súhlasíte so spracovaním osobných údajov. Vytvoríme vám profil pre sledovanie žiadosti.
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmittingApp || !motivation.trim()}
                                className="w-full sm:w-auto bg-brand-600 text-white font-black px-12 py-4 rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-100 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                            >
                                {isSubmittingApp ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                Odoslať žiadosť
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdoptionInquiryPage;
