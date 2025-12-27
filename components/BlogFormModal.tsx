import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Save, Loader2, Info } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => Promise<void>;
}

const BlogFormModal: React.FC<BlogFormModalProps> = ({ isOpen, onClose, post, onSave }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setTitle(post.title);
        setSummary(post.summary);
        // FIX: post.content can be string or string[], check type before calling join to fix Property 'join' does not exist error
        setContent(Array.isArray(post.content) ? post.content.join('\n\n') : post.content);
        setAuthor(post.author);
        setImageUrl(post.imageUrl);
      } else {
        setTitle('');
        setSummary('');
        setContent('');
        setAuthor('Admin');
        setImageUrl('');
      }
    }
  }, [isOpen, post]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title || !summary || !content) {
      alert("Vyplňte povinné polia (Nadpis, Zhrnutie, Obsah)");
      return;
    }

    setLoading(true);
    try {
      const postData: Partial<BlogPost> = {
        id: post?.id,
        title,
        summary,
        content: content.split('\n\n').filter(p => p.trim()),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=800',
        author,
        date: post?.date // Keep original date if editing
      };
      await onSave(postData);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Chyba pri ukladaní");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">{post ? 'Upraviť článok' : 'Nový článok'}</h3>
            <p className="text-sm text-gray-500">Pridajte obsah na blog.</p>
          </div>
          <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-500 p-2 rounded-full border border-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Titulný obrázok</label>
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <Info size={14} className="text-brand-500" />
              Odporúčame orientáciu na šírku (16:9), min. 1200px šírka.
            </p>
            <div className="flex gap-4 items-start">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition group flex-shrink-0"
              >
                <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition"><Upload className="text-brand-600" size={18} /></div>
                <span className="text-[10px] text-gray-500 font-bold">Nahrať</span>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              {imageUrl && (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Nadpis</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition"
                placeholder="Napr. 10 tipov pre nových majiteľov"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Autor</label>
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 transition"
                placeholder="Meno autora"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Krátke zhrnutie (perex)</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
              placeholder="Stručný popis článku..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Obsah článku</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition"
              placeholder="Text článku. Odstavce oddeľte vynechaným riadkom."
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">Tip: Každý nový odstavec oddeľte prázdnym riadkom.</p>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">Zrušiť</button>
          <button onClick={handleSave} disabled={loading} className="px-8 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition transform hover:-translate-y-0.5 flex items-center gap-2">
            {loading && <Loader2 className="animate-spin" size={18} />}
            {post ? 'Uložiť zmeny' : 'Publikovať článok'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogFormModal;
