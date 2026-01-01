import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { BlogPost } from '../types';
import DOMPurify from 'dompurify';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getBlogPost(id);
        setPost(data || null);

        // Fetch recent posts for "You might also like"
        // In a real app, this might be filtered by tag or category
        const allPosts = await api.getBlogPosts();
        setRelatedPosts(allPosts.filter(p => p.id !== id).slice(0, 2));
      } catch (e) {
        console.error("Failed to load blog post", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-brand-600" size={48} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Článok sa nenašiel</h2>
          <p className="text-gray-500 mb-6">Je nám ľúto, ale tento článok neexistuje alebo bol odstránený.</p>
          <Link to="/blog" className="text-brand-600 font-bold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={20} /> Späť na blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Image */}
      <div className="w-full h-[40vh] md:h-[50vh] relative overflow-hidden bg-gray-900">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition">
              <ArrowLeft size={20} className="mr-2" /> Späť na všetky články
            </Link>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                  <User size={16} />
                </div>
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar size={18} />
                <span>{new Date(post.date).toLocaleDateString('sk-SK')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-t-3xl p-8 md:p-12 shadow-sm border-x border-t border-gray-100 min-h-[500px]">

          {/* Content */}
          <article className="prose prose-lg prose-orange max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="font-bold text-xl text-gray-900 mb-8">{post.summary}</p>
            {Array.isArray(post.content) ? post.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            )) : (
              // Fallback for simple string content (backward compatibility or raw HTML)
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content as string) }} />
            )}
          </article>

          {/* Share & Tags */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-500 font-medium">
                Zdieľať tento článok:
              </div>
              <div className="flex gap-4">
                <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                  <Facebook size={20} />
                </button>
                <button className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition">
                  <Twitter size={20} />
                </button>
                <button className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition">
                  <Linkedin size={20} />
                </button>
                <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Next Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 px-4">Mohlo by vás zaujímať</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map(nextPost => (
                <Link key={nextPost.id} to={`/blog/${nextPost.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex border border-gray-100">
                  <img src={nextPost.imageUrl} alt={nextPost.title} className="w-1/3 object-cover" />
                  <div className="p-4 flex flex-col justify-center">
                    <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition line-clamp-2">{nextPost.title}</h4>
                    <span className="text-xs text-gray-500 mt-2">{new Date(nextPost.date).toLocaleDateString('sk-SK')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogDetailPage;