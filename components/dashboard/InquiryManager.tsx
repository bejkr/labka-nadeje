import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Home, Baby, Dog, Award, Clock, Quote, ShieldCheck, CheckCircle, XCircle, MessageSquare, ArrowUpRight } from 'lucide-react';
import { AdoptionInquiry, Shelter } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePets } from '../../contexts/PetContext';
import { useApp } from '../../contexts/AppContext';
import ChatWindow from '../ChatWindow';

interface InquiryManagerProps {
    inquiries: AdoptionInquiry[];
    updateStatus: any;
    markInquiryAsRead: (id: string) => void;
    shelter: Shelter;
    seenInquiryIds: string[];
}

const InquiryManager: React.FC<InquiryManagerProps> = ({ inquiries, updateStatus, markInquiryAsRead, shelter, seenInquiryIds }) => {
    const [selectedInquiry, setSelectedInquiry] = useState<AdoptionInquiry | null>(null);
    const { currentUser } = useAuth();
    const { pets } = usePets();
    const { showToast } = useApp();

    const handleInquiryClick = (inq: AdoptionInquiry) => {
        setSelectedInquiry(inq);
        markInquiryAsRead(inq.id);
    };

    const inquiryPet = selectedInquiry ? pets.find(p => p.id === selectedInquiry.petId) : null;
    const applicant = selectedInquiry?.applicantDetails;

    const handleAction = async (status: 'Schválená' | 'Zamietnutá') => {
        if (!selectedInquiry) return;
        try {
            await updateStatus(selectedInquiry.id, status);
            setSelectedInquiry({ ...selectedInquiry, status });
            showToast(`Žiadosť bola ${status.toLowerCase()}.`, 'success');
        } catch (e) {
            showToast("Chyba pri aktualizácii statusu.", "error");
        }
    };

    // Detail View
    if (selectedInquiry) {
        return (
            <div className="animate-in fade-in slide-in-from-right duration-300 h-full lg:h-[calc(100vh-8rem)] flex flex-col">
                <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50 z-10 py-2">
                    <button
                        onClick={() => setSelectedInquiry(null)}
                        className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">Detail dopytu: {selectedInquiry.applicantName}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Zaslané: {new Date(selectedInquiry.date).toLocaleDateString('sk-SK')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                    {/* Candidate Profile - Left Column (5/12) */}
                    <div className="lg:col-span-5 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
                        {/* Pet Context */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                                    <img src={inquiryPet?.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Záujem o zvieratko</div>
                                    <div className="font-black text-gray-900 text-xl">{selectedInquiry.petName}</div>
                                </div>
                            </div>
                        </div>

                        {/* Applicant Contact */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><User size={20} className="text-brand-500" /> Kontaktné údaje</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-700 break-all">{selectedInquiry.email}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                                    <Phone size={16} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-700">{selectedInquiry.phone || 'Neuvedený'}</span>
                                </div>
                                {applicant?.location && (
                                    <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-700">{applicant.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Household & Experience Details */}
                        {applicant?.household && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                <div>
                                    <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Home size={20} className="text-brand-500" /> Domácnosť</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-[10px] text-gray-400 font-bold mb-1 uppercase">Typ bývania</div>
                                            <div className="text-sm font-black text-gray-800">{applicant.household.housingType}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-[10px] text-gray-400 font-bold mb-1 uppercase">Práca</div>
                                            <div className="text-sm font-black text-gray-800">{applicant.household.workMode}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Baby size={16} className="text-pink-500" />
                                                <span className="text-xs font-bold text-gray-600">Deti</span>
                                            </div>
                                            <span className="text-xs font-black">{applicant.household.hasChildren ? 'Áno' : 'Nie'}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Dog size={16} className="text-blue-500" />
                                                <span className="text-xs font-bold text-gray-600">Iné zvery</span>
                                            </div>
                                            <span className="text-xs font-black">{applicant.household.hasOtherPets ? 'Áno' : 'Nie'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Award size={20} className="text-brand-500" /> Skúsenosti</h3>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                        <div className="text-[10px] text-blue-500 font-bold mb-1 uppercase tracking-wider">Úroveň kynológa</div>
                                        <div className="text-sm font-black text-blue-900">{applicant.household.experienceLevel}</div>
                                    </div>
                                </div>

                                {applicant.availability && (
                                    <div>
                                        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Clock size={20} className="text-brand-500" /> Dostupnosť</h3>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">{applicant.availability}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BIO / Message Summary */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Quote size={20} className="text-brand-500" /> O kandidátovi</h3>
                            <div className="prose prose-sm text-gray-600 italic bg-gray-50 p-4 rounded-xl">
                                "{applicant?.bio || selectedInquiry.message}"
                            </div>
                        </div>

                        {/* ACTION BUTTONS (DECISION) */}
                        {selectedInquiry.status !== 'Schválená' && selectedInquiry.status !== 'Zamietnutá' && selectedInquiry.status !== 'Zrušená' ? (
                            <div className="bg-gray-900 p-6 rounded-3xl shadow-xl space-y-3">
                                <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> Rozhodnutie útulku</h4>
                                <button
                                    onClick={() => handleAction('Schválená')}
                                    className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <CheckCircle size={20} /> Schváliť adopciu
                                </button>
                                <button
                                    onClick={() => handleAction('Zamietnutá')}
                                    className="w-full bg-white/10 text-white py-3.5 rounded-xl font-bold hover:bg-white/20 transition border border-white/10 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <XCircle size={20} /> Zamietnuť žiadosť
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-4 opacity-70">
                                    Schválenie označí zvieratko ako rezervované
                                </p>
                            </div>
                        ) : (
                            <div className={`p-6 rounded-3xl border text-center ${selectedInquiry.status === 'Schválená' ? 'bg-green-50 border-green-100 text-green-700' :
                                selectedInquiry.status === 'Zrušená' ? 'bg-gray-50 border-gray-100 text-gray-500' :
                                    'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                <div className="text-xs font-black mb-1 uppercase tracking-wide opacity-50">Status žiadosti</div>
                                <div className="text-xl font-black">{selectedInquiry.status.toUpperCase()}</div>
                                {selectedInquiry.status === 'Zrušená' && (
                                    <p className="text-xs font-bold text-gray-400 mt-2 italic">Tento dopyt bol zrušený záujemcom.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chat - Right Column (7/12) */}
                    <div className="lg:col-span-7 flex flex-col h-[600px] lg:h-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
                        <ChatWindow
                            inquiryId={selectedInquiry.id}
                            currentUser={currentUser}
                            myAvatarUrl={shelter.logoUrl}
                            otherAvatarUrl={selectedInquiry.applicantDetails?.avatarUrl}
                            className="h-full border-none"
                            initialMessage={{ content: selectedInquiry.message, date: selectedInquiry.date, senderId: selectedInquiry.applicantId }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Adopčné dopyty</h2>
                <p className="text-gray-500 text-sm font-medium">Správy a žiadosti od záujemcov.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Dátum</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Záujemca</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Zviera</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider">Akcia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {inquiries.map(inq => {
                                const hasChatUnread = (inq as any).hasUnreadMessages === true;
                                const isNewNotSeen = inq.status === 'Nová' && !seenInquiryIds.includes(inq.id);
                                const isUnread = hasChatUnread || isNewNotSeen;

                                return (
                                    <tr key={inq.id} onClick={() => handleInquiryClick(inq)} className={`hover:bg-gray-50 transition cursor-pointer group ${isUnread ? 'bg-orange-50/40 relative' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                                            {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>}
                                            {inq.date ? new Date(inq.date).toLocaleDateString('sk-SK') : ''}
                                        </td>
                                        <td className={`px-6 py-4 ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                            <div className="flex items-center gap-3">
                                                {hasChatUnread ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black shadow-sm">
                                                        <MessageSquare size={10} fill="currentColor" /> Nová správa
                                                    </div>
                                                ) : isNewNotSeen && (
                                                    <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse flex-shrink-0 shadow-sm shadow-brand-200" title="Nový dopyt"></div>
                                                )}
                                                {inq.applicantName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className="text-brand-600 font-bold">{inq.petName}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${inq.status === 'Nová' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    inq.status === 'Schválená' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        inq.status === 'Zamietnutá' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>{inq.status.toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right"><ArrowUpRight size={20} className="text-gray-300 group-hover:text-brand-600 inline transition-colors" /></td>
                                    </tr>
                                );
                            })}
                            {inquiries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Zatiaľ ste nedostali žiadne dopyty.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InquiryManager;
