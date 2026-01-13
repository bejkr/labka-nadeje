
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { Shelter } from '../../types';
import { Save, Building2, MapPin, Phone, Mail, Globe, Facebook, Instagram, CreditCard, Upload } from 'lucide-react';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

const InternalSettings: React.FC = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Shelter>>({});

    useEffect(() => {
        if (currentUser && currentUser.role === 'shelter') {
            setFormData(currentUser as Shelter);
        }

        // Initialize Facebook SDK
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: '1244916417484539',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
            window.FB.AppEvents.logPageView();
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s) as HTMLScriptElement; js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode?.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(formData);
            success("Uložené", "Nastavenia boli úspešne uložené.");
        } catch (e) {
            console.error(e);
            error("Chyba", "Chyba pri ukladaní nastavení.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (existing logic)
        error("Nedostupné", "Nahrávanie loga bude dostupné čoskoro. Zadajte prosím URL adresu.");
    };

    const handleConnect = async (platform: 'facebook' | 'instagram') => {
        if (platform === 'instagram') {
            alert("Instagram connection is coming soon! (Requires complex setup).");
            return;
        }

        if (!window.FB) {
            error("Chyba", "Facebook SDK sa nepodarilo načítať. Skúste vypnúť AdBlock.");
            return;
        }

        window.FB.login(function (response: any) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');

                // Get the User's Name
                window.FB.api('/me', function (response: any) {
                    console.log('Good to see you, ' + response.name + '.');
                });

                // Get User's Pages (to find the shelter page)
                window.FB.api('/me/accounts', function (pagesResponse: any) {
                    console.log('[FB Debug] Pages Response:', pagesResponse);
                    if (pagesResponse && pagesResponse.data && pagesResponse.data.length > 0) {
                        // For now, auto-select the first page or let's try to find one that matches
                        // In a real generic app, we'd show a modal to let them pick the page.
                        // We'll mimic the logic: pick the first one.
                        const page = pagesResponse.data[0];

                        // Save this page's token! This is what we need to post as the page.
                        const newSocialsAuth = {
                            ...formData.socialsAuth,
                            [platform]: {
                                linked: true,
                                pageName: page.name,
                                pageId: page.id,
                                accessToken: page.access_token // CRITICAL: Save this token
                            }
                        };

                        const updatedFormData = { ...formData, socialsAuth: newSocialsAuth };
                        setFormData(updatedFormData);
                        updateUserProfile(updatedFormData as any)
                            .then(() => success("Prepojené", `Úspešne prepojené s ${page.name}`))
                            .catch((e) => { console.error(e); error("Chyba", "Nepodarilo sa uložiť prepojenie."); });

                    } else {
                        error("Chyba", "Nenašli sa žiadne Facebook Stránky, ktoré spravujete.");
                    }
                });

            } else {
                console.log('User cancelled login or did not fully authorize.');
                error("Chyba", "Prihlásenie zrušené.");
            }
        }, { scope: 'public_profile,email,pages_manage_posts,pages_read_engagement,pages_show_list' });
    };

    const handleDisconnect = async (platform: 'facebook' | 'instagram') => {
        if (confirm(`Naozaj chcete odpojiť ${platform}?`)) {
            const newSocialsAuth = {
                ...formData.socialsAuth,
                [platform]: { linked: false }
            };

            const updatedFormData = {
                ...formData,
                socialsAuth: newSocialsAuth
            };

            setFormData(updatedFormData);

            try {
                await updateUserProfile(updatedFormData as any);
                success("Odpojené", `${platform === 'facebook' ? 'Facebook' : 'Instagram'} bol odpojený.`);
            } catch (e) {
                console.error(e);
                error("Chyba", "Nepodarilo sa uložiť odpojenie.");
            }
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nastavenia útulku</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Spravujte profil, kontaktné údaje a dary</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 dark:shadow-none hover:bg-brand-700 transition flex items-center gap-2"
                >
                    <Save size={18} />
                    {loading ? 'Ukladám...' : 'Uložiť zmeny'}
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* 1. Basic Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-brand-600 dark:text-brand-400" /> Základné informácie
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Názov útulku</label>
                            <input
                                type="text" name="name"
                                value={formData.name || ''} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Popis (Bio)</label>
                            <textarea
                                name="description" rows={4}
                                value={formData.description || ''} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                                placeholder="Napíšte niečo o vašom útulku..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text" name="logoUrl"
                                    value={formData.logoUrl || ''} onChange={handleChange}
                                    placeholder="https://..."
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm text-gray-900 dark:text-white transition"
                                />
                                {formData.logoUrl && (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Tip: Použite odkaz na existujúci obrázok alebo nahrajte do dokumentov a skopírujte odkaz.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Otváracie hodiny</label>
                            <input
                                type="text" name="openingHours"
                                value={formData.openingHours || ''} onChange={handleChange}
                                placeholder="Po-Pi: 9:00 - 17:00"
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Contact Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-brand-600 dark:text-brand-400" /> Kontakt a Adresa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email" name="email"
                                    value={formData.email || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefón</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text" name="phone"
                                    value={formData.phone || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                                />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresa útulku</label>
                            <input
                                type="text" name="location"
                                value={formData.location || ''} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresa pre dary (poštová)</label>
                            <input
                                type="text" name="shippingAddress"
                                value={formData.shippingAddress || ''} onChange={handleChange}
                                placeholder="Vyplňte, ak sa líši od adresy útulku"
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Socials & Web */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-brand-600 dark:text-brand-400" /> Online prítomnosť
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webstránka</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text" name="socials.website"
                                    value={(formData.socials as any)?.website || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition"
                                />
                            </div>
                        </div>

                        {/* Facebook Connect */}
                        <SocialConnectCard
                            platform="facebook"
                            connected={formData.socialsAuth?.facebook?.linked}
                            data={formData.socialsAuth?.facebook}
                            onConnect={() => handleConnect('facebook')}
                            onDisconnect={() => handleDisconnect('facebook')}
                        />

                        {/* Instagram Connect */}
                        <SocialConnectCard
                            platform="instagram"
                            connected={formData.socialsAuth?.instagram?.linked}
                            data={formData.socialsAuth?.instagram}
                            onConnect={() => handleConnect('instagram')}
                            onDisconnect={() => handleDisconnect('instagram')}
                        />
                    </div>
                </div>

                {/* 4. Donations */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard size={20} className="text-brand-600 dark:text-brand-400" /> Finančné dary
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Číslo účtu (IBAN)</label>
                        <input
                            type="text" name="bankAccount"
                            value={formData.bankAccount || ''} onChange={handleChange}
                            placeholder="SK..."
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono text-gray-900 dark:text-white transition"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Toto číslo účtu sa bude zobrazovať pri vašich zvieratách pre virtuálnu adopciu alebo jednorazovú podporu.</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

const SocialConnectCard = ({ platform, connected, data, onConnect, onDisconnect }: any) => {
    const isFb = platform === 'facebook';
    return (
        <div className={`
            border rounded-xl p-4 flex flex-col justify-between h-full transition gap-3
            ${connected
                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }
        `}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isFb ? 'bg-[#1877F2]' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'} text-white`}>
                    {isFb ? <Facebook size={18} /> : <Instagram size={18} />}
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{isFb ? 'Facebook' : 'Instagram'}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {connected ? (isFb ? 'Stránka pripojená' : 'Váš účet pripojený') : 'Nepripojené'}
                    </p>
                </div>
            </div>

            {connected ? (
                <div className="space-y-3">
                    <div className="text-xs font-mono bg-white dark:bg-gray-900 p-2 rounded border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 truncate">
                        {data?.pageName || data?.username || 'Účet'}
                    </div>
                    <button
                        type="button"
                        onClick={onDisconnect}
                        className="w-full py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                        Odpojiť
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onConnect}
                    className={`w-full py-2 rounded-lg text-xs font-bold text-white shadow-sm transition transform active:scale-95 ${isFb ? 'bg-[#1877F2] hover:bg-blue-700' : 'bg-gray-800 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600'}`}
                >
                    Pripojiť
                </button>
            )}
        </div>
    );
};

export default InternalSettings;
