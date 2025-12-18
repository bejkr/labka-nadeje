import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const GDPRConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('labka-gdpr-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('labka-gdpr-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-2xl border border-gray-800">
        <div className="flex items-start gap-4">
          <div className="bg-brand-600 p-2 rounded-xl flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Chránime vaše súkromie</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Naša stránka používa cookies a spracováva osobné údaje pre správne fungovanie adopčného procesu. 
              Prečítajte si naše <Link to="/privacy" onClick={() => setIsVisible(false)} className="text-brand-400 hover:text-brand-300 underline">zásady ochrany údajov</Link>.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleAccept}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl transition text-sm"
              >
                Rozumiem a súhlasím
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="px-4 py-2.5 text-gray-400 hover:text-white transition text-sm"
              >
                Zavrieť
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRConsent;