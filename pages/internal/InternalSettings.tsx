
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Shelter } from '../../types';
import { Save, Building2, MapPin, Phone, Mail, Globe, Facebook, Instagram, CreditCard, Upload } from 'lucide-react';

const InternalSettings: React.FC = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Shelter>>({});

    useEffect(() => {
        if (currentUser && currentUser.role === 'shelter') {
            setFormData(currentUser as Shelter);
        }
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
            alert("Nastavenia boli úspešne uložené.");
        } catch (e) {
            console.error(e);
            alert("Chyba pri ukladaní nastavení.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !currentUser) return;
        const file = e.target.files[0];
        setLoading(true);
        try {
            // Reusing document upload logic but for public bucket ideally. 
            // For now, let's assume we have a public bucket or we use the generic upload and get a public URL.
            // Simplified: User uploads, we get URL, we set `logoUrl`.

            // NOTE: Ideally we need a 'public-assets' bucket. 
            // Leveraging existing uploadShelterDocument for now but we might need to handle permissions if that bucket is private.
            // Assuming we have a 'avatars' or 'public' folder handled by `api.uploadImage` (generic).
            // Let's check `api.ts` later. using `uploadShelterDocument` for now as placeholder or `uploadImage` if exists.

            // Checking api.ts from memory/view: we don't have generic uploadImage exposed clearly, but we have `uploadShelterDocument`.
            // Let's allow generic text input for URL for now, or assume upload support later.
            // Actually, let me check strict types.
            alert("Nahrávanie loga bude dostupné čoskoro. Zadajte prosím URL adresu.");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nastavenia útulku</h1>
                    <p className="text-gray-500 text-sm">Spravujte profil, kontaktné údaje a dary</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition flex items-center gap-2"
                >
                    <Save size={18} />
                    {loading ? 'Ukladám...' : 'Uložiť zmeny'}
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* 1. Basic Info */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-brand-600" /> Základné informácie
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Názov útulku</label>
                            <input
                                type="text" name="name"
                                value={formData.name || ''} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Popis (Bio)</label>
                            <textarea
                                name="description" rows={4}
                                value={formData.description || ''} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="Napíšte niečo o vašom útulku..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text" name="logoUrl"
                                    value={formData.logoUrl || ''} onChange={handleChange}
                                    placeholder="https://..."
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                />
                                {formData.logoUrl && (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Tip: Použite odkaz na existujúci obrázok alebo nahrajte do dokumentov a skopírujte odkaz.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Otváracie hodiny</label>
                            <input
                                type="text" name="openingHours"
                                value={formData.openingHours || ''} onChange={handleChange}
                                placeholder="Po-Pi: 9:00 - 17:00"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Contact Info */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-brand-600" /> Kontakt a Adresa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email" name="email"
                                    value={formData.email || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefón</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text" name="phone"
                                    value={formData.phone || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresa útulku</label>
                            <input
                                type="text" name="location"
                                value={formData.location || ''} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresa pre dary (poštová)</label>
                            <input
                                type="text" name="shippingAddress"
                                value={formData.shippingAddress || ''} onChange={handleChange}
                                placeholder="Vyplňte, ak sa líši od adresy útulku"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Socials & Web */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-brand-600" /> Online prítomnosť
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Webstránka</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text" name="socials.website"
                                    value={(formData.socials as any)?.website || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                            <div className="relative">
                                <Facebook size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text" name="socials.facebook"
                                    value={(formData.socials as any)?.facebook || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                            <div className="relative">
                                <Instagram size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text" name="socials.instagram"
                                    value={(formData.socials as any)?.instagram || ''} onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Donations */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard size={20} className="text-brand-600" /> Finančné dary
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Číslo účtu (IBAN)</label>
                        <input
                            type="text" name="bankAccount"
                            value={formData.bankAccount || ''} onChange={handleChange}
                            placeholder="SK..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-2">Toto číslo účtu sa bude zobrazovať pri vašich zvieratách pre virtuálnu adopciu alebo jednorazovú podporu.</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InternalSettings;
