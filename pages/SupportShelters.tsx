import React from 'react';
import { CreditCard, Gift, HeartHandshake, MapPin, Building2, ArrowRight, Search, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

const SupportShelters: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title={t('nav.supportShelters')}
                description={t('supportSheltersPage.hero.subtitle')}
            />

            {/* Premium Hero Section - Nature Theme */}
            <div className="relative bg-[#134e4a] text-white overflow-hidden rounded-b-[4rem] shadow-2xl">
                {/* Organic Background Elements */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#2dd4bf] rounded-full blur-[120px] opacity-20 -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#99f6e4] rounded-full blur-[100px] opacity-10 -mr-20 -mb-20"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[#5eead4] text-sm font-bold mb-8 backdrop-blur-md shadow-lg">
                        <Heart size={16} className="text-[#5eead4] fill-[#5eead4] animate-pulse" />
                        {t('nav.supportShelters')}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
                        {t('supportSheltersPage.hero.title')}
                    </h1>

                    <p className="text-xl text-[#ccfbf1] max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                        {t('supportSheltersPage.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#methods" className="bg-[#2dd4bf] text-[#134e4a] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#5eead4] transition shadow-lg shadow-[#2dd4bf]/30 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            <HeartHandshake size={20} />
                            {t('supportSheltersPage.hero.cta')}
                        </a>
                        <Link to="/shelters" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition backdrop-blur-md flex items-center justify-center gap-2">
                            <Search size={20} />
                            {t('supportSheltersPage.local.title')}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">

                {/* 3 Main Methods */}
                <div id="methods" className="scroll-mt-24">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Financial */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 group hover:-translate-y-2 transition duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -mr-10 -mt-10 transition group-hover:bg-green-100"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <CreditCard size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('supportSheltersPage.methods.money.title')}</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed h-24">
                                    {t('supportSheltersPage.methods.money.desc')}
                                </p>
                                <Link to="/shelters" className="inline-flex items-center text-green-700 font-bold hover:gap-2 transition-all">
                                    {t('supportSheltersPage.methods.money.cta')} <ArrowRight size={20} className="ml-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Material */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 group hover:-translate-y-2 transition duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-10 -mt-10 transition group-hover:bg-blue-100"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <Gift size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('supportSheltersPage.methods.material.title')}</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed h-24">
                                    {t('supportSheltersPage.methods.material.desc')}
                                </p>
                                <Link to="/shelters" className="inline-flex items-center text-blue-700 font-bold hover:gap-2 transition-all">
                                    {t('supportSheltersPage.methods.material.cta')} <ArrowRight size={20} className="ml-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Volunteer */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 group hover:-translate-y-2 transition duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] -mr-10 -mt-10 transition group-hover:bg-purple-100"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <HeartHandshake size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('supportSheltersPage.methods.volunteer.title')}</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed h-24">
                                    {t('supportSheltersPage.methods.volunteer.desc')}
                                </p>
                                <Link to="/shelters" className="inline-flex items-center text-purple-700 font-bold hover:gap-2 transition-all">
                                    {t('supportSheltersPage.methods.volunteer.cta')} <ArrowRight size={20} className="ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corporate Section */}
                <div className="bg-[#1e293b] rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-[100px] opacity-10"></div>

                    <div className="flex-1 relative z-10">
                        <div className="inline-block bg-white/10 px-4 py-2 rounded-full text-blue-300 font-bold text-sm mb-6 border border-white/10">CSR & ESG</div>
                        <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                            {t('supportSheltersPage.corporate.title')}
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                            {t('supportSheltersPage.corporate.desc')}
                        </p>
                        <a href="mailto:partneri@labkanadeje.sk" className="inline-flex items-center gap-2 bg-white text-[#1e293b] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
                            <Building2 size={20} />
                            {t('supportSheltersPage.corporate.cta')}
                        </a>
                    </div>
                    <div className="w-full md:w-1/3 flex justify-center relative z-10">
                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl rotate-3">
                            <Building2 size={120} className="text-white/20" />
                        </div>
                    </div>
                </div>

                {/* Local Search CTA */}
                <div className="text-center bg-brand-50 rounded-[3rem] p-16 border border-brand-100">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-md text-brand-600">
                        <MapPin size={40} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('supportSheltersPage.local.title')}</h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">{t('supportSheltersPage.local.subtitle')}</p>
                    <Link to="/shelters" className="inline-flex items-center gap-2 bg-brand-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-brand-700 transition shadow-xl shadow-brand-500/30 transform hover:-translate-y-1">
                        <Search size={24} /> {t('supportSheltersPage.hero.cta')}
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default SupportShelters;
