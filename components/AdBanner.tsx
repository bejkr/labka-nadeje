
import React from 'react';
import { ExternalLink } from 'lucide-react';

type AdType = 'custom' | 'adsense';

interface AdBannerProps {
  type?: AdType;
  // Pre Custom Banner
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  // Pre AdSense (do budúcna)
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  type = 'custom', 
  imageUrl, 
  linkUrl, 
  altText = "Reklama", 
  slotId,
  className = "",
  label = "Sponzorovaný obsah"
}) => {
  
  if (type === 'custom') {
    if (!imageUrl) return null;

    return (
      <div className={`w-full my-8 ${className}`}>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-1 font-bold">
          {label}
        </div>
        <a 
          href={linkUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block relative group overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
        >
          <img 
            src={imageUrl} 
            alt={altText} 
            className="w-full h-32 md:h-40 object-cover object-center transform group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center">
             {linkUrl && (
                 <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition shadow-sm flex items-center gap-1 transform translate-y-2 group-hover:translate-y-0">
                    Otvoriť <ExternalLink size={12} />
                 </span>
             )}
          </div>
        </a>
      </div>
    );
  }

  // Placeholder for AdSense
  return (
    <div className={`w-full my-8 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center p-4 min-h-[150px] text-gray-400 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-widest mb-2">Reklama</span>
      {/* V produkcii tu bude <ins className="adsbygoogle" ... /> */}
      <div className="text-sm text-center">
        Google AdSense Slot <br/>
        <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">{slotId || 'ID-nevyplnene'}</code>
      </div>
    </div>
  );
};

export default AdBanner;
