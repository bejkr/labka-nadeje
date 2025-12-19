
import { supabase } from './supabaseClient';
import { Pet, User, Shelter, AdoptionInquiry, VirtualAdoption, PetType, Gender, Size, Volunteer, ShelterSupply, BlogPost, InquiryMessage, PromoSlide } from '../types';

// Helper to map DB pet object to Pet type
const mapPetFromDB = (row: any): Pet => ({
  id: row.id,
  shelterId: row.shelter_id,
  name: row.name || 'Bez mena',
  type: (row.type as PetType) || PetType.OTHER,
  breed: row.breed || 'Neznáme',
  age: Number(row.age || 0),
  gender: (row.gender as Gender) || Gender.MALE,
  size: (row.size as Size) || Size.MEDIUM,
  location: row.location || '',
  imageUrl: row.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
  description: row.description || '',
  adoptionFee: Number(row.adoption_fee || 0),
  adoptionStatus: row.adoption_status || 'Available',
  isVisible: row.is_visible !== false,
  needsFoster: !!row.needs_foster,
  tags: Array.isArray(row.tags) ? row.tags : [],
  postedDate: row.posted_date || new Date().toISOString(),
  views: Number(row.views || 0),
  gallery: row.details?.gallery || [],
  health: row.details?.health || {},
  social: row.details?.social || {},
  training: row.details?.training || {},
  requirements: row.details?.requirements || {},
  videoUrl: row.details?.videoUrl || '',
  importantNotes: row.details?.importantNotes || ''
});

// Helper to map DB profile object to User or Shelter type
const mapProfileFromDB = (row: any): User | Shelter => {
  if (row.role === 'shelter') {
    return {
      id: row.id,
      role: 'shelter',
      name: row.name || 'Neznámy útulok',
      email: row.email || '',
      location: row.location || '',
      phone: row.phone || '',
      isVerified: row.shelter_data?.isVerified || false,
      isSuperAdmin: row.is_super_admin || false,
      description: row.shelter_data?.description || '',
      openingHours: row.shelter_data?.openingHours || '',
      bankAccount: row.shelter_data?.bankAccount || '',
      shippingAddress: row.shelter_data?.shippingAddress || '',
      logoUrl: row.shelter_data?.logoUrl || '',
      socials: row.shelter_data?.socials || {},
      stats: row.shelter_data?.stats || { adoptions: 0, currentAnimals: 0, views: 0 }
    } as Shelter;
  }
  return {
    id: row.id,
    role: 'user',
    name: row.name || 'Užívateľ',
    email: row.email || '',
    phone: row.phone || '',
    avatarUrl: row.user_data?.avatarUrl || '',
    bio: row.bio || '',
    location: row.location || '',
    birthYear: row.user_data?.birthYear,
    availability: row.user_data?.availability || '',
    maxTravelDistance: row.user_data?.maxTravelDistance,
    isFosterParent: row.user_data?.isFosterParent || false,
    verification: row.user_data?.verification || { email: false, phone: false, identity: false },
    household: row.user_data?.household,
    preferences: row.user_data?.preferences,
    badges: row.user_data?.badges || [],
    virtualAdoptions: row.user_data?.virtualAdoptions || [],
    favorites: row.user_data?.favorites || [],
    applications: [],
    isSuperAdmin: row.is_super_admin || false
  } as User;
};

