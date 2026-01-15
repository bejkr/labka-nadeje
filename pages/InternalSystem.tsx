import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Database, Heart, RefreshCw, BarChart3, ChevronRight, Check } from 'lucide-react';

const InternalSystem: React.FC = () => {
    const { t } = useTranslation();

    const features = [
        { key: 'records', icon: Database, color: 'text-blue-600 bg-blue-50' },
        { key: 'adoptions', icon: Heart, color: 'text-rose-600 bg-rose-50' },
        { key: 'sync', icon: RefreshCw, color: 'text-emerald-600 bg-emerald-50' },
        { key: 'analytics', icon: BarChart3, color: 'text-purple-600 bg-purple-50' }
    ];

    return (
        <div className="bg-white min-h-screen font-sans text-gray-900">
            <Helmet>
                <title>{t('internalSystemPage.title')} | LabkaNádeje</title>
            </Helmet>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 font-bold text-sm mb-8 border border-brand-100">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                        </span>
                        Coming Soon
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                        {t('internalSystemPage.title')}
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        {t('internalSystemPage.subtitle')}
                    </p>

                    {/* Feature Grid */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 text-left">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {t(`internalSystemPage.features.${feature.key}.title`)}
                                </h3>
                                <p className="text-gray-500 font-medium">
                                    {t(`internalSystemPage.features.${feature.key}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Screenshot Showcase */}
                    <div className="relative max-w-5xl mx-auto perspective-1000 mb-20">
                        <div className="relative transform rotate-x-[5deg] shadow-2xl rounded-xl overflow-hidden">
                            <img
                                src="/laptop-dashboard.png"
                                alt="Dashboard Preview"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-500/20 blur-[120px] -z-10"></div>
                    </div>

                    {/* CTA */}
                    <div className=" bg-gray-900 rounded-[2.5rem] p-12 text-white text-center relative overflow-hidden max-w-4xl mx-auto">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-8">Chcete byť medzi prvými?</h2>
                            <Link
                                to="/auth?role=shelter"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-brand-500 text-white font-bold text-lg hover:bg-brand-400 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-brand-500/30"
                            >
                                {t('internalSystemPage.cta')}
                                <ChevronRight className="ml-2" size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InternalSystem;
