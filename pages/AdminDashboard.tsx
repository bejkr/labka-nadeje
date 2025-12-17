import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { User, Shelter, Pet, BlogPost, PromoSlide } from '../types';
import { ShieldAlert, Users, Building2, Loader2, Search, Dog, Trash2, Edit2, BookOpen, Plus, CheckCircle, XCircle, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PetFormModal from '../components/PetFormModal';
import BlogFormModal from '../components/BlogFormModal';
import PromoFormModal from '../components/PromoFormModal';

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

  // Edit States
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  const [editingSlide, setEditingSlide] = useState<PromoSlide | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

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

  const handleEditPet = (pet: Pet) => {
      setEditingPet(pet);
      setIsEditModalOpen(true);
  };

  const handleSavePet = async (petData: Pet) => {
      try {
          await api.updatePet(petData);
          alert("Inzerát bol úspešne aktualizovaný.");
          setIsEditModalOpen(false);
          loadData();
      } catch (e) {
          console.error(e);
          alert("Chyba pri aktualizácii inzerátu.");
      }
  };

  const handleDeletePet = async (id: string, name: string) => {
      if (window.confirm(`Naozaj vymazať inzerát "${name}"? Táto akcia je nevratná.`)) {
          try {
              await api.deletePet(id);
              alert("Inzerát bol úspešne vymazaný.");
              loadData();
          } catch (e: any) {
              console.error(e);
              alert(e.message || "Chyba pri mazaní inzerátu.");
          }
      }
  };

  // --- Blog Handlers ---
  const handleAddPost = () => {
      setEditingPost(null);
      setIsBlogModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
      setEditingPost(post);
      setIsBlogModalOpen(true);
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
      try {
          if (postData.id) {
            await api.updateBlogPost(postData);
            alert("Článok bol aktualizovaný.");
          } else {
            await api.createBlogPost(postData);
            alert("Článok bol vytvorený.");
          }
          setIsBlogModalOpen(false);
          loadData();
      } catch (e) {
          console.error(e);
          alert("Chyba pri ukladaní článku.");
      }
  };

  const handleDeletePost = async (id: string, title: string) => {
      if (window.confirm(`Naozaj vymazať článok "${title}"?`)) {
          try {
              await api.deleteBlogPost(id);
              alert("Článok bol vymazaný.");
              loadData();
          } catch (e) {
              console.error(e);
              alert("Chyba pri mazaní článku.");
          }
      }
  };

  // --- Promo Handlers ---
  const handleAddSlide = () => {
      setEditingSlide(null);
      setIsPromoModalOpen(true);
  };

  const handleEditSlide = (slide: PromoSlide) => {
      setEditingSlide(slide);
      setIsPromoModalOpen(true);
  };

  const handleDeleteSlide = async (id: string) => {
      if (window.confirm("Naozaj vymazať tento banner?")) {
          try {
              await api.deletePromoSlide(id);
              loadData();
          } catch (e) {
              console.error(e);
              alert("Chyba pri mazaní.");
          }
      }
  };

  const handleSavePromo = () => {
      loadData(); // Just reload, logic is in modal
  };

  // --- Shelter Verification ---
  const handleVerifyShelter = async (shelterId: string, currentStatus: boolean | undefined) => {
      try {
          await api.verifyShelter(shelterId, !currentStatus);
          setUsers(prev => prev.map(u => u.id === shelterId ? { ...u, isVerified: !currentStatus } as Shelter : u));
      } catch (e) {
          console.error(e);
          alert("Chyba pri zmene statusu.");
      }
  };

  // --- Filtering ---
  const filteredUsers = users.filter(u => 
      u.role === 'user' && (u.name.toLowerCase().includes(filter.toLowerCase()) || 
      u.email.toLowerCase().includes(filter.toLowerCase()))
  );

  const filteredShelters = users.filter(u => 
      u.role === 'shelter' && (u.name.toLowerCase().includes(filter.toLowerCase()) || 
      u.email.toLowerCase().includes(filter.toLowerCase()))
  );

  const filteredPets = pets.filter(p => 
      p.name.toLowerCase().includes(filter.toLowerCase()) || 
      (p.shelterName && p.shelterName.toLowerCase().includes(filter.toLowerCase()))
  );

  const filteredPosts = blogPosts.filter(p => 
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.author.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isSuperAdmin) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <ShieldAlert className="text-red-600" size={32}/> 
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2">Vitajte v centrále. Máte plnú kontrolu.</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    <Users size={20}/> Používatelia
                </button>
                <button onClick={() => setActiveTab('shelters')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'shelters' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    <Building2 size={20}/> Útulky
                </button>
                <button onClick={() => setActiveTab('pets')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'pets' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    <Dog size={20}/> Inzeráty
                </button>
                <button onClick={() => setActiveTab('blog')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'blog' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    <BookOpen size={20}/> Blog
                </button>
                <button onClick={() => setActiveTab('promo')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'promo' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    <Megaphone size={20}/> Partneri
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {activeTab === 'users' ? 'Zoznam používateľov' : 
                         activeTab === 'shelters' ? 'Správa a overovanie útulkov' :
                         activeTab === 'pets' ? 'Zoznam všetkých zvierat' : 
                         activeTab === 'blog' ? 'Správa článkov' : 'Správa bannerov partnerov'}
                    </h2>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Hľadať..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        {activeTab === 'blog' && (
                            <button onClick={handleAddPost} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-700 transition flex items-center gap-2 shadow-lg shadow-brand-200 whitespace-nowrap">
                                <Plus size={18} /> Pridať článok
                            </button>
                        )}
                        {activeTab === 'promo' && (
                            <button onClick={handleAddSlide} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-700 transition flex items-center gap-2 shadow-lg shadow-brand-200 whitespace-nowrap">
                                <Plus size={18} /> Pridať banner
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="px-6 py-4 font-bold">Meno</th>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">Lokalita</th>
                                        <th className="px-6 py-4 font-bold">Admin?</th>
                                    </>
                                ) : activeTab === 'shelters' ? (
                                    <>
                                        <th className="px-6 py-4 font-bold">Názov útulku</th>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">Lokalita</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold text-right">Akcia</th>
                                    </>
                                ) : activeTab === 'pets' ? (
                                    <>
                                        <th className="px-6 py-4 font-bold">Zviera</th>
                                        <th className="px-6 py-4 font-bold">Útulok</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold text-right">Akcia</th>
                                    </>
                                ) : activeTab === 'blog' ? (
                                    <>
                                        <th className="px-6 py-4 font-bold">Obrázok</th>
                                        <th className="px-6 py-4 font-bold">Názov</th>
                                        <th className="px-6 py-4 font-bold">Autor</th>
                                        <th className="px-6 py-4 font-bold">Dátum</th>
                                        <th className="px-6 py-4 font-bold text-right">Akcia</th>
                                    </>
                                ) : (
                                    /* PROMO TAB */
                                    <>
                                        <th className="px-6 py-4 font-bold">Banner</th>
                                        <th className="px-6 py-4 font-bold">Badge</th>
                                        <th className="px-6 py-4 font-bold">Link</th>
                                        <th className="px-6 py-4 font-bold text-right">Akcia</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-brand-600"/></td></tr>
                            ) : activeTab === 'users' ? (
                                filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.location || '-'}</td>
                                            <td className="px-6 py-4">
                                                {user.isSuperAdmin ? (
                                                    <span className="text-red-600 font-bold flex items-center gap-1"><ShieldAlert size={14}/> Áno</span>
                                                ) : <span className="text-gray-400">Nie</span>}
                                            </td>
                                        </tr>
                                    ))
                                ) : <tr><td colSpan={5} className="p-12 text-center text-gray-400">Žiadne výsledky.</td></tr>
                            ) : activeTab === 'shelters' ? (
                                filteredShelters.length > 0 ? (
                                    (filteredShelters as Shelter[]).map(shelter => (
                                        <tr key={shelter.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-bold text-gray-900">{shelter.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{shelter.email}</td>
                                            <td className="px-6 py-4 text-gray-500">{shelter.location || '-'}</td>
                                            <td className="px-6 py-4">
                                                {shelter.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-green-200">
                                                        <CheckCircle size={12}/> Overený
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                                                        <XCircle size={12}/> Neoverený
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleVerifyShelter(shelter.id, shelter.isVerified)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${shelter.isVerified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                                >
                                                    {shelter.isVerified ? 'Zrušiť overenie' : 'Overiť útulok'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : <tr><td colSpan={5} className="p-12 text-center text-gray-400">Žiadne výsledky.</td></tr>
                            ) : activeTab === 'pets' ? (
                                filteredPets.length > 0 ? (
                                    filteredPets.map(pet => (
                                        <tr key={pet.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={pet.imageUrl} alt={pet.name} className="w-10 h-10 rounded-lg object-cover bg-gray-200"/>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{pet.name}</div>
                                                        <div className="text-xs text-gray-500">{pet.breed}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700">{pet.shelterName}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${pet.adoptionStatus === 'Available' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {pet.adoptionStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => handleEditPet(pet)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Upraviť inzerát"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDeletePet(pet.id, pet.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Vymazať inzerát"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : <tr><td colSpan={4} className="p-12 text-center text-gray-400">Žiadne inzeráty.</td></tr>
                            ) : activeTab === 'blog' ? (
                                /* BLOG TAB */
                                filteredPosts.length > 0 ? (
                                    filteredPosts.map(post => (
                                        <tr key={post.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <img src={post.imageUrl} alt={post.title} className="w-16 h-10 rounded-lg object-cover bg-gray-200"/>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 max-w-xs truncate">{post.title}</td>
                                            <td className="px-6 py-4 text-gray-600">{post.author}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(post.date).toLocaleDateString('sk-SK')}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => handleEditPost(post)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Upraviť článok"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDeletePost(post.id, post.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Vymazať článok"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : <tr><td colSpan={5} className="p-12 text-center text-gray-400">Žiadne články.</td></tr>
                            ) : (
                                /* PROMO TAB */
                                promoSlides.length > 0 ? (
                                    promoSlides.map(slide => (
                                        <tr key={slide.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={slide.imageUrl} alt={slide.title} className="w-16 h-10 rounded-lg object-cover bg-gray-200"/>
                                                    <div className="font-bold text-gray-900">{slide.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">{slide.badge}</span></td>
                                            <td className="px-6 py-4 text-xs text-gray-500 truncate max-w-[150px]">{slide.link}</td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => handleEditSlide(slide)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18}/></button>
                                                <button onClick={() => handleDeleteSlide(slide.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : <tr><td colSpan={4} className="p-12 text-center text-gray-400">Žiadne bannery.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Reuse the PetFormModal for Admin Editing Pets */}
        {editingPet && (
            <PetFormModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                pet={editingPet}
                shelterId={editingPet.shelterId}
                onSave={handleSavePet}
                defaultLocation="" // Admin doesn't have a shelter location context easily, user must enter
            />
        )}

        {/* Blog Form Modal */}
        <BlogFormModal 
            isOpen={isBlogModalOpen}
            onClose={() => setIsBlogModalOpen(false)}
            post={editingPost}
            onSave={handleSavePost}
        />

        {/* Promo Form Modal */}
        <PromoFormModal
            isOpen={isPromoModalOpen}
            onClose={() => setIsPromoModalOpen(false)}
            slide={editingSlide}
            onSave={handleSavePromo}
        />
    </div>
  );
};

export default AdminDashboard;