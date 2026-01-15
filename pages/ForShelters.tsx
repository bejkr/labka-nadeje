import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    Building2, Heart, Users, CheckCircle, ArrowRight, XCircle,
    MessageCircle, Clock, Share2, ShieldCheck, Home, Phone
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';

const ForShelters: React.FC = () => {
    const { t } = useTranslation();
    const [shelterLogos, setShelterLogos] = useState<string[]>([]);

    useEffect(() => {
        const fetchShelters = async () => {
            try {
                const shelters = await api.getAllShelters();
                const logos = shelters
                    .filter(s => s.logoUrl)
                    .map(s => s.logoUrl)
                    .slice(0, 3);

                if (logos.length > 0) {
                    setShelterLogos(logos);
                }
            } catch (err) {
                console.error("Failed to fetch shelter logos", err);
            }
        };
        fetchShelters();
    }, []);

    const benefits = [
        {
            key: 'visibility',
            icon: Users,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            key: 'admin',
            icon: Clock,
            color: 'bg-amber-100 text-amber-600'
        },
        {
            key: 'assistance',
            icon: MessageCircle,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            key: 'longWait',
            icon: Heart,
            color: 'bg-red-100 text-red-600'
        },
        {
            key: 'socials',
            icon: Share2,
            color: 'bg-pink-100 text-pink-600'
        },
        {
            key: 'partnership',
            icon: ShieldCheck,
            color: 'bg-green-100 text-green-600'
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans text-gray-900">
            <Helmet>
                <title>{t('nav.forShelters')} | LabkaNádeje</title>
            </Helmet>

            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-0">
                        {/* Text Content - Left Side (Desktop) */}
                        <div className="flex flex-col justify-center px-6 py-16 lg:py-24 lg:px-12 relative z-10 bg-white">
                            <div className="max-w-xl mx-auto lg:mx-0">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 font-bold text-sm mb-8">
                                    <Heart size={16} className="fill-brand-700" />
                                    <span>{t('forSheltersPage.hero.title').split('\n')[0]}</span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-tight whitespace-pre-line">
                                    {t('forSheltersPage.hero.title')}
                                </h1>
                                <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                                    {t('forSheltersPage.hero.subtitle')}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        to="/auth?role=shelter"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-brand-600 text-white font-bold text-lg shadow-lg hover:bg-brand-700 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
                                    >
                                        <Building2 className="mr-2" size={24} />
                                        {t('forSheltersPage.hero.ctaRegister')}
                                    </Link>
                                    <a
                                        href="mailto:partneri@labkanadeje.sk"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-50 text-gray-900 font-bold text-lg border border-gray-200 hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all duration-300 whitespace-nowrap"
                                    >
                                        <MessageCircle className="mr-2" size={24} />
                                        {t('forSheltersPage.hero.ctaContact')}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Image Content - Right Side (Desktop) */}
                        <div className="relative h-64 lg:h-auto overflow-hidden group">
                            <div className="absolute inset-0 bg-brand-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                            <img
                                src="/hero-shelter.png"
                                alt="Happy shelter dog with volunteer"
                                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                            />
                            {/* Decorative Elements */}
                            <div className="absolute bottom-0 left-0 bg-white p-6 rounded-tr-[3rem] z-20 hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-4">
                                        {(shelterLogos.length > 0 ? shelterLogos : ['shelter-logo-1.png', 'shelter-logo-2.png', 'shelter-logo-3.png']).map((logo, i) => (
                                            <div key={i} className={`w-12 h-12 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden shadow-sm`}>
                                                <img
                                                    src={logo.startsWith('http') || logo.startsWith('/') ? logo : `/${logo}`}
                                                    alt="Shelter Logo"
                                                    className="w-full h-full object-cover p-1"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null; // Prevent infinite loop
                                                        // Fallback to one of our generated logos based on index
                                                        target.src = `/shelter-logo-${(i % 3) + 1}.png`;
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold text-gray-900">5+ Útulkov</p>
                                        <p className="text-gray-500">sa už pridalo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* 3. BENEFITS GRID - CORE */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-2 block">Prečo Labka Nádeje?</span>
                        <h2 className="text-4xl font-black text-gray-900 mb-4">{t('forSheltersPage.benefits.title')}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${benefit.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <benefit.icon size={28} />
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-300 bg-gray-50 px-2 py-1 rounded-md group-hover:bg-gray-100 transition-colors">
                                        0{idx + 1}
                                    </span>
                                </div>
                                <div className="mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600/80">
                                        {t(`forSheltersPage.benefits.items.${benefit.key}.badge`)}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                                    {t(`forSheltersPage.benefits.items.${benefit.key}.title`)}
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {t(`forSheltersPage.benefits.items.${benefit.key}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. PROCESS */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-gray-900">{t('forSheltersPage.process.title')}</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[3rem] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-100 via-brand-200 to-gray-100 z-0"></div>

                        {[1, 2, 3].map((step) => (
                            <div key={step} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-full bg-white border-8 border-gray-50 group-hover:border-brand-100 flex items-center justify-center text-3xl font-black text-gray-300 group-hover:text-brand-600 mb-8 shadow-sm transition-all duration-500 transform group-hover:scale-110">
                                    {step}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-brand-700 transition-colors">
                                    {t(`forSheltersPage.process.step${step}.title`)}
                                </h3>
                                <p className="text-gray-500 font-medium max-w-xs leading-relaxed">
                                    {t(`forSheltersPage.process.step${step}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. INTERNAL SYSTEM SECTION (Replaces Assurances) */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-6 border border-blue-100">
                                <Clock size={16} className="text-blue-600" />
                                <span>Coming Soon</span>
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                {t('forSheltersPage.internalSystem.title')}
                            </h2>
                            <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                                {t('forSheltersPage.internalSystem.subtitle')}
                            </p>

                            <div className="space-y-8">
                                {[
                                    { key: 'records', icon: MessageCircle, color: 'bg-indigo-50 text-indigo-600' },
                                    { key: 'adoptions', icon: Heart, color: 'bg-rose-50 text-rose-600' },
                                    { key: 'sync', icon: Share2, color: 'bg-emerald-50 text-emerald-600' }
                                ].map((feature) => (
                                    <div key={feature.key} className="flex gap-4 group">
                                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {t(`forSheltersPage.internalSystem.features.${feature.key}.title`)}
                                            </h3>
                                            <p className="text-gray-500 font-medium leading-relaxed">
                                                {t(`forSheltersPage.internalSystem.features.${feature.key}.desc`)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-10">
                                <button className="px-8 py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300">
                                    {t('forSheltersPage.internalSystem.cta')}
                                </button>
                                <Link
                                    to="/internal-system"
                                    className="px-8 py-4 rounded-xl bg-white text-gray-900 border-2 border-gray-100 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 flex items-center justify-center"
                                >
                                    {t('forSheltersPage.internalSystem.moreInfo')}
                                    <ArrowRight className="ml-2" size={20} />
                                </Link>
                            </div>
                        </div>

                        <div className="relative perspective-1000">
                            <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-[0deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out group">
                                <img
                                    src="/laptop-dashboard.png"
                                    alt="Shelter Management System Dashboard"
                                    className="w-[120%] max-w-none h-auto object-cover -ml-[10%]"
                                />
                            </div>
                            {/* Decorative blobs */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-30 -z-10"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-400 rounded-full blur-3xl opacity-30 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. TESTIMONIALS */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-50/50 rounded-full blur-3xl -z-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="relative inline-block">
                        <span className="text-8xl text-brand-100 absolute -top-12 -left-12 font-serif opacity-50">"</span>
                        <blockquote className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                            {t('forSheltersPage.testimonial.text')}
                        </blockquote>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <div className="h-1 w-12 bg-brand-200 rounded-full"></div>
                            <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">
                                {t('forSheltersPage.testimonial.author')}
                            </span>
                            <div className="h-1 w-12 bg-brand-200 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FINAL CTA */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden font-sans">
                <div className="absolute inset-0 bg-brand-900/30"></div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-10 whitespace-pre-line leading-tight drop-shadow-lg">
                        {t('forSheltersPage.finalCta.text')}
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/auth?role=shelter"
                            className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-brand-900 font-black text-xl shadow-2xl hover:bg-brand-50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                        >
                            <span className="relative z-10">{t('forSheltersPage.finalCta.register')}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </Link>
                        <a
                            href="mailto:partneri@labkanadeje.sk"
                            className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white/10 border-2 border-white/20 text-white font-bold text-xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                        >
                            {t('forSheltersPage.finalCta.contact')}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForShelters;
