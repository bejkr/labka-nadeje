import React, { useState } from 'react';
import { CreditCard, Gift, HeartHandshake, Database, CheckCircle, AlertTriangle, ShieldAlert, RefreshCw, Search, Rocket, Server, Megaphone, Laptop } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';

const SupportPage: React.FC = () => {
  const { userRole, currentUser } = useAuth();
  const { showToast } = useApp();

  const isSuperAdmin = (currentUser as any)?.isSuperAdmin;

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Spoločne meníme osudy</h1>
          <p className="text-lg text-gray-600">
            Sme nezisková iniciatíva. Aby sme mohli spájať zvieratá s novými domovmi, potrebujeme pomoc pre chod portálu aj pre samotné útulky.
          </p>
        </div>

        {/* 1. SUPPORT THE PLATFORM SECTION (FIRST) */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl mb-24 relative overflow-hidden border border-brand-500">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full blur-3xl -ml-10 -mb-10"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-50 text-sm font-bold mb-6 backdrop-blur-md">
                <Rocket size={16} className="text-yellow-300" />
                Podporte rozvoj platformy
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                Pomôžte nám udržať <br /> LabkuNádeje pri živote
              </h2>
              <p className="text-brand-100 text-lg mb-8 leading-relaxed max-w-xl">
                Prevádzka moderného portálu niečo stojí. Váš dar pre platformu nám umožňuje platiť servery, vyvíjať nové funkcie pre útulky a propagovať adopcie na sociálnych sieťach, aby sa o zvieratkách dozvedelo čo najviac ľudí.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-white text-brand-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition shadow-lg shadow-brand-900/20 transform hover:-translate-y-1">
                  Darovať na chod portálu
                </button>
              </div>
            </div>

            {/* Visual Stats / Usage */}
            <div className="w-full lg:w-5/12 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Laptop size={24} className="text-brand-200" />
                Kam putujú vaše dary?
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/30 flex items-center justify-center flex-shrink-0 text-white">
                    <Server size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Technická prevádzka</h4>
                    <p className="text-brand-100 text-sm">Hosting, databázy, bezpečnosť dát a údržba systému.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/30 flex items-center justify-center flex-shrink-0 text-white">
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Marketing adopcií</h4>
                    <p className="text-brand-100 text-sm">Platená reklama pre ťažko adoptovateľné zvieratá a osveta.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/30 flex items-center justify-center flex-shrink-0 text-white">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Overovanie útulkov</h4>
                    <p className="text-brand-100 text-sm">Administratíva spojená s preverovaním organizácií.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SUPPORT SHELTERS SECTION (SECOND) */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="text-brand-600 font-bold text-sm mb-2 block">Pomoc v teréne</span>
            <h2 className="text-4xl font-bold text-gray-900">Ako podporiť priamo útulky?</h2>
            <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">
              Môžete si vybrať konkrétny útulok zo zoznamu alebo podporiť zvieratá globálne týmito spôsobmi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
              <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition border border-green-100">
                <CreditCard size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Finančný dar útulku</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Peniaze na veterinárne úkony, operácie a kvalitnú stravu. Darujete priamo na účet vybraného útulku.
              </p>
              <Link to="/shelters" className="block w-full bg-white text-gray-900 border-2 border-gray-100 font-bold py-3 rounded-xl hover:border-green-500 hover:text-green-600 transition">
                Vybrať útulok
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
              <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition border border-blue-100">
                <Gift size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Materiálna pomoc</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Staré deky, uteráky, hračky, čistiace prostriedky alebo krmivo. Útulky majú zoznamy vecí, ktoré im chýbajú.
              </p>
              <Link to="/shelters" className="block w-full bg-white text-gray-900 border-2 border-gray-100 font-bold py-3 rounded-xl hover:border-blue-500 hover:text-blue-600 transition">
                Pozrieť zoznamy potrieb
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
              <div className="mx-auto w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition border border-purple-100">
                <HeartHandshake size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Dobrovoľníctvo</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Najcennejšie čo máte, je váš čas. Venčenie psov, pomoc pri upratovaní alebo fotenie zvierat na adopciu.
              </p>
              <Link to="/shelters" className="block w-full bg-white text-gray-900 border-2 border-gray-100 font-bold py-3 rounded-xl hover:border-purple-500 hover:text-purple-600 transition">
                Stať sa dobrovoľníkom
              </Link>
            </div>
          </div>
        </div>

        {/* 3. VIRTUAL ADOPTION SECTION */}
        <div className="mb-24 py-12 border-t border-gray-200">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-bold text-sm mb-2 block">Pomoc na diaľku</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ako funguje virtuálna adopcia?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nemôžete si vziať zvieratko domov, ale chcete pomôcť konkrétnemu chlpáčovi?
              Virtuálna adopcia je ideálne riešenie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-brand-100 -z-10"></div>

            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative group hover:-translate-y-1 transition duration-300">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-50 shadow-sm group-hover:border-brand-200 transition">
                <span className="text-4xl font-extrabold text-brand-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vyberte si lásku</h3>
              <p className="text-gray-500 leading-relaxed">
                Nájdite v zozname zvieratko, ktoré vás chytí za srdce. Často sú to staršie psy alebo mačky, ktoré dlhšie čakajú na domov.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative group hover:-translate-y-1 transition duration-300">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-50 shadow-sm group-hover:border-brand-200 transition">
                <span className="text-4xl font-extrabold text-brand-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nastavte príspevok</h3>
              <p className="text-gray-500 leading-relaxed">
                Zvoľte si ľubovoľnú mesačnú sumu (už od 5 €). Vaše peniaze pôjdu priamo na krmivo, lieky a starostlivosť o dané zvieratko.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative group hover:-translate-y-1 transition duration-300">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-50 shadow-sm group-hover:border-brand-200 transition">
                <span className="text-4xl font-extrabold text-brand-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sledujte jeho cestu</h3>
              <p className="text-gray-500 leading-relaxed">
                Virtuálnu adopciu uvidíte vo svojom profile. Budete mať dobrý pocit, že vďaka vám má konkrétne zvieratko lepší život.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/pets" className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-200 transform hover:-translate-y-1">
              <Search size={20} /> Nájsť zvieratko na adopciu
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;