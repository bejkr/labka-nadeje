
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { Calendar, User, Trash2, Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const BlogPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useApp();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = (currentUser as any)?.isSuperAdmin;

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
      try {
          const data = await api.getBlogPosts();
          setPosts(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.preventDefault(); // Prevent link click
      if (!window.confirm("Naozaj vymazať tento článok?")) return;
      
      try {
          await api.deleteBlogPost(id);
          setPosts(prev => prev.filter(p => p.id !== id));
          showToast("Článok bol vymazaný", "success");
      } catch (e) {
          console.error(e);
          showToast("Chyba pri mazaní", "error");
      }
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Blog & Príbehy</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Rady pre nových majiteľov, šťastné konce adopcií a novinky zo sveta útulkov.
          </p>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48} /></div>
        ) : (
            <div className="grid gap-12 lg:grid-cols-3">
            {posts.length > 0 ? posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="group flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 relative border border-gray-100">
                
                {isSuperAdmin && (
                    <button 
                        onClick={(e) => handleDelete(e, post.id)}
                        className="absolute top-3 right-3 z-20 bg-white/90 text-red-600 p-2 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm border border-red-100"
                        title="Vymazať článok (Admin)"
                    >
                        <Trash2 size={18} />
                    </button>
                )}

                <div className="flex-shrink-0 h-48 overflow-hidden">
                    <img className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" src={post.imageUrl} alt={post.title} />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-brand-600 mb-2">
                        Článok
                    </p>
                    <div className="block mt-2">
                        <p className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition">
                        {post.title}
                        </p>
                        <p className="mt-3 text-base text-gray-500 line-clamp-3">
                        {post.summary}
                        </p>
                    </div>
                    </div>
                    <div className="mt-6 flex items-center pt-4 border-t border-gray-100">
                    <div className="flex-shrink-0">
                        <span className="sr-only">{post.author}</span>
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <User size={20} />
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                        {post.author || 'Redakcia'}
                        </p>
                        <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('sk-SK')}</time>
                        </div>
                    </div>
                    </div>
                </div>
                </Link>
            )) : (
                <div className="col-span-3 text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Zatiaľ žiadne články. {isSuperAdmin ? 'Nahrajte ich cez stránku Podpora.' : ''}</p>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
