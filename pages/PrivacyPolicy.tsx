import React from 'react';
import { ShieldCheck, Eye, Lock, UserCheck, FileText, Mail, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "1. Prevádzkovateľ a základné informácie",
      icon: Info,
      content: "Prevádzkovateľom platformy LabkaNádeje je občianske združenie LabkaNádeje o.z., so sídlom v Bratislave. Vaše súkromie berieme vážne a spracovávame vaše údaje v súlade s Nariadením GDPR a zákonom o ochrane osobných údajov."
    },
    {
      title: "2. Rozsah spracovávaných údajov",
      icon: UserCheck,
      content: "Spracovávame údaje potrebné pre proces adopcie: meno, priezvisko, e-mailovú adresu, telefónne číslo a informácie o vašej domácnosti (ktoré dobrovoľne uvediete v profile), aby sme zabezpečili najlepšie zladenie so zvieratkom."
    },
    {
      title: "3. Účel spracovania",
      icon: FileText,
      content: "Hlavným účelom je sprostredkovanie kontaktu medzi vami a útulkom pri záujme o adopciu alebo dočasnú opateru. Ďalšími účelmi sú správa vášho používateľského konta, zasielanie noviniek (ak ste súhlasili) a analytika návštevnosti."
    },
    {
      title: "4. Zdieľanie údajov s útulkami",
      icon: Lock,
      content: "Keď odošlete žiadosť o adopciu, vaše kontaktné údaje sú sprístupnené konkrétnemu útulku, ktorý spravuje dané zvieratko. Útulky sú zmluvne viazané používať tieto údaje výhradne na účely adopčného procesu."
    },
    {
      title: "5. Vaše práva",
      icon: ShieldCheck,
      content: "Máte právo na prístup k svojim údajom, ich opravu, vymazanie (právo na zabudnutie), obmedzenie spracovania a právo namietať proti spracovaniu. Svoj súhlas so spracovaním môžete kedykoľvek odvolať vo svojom profile."
    },
    {
      title: "6. Cookies a analytika",
      icon: Eye,
      content: "Používame nevyhnutné cookies pre fungovanie prihlásenia a anonymizované analytické cookies na zlepšovanie našich služieb. AI asistent spracováva vaše otázky anonymne bez priradenia k vašej identite."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-brand-600 font-bold mb-8 transition">
          <ArrowLeft size={20} className="mr-2" /> Späť na hlavnú stránku
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-brand-600 p-8 md:p-12 text-white text-center">
            <ShieldCheck size={48} className="mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Ochrana osobných údajov</h1>
            <p className="text-brand-100 max-w-xl mx-auto">
              Transparentne informujeme o tom, ako chránime vaše dáta a súkromie pri hľadaní nového člena rodiny.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="space-y-12">
              {sections.map((section, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
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
              <div className="bg-blue-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-bold text-blue-900 text-xl mb-2">Máte otázky k vašim údajom?</h3>
                  <p className="text-blue-800">Sme tu pre vás. Napíšte nášmu zodpovednému zástupcovi.</p>
                </div>
                <a
                  href="mailto:info@labkanadeje.sk"
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition flex items-center gap-2"
                >
                  <Mail size={20} /> info@labkanadeje.sk
                </a>
              </div>
            </div>

            <div className="mt-12 text-center text-gray-400 text-sm">
              Posledná aktualizácia: 20. máj 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;