import React from 'react';
import { X, Facebook, Instagram, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SocialShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    petName: string;
    imageUrl: string;
    description: string;
    hashtags?: string[];
    url?: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
    isOpen, onClose, petName, imageUrl, description, hashtags = [], url = window.location.href
}) => {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleFacebookShare = () => {
        // Use Share Proxy for Facebook to ensure Meta Tags are read correctly
        // The proxy will then redirect the user back to the app
        let petId = '';
        try {
            // Safely extract ID regardless of URL structure
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            petId = pathParts[pathParts.length - 1] || ''; // Last part is usually ID
        } catch (e) {
            console.error('Error parsing URL', e);
        }

        const supabaseUrl = 'https://qcwoyklifcekulkhrqmz.supabase.co';
        // Fallback to home if no ID found, though typically we shouldn't share without ID
        const proxyUrl = petId
            ? `${supabaseUrl}/functions/v1/share-proxy?id=${petId}`
            : url;

        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(proxyUrl)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const handleInstagramCopy = () => {
        const caption = `🐾 ${petName} hľadá domov!\n\n${description}\n\n📍 Viac info v linku v bio!\n\n${hashtags.join(' ')}\n\n#labkanadeje #adopcia #pes #macka #hladamdomov`;
        navigator.clipboard.writeText(caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyLink = () => {
        // Copy Proxy URL so pasted links in Messenger/WhatsApp etc work too
        let petId = '';
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            petId = pathParts[pathParts.length - 1] || '';
        } catch (e) {
            console.error('Error parsing URL', e);
        }

        const supabaseUrl = 'https://qcwoyklifcekulkhrqmz.supabase.co';
        const proxyUrl = petId
            ? `${supabaseUrl}/functions/v1/share-proxy?id=${petId}`
            : url;

        navigator.clipboard.writeText(proxyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-black text-xl text-gray-900">Zdieľať profil</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Preview */}
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <img src={imageUrl} alt={petName} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                        <div>
                            <div className="font-black text-gray-900">{petName}</div>
                            <div className="text-xs text-gray-500 font-medium line-clamp-1">{description}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Facebook */}
                        <button onClick={handleFacebookShare} className="flex items-center gap-4 w-full p-4 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 text-[#1877F2] rounded-2xl transition font-bold border border-[#1877F2]/10">
                            <div className="p-2 bg-[#1877F2] text-white rounded-xl"><Facebook size={20} /></div>
                            <div>
                                <div className="text-sm">Facebook</div>
                                <div className="text-[10px] opacity-70 font-medium">Zdieľať príspevok</div>
                            </div>
                        </button>

                        {/* Instagram Helper */}
                        <button onClick={handleInstagramCopy} className="flex items-center gap-4 w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-pink-700 rounded-2xl transition font-bold border border-pink-100 group relative">
                            <div className="p-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-xl"><Instagram size={20} /></div>
                            <div className="text-left">
                                <div className="text-sm">Instagram</div>
                                <div className="text-[10px] opacity-70 font-medium">Kopírovať fotku a popis</div>
                            </div>
                            {copied && (
                                <div className="absolute right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-lg font-bold animate-in fade-in slide-in-from-right-2">
                                    Skopírované!
                                </div>
                            )}
                        </button>

                        {/* Copy Link */}
                        <button onClick={handleCopyLink} className="flex items-center gap-4 w-full p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl transition font-bold border border-gray-100">
                            <div className="p-2 bg-gray-200 text-gray-600 rounded-xl"><LinkIcon size={20} /></div>
                            <div className="text-left">
                                <div className="text-sm">Odkaz</div>
                                <div className="text-[10px] opacity-70 font-medium">Kopírovať link</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialShareModal;
