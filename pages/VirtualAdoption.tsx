import React from 'react';
import { Search, Heart, Utensils, Stethoscope, Home as HomeIcon, HelpCircle, Award, FileCheck, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

const VirtualAdoption: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title={t('nav.virtualAdoption')}
                description={t('virtualAdoptionPage.hero.subtitle')}
            />

            {/* Hero Section */}
            <div className="relative bg-brand-600 text-white overflow-hidden rounded-b-[3rem] shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800 opacity-90"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-50 text-sm font-bold mb-6 backdrop-blur-md">
                        <Heart size={16} className="text-red-300 fill-red-300" />
                        {t('nav.virtualAdoption')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                        {t('virtualAdoptionPage.hero.title')}
                    </h1>
                    <p className="text-xl text-brand-100 max-w-2xl mx-auto mb-10 font-medium">
                        {t('virtualAdoptionPage.hero.subtitle')}
                    </p>
                    <Link to="/pets" className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-50 transition shadow-lg shadow-brand-900/20 transform hover:-translate-y-1">
                        <Search size={22} /> {t('virtualAdoptionPage.hero.cta')}
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

                {/* How it works (Original Sections, styled) */}
                <div>
                    <div className="text-center mb-16">
                        <span className="text-brand-600 font-bold text-sm mb-2 block">Jednoduchý proces</span>
                        <h2 className="text-3xl font-bold text-gray-900">{t('home.virtualAdoption.howItWorks')}</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-brand-100 -z-10"></div>

                        {/* Step 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative group hover:-translate-y-1 transition duration-300">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-50 shadow-sm group-hover:border-brand-200 transition">
                                <span className="text-3xl font-extrabold text-brand-600">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Vyberte si lásku</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Nájdite v zozname zvieratko, ktoré vás chytí za srdce. Často sú to staršie psy alebo mačky, ktoré dlhšie čakajú na domov.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative group hover:-translate-y-1 transition duration-300">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-50 shadow-sm group-hover:border-brand-200 transition">
                                <span className="text-3xl font-extrabold text-brand-600">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Nastavte príspevok</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Zvoľte si ľubovoľnú mesačnú sumu (už od 5 €). Vaše peniaze pôjdu priamo na krmivo, lieky a starostlivosť.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative group hover:-translate-y-1 transition duration-300">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-50 shadow-sm group-hover:border-brand-200 transition">
                                <span className="text-3xl font-extrabold text-brand-600">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Sledujte jeho cestu</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Virtuálnu adopciu uvidíte vo svojom profile. Budete mať dobrý pocit, že vďaka vám má konkrétne zvieratko lepší život.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why it Matters */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-brand-100/50 border border-brand-100 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6">
                            <Heart className="fill-brand-600 animate-pulse" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            {t('virtualAdoptionPage.why.title')}
                        </h2>
                        <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                            <p>{t('virtualAdoptionPage.why.p1')}</p>
                            <p>{t('virtualAdoptionPage.why.p2')}</p>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 relative">
                        <div className="absolute inset-0 bg-brand-600 rounded-3xl rotate-3 opacity-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800"
                            alt="Happy dog"
                            className="relative z-10 rounded-3xl shadow-lg w-full object-cover aspect-[4/5]"
                        />
                    </div>
                </div>

                {/* Impact */}
                <div>
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('virtualAdoptionPage.impact.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Utensils, color: "text-orange-500", bg: "bg-orange-50", titleKey: 'food' },
                            { icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50", titleKey: 'health' },
                            { icon: HomeIcon, color: "text-purple-500", bg: "bg-purple-50", titleKey: 'comfort' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`virtualAdoptionPage.impact.items.${item.titleKey}.title`)}</h3>
                                <p className="text-gray-500 font-medium">
                                    {t(`virtualAdoptionPage.impact.items.${item.titleKey}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-brand-50 rounded-[2rem] p-8 md:p-12 border border-brand-100">
                    <div className="text-center mb-12">
                        <span className="text-brand-600 font-bold text-sm mb-2 block">Odmena za vašu dobrotu</span>
                        <h2 className="text-3xl font-bold text-gray-900">{t('virtualAdoptionPage.benefits.title')}</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 text-center hover:shadow-md transition">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('virtualAdoptionPage.benefits.items.fame.title')}</h3>
                            <p className="text-gray-600">{t('virtualAdoptionPage.benefits.items.fame.desc')}</p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 text-center hover:shadow-md transition">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('virtualAdoptionPage.benefits.items.certificate.title')}</h3>
                            <p className="text-gray-600">{t('virtualAdoptionPage.benefits.items.certificate.desc')}</p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 text-center hover:shadow-md transition">
                            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Camera size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('virtualAdoptionPage.benefits.items.updates.title')}</h3>
                            <p className="text-gray-600">{t('virtualAdoptionPage.benefits.items.updates.desc')}</p>
                        </div>
                    </div>
                </div>



                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">{t('virtualAdoptionPage.faq.title')}</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-200 transition">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-3">
                                    <HelpCircle size={20} className="text-brand-500 mt-1 flex-shrink-0" />
                                    {t(`virtualAdoptionPage.faq.q${num}`)}
                                </h3>
                                <p className="text-gray-600 pl-8 leading-relaxed">
                                    {t(`virtualAdoptionPage.faq.a${num}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center pt-10">
                    <Link to="/pets" className="inline-flex items-center gap-2 bg-brand-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-brand-700 transition shadow-xl shadow-brand-500/30 transform hover:-translate-y-1">
                        <Search size={24} /> {t('virtualAdoptionPage.hero.cta')}
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default VirtualAdoption;
