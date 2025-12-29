import React, { useState } from 'react';
import { X, Heart, Shield, Star, CheckCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Pet } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface VirtualAdoptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    pet: Pet;
    onSuccess: () => void;
}

const VirtualAdoptionModal: React.FC<VirtualAdoptionModalProps> = ({ isOpen, onClose, pet, onSuccess }) => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const [amount, setAmount] = useState<number>(25);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAmountSelect = (val: number) => {
        setAmount(val);
        setCustomAmount('');
        setError(null);
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomAmount(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed > 0) {
            setAmount(parsed);
            setError(null);
        }
    };

    const handleContinue = () => {
        if (amount < 1) {
            setError(t('petDetail.toast.invalidAmount') || 'Minimálna suma je 1 €.');
            return;
        }
        setStep('confirm');
    };

    const handleConfirm = async () => {
        try {
            setStep('processing');
            await api.createVirtualAdoption(pet, amount);
            // Simulate processing delay for effect
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (e) {
            console.error(e);
            setError(t('petDetail.errorSending') || 'Chyba pri spracovaní.');
            setStep('select');
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl my-8 transition-all duration-300 transform ${step === 'processing' ? 'scale-95 opacity-90' : 'scale-100'}`}>

                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase">
                                {t('home.virtualAdoption.badge')}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">
                            Staňte sa hrdinom pre <span className="text-brand-600">{pet.name}</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            {t('home.virtualAdoption.description')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'processing' ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="animate-spin text-brand-600" size={40} />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 mb-2">Spracovávame váš dar...</h4>
                            <p className="text-gray-500 font-medium">Prosím čakajte, spájame vaše srdce s {pet.name}.</p>
                        </div>
                    ) : step === 'confirm' ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-gradient-to-br from-brand-50 to-white border border-brand-100 p-6 rounded-3xl text-center relative overflow-hidden">
                                <Sparkles className="absolute top-4 right-4 text-brand-200 opacity-50" size={48} />
                                <div className="relative z-10">
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Mesačný príspevok</p>
                                    <div className="text-5xl font-black text-brand-600 mb-2">{amount} €</div>
                                    <p className="text-xs font-bold text-brand-400">každý mesiac</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700">Pravidelná podpora pre {pet.name}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700">Certifikát o virtuálnej adopcii</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle size={20} className="text-green-500 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700">Možnosť kedykoľvek zrušiť</span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-200 transition transform hover:-translate-y-1"
                            >
                                Potvrdiť a Adoptovať
                            </button>
                            <button
                                onClick={() => setStep('select')}
                                className="w-full py-2 text-gray-400 font-bold text-sm hover:text-gray-600"
                            >
                                Späť na výber sumy
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">
                                    {t('petDetail.chooseAmount')}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    {[10, 25, 50].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => handleAmountSelect(val)}
                                            className={`relative p-4 rounded-2xl border-2 transition-all duration-200 group ${amount === val && !customAmount ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md transform -translate-y-1' : 'border-gray-100 bg-white text-gray-600 hover:border-brand-200 hover:bg-gray-50'}`}
                                        >
                                            <div className="font-black text-2xl mb-1">{val} €</div>
                                            <div className="text-[10px] font-bold opacity-70">mesačne</div>
                                            {amount === val && !customAmount && <div className="absolute top-2 right-2 text-brand-600"><CheckCircle size={16} /></div>}
                                        </button>
                                    ))}
                                </div>

                                <div className={`relative flex items-center rounded-2xl border-2 transition-colors ${customAmount ? 'border-brand-500 bg-white ring-4 ring-brand-50' : 'border-gray-100 bg-gray-50'}`}>
                                    <div className="pl-4 font-bold text-gray-500">€</div>
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        placeholder={t('petDetail.otherAmount') || 'Iná suma'}
                                        className="w-full p-4 bg-transparent outline-none font-bold text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                                {error && (
                                    <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                                        <AlertCircle size={12} /> {error}
                                    </p>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                                <Shield className="text-blue-500 shrink-0" size={20} />
                                <div className="text-xs text-blue-800 font-medium leading-relaxed">
                                    <strong className="block mb-1 text-blue-900">Bezpečná platba cez Stripe</strong>
                                    Ide o pravidelný mesačný príspevok. Môžete ho kedykoľvek jednoducho zrušiť alebo zmeniť vo svojom profile.
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <Heart className="fill-current" size={20} />
                                Pokračovať
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VirtualAdoptionModal;
