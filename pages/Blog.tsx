
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { Calendar, User, Trash2, Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import ConfirmationModal from '../components/ConfirmationModal';

const BlogPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useApp();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [blogToDelete, setBlogToDelete] = useState<{ id: string, title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isSuperAdmin = (currentUser as any)?.isSuperAdmin;

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await api.getBlogPosts(24);
            setPosts(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;
        setIsDeleting(true);
        try {
            await api.deleteBlogPost(blogToDelete.id);
            setPosts(prev => prev.filter(p => p.id !== blogToDelete.id));
            showToast("Článok bol vymazaný", "success");
            setBlogToDelete(null);
        } catch (e) {
            showToast("Chyba pri mazaní", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white min-h-screen py-16 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Blog & Príbehy</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">Zaujimavosti zo sveta zvierat.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48} /></div>
                ) : (
                    <div className="grid gap-12 lg:grid-cols-3">
                        {posts.length > 0 ? posts.map((post) => (
                            <Link key={post.id} to={`/blog/${post.id}`} className="group flex flex-col overflow-hidden rounded-2xl shadow-lg border border-gray-100 relative">

                                {isSuperAdmin && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); setBlogToDelete({ id: post.id, title: post.title }); }}
                                        className="absolute top-3 right-3 z-20 bg-white/90 text-red-600 p-2 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <div className="flex-shrink-0 h-48 overflow-hidden">
                                    <img className="h-full w-full object-cover transform group-hover:scale-105 transition duration-500" src={post.imageUrl} alt={post.title} loading="lazy" />
                                </div>
                                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition">{post.title}</h3>
                                    <p className="mt-3 text-gray-500 line-clamp-3 text-sm">{post.summary}</p>
                                    <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
                                        {new Date(post.date).toLocaleDateString('sk-SK')}
                                    </div>
                                </div>
                            </Link>
                        )) : <p className="col-span-3 text-center py-20 text-gray-400">Zatiaľ žiadne články.</p>}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!blogToDelete}
                onClose={() => setBlogToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Vymazať článok?"
                message={`Naozaj chcete vymazať článok "${blogToDelete?.title}"?`}
            />
        </div>
    );
};

export default BlogPage;
