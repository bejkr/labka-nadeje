
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { User, Shelter, Pet, BlogPost, PromoSlide } from '../types';
import { ShieldAlert, Users, Building2, Loader2, Search, Dog, Trash2, Edit2, BookOpen, Plus, CheckCircle, XCircle, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PetFormModal from '../components/PetFormModal';
import BlogFormModal from '../components/BlogFormModal';
import PromoFormModal from '../components/PromoFormModal';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<(User | Shelter)[]>([]);
  const [pets, setPets] = useState<(Pet & { shelterName?: string })[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'shelters' | 'pets' | 'blog' | 'promo'>('users');

  // Modal States
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  const [editingSlide, setEditingSlide] = useState<PromoSlide | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Confirmation States
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'pet' | 'blog' | 'promo', name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSuperAdmin = (currentUser as any)?.isSuperAdmin;

  const loadData = async () => {
      setLoading(true);
      try {
          if (activeTab === 'users' || activeTab === 'shelters') {
              const data = await api.getAllUsers();
              setUsers(data);
          } else if (activeTab === 'pets') {
              const data = await api.adminGetAllPets();
              setPets(data);
          } else if (activeTab === 'blog') {
              const data = await api.getBlogPosts();
              setBlogPosts(data);
          } else if (activeTab === 'promo') {
              const data = await api.getPromoSlides();
              setPromoSlides(data);
          }
      } catch (e) {
          console.error("Admin: Failed to load data", e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    if (!currentUser || !isSuperAdmin) {
        navigate('/');
        return;
    }
    loadData();
  }, [currentUser, isSuperAdmin, navigate, activeTab]);

  const handleExecuteDelete = async () => {
      if (!confirmDelete) return;
      setIsProcessing(true);
      try {
          if (confirmDelete.type === 'pet') await api.deletePet(confirmDelete.id);
          else if (confirmDelete.type === 'blog') await api.deleteBlogPost(confirmDelete.id);
          else if (confirmDelete.type === 'promo') await api.deletePromoSlide(confirmDelete.id);
          
          setConfirmDelete(null);
          loadData();
      } catch (e: any) {
          alert(e.message || "Chyba pri mazaní.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleEditPet = (pet: Pet) => {
      setEditingPet(pet);
      setIsEditModalOpen(true);
  };

  const handleSavePet = async (petData: Pet) => {
      try {
          await api.updatePet(petData);
          setIsEditModalOpen(false);
          loadData();
      } catch (e) { console.error(e); }
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
      try {
          if (postData.id) await api.updateBlogPost(postData);
          else await api.createBlogPost(postData);
          setIsBlogModalOpen(false);
          loadData();
      } catch (e) { console.error(e); }
  };

  const handleVerifyShelter = async (shelterId: string, currentStatus: boolean | undefined) => {
      try {
          await api.verifyShelter(shelterId, !currentStatus);
          setUsers(prev => prev.map(u => u.id === shelterId ? { ...u, isVerified: !currentStatus } as Shelter : u));
      } catch (e) { console.error(e); }
  };

  // --- Filtering ---
  const filteredUsers = users.filter(u => u.role === 'user' && (u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())));
  const filteredShelters = users.filter(u => u.role === 'shelter' && (u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())));
  const filteredPets = pets.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || (p.shelterName && p.shelterName.toLowerCase().includes(filter.toLowerCase())));
  const filteredPosts = blogPosts.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()) || p.author.toLowerCase().includes(filter.toLowerCase()));

  if (!isSuperAdmin) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12 text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold flex items-center gap-3"><ShieldAlert className="text-red-600" size={32}/> Admin Panel</h1>
                    <p className="text-gray-500 mt-2">Plná kontrola nad platformou.</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}><Users size={20}/> Používatelia</button>
                <button onClick={() => setActiveTab('shelters')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'shelters' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}><Building2 size={20}/> Útulky</button>
                <button onClick={() => setActiveTab('pets')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'pets' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}><Dog size={20}/> Inzeráty</button>
                <button onClick={() => setActiveTab('blog')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'blog' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}><BookOpen size={20}/> Blog</button>
                <button onClick={() => setActiveTab('promo')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'promo' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}><Megaphone size={20}/> Partneri</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold">{activeTab === 'users' ? 'Používatelia' : activeTab === 'shelters' ? 'Správa útulkov' : activeTab === 'pets' ? 'Inzeráty' : activeTab === 'blog' ? 'Blog' : 'Bannery'}</h2>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Hľadať..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                        {activeTab === 'blog' && <button onClick={() => setIsBlogModalOpen(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-700 transition flex items-center gap-2">Pridať článok</button>}
                        {activeTab === 'promo' && <button onClick={() => setIsPromoModalOpen(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-700 transition flex items-center gap-2">Pridať banner</button>}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                {activeTab === 'users' ? (<><th className="px-6 py-4 font-bold">Meno</th><th className="px-6 py-4 font-bold">Email</th><th className="px-6 py-4 font-bold">Admin</th></>) : 
                                 activeTab === 'shelters' ? (<><th className="px-6 py-4 font-bold">Útulok</th><th className="px-6 py-4 font-bold">Lokalita</th><th className="px-6 py-4 font-bold">Status</th><th className="px-6 py-4 text-right font-bold">Akcia</th></>) : 
                                 activeTab === 'pets' ? (<><th className="px-6 py-4 font-bold">Zviera</th><th className="px-6 py-4 font-bold">Útulok</th><th className="px-6 py-4 text-right font-bold">Akcia</th></>) : 
                                 activeTab === 'blog' ? (<><th className="px-6 py-4 font-bold">Názov</th><th className="px-6 py-4 font-bold">Autor</th><th className="px-6 py-4 text-right font-bold">Akcia</th></>) : 
                                 (<><th className="px-6 py-4 font-bold">Názov</th><th className="px-6 py-4 font-bold">Badge</th><th className="px-6 py-4 text-right font-bold">Akcia</th></>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (<tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-brand-600"/></td></tr>) : 
                             activeTab === 'users' ? (filteredUsers.map(user => (<tr key={user.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 font-bold">{user.name}</td><td className="px-6 py-4">{user.email}</td><td className="px-6 py-4 font-bold">{user.isSuperAdmin ? 'ÁNO' : 'Nie'}</td></tr>))) : 
                             activeTab === 'shelters' ? ((filteredShelters as Shelter[]).map(shelter => (<tr key={shelter.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 font-bold">{shelter.name}</td><td className="px-6 py-4">{shelter.location}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${shelter.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{shelter.isVerified ? 'Overený' : 'Neoverený'}</span></td><td className="px-6 py-4 text-right"><button onClick={() => handleVerifyShelter(shelter.id, shelter.isVerified)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${shelter.isVerified ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white'}`}>{shelter.isVerified ? 'Zrušiť overenie' : 'Overiť'}</button></td></tr>))) : 
                             activeTab === 'pets' ? (filteredPets.map(pet => (<tr key={pet.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 font-bold">{pet.name}</td><td className="px-6 py-4">{pet.shelterName}</td><td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => handleEditPet(pet)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18} /></button><button onClick={() => setConfirmDelete({ id: pet.id, type: 'pet', name: pet.name })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button></td></tr>))) : 
                             activeTab === 'blog' ? (filteredPosts.map(post => (<tr key={post.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 font-bold">{post.title}</td><td className="px-6 py-4">{post.author}</td><td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => { setEditingPost(post); setIsBlogModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18} /></button><button onClick={() => setConfirmDelete({ id: post.id, type: 'blog', name: post.title })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button></td></tr>))) : 
                             (promoSlides.map(slide => (<tr key={slide.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 font-bold">{slide.title}</td><td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{slide.badge}</span></td><td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => { setEditingSlide(slide); setIsPromoModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18} /></button><button onClick={() => setConfirmDelete({ id: slide.id, type: 'promo', name: slide.title })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button></td></tr>)))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {editingPet && <PetFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} pet={editingPet} shelterId={editingPet.shelterId} onSave={handleSavePet} defaultLocation="" />}
        <BlogFormModal isOpen={isBlogModalOpen} onClose={() => setIsBlogModalOpen(false)} post={editingPost} onSave={handleSavePost} />
        <PromoFormModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} slide={editingSlide} onSave={loadData} />
        
        <ConfirmationModal 
           isOpen={!!confirmDelete} 
           onClose={() => setConfirmDelete(null)} 
           onConfirm={handleExecuteDelete} 
           isLoading={isProcessing} 
           title={`Vymazať ${confirmDelete?.type === 'pet' ? 'inzerát' : confirmDelete?.type === 'blog' ? 'článok' : 'banner'}?`} 
           message={`Naozaj chcete natrvalo vymazať "${confirmDelete?.name}"? Táto akcia je nevratná.`} 
        />
    </div>
  );
};

export default AdminDashboard;
