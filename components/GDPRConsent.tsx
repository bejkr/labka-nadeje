import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GDPRConsent: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[400px] z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-gray-800">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="bg-brand-600 p-1.5 md:p-2 rounded-lg md:rounded-xl flex-shrink-0">
            <ShieldCheck size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2">{t('gdpr.title')}</h3>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-3 md:mb-4">
              {t('gdpr.description')}{' '}
              <Link to="/privacy" onClick={() => setIsVisible(false)} className="text-brand-400 hover:text-brand-300 underline">{t('gdpr.link')}</Link>.
            </p>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl transition text-xs md:text-sm"
              >
                {t('gdpr.accept')}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-3 md:px-4 py-1.5 md:py-2.5 text-gray-400 hover:text-white transition text-xs md:text-sm"
              >
                {t('gdpr.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRConsent;