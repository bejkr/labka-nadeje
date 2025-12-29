
import React, { useRef } from 'react';
import { X, Download, Share2, Award, Heart } from 'lucide-react';
import { VirtualAdoption } from '../types';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    adoption: VirtualAdoption | null;
    userName: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, adoption, userName }) => {
    if (!isOpen || !adoption) return null;

    const sentiment = adoption.amount >= 50 ? 'Guardian Angel' : adoption.amount >= 25 ? 'Hero' : 'Supporter';
    const date = new Date(adoption.nextBillingDate); // Using billing date as proxy for now, ideally creation date
    date.setMonth(date.getMonth() - 1); // Approximate start date
    const dateString = date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
            <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:w-full print:max-w-none print:rounded-none">

                {/* Close Button - Hide on print */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100/50 hover:bg-gray-100 rounded-full text-gray-500 transition print:hidden"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col md:flex-row print:flex-row h-full min-h-[600px]">
                    {/* Left Side - Visual */}
                    <div className="w-full md:w-1/3 bg-gray-900 text-white p-10 flex flex-col justify-between relative overflow-hidden print:w-1/3">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                    <Heart className="text-pink-500 fill-current" size={24} />
                                </div>
                                <span className="font-bold tracking-wide uppercase text-sm opacity-80">LabkaNádeje</span>
                            </div>

                            <h2 className="text-4xl font-black leading-tight mb-4">
                                Certifikát<br />
                                <span className="text-brand-400">Adopcie</span>
                            </h2>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                Oficiálne potvrdenie o virtuálnej adopcii a podpore zvieratka v núdzi.
                            </p>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shadow-lg mb-4">
                                <img src={adoption.petImage || "https://images.unsplash.com/photo-1543466835-00a7907e9de1"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-lg font-bold">{adoption.petName}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">Adoptované zvieratko</div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="w-full md:w-2/3 p-10 md:p-14 flex flex-col justify-center bg-white relative print:w-2/3">

                        <div className="border-[12px] border-double border-gray-100 absolute inset-6 pointer-events-none print:inset-0 print:border-8"></div>

                        <div className="text-center relative z-10">
                            <Award className="w-16 h-16 text-brand-500 mx-auto mb-6" />

                            <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Týmto sa udeľuje</div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 font-serif italic text-brand-900">
                                {userName}
                            </h1>

                            <div className="w-24 h-1 bg-brand-100 mx-auto mb-8 rounded-full"></div>

                            <p className="text-gray-600 font-medium text-lg leading-relaxed max-w-lg mx-auto mb-10">
                                Za láskavú podporu a virtuálnu adopciu zvieratka <strong className="text-gray-900">{adoption.petName}</strong>.
                                Vaša pomoc vo výške <strong className="text-brand-600">{adoption.amount} € mesačne</strong> zabezpečuje {adoption.amount >= 25 ? 'komplexnú starostlivosť, jedlo a veterinárne ošetrenie' : 'dennú dávku krmiva a maškrty'}.
                            </p>

                            <div className="flex justify-between items-end max-w-md mx-auto border-t border-gray-100 pt-8">
                                <div className="text-left">
                                    <div className="font-dancing text-2xl text-gray-800 mb-1">Jana Nováková</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Riaditeľka útulku</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-800 mb-1">{dateString}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dátum vystavenia</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions - Hide on print */}
                <div className="bg-gray-50 p-6 flex justify-between items-center print:hidden border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">ID certifikátu: {adoption.id.slice(0, 8).toUpperCase()}</p>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                            <Download size={18} /> Stiahnuť PDF
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CertificateModal;
