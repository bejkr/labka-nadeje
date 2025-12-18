
import { supabase } from './supabaseClient';
import { Pet, User, Shelter, AdoptionInquiry, VirtualAdoption, PetType, Gender, Size, Volunteer, ShelterSupply, BlogPost, InquiryMessage, PromoSlide } from '../types';
import { MOCK_PETS, MOCK_BLOG_POSTS } from '../constants';

// --- Mappers ---

const mapPetFromDB = (row: any): Pet => ({
  id: row.id,
  shelterId: row.shelter_id || '',
  name: row.name || 'Neznáme meno',
  type: (row.type as PetType) || PetType.OTHER,
  breed: row.breed || 'Kríženec',
  age: row.age ?? 0,
  gender: (row.gender as Gender) || Gender.MALE,
  size: (row.size as Size) || Size.MEDIUM,
  location: row.location || 'Neznáma lokalita',
  imageUrl: row.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
  description: row.description || '',
  adoptionFee: row.adoption_fee ?? 0,
  adoptionStatus: row.adoption_status || 'Available',
  isVisible: row.is_visible ?? true,
  needsFoster: row.needs_foster ?? false,
  tags: row.tags || [],
  postedDate: row.posted_date || new Date().toISOString(),
  views: row.views || 0,
  
  gallery: row.details?.gallery || [],
  health: row.details?.health || { isVaccinated: false, isDewormed: false, isCastrated: false, isChipped: false, hasAllergies: false },
  social: row.details?.social || { children: 'Neznáme', dogs: 'Neznáme', cats: 'Neznáme' },
  training: row.details?.training || { toiletTrained: false, leashTrained: false, carTravel: false, aloneTime: false },
  requirements: row.details?.requirements || { activityLevel: 'Stredná', suitableFor: [], unsuitableFor: [] },
  videoUrl: row.details?.videoUrl || '',
  importantNotes: row.details?.importantNotes || '',
});

const mapProfileFromDB = (row: any, sessionUser?: any): User | Shelter => {
  let role = row.role;
  
  if ((!role || role === 'user') && sessionUser?.user_metadata?.role === 'shelter') {
      role = 'shelter';
  }

  if (role !== 'shelter' && row.shelter_data && Object.keys(row.shelter_data).length > 0) {
      const sData = row.shelter_data;
      if (sData.bankAccount || sData.description || sData.isVerified !== undefined) {
          role = 'shelter';
      }
  }

  if (!role) role = 'user';

  const common = {
      id: row.id,
      email: row.email || '',
      name: row.name || 'Užívateľ',
      phone: row.phone || '',
      location: row.location || '',
      isSuperAdmin: row.is_super_admin || false,
  };

  if (role === 'shelter') {
    return {
      ...common,
      role: 'shelter',
      isVerified: row.shelter_data?.isVerified || false,
      logoUrl: row.avatar_url || '',
      description: row.shelter_data?.description || '',
      openingHours: row.shelter_data?.openingHours || '',
      bankAccount: row.shelter_data?.bankAccount || '',
      shippingAddress: row.shelter_data?.shippingAddress || '',
      socials: row.shelter_data?.socials || {},
      stats: row.shelter_data?.stats || { adoptions: 0, currentAnimals: 0, views: 0 }
    } as Shelter;
  } else {
    return {
      ...common,
      role: 'user',
      avatarUrl: row.avatar_url || '',
      bio: row.bio || '',
      birthYear: row.user_data?.birthYear,
      preferredContact: row.user_data?.preferredContact,
      availability: row.user_data?.availability,
      maxTravelDistance: row.user_data?.maxTravelDistance,
      isFosterParent: row.user_data?.isFosterParent,
      verification: row.user_data?.verification || { email: true, phone: false, identity: false },
      household: row.user_data?.household,
      preferences: row.user_data?.preferences,
      badges: row.user_data?.badges || [],
      virtualAdoptions: [], 
      favorites: [], 
      applications: []
    } as User;
  }
};

