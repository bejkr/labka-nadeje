import React from 'react';
import { ShieldAlert, FileText, UserCheck, MessageCircle, Heart, AlertTriangle, ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
    const sections = [
        {
            title: "1. Všeobecné ustanovenia",
            icon: Scale,
            content: "Tieto podmienky upravujú používanie platformy LabkaNádeje. Vstupom na platformu a jej používaním súhlasíte s týmito podmienkami. Platforma slúži na sprostredkovanie adopcií a podporu útulkov."
        },
        {
            title: "2. Pravidlá správania",
            icon: UserCheck,
            content: "Užívateľ sa zaväzuje komunikovať slušne a rešpektovať ostatných členov komunity a útulky. Akékoľvek nenávistné prejavy, spam alebo podvodné správanie bude viesť k zablokovaniu účtu."
        },
        {
            title: "3. Adopčný proces",
            icon: Heart,
            content: "Adopcia zvierat podlieha schváleniu konkrétnym útulkom. Odoslanie žiadosti cez platformu negarantuje adopciu. Útulok má právo odmietnuť záujemcu, ak nespĺňa podmienky pre vhodné umiestnenie zvieraťa."
        },
        {
            title: "4. Zodpovednosť za obsah",
            icon: FileText,
            content: "Za informácie o zvieratách a útulkoch zodpovedajú príslušné útulky. Platforma LabkaNádeje nenesie zodpovednosť za presnosť údajov poskytnutých tretími stranami, hoci sa snaží ich aktívne overovať."
        },
        {
            title: "5. Virtuálna adopcia",
            icon: MessageCircle,
            content: "Príspevky v rámci virtuálnej adopcie sú dobrovoľné dary konkrétnemu zvieratku alebo útulku. Platforma zabezpečuje transparentný prevod týchto prostriedkov určenému príjemcovi."
        },
        {
            title: "6. Obmedzenie zodpovednosti",
            icon: AlertTriangle,
            content: "Platforma je poskytovaná 'tak ako je'. Nezaručujeme nepretržitú dostupnosť služby a nezodpovedáme za prípadné škody vzniknuté výpadkom systému alebo stratou dát, hoci robíme všetko pre ich ochranu."
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-brand-600 font-bold mb-8 transition">
                    <ArrowLeft size={20} className="mr-2" /> Späť na hlavnú stránku
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-900 p-8 md:p-12 text-white text-center">
                        <ShieldAlert size={48} className="mx-auto mb-4 opacity-90 text-brand-400" />
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Podmienky používania</h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Pravidlá, ktoré robia z LabkaNádeje bezpečné a dôveryhodné miesto pre zvieratká aj ľudí.
                        </p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="space-y-12">
                            {sections.map((section, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                                        <section.icon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                                        <p className="text-gray-600 leading-relaxed text-lg">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 pt-8 border-t border-gray-100">
                            <div className="bg-yellow-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-yellow-100">
                                <div>
                                    <h3 className="font-bold text-yellow-900 text-xl mb-2">Potrebujete niečo nahlásiť?</h3>
                                    <p className="text-yellow-800">Ak ste svedkom porušovania pravidiel, dajte nám vedieť.</p>
                                </div>
                                <a
                                    href="mailto:info@labkanadeje.sk"
                                    className="bg-white text-yellow-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition flex items-center gap-2 border border-yellow-200"
                                >
                                    <AlertTriangle size={20} /> info@labkanadeje.sk
                                </a>
                            </div>
                        </div>

                        <div className="mt-12 text-center text-gray-400 text-sm">
                            Platné od: 1. január 2025
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