export const api = {
  // File Upload Helper
  async uploadFile(file: File, bucket: string, path: string = ''): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Konštrukcia cesty: napr. "avatars/xyz.png" vnútri bucketu
    const fullPath = path ? `${path}/${fileName}` : fileName;

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file);

    if (uploadError) {
        console.error("Supabase Storage Error:", uploadError);
        // Ak bucket neexistuje, vrátime čitateľnú chybu
        if (uploadError.message.includes("Bucket not found")) {
            throw new Error(`Úložisko '${bucket}' nebolo v systéme nájdené. Kontaktujte administrátora.`);
        }
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return publicUrl;
  },

  // Auth Methods
  async getCurrentSession(): Promise<User | Shelter | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    return profile ? mapProfileFromDB(profile) : null;
  },

  async login(email: string, password?: string): Promise<User | Shelter | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
    if (error) throw error;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    return profile ? mapProfileFromDB(profile) : null;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async register(email: string, password?: string, metadata?: any): Promise<{ user: User | Shelter | null, verificationRequired: boolean }> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: { data: metadata }
    });
    if (error) throw error;
    
    if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        return { 
            user: profile ? mapProfileFromDB(profile) : null,
            verificationRequired: !data.session
        };
    }
    return { user: null, verificationRequired: true };
  },

  async updateProfile(id: string, updates: any, role: string) {
    if (role === 'shelter') {
        const { name, email, location, phone, ...rest } = updates;
        const profileUpdates: any = {};
        if (name) profileUpdates.name = name;
        if (email) profileUpdates.email = email;
        if (location) profileUpdates.location = location;
        if (phone) profileUpdates.phone = phone;

        const { data: current } = await supabase.from('profiles').select('shelter_data').eq('id', id).single();
        const existingData = current?.shelter_data || {};
        profileUpdates.shelter_data = { ...existingData, ...rest };
        await supabase.from('profiles').update(profileUpdates).eq('id', id);
    } else {
        const { name, email, bio, location, phone, ...rest } = updates;
        const profileUpdates: any = {};
        if (name) profileUpdates.name = name;
        if (email) profileUpdates.email = email;
        if (bio) profileUpdates.bio = bio;
        if (location) profileUpdates.location = location;
        if (phone) profileUpdates.phone = phone;

        const { data: current } = await supabase.from('profiles').select('user_data').eq('id', id).single();
        const existingData = current?.user_data || {};
        profileUpdates.user_data = { ...existingData, ...rest };
        await supabase.from('profiles').update(profileUpdates).eq('id', id);
    }
  },

  async resetPassword(email: string) {
    await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/auth?mode=update-password',
    });
  },

  async updatePassword(password: string) {
    await supabase.auth.updateUser({ password });
  },

  async toggleFavorite(userId: string, petId: string, isFav: boolean) {
    const { data: profile } = await supabase.from('profiles').select('user_data').eq('id', userId).single();
    const userData = profile?.user_data || {};
    let favorites = userData.favorites || [];

    if (isFav) {
        favorites = favorites.filter((id: string) => id !== petId);
    } else {
        if (!favorites.includes(petId)) {
            favorites = [...favorites, petId];
        }
    }

    const { error } = await supabase.from('profiles')
        .update({ user_data: { ...userData, favorites } })
        .eq('id', userId);
        
    if (error) throw error;
  },

  // Virtual Adoption Methods
  async adoptVirtually(userId: string, petId: string, amount: number) {
    await supabase.from('virtual_adoptions').insert({
        user_id: userId,
        pet_id: petId,
        amount: amount,
        start_date: new Date().toISOString()
    });

    const { data: current } = await supabase.from('profiles').select('user_data').eq('id', userId).single();
    const userData = current?.user_data || {};
    const virtualAdoptions = userData.virtualAdoptions || [];
    virtualAdoptions.push({ petId, amount, startDate: new Date().toISOString() });
    await supabase.from('profiles').update({ user_data: { ...userData, virtualAdoptions } }).eq('id', userId);
  },

  async updateVirtualAdoption(userId: string, petId: string, amount: number) {
      await supabase.from('virtual_adoptions').update({ amount }).eq('user_id', userId).eq('pet_id', petId);
      const { data: current } = await supabase.from('profiles').select('user_data').eq('id', userId).single();
      const userData = current?.user_data || {};
      const virtualAdoptions = (userData.virtualAdoptions || []).map((a: any) => a.petId === petId ? { ...a, amount } : a);
      await supabase.from('profiles').update({ user_data: { ...userData, virtualAdoptions } }).eq('id', userId);
  },

  async cancelVirtualAdoption(userId: string, petId: string) {
      await supabase.from('virtual_adoptions').delete().eq('user_id', userId).eq('pet_id', petId);
      const { data: current } = await supabase.from('profiles').select('user_data').eq('id', userId).single();
      const userData = current?.user_data || {};
      const virtualAdoptions = (userData.virtualAdoptions || []).filter((a: any) => a.petId !== petId);
      await supabase.from('profiles').update({ user_data: { ...userData, virtualAdoptions } }).eq('id', userId);
  },

  async getShelterVirtualAdoptionsCount(shelterId: string): Promise<number> {
      try {
          const { data: petIds } = await supabase
              .from('pets')
              .select('id')
              .eq('shelter_id', shelterId);
          
          if (!petIds || petIds.length === 0) return 0;
          const ids = petIds.map(p => p.id);
          const { count, error } = await supabase
              .from('virtual_adoptions')
              .select('*', { count: 'exact', head: true })
              .in('pet_id', ids);

          if (error) throw error;
          return count || 0;
      } catch (e) {
          console.error("Failed to fetch virtual adoptions count", e);
          return 0;
      }
  },

  // Payment Simulation
  async createPaymentSession(petId: string, amount: number): Promise<string> {
      return `#/payment-success?petId=${petId}&amount=${amount}&session_id=demo_${Date.now()}`;
  },

  // Pet Methods
  async getPets(): Promise<Pet[]> {
    try {
        const { data, error } = await supabase.from('pets').select('*').order('posted_date', { ascending: false });
        if (error) throw new Error(error.message);
        return data?.map(mapPetFromDB) || [];
    } catch (e) {
        console.error("Failed to fetch pets from DB", e);
        return [];
    }
  },

  async getPet(id: string): Promise<Pet | undefined> {
      try {
          const { data } = await supabase.from('pets').select('*').eq('id', id).single();
          if (data) return mapPetFromDB(data);
      } catch (e) {}
      return undefined;
  },

  async createPet(pet: Pet) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nie ste prihlásený.");

      const dbPet = {
          shelter_id: session.user.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: Number(pet.age),
          gender: pet.gender,
          size: pet.size,
          location: pet.location,
          image_url: pet.imageUrl,
          description: pet.description,
          adoption_fee: Number(pet.adoptionFee || 0),
          adoption_status: pet.adoptionStatus || 'Available',
          is_visible: pet.isVisible,
          needs_foster: pet.needsFoster,
          tags: pet.tags || [],
          posted_date: new Date().toISOString(),
          views: 0, 
          details: {
              gallery: pet.gallery || [],
              health: pet.health || {},
              social: pet.social || {},
              training: pet.training || {},
              requirements: pet.requirements || {},
              videoUrl: pet.videoUrl || '',
              importantNotes: pet.importantNotes || ''
          }
      };

      const { data, error } = await supabase.from('pets').insert(dbPet).select().single();
      if (error) throw new Error(`Nepodarilo sa uložiť zviera: ${error.message}`);
      return mapPetFromDB(data);
  },

  async updatePet(pet: Pet) {
      const dbPet = {
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: Number(pet.age),
          gender: pet.gender,
          size: pet.size,
          location: pet.location,
          image_url: pet.imageUrl,
          description: pet.description,
          adoption_fee: Number(pet.adoptionFee || 0),
          adoption_status: pet.adoptionStatus,
          is_visible: pet.isVisible,
          needs_foster: pet.needsFoster,
          tags: pet.tags || [],
          details: {
              gallery: pet.gallery || [],
              health: pet.health || {},
              social: pet.social || {},
              training: pet.training || {},
              requirements: pet.requirements || {},
              videoUrl: pet.videoUrl || '',
              importantNotes: pet.importantNotes || ''
          }
      };

      const { error } = await supabase.from('pets').update(dbPet).eq('id', pet.id);
      if (error) throw new Error(error.message);
  },

  async deletePet(petId: string) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Relácia vypršala. Prihláste sa znova.");
      const { data, error } = await supabase.from('pets').delete().eq('id', petId).select('id');
      if (error || !data || data.length === 0) throw new Error("Nepodarilo sa vymazať inzerát.");
  },

  async incrementPetViews(petId: string) {
      try {
          const { error } = await supabase.rpc('increment_pet_view', { row_id: petId });
          if (error) {
              const { data } = await supabase.from('pets').select('views').eq('id', petId).single();
              if (data) await supabase.from('pets').update({ views: (data.views || 0) + 1 }).eq('id', petId);
          }
      } catch (e) {}
  },

  // Shelter Public Methods
  async getPublicShelter(id: string): Promise<Shelter | null> {
      try {
          const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
          if (data) {
              const profile = mapProfileFromDB(data);
              if (profile.role === 'shelter') return profile as Shelter;
          }
      } catch (e) {}
      return null;
  },

  async getAllShelters(): Promise<Shelter[]> {
      try {
          const { data: profiles, error } = await supabase.from('profiles').select('*').eq('role', 'shelter');
          if (error) throw new Error(error.message);
          const { data: allPets } = await supabase.from('pets').select('shelter_id, adoption_status');
          return profiles.map(row => {
              const shelter = mapProfileFromDB(row) as Shelter;
              if (allPets) {
                  const shelterPets = allPets.filter((p: any) => p.shelter_id === shelter.id);
                  shelter.stats = {
                      ...shelter.stats,
                      currentAnimals: shelterPets.filter((p: any) => p.adoption_status === 'Available' || p.adoption_status === 'Reserved').length,
                      adoptions: shelterPets.filter((p: any) => p.adoption_status === 'Adopted').length
                  };
              }
              return shelter;
          });
      } catch (e) { return []; }
  },

  async incrementShelterViews(shelterId: string) {
     try {
         const { data } = await supabase.from('profiles').select('shelter_data').eq('id', shelterId).single();
         if (data && data.shelter_data) {
             const stats = data.shelter_data.stats || { adoptions: 0, currentAnimals: 0, views: 0 };
             const newStats = { ...stats, views: (stats.views || 0) + 1 };
             await supabase.from('profiles').update({ shelter_data: { ...data.shelter_data, stats: newStats } }).eq('id', shelterId);
         }
     } catch (e) {}
  },

  async getPetsByShelter(shelterId: string): Promise<Pet[]> {
      const { data } = await supabase.from('pets').select('*').eq('shelter_id', shelterId);
      return data?.map(mapPetFromDB) || [];
  },

  // Admin Methods
  async verifyShelter(shelterId: string, isVerified: boolean) {
      const { data: current } = await supabase.from('profiles').select('shelter_data').eq('id', shelterId).single();
      const shelterData = current?.shelter_data || {};
      await supabase.from('profiles').update({ shelter_data: { ...shelterData, isVerified } }).eq('id', shelterId);
  },

  async adminGetAllPets(): Promise<(Pet & { shelterName?: string })[]> {
      const { data, error } = await supabase.from('pets').select('*, profiles:shelter_id (name)').order('posted_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((row: any) => ({ ...mapPetFromDB(row), shelterName: row.profiles?.name || 'Neznámy útulok' }));
  },

  async getAllUsers(): Promise<(User | Shelter)[]> {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((row: any) => mapProfileFromDB(row));
  },

  // Volunteers & Supplies
  async getVolunteers(shelterId: string): Promise<Volunteer[]> {
      const { data } = await supabase.from('volunteers').select('*').eq('shelter_id', shelterId);
      return data || [];
  },

  async addVolunteer(shelterId: string, v: Partial<Volunteer>) {
      const { data, error } = await supabase.from('volunteers').insert({ ...v, shelter_id: shelterId }).select().single();
      if (error) throw new Error(error.message);
      return data;
  },

  async deleteVolunteer(id: string) {
      await supabase.from('volunteers').delete().eq('id', id);
  },

  async getSupplies(shelterId: string): Promise<ShelterSupply[]> {
      const { data } = await supabase.from('shelter_supplies').select('*').eq('shelter_id', shelterId);
      return data || [];
  },

  async addSupply(shelterId: string, s: Partial<ShelterSupply>) {
      const { data, error } = await supabase.from('shelter_supplies').insert({ ...s, shelter_id: shelterId }).select().single();
      if (error) throw new Error(error.message);
      return data;
  },

  async deleteSupply(id: string) {
      await supabase.from('shelter_supplies').delete().eq('id', id);
  },

  // Inquiries
  async getInquiries(): Promise<AdoptionInquiry[]> {
      const { data, error } = await supabase.from('inquiries').select('*, pets (name), profiles!applicant_id (user_data, location, bio)').order('created_at', { ascending: false });
      if (error) return [];
      return data.map((row: any) => ({
          id: row.id, shelterId: row.shelter_id, applicantId: row.applicant_id, petId: row.pet_id, petName: row.pets?.name || 'Neznáme',
          applicantName: row.applicant_name, email: row.email, phone: row.phone, date: row.created_at, status: row.status, message: row.message,
          applicantDetails: row.profiles ? { 
              location: row.profiles.location, 
              bio: row.profiles.bio, 
              avatarUrl: row.profiles.user_data?.avatarUrl,
              household: row.profiles.user_data?.household, 
              availability: row.profiles.user_data?.availability 
          } : undefined
      }));
  },

  async createInquiry(inq: AdoptionInquiry) {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('inquiries').insert({
          shelter_id: inq.shelterId, pet_id: inq.petId, applicant_id: session?.user?.id || null, applicant_name: inq.applicantName, email: inq.email, phone: inq.phone, message: inq.message, status: 'Nová', created_at: new Date().toISOString()
      });
      if (error) {
          if (error.code === '23505') throw new Error("Žiadosť pre toto zviera už bola odoslaná.");
          throw new Error(error.message);
      }
  },

  async updateInquiryStatus(id: string, status: string) {
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
      if (error) throw new Error(error.message);
      if (status === 'Schválená') {
          const { data: inquiry } = await supabase.from('inquiries').select('pet_id').eq('id', id).single();
          if (inquiry && inquiry.pet_id) await supabase.from('pets').update({ adoption_status: 'Reserved' }).eq('id', inquiry.pet_id);
      }
  },

  async getInquiryMessages(inquiryId: string): Promise<InquiryMessage[]> {
      const { data, error } = await supabase.from('inquiry_messages').select('*').eq('inquiry_id', inquiryId).order('created_at', { ascending: true });
      if (error) return [];
      return data.map((row: any) => ({ id: row.id, inquiryId: row.inquiry_id, senderId: row.sender_id, content: row.content, createdAt: row.created_at, isRead: row.is_read }));
  },

  async sendInquiryMessage(inquiryId: string, content: string) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nie ste prihlásený");
      const { data, error = null } = await supabase.from('inquiry_messages').insert({ inquiry_id: inquiryId, sender_id: session.user.id, content, created_at: new Date().toISOString() }).select().single();
      if (error) throw new Error(error.message);
      return { id: data.id, inquiryId: data.inquiry_id, senderId: data.sender_id, content: data.content, createdAt: data.created_at, isRead: data.is_read } as InquiryMessage;
  },

  // Blog
  async getBlogPosts(): Promise<BlogPost[]> {
      try {
          const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
          if (!data) return [];
          return data.map((row: any) => ({ id: row.id, title: row.title, summary: row.summary, content: row.content || [], imageUrl: row.image_url, date: row.created_at, author: row.author }));
      } catch (e) { return []; }
  },

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
      try {
          const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single();
          if (data) return { id: data.id, title: data.title, summary: data.summary, content: data.content || [], imageUrl: data.image_url, date: data.created_at, author: data.author };
      } catch (e) {}
      return undefined;
  },

  async deleteBlogPost(id: string) {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
  },

  async createBlogPost(post: Partial<BlogPost>) {
      const { data, error } = await supabase.from('blog_posts').insert({ title: post.title, summary: post.summary, content: post.content, image_url: post.imageUrl, author: post.author || 'Admin', created_at: new Date().toISOString() }).select().single();
      if (error) throw new Error(error.message);
      return { id: data.id, title: data.title, summary: data.summary, content: data.content || [], imageUrl: data.image_url, date: data.created_at, author: data.author } as BlogPost;
  },

  async updateBlogPost(post: Partial<BlogPost>) {
      if (!post.id) throw new Error("ID chýba");
      const { error } = await supabase.from('blog_posts').update({ title: post.title, summary: post.summary, content: post.content, image_url: post.imageUrl, author: post.author }).eq('id', post.id);
      if (error) throw new Error(error.message);
  },

  // Promo Slides
  async getPromoSlides(): Promise<PromoSlide[]> {
      try {
          const { data } = await supabase.from('promo_slides').select('*').order('created_at', { ascending: true });
          if (!data) return [];
          return data.map((row: any) => ({ id: row.id, title: row.title, description: row.description, link: row.link, imageUrl: row.image_url, badge: row.badge, cta: row.cta, iconType: row.icon_type }));
      } catch (e) { return []; }
  },

  async createPromoSlide(slide: Partial<PromoSlide>) {
      const { data, error } = await supabase.from('promo_slides').insert({ title: slide.title, description: slide.description, link: slide.link, image_url: slide.imageUrl, badge: slide.badge, cta: slide.cta, icon_type: slide.iconType || 'star' }).select().single();
      if (error) throw error;
      return data;
  },

  async deletePromoSlide(id: string) {
      const { error } = await supabase.from('promo_slides').delete().eq('id', id);
      if (error) throw error;
  }
};