export const api = {
  // --- STORAGE ---
  async uploadFile(file: File, folder: string = 'pets'): Promise<string> {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

      if (error) {
          console.error("Upload error:", error);
          throw new Error("Nepodarilo sa nahrať obrázok. " + error.message);
      }

      const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

      return publicUrl;
  },

  // --- AUTH ---
  async getCurrentSession() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        console.error("Auth Session Error:", sessionError);
        return null;
    }
    
    if (!session) return null;
    
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
        console.warn("Profile not found in DB. Attempting auto-creation or fallback...");
        
        const metadata = session.user.user_metadata || {};
        const fallbackProfile = {
            id: session.user.id,
            email: session.user.email,
            role: metadata.role || 'user',
            name: metadata.name || session.user.email?.split('@')[0] || 'User',
            user_data: {},
            shelter_data: {},
            is_super_admin: false
        };

        const { error: insertError } = await supabase.from('profiles').insert(fallbackProfile);
        
        if (insertError) {
            console.error("Auto-creation failed.", insertError);
            return mapProfileFromDB(fallbackProfile, session.user); 
        } else {
            const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (newProfile) profile = newProfile;
            else return mapProfileFromDB(fallbackProfile, session.user);
        }
    }

    const userObj = mapProfileFromDB(profile, session.user);
    
    if (userObj.role === 'user') {
       const user = userObj as User;
       
       try {
           const { data: favs } = await supabase.from('favorites').select('pet_id').eq('user_id', user.id);
           user.favorites = favs?.map((f: any) => f.pet_id) || [];
       } catch (e) { console.warn("Failed fetching favorites", e); }

       try {
           const { data: va } = await supabase.from('virtual_adoptions').select('*').eq('user_id', user.id);
           user.virtualAdoptions = va?.map((v: any) => ({ petId: v.pet_id, amount: v.amount, startDate: v.start_date })) || [];
       } catch (e) { console.warn("Failed fetching adoptions", e); }

       try {
           const { data: apps } = await supabase
               .from('inquiries')
               .select('*, pets (name)')
               .or(`applicant_id.eq.${user.id},email.eq.${user.email}`)
               .order('created_at', { ascending: false });

           user.applications = apps?.map((row: any) => ({
               id: row.id,
               shelterId: row.shelter_id,
               petId: row.pet_id,
               petName: row.pets?.name || 'Neznáme',
               applicantName: row.applicant_name,
               email: row.email,
               phone: row.phone,
               date: row.created_at,
               status: row.status,
               message: row.message
           })) || [];
       } catch (e) { console.warn("Failed fetching applications", e); }
    }

    return userObj;
  },

  async login(email: string, password?: string) {
    if (!password) throw new Error("Heslo je povinné");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error("Login Error:", error);
        throw new Error(error.message);
    }
    return this.getCurrentSession();
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async register(email: string, password: string, metaData: { role: 'user' | 'shelter', name: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metaData }
    });

    if (error) throw new Error(error.message);
    
    // Ak sa po registrácii nevytvorila session, znamená to, že sa čaká na overenie e-mailu
    if (!data.session) {
        return { verificationRequired: true };
    }

    const sessionUser = await this.getCurrentSession();
    return { verificationRequired: false, user: sessionUser };
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/auth?mode=update-password`,
    });
    if (error) throw new Error(error.message);
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  },

  async updateProfile(id: string, updates: any, role: 'user' | 'shelter') {
      const dbUpdates: any = {};
      
      // Top level fields - only update if present
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      
      // Handle avatar URL from either property name
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.logoUrl !== undefined) dbUpdates.avatar_url = updates.logoUrl;

      if (role === 'user') {
          if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
          
          const { data: current } = await supabase.from('profiles').select('user_data').eq('id', id).single();
          const currentData = current?.user_data || {};
          
          // Merge partial updates with existing JSON data to avoid overwriting with undefined
          dbUpdates.user_data = {
              ...currentData,
              ...(updates.birthYear !== undefined && { birthYear: updates.birthYear }),
              ...(updates.household !== undefined && { household: updates.household }),
              ...(updates.preferences !== undefined && { preferences: updates.preferences }),
              ...(updates.availability !== undefined && { availability: updates.availability }),
              ...(updates.maxTravelDistance !== undefined && { maxTravelDistance: updates.maxTravelDistance }),
              ...(updates.isFosterParent !== undefined && { isFosterParent: updates.isFosterParent }),
              ...(updates.preferredContact !== undefined && { preferredContact: updates.preferredContact })
          };
      } else {
          const { data: current } = await supabase.from('profiles').select('shelter_data').eq('id', id).single();
          const currentData = current?.shelter_data || {};
          
          dbUpdates.shelter_data = {
              ...currentData,
              ...(updates.description !== undefined && { description: updates.description }),
              ...(updates.openingHours !== undefined && { openingHours: updates.openingHours }),
              ...(updates.bankAccount !== undefined && { bankAccount: updates.bankAccount }),
              ...(updates.shippingAddress !== undefined && { shippingAddress: updates.shippingAddress }),
              ...(updates.socials !== undefined && { socials: updates.socials }),
              ...(updates.isVerified !== undefined && { isVerified: updates.isVerified })
          };
      }

      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', id);
      if (error) throw new Error(error.message);
  },

  async toggleFavorite(userId: string, petId: string, isFav: boolean) {
      if (isFav) {
          await supabase.from('favorites').delete().eq('user_id', userId).eq('pet_id', petId);
      } else {
          await supabase.from('favorites').insert({ user_id: userId, pet_id: petId });
      }
  },

  async createPaymentSession(petId: string, amount: number) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `/#/payment-success?petId=${petId}&amount=${amount}&session_id=simulated_session_123`;
  },

  async adoptVirtually(userId: string, petId: string, amount: number) {
      await supabase.from('virtual_adoptions').insert({
          user_id: userId,
          pet_id: petId,
          amount,
          start_date: new Date().toISOString()
      });
  },

  async updateVirtualAdoption(userId: string, petId: string, amount: number) {
      await supabase.from('virtual_adoptions').update({ amount }).eq('user_id', userId).eq('pet_id', petId);
  },

  async cancelVirtualAdoption(userId: string, petId: string) {
      await supabase.from('virtual_adoptions').delete().eq('user_id', userId).eq('pet_id', petId);
  },

  // --- PETS ---
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
          adoption_status: pet.adoptionStatus,
          is_visible: pet.isVisible,
          // FIX: Changed pet.needs_foster to pet.needsFoster
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
      
      if (error) {
          console.error("Supabase Create Error:", error);
          throw new Error(`Nepodarilo sa uložiť zviera: ${error.message}`);
      }
      
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
      if (error) {
          throw new Error(error.message);
      }
  },

  async deletePet(petId: string) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nie ste prihlásený");

      const { error, count } = await supabase.from('pets').delete().eq('id', petId).select('id', { count: 'exact' });
      
      if (error) {
          throw new Error(`Chyba databázy: ${error.message}`);
      }

      if (count === 0) {
          throw new Error("Nepodarilo sa vymazať zviera. Možno už neexistuje alebo nemáte oprávnenie.");
      }
  },

  async incrementPetViews(petId: string) {
      try {
          const { error } = await supabase.rpc('increment_pet_view', { row_id: petId });
          if (error) {
              const { data } = await supabase.from('pets').select('views').eq('id', petId).single();
              if (data) {
                  await supabase.from('pets').update({ views: (data.views || 0) + 1 }).eq('id', petId);
              }
          }
      } catch (e) { console.error("Failed to increment pet views", e); }
  },

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
                  const activeCount = shelterPets.filter((p: any) => p.adoption_status === 'Available' || p.adoption_status === 'Reserved').length;
                  const adoptedCount = shelterPets.filter((p: any) => p.adoption_status === 'Adopted').length;

                  shelter.stats = {
                      ...shelter.stats,
                      currentAnimals: activeCount,
                      adoptions: adoptedCount
                  };
              }
              return shelter;
          });
      } catch (e) {
          console.error("Failed to fetch shelters", e);
          return [];
      }
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

  async verifyShelter(shelterId: string, isVerified: boolean) {
      const { data: current } = await supabase.from('profiles').select('shelter_data').eq('id', shelterId).single();
      const shelterData = current?.shelter_data || {};
      
      await supabase.from('profiles').update({ shelter_data: { ...shelterData, isVerified } }).eq('id', shelterId);
  },

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

  async getInquiries(): Promise<AdoptionInquiry[]> {
      // JOIN with profiles to get applicant details
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, pets (name), profiles!applicant_id (user_data, location, bio)')
        .order('created_at', { ascending: false });
      
      if (error) {
          console.error("Get Inquiries Error:", error);
          return [];
      }

      return data.map((row: any) => ({
          id: row.id,
          shelterId: row.shelter_id,
          petId: row.pet_id,
          petName: row.pets?.name || 'Neznáme',
          applicantName: row.applicant_name,
          email: row.email,
          phone: row.phone,
          date: row.created_at,
          status: row.status,
          message: row.message,
          applicantDetails: row.profiles ? {
              location: row.profiles.location,
              bio: row.profiles.bio,
              household: row.profiles.user_data?.household,
              availability: row.profiles.user_data?.availability
          } : undefined
      }));
  },

  async createInquiry(inq: AdoptionInquiry) {
      const { data: { session } } = await supabase.auth.getSession();
      const applicantId = session?.user?.id || null;

      const { error } = await supabase.from('inquiries').insert({
          shelter_id: inq.shelterId,
          pet_id: inq.petId,
          applicant_id: applicantId,
          applicant_name: inq.applicantName,
          email: inq.email,
          phone: inq.phone,
          message: inq.message,
          status: 'Nová',
          created_at: new Date().toISOString()
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
          if (inquiry && inquiry.pet_id) {
              await supabase.from('pets').update({ adoption_status: 'Reserved' }).eq('id', inquiry.pet_id);
          }
      }
  },

  async getInquiryMessages(inquiryId: string): Promise<InquiryMessage[]> {
      const { data, error } = await supabase
          .from('inquiry_messages')
          .select('*')
          .eq('inquiry_id', inquiryId)
          .order('created_at', { ascending: true });
      
      if (error) return [];

      return data.map((row: any) => ({
          id: row.id,
          inquiryId: row.inquiry_id,
          senderId: row.sender_id,
          content: row.content,
          createdAt: row.created_at,
          isRead: row.is_read
      }));
  },

  async sendInquiryMessage(inquiryId: string, content: string) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nie ste prihlásený");

      const { data, error } = await supabase.from('inquiry_messages').insert({
          inquiry_id: inquiryId,
          sender_id: session.user.id,
          content,
          created_at: new Date().toISOString()
      }).select().single();

      if (error) throw new Error(error.message);
      
      return {
          id: data.id,
          inquiryId: data.inquiry_id,
          senderId: data.sender_id,
          content: data.content,
          createdAt: data.created_at,
          isRead: data.is_read
      } as InquiryMessage;
  },

  // --- BLOG ---
  async getBlogPosts(): Promise<BlogPost[]> {
      try {
          const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
          if (!data) return [];
          return data.map((row: any) => ({
              id: row.id,
              title: row.title,
              summary: row.summary,
              content: row.content || [],
              imageUrl: row.image_url,
              date: row.created_at,
              author: row.author
          }));
      } catch (e) { return []; }
  },

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
      try {
          const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single();
          if (data) {
              return {
                  id: data.id,
                  title: data.title,
                  summary: data.summary,
                  content: data.content || [],
                  imageUrl: data.image_url,
                  date: data.created_at,
                  author: data.author
              };
          }
      } catch (e) {}
      return undefined;
  },

  async deleteBlogPost(id: string) {
      await supabase.from('blog_posts').delete().eq('id', id);
  },

  async createBlogPost(post: Partial<BlogPost>) {
      const dbPost = {
          title: post.title,
          summary: post.summary,
          content: post.content,
          image_url: post.imageUrl,
          author: post.author || 'Admin',
          created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('blog_posts').insert(dbPost).select().single();
      if (error) throw new Error(error.message);
      return {
          id: data.id,
          title: data.title,
          summary: data.summary,
          content: data.content || [],
          imageUrl: data.image_url,
          date: data.created_at,
          author: data.author
      } as BlogPost;
  },

  async updateBlogPost(post: Partial<BlogPost>) {
      if (!post.id) throw new Error("ID chýba");
      const dbPost = {
          title: post.title,
          summary: post.summary,
          content: post.content,
          image_url: post.imageUrl,
          author: post.author
      };
      
      const { error } = await supabase.from('blog_posts').update(dbPost).eq('id', post.id);
      if (error) throw new Error(error.message);
  },

  // --- PROMO SLIDES ---
  async getPromoSlides(): Promise<PromoSlide[]> {
      try {
          const { data } = await supabase.from('promo_slides').select('*').order('created_at', { ascending: true });
          if (!data) return [];
          return data.map((row: any) => ({
              id: row.id,
              title: row.title,
              description: row.description,
              link: row.link,
              imageUrl: row.image_url,
              badge: row.badge,
              cta: row.cta,
              iconType: row.icon_type
          }));
      } catch (e) {
          console.warn("Could not fetch promo slides", e);
          return []; 
      }
  },

  async createPromoSlide(slide: Partial<PromoSlide>) {
      const dbSlide = {
          title: slide.title,
          description: slide.description,
          link: slide.link,
          image_url: slide.imageUrl,
          badge: slide.badge,
          cta: slide.cta,
          icon_type: slide.iconType || 'star'
      };
      const { data, error } = await supabase.from('promo_slides').insert(dbSlide).select().single();
      if (error) throw new Error(error.message);
      return data;
  },

  async deletePromoSlide(id: string) {
      const { error } = await supabase.from('promo_slides').delete().eq('id', id);
      if (error) throw error;
  },

  // --- ADMIN & SEEDING ---
  async adminGetAllPets(): Promise<(Pet & { shelterName?: string })[]> {
      const { data, error } = await supabase
          .from('pets')
          .select('*, profiles:shelter_id (name)')
          .order('posted_date', { ascending: false });
      
      if (error) throw new Error(error.message);

      return data.map((row: any) => ({
          ...mapPetFromDB(row),
          shelterName: row.profiles?.name || 'Neznámy útulok'
      }));
  },

  async getAllUsers(): Promise<(User | Shelter)[]> {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((row: any) => mapProfileFromDB(row));
  },

  async makeMeAdmin(userId: string) {
      const { error } = await supabase.rpc('enable_super_admin');
      if (error) {
          await supabase.from('profiles').update({ is_super_admin: true }).eq('id', userId);
      }
  },

  async seedPets(shelterId: string) {
      const promises = MOCK_PETS.slice(0, 5).map(mock => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, shelterId: oldSid, ...rest } = mock;
          return this.createPet({ ...rest, shelterId } as Pet);
      });
      await Promise.all(promises);
  },

  async seedBlog(userId: string) {
      const promises = MOCK_BLOG_POSTS.map(post => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = post;
          return supabase.from('blog_posts').insert({
              ...rest,
              created_at: new Date(post.date).toISOString()
          });
      });
      await Promise.all(promises);
  }
};
