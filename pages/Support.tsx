import React from 'react';
import { Rocket, Server, Megaphone, ShieldAlert, Heart, Zap, Building2, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';

const SupportPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEOHead
        title={t('nav.supportPlatform')}
        description={t('supportPage.hero.subtitle')}
      />

      {/* Modern Hero Section */}
      <div className="relative bg-[#1a1c2e] text-white overflow-hidden rounded-b-[4rem] shadow-2xl">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600 rounded-full blur-[120px] opacity-20 -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[100px] opacity-20 -ml-20 -mb-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-brand-200 text-sm font-bold mb-8 backdrop-blur-md shadow-lg">
                <Heart size={16} className="text-red-400 fill-red-400 animate-pulse" />
                {t('nav.supportPlatform')}
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-100 to-brand-200">
                {t('supportPage.hero.title')}
              </h1>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                {t('supportPage.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a href="#ways" className="bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-600 transition shadow-lg shadow-brand-500/40 hover:-translate-y-1 transform">
                  {t('supportPage.hero.cta')}
                </a>
              </div>
            </div>

            <div className="w-full lg:w-5/12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-[3rem] rotate-6 opacity-30 blur-xl"></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-10 relative z-10 shadow-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                      <Users className="w-8 h-8 text-brand-300 mx-auto mb-3" />
                      <div className="text-3xl font-black text-white">1250+</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">{t('supportPage.impact.adopted')}</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                      <Building2 className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                      <div className="text-3xl font-black text-white">85+</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">{t('supportPage.impact.shelters')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">

        {/* Transparency Section */}
        <div className="relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('supportPage.transparency.title')}</h2>
            <div className="h-1.5 w-24 bg-brand-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Server, color: "text-blue-500", bg: "bg-blue-50", key: "tech" },
              { icon: Megaphone, color: "text-purple-500", bg: "bg-purple-50", key: "marketing" },
              { icon: ShieldAlert, color: "text-green-500", bg: "bg-green-50", key: "verify" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-brand-500/10 transition duration-300 group">
                <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                  <item.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition">
                  {t(`supportPage.transparency.items.${item.key}.title`)}
                </h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                  {t(`supportPage.transparency.items.${item.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ways to Help Section */}
        <div id="ways" className="scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('supportPage.ways.title')}</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* One Time */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-lg relative group hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-600">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('supportPage.ways.oneTime.title')}</h3>
              <p className="text-gray-500 mb-8 min-h-[3rem]">{t('supportPage.ways.oneTime.desc')}</p>
              <button className="w-full py-4 rounded-xl border-2 border-gray-900 font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition">
                {t('supportPage.ways.oneTime.cta')}
              </button>
            </div>

            {/* Monthly (Highlight) */}
            <div className="bg-brand-600 p-10 rounded-[2.5rem] border border-brand-500 shadow-2xl shadow-brand-500/40 relative transform lg:-mt-6 group hover:-translate-y-2 transition duration-300 text-white">
              <div className="absolute top-0 right-0 bg-[#FFD700] text-brand-900 text-xs font-black uppercase tracking-widest py-2 px-6 rounded-bl-2xl rounded-tr-2xl">
                {t('supportPage.ways.monthly.badge')}
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('supportPage.ways.monthly.title')}</h3>
              <p className="text-brand-100 mb-8 min-h-[3rem]">{t('supportPage.ways.monthly.desc')}</p>
              <button className="w-full py-4 rounded-xl bg-white text-brand-900 font-bold hover:bg-brand-50 transition shadow-lg">
                {t('supportPage.ways.monthly.cta')}
              </button>
            </div>

            {/* Corporate */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-lg relative group hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-6 text-purple-600">
                <Building2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('supportPage.ways.corporate.title')}</h3>
              <p className="text-gray-500 mb-8 min-h-[3rem]">{t('supportPage.ways.corporate.desc')}</p>
              <button className="w-full py-4 rounded-xl border-2 border-purple-600 font-bold text-purple-600 hover:bg-purple-50 transition">
                {t('supportPage.ways.corporate.cta')}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;