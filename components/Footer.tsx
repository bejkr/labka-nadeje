import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, ShieldAlert, Shield, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import Logo from './Logo';

const Footer: React.FC = () => {
    const { showToast } = useApp();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            showToast("Zadajte prosím platnú e-mailovú adresu.", "error"); // TODO: Translate toast helper
            return;
        }

        setLoading(true);
        try {
            await api.subscribeToNewsletter(email);
            showToast("Ďakujeme! Boli ste úspešne prihlásený na odber.", "success");
            setEmail('');
        } catch (error: any) {
            showToast(error.message || "Nepodarilo sa prihlásiť na odber.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-4">
                            <Logo className="h-12" variant="light" />
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            {t('footer.tagline')}
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/profile.php?id=61584849571446" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition text-white">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.instagram.com/labka_nadeje/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition text-white">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-400">{t('footer.quickLinks')}</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/pets" className="hover:text-white">{t('nav.pets')}</Link></li>
                            <li><Link to="/shelters" className="hover:text-white">{t('nav.shelters')}</Link></li>
                            <li><Link to="/privacy" className="hover:text-white">{t('footer.privacy')}</Link></li>
                            <li><Link to="/blog" className="hover:text-white">{t('nav.blog')}</Link></li>
                            <li><Link to="/support" className="hover:text-white">{t('nav.support')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-400">{t('footer.contact')}</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>info@labkanadeje.sk</li>
                            <li>Bratislava, Slovensko</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-400">{t('footer.news')}</h3>
                        <p className="text-gray-400 text-sm mb-4">{t('footer.subscribeText')}</p>
                        <form onSubmit={handleNewsletterSubmit} className="flex shadow-sm">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('footer.emailPlaceholder')}
                                className="px-4 py-2 bg-white text-gray-900 rounded-l-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-brand-600 px-5 py-2 rounded-r-xl hover:bg-brand-700 text-sm font-bold transition flex items-center justify-center min-w-[60px]"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : 'OK'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 py-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
                    <p className="text-gray-400 text-xs font-medium flex items-center justify-center gap-2">
                        <ShieldAlert size={14} className="text-brand-500" />
                        {t('footer.betaNotice')}
                    </p>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                        <Shield size={14} />
                        <span>&copy; {new Date().getFullYear()} {t('footer.copyright')}</span>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition">{t('footer.privacy')}</Link>
                        <Link to="/terms" className="hover:text-white transition">{t('footer.terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
