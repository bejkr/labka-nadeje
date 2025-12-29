
import { supabase } from './supabaseClient';
import { Pet, User, Shelter, AdoptionInquiry, VirtualAdoption, PetType, Gender, Size, Volunteer, ShelterSupply, BlogPost, InquiryMessage, PromoSlide } from '../types';

// Cache for the current user profile to avoid redundant fetches
let cachedProfile: User | Shelter | null = null;

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
    importantNotes: row.details?.importantNotes || '',
    // Prefer the new SQL table 'pet_updates', fall back to JSONB for legacy data if needed, or merge them?
    // For now, let's assume valid data will come from the new table for new updates. 
    // We can map the SQL rows to our PetUpdate interface.
    updates: (row.pet_updates || []).map((u: any) => ({
        id: u.id,
        petId: u.pet_id,
        date: u.created_at,
        title: u.title,
        content: u.content,
        imageUrl: u.image_url,
        type: u.type
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    // Fallback to old updates if new table is empty? 
    // If we want to keep old data visible without migration, we could concat:
    // .concat(row.details?.updates || [])
    // But let's start clean or assume user wants the new system. Let's just use the table.
});

// Helper to map DB profile object to User or Shelter type
const mapProfileFromDB = (row: any): User | Shelter => {
    const notificationsEnabled = row.email_notifications_enabled !== false;

    if (row.role === 'shelter') {
        return {
            id: row.id,
            role: 'shelter',
            name: row.name || 'Neznámy útulok',
            email: row.email || '',
            location: row.location || '',
            phone: row.phone || '',
            emailNotificationsEnabled: notificationsEnabled,
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
        emailNotificationsEnabled: notificationsEnabled,
        avatarUrl: row.user_data?.avatarUrl || '',
        bio: row.bio || '',
        location: row.location || '',
        birthYear: row.user_data?.birthYear,
        availability: row.user_data?.availability || '',
        maxTravelDistance: row.user_data?.birthYear,
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
    async uploadFile(file: File, bucket: string, path: string = ''): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const fullPath = path ? `${path}/${fileName}` : fileName;
        const { data, error: uploadError } = await supabase.storage.from(bucket).upload(fullPath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fullPath);
        return publicUrl;
    },

    async getCurrentSession(providedSession?: any): Promise<User | Shelter | null> {
        const session = providedSession || (await supabase.auth.getSession()).data.session;
        if (!session) { cachedProfile = null; return null; }
        if (cachedProfile && cachedProfile.id === session.user.id) return cachedProfile;

        try {
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (error) return null;
            if (profile) {
                cachedProfile = mapProfileFromDB(profile);
                return cachedProfile;
            }
        } catch (e) { console.error(e); }
        return null;
    },

    async login(email: string, password?: string): Promise<User | Shelter | null> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
        if (error) throw error;
        return this.getCurrentSession(data.session);
    },

    async logout() {
        cachedProfile = null;
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
            const profile = await this.getCurrentSession(data.session);
            return { user: profile, verificationRequired: !data.session };
        }
        return { user: null, verificationRequired: true };
    },

    async updateProfile(id: string, updates: any, role: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Neprihlásený");

        const { name, email, location, phone, emailNotificationsEnabled, ...rest } = updates;
        const profileUpdates: any = {};

        if (name !== undefined) profileUpdates.name = name;
        if (email !== undefined) profileUpdates.email = email;
        if (location !== undefined) profileUpdates.location = location;
        if (phone !== undefined) profileUpdates.phone = phone;
        if (emailNotificationsEnabled !== undefined) profileUpdates.email_notifications_enabled = !!emailNotificationsEnabled;

        if (role === 'shelter') {
            const { data: current } = await supabase.from('profiles').select('shelter_data').eq('id', id).single();
            const existingData = current?.shelter_data || {};
            profileUpdates.shelter_data = { ...existingData, ...rest };
        } else {
            const { bio, ...userRest } = rest;
            if (bio !== undefined) profileUpdates.bio = bio;
            const { data: current } = await supabase.from('profiles').select('user_data').eq('id', id).single();
            const existingData = current?.user_data || {};
            profileUpdates.user_data = { ...existingData, ...userRest };
        }

        const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', id);
        if (error) throw error;
        cachedProfile = null;
        return this.getCurrentSession();
    },

    async toggleFavorite(userId: string, petId: string, isFav: boolean) {
        const { data: profile } = await supabase.from('profiles').select('user_data').eq('id', userId).single();
        const userData = profile?.user_data || {};
        let favorites = userData.favorites || [];
        if (isFav) { favorites = favorites.filter((id: string) => id !== petId); }
        else { if (!favorites.includes(petId)) { favorites = [...favorites, petId]; } }
        await supabase.from('profiles').update({ user_data: { ...userData, favorites } }).eq('id', userId);
        if (cachedProfile && cachedProfile.role === 'user') { (cachedProfile as User).favorites = favorites; }
    },

    async adoptVirtually(userId: string, petId: string, amount: number) {
        await supabase.from('virtual_adoptions').insert({ user_id: userId, pet_id: petId, amount: amount, start_date: new Date().toISOString() });
        const { data: current } = await supabase.from('profiles').select('user_data').eq('id', userId).single();
        const userData = current?.user_data || {};
        const virtualAdoptions = userData.virtualAdoptions || [];
        virtualAdoptions.push({ petId, amount, startDate: new Date().toISOString() });
        await supabase.from('profiles').update({ user_data: { ...userData, virtualAdoptions } }).eq('id', userId);
        if (cachedProfile && cachedProfile.role === 'user') { (cachedProfile as User).virtualAdoptions = virtualAdoptions; }
    },

    async updateVirtualAdoption(userId: string, petId: string, amount: number) {
        await supabase.from('virtual_adoptions').update({ amount }).eq('user_id', userId).eq('pet_id', petId);
        const { data: current } = await supabase.from('profiles').select('user_data').eq('id', userId).single();
        const userData = current?.user_data || {};
        const virtualAdoptions = (userData.virtualAdoptions || []).map((a: any) => a.petId === petId ? { ...a, amount } : a);
        await supabase.from('profiles').update({ user_data: { ...userData, virtualAdoptions } }).eq('id', userId);
        if (cachedProfile && cachedProfile.role === 'user') { (cachedProfile as User).virtualAdoptions = virtualAdoptions; }
    },

    async cancelVirtualAdoption(id: string) {
        // Mock implementation
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: current } = await supabase.from('profiles').select('user_data').eq('id', session.user.id).single();
        const userData = current?.user_data || {};
        const virtualAdoptions = (userData.virtualAdoptions || []).map((va: VirtualAdoption) =>
            va.id === id ? { ...va, status: 'cancelled' } : va
        );

        await supabase.from('profiles').update({ user_data: { ...userData, virtualAdoptions } }).eq('id', session.user.id);
        if (cachedProfile && cachedProfile.role === 'user') { (cachedProfile as User).virtualAdoptions = virtualAdoptions; }
    },

    async createVirtualAdoption(pet: Pet, amount: number) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Musíte byť prihlásený");

        const newAdoption: VirtualAdoption = {
            id: Math.random().toString(36).substr(2, 9),
            userId: session.user.id,
            petId: pet.id,
            petName: pet.name,
            petImage: pet.imageUrl,
            amount: amount,
            currency: 'eur',
            status: 'active',
            startDate: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: current } = await supabase.from('profiles').select('user_data').eq('id', session.user.id).single();
        const userData = current?.user_data || {};
        const virtualAdoptions = [...(userData.virtualAdoptions || []), newAdoption];

        await supabase.from('profiles').update({ user_data: { ...userData, virtualAdoptions } }).eq('id', session.user.id);
        if (cachedProfile && cachedProfile.role === 'user') { (cachedProfile as User).virtualAdoptions = virtualAdoptions; }

        return newAdoption;
    },

    async getShelterVirtualAdoptionsCount(shelterId: string): Promise<number> {
        try {
            const { data: petIds } = await supabase.from('pets').select('id').eq('shelter_id', shelterId);
            if (!petIds || petIds.length === 0) return 0;
            const ids = petIds.map(p => p.id);
            const { count } = await supabase.from('virtual_adoptions').select('*', { count: 'exact', head: true }).in('pet_id', ids);
            return count || 0;
        } catch (e) { return 0; }
    },

    async createPaymentSession(petId: string, amount: number): Promise<string> {
        return `#/payment-success?petId=${petId}&amount=${amount}&session_id=demo_${Date.now()}`;
    },

    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) throw error;
    },

    async updatePassword(password: string) {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        return data;
    },

    async getPets(): Promise<Pet[]> {
        try {
            const { data, error } = await supabase.from('pets')
                .select('id, shelter_id, name, type, breed, age, gender, size, location, image_url, description, adoption_fee, adoption_status, is_visible, needs_foster, tags, posted_date, views, details, pet_updates(*)')
                .order('posted_date', { ascending: false });
            if (error) throw error;
            return data?.map(mapPetFromDB) || [];
        } catch (e) { return []; }
    },

    async createPet(pet: Pet) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Nie ste prihlásený.");
        const details: any = {
            health: pet.health || {},
            social: pet.social || {},
            training: pet.training || {},
            requirements: pet.requirements || {},
            gallery: pet.gallery || [],
            videoUrl: pet.videoUrl || '',
            importantNotes: pet.importantNotes || '',
            updates: pet.updates || []
        };
        const dbPet = {
            shelter_id: user.id,
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
            details: details
        };
        const { data, error } = await supabase.from('pets').insert(dbPet).select().single();
        if (error) throw error;
        return mapPetFromDB(data);
    },

    async updatePet(pet: Pet) {
        const dbPet = {
            name: pet.name, type: pet.type, breed: pet.breed, age: Number(pet.age), gender: pet.gender, size: pet.size, location: pet.location, image_url: pet.imageUrl, description: pet.description, adoption_fee: Number(pet.adoptionFee || 0), adoption_status: pet.adoptionStatus, is_visible: pet.isVisible, needs_foster: pet.needsFoster, tags: pet.tags || [],
            details: { gallery: pet.gallery || [], health: pet.health || {}, social: pet.social || {}, training: pet.training || {}, requirements: pet.requirements || {}, videoUrl: pet.videoUrl || '', importantNotes: pet.importantNotes || '', updates: pet.updates || [] }
        };
        const { error } = await supabase.from('pets').update(dbPet).eq('id', pet.id);
        if (error) throw error;
    },

    async updatePetStatus(petId: string, status: string) {
        const { error } = await supabase.from('pets').update({ adoption_status: status }).eq('id', petId);
        if (error) throw error;
    },

    async addPetUpdate(petId: string, update: any) {
        // Insert into the new dedicated SQL table
        const { error } = await supabase.from('pet_updates').insert({
            pet_id: petId,
            title: update.title,
            content: update.content,
            image_url: update.imageUrl,
            type: update.type || 'status',
            created_at: new Date().toISOString()
        });

        if (error) throw error;
    },

    async deletePet(petId: string) {
        const { error } = await supabase.from('pets').delete().eq('id', petId);
        if (error) throw error;
    },

    async incrementPetViews(petId: string) {
        try {
            const { data } = await supabase.from('pets').select('views').eq('id', petId).single();
            if (data) await supabase.from('pets').update({ views: (data.views || 0) + 1 }).eq('id', petId);
        } catch (e) { }
    },

    async getPublicShelter(id: string): Promise<Shelter | null> {
        try {
            const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (data) {
                const profile = mapProfileFromDB(data);
                if (profile.role === 'shelter') return profile as Shelter;
            }
        } catch (e) { }
        return null;
    },

    async getAllShelters(): Promise<Shelter[]> {
        try {
            const { data: profiles, error } = await supabase.from('profiles').select('*').eq('role', 'shelter');
            if (error) throw error;

            // Fetch all pets to calculate stats dynamically
            const { data: allPets } = await supabase.from('pets').select('shelter_id, adoption_status');

            const statsMap = new Map<string, { currentAnimals: number, adoptions: number }>();

            if (allPets) {
                allPets.forEach((pet: any) => {
                    const sid = pet.shelter_id;
                    if (!sid) return;

                    if (!statsMap.has(sid)) {
                        statsMap.set(sid, { currentAnimals: 0, adoptions: 0 });
                    }
                    const stats = statsMap.get(sid)!;

                    if (pet.adoption_status === 'Adopted') {
                        stats.adoptions++;
                    } else {
                        stats.currentAnimals++;
                    }
                });
            }

            return profiles.map(row => {
                const shelter = mapProfileFromDB(row) as Shelter;
                const stats = statsMap.get(shelter.id);
                if (stats) {
                    shelter.stats = {
                        views: shelter.stats.views, // Keep views primarily from profile stats (or could calculate too if tracked elsewhere)
                        currentAnimals: stats.currentAnimals,
                        adoptions: stats.adoptions
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
        } catch (e) { }
    },

    async getPetsByShelter(shelterId: string): Promise<Pet[]> {
        const { data } = await supabase.from('pets').select('*, pet_updates(*)').eq('shelter_id', shelterId);
        return data?.map(mapPetFromDB) || [];
    },

    async verifyShelter(shelterId: string, isVerified: boolean) {
        const { data: current } = await supabase.from('profiles').select('shelter_data').eq('id', shelterId).single();
        const shelterData = current?.shelter_data || {};
        await supabase.from('profiles').update({ shelter_data: { ...shelterData, isVerified } }).eq('id', shelterId);
    },

    async adminGetAllPets(): Promise<(Pet & { shelterName?: string })[]> {
        const { data, error } = await supabase.from('pets').select('*, profiles:shelter_id (name), pet_updates(*)').order('posted_date', { ascending: false });
        if (error) throw error;
        return data.map((row: any) => ({ ...mapPetFromDB(row), shelterName: row.profiles?.name || 'Neznámy útulok' }));
    },

    async getAllUsers(): Promise<(User | Shelter)[]> {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map((row: any) => mapProfileFromDB(row));
    },

    async getVolunteers(shelterId: string): Promise<Volunteer[]> {
        const { data } = await supabase.from('volunteers').select('*').eq('shelter_id', shelterId);
        return data || [];
    },

    async addVolunteer(shelterId: string, v: Partial<Volunteer>) {
        const { data, error = null } = await supabase.from('volunteers').insert({ ...v, shelter_id: shelterId }).select().single();
        if (error) throw error;
        return data;
    },

    async deleteVolunteer(id: string) { await supabase.from('volunteers').delete().eq('id', id); },

    async getSupplies(shelterId: string): Promise<ShelterSupply[]> {
        const { data } = await supabase.from('shelter_supplies').select('*').eq('shelter_id', shelterId);
        return data || [];
    },

    async addSupply(shelterId: string, s: Partial<ShelterSupply>) {
        const { data, error = null } = await supabase.from('shelter_supplies').insert({ ...s, shelter_id: shelterId }).select().single();
        if (error) throw error;
        return data;
    },

    async deleteSupply(id: string) { await supabase.from('shelter_supplies').delete().eq('id', id); },

    async getInquiries(): Promise<AdoptionInquiry[]> {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        if (!currentUserId) return [];

        const { data, error } = await supabase.from('inquiries')
            .select(`
          id, shelter_id, applicant_id, pet_id, applicant_name, email, phone, status, message, created_at,
          pets (name),
          profiles!applicant_id (user_data, location, bio)
        `)
            .order('created_at', { ascending: false });

        if (error) return [];

        const { data: unreadMsgData } = await supabase.from('inquiry_messages')
            .select('inquiry_id')
            .eq('is_read', false)
            .neq('sender_id', currentUserId);

        const unreadIds = unreadMsgData?.map(m => m.inquiry_id) || [];

        return data.map((row: any) => ({
            id: row.id, shelterId: row.shelter_id, applicantId: row.applicant_id, petId: row.pet_id, petName: row.pets?.name || 'Neznáme',
            applicantName: row.applicant_name, email: row.email, phone: row.phone, date: row.created_at, status: row.status, message: row.message,
            applicantDetails: row.profiles ? { location: row.profiles.location, bio: row.profiles.bio, avatarUrl: row.profiles.user_data?.avatarUrl, household: row.profiles.user_data?.household, availability: row.profiles.user_data?.availability } : undefined,
            hasUnreadMessages: unreadIds.includes(row.id)
        })) as (AdoptionInquiry & { hasUnreadMessages?: boolean })[];
    },

    async createInquiry(inq: AdoptionInquiry) {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.from('inquiries').insert({ shelter_id: inq.shelterId, pet_id: inq.petId, applicant_id: session?.user?.id || null, applicant_name: inq.applicantName, email: inq.email, phone: inq.phone, message: inq.message, status: 'Nová', created_at: new Date().toISOString() });
        if (error) { if (error.code === '23505') throw new Error("Žiadosť pre toto zviera už bola odoslaná."); throw error; }
    },

    async updateInquiryStatus(id: string, status: string) {
        const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
        if (error) throw error;
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
        if (error) throw error;

        // Trigger notification function (fire and forget)
        supabase.functions.invoke('notify-message', {
            body: { message_id: data.id }
        }).catch(err => console.warn("Notification trigger failed:", err));

        return { id: data.id, inquiryId: data.inquiry_id, senderId: data.sender_id, content: data.content, createdAt: data.created_at, isRead: data.is_read } as InquiryMessage;
    },

    async markMessagesAsRead(inquiryId: string, currentUserId: string) {
        await supabase.from('inquiry_messages')
            .update({ is_read: true })
            .eq('inquiry_id', inquiryId)
            .neq('sender_id', currentUserId);
    },

    async getBlogPosts(): Promise<BlogPost[]> {
        try {
            const { data } = await supabase.from('blog_posts').select('id, title, summary, image_url, created_at, author').order('created_at', { ascending: false });
            if (!data) return [];
            return data.map((row: any) => ({ id: row.id, title: row.title, summary: row.summary, content: [], imageUrl: row.image_url, date: row.created_at, author: row.author }));
        } catch (e) { return []; }
    },

    async getBlogPost(id: string): Promise<BlogPost | undefined> {
        try {
            const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single();
            if (data) return { id: data.id, title: data.title, summary: data.summary, content: data.content || [], imageUrl: data.image_url, date: data.created_at, author: data.author };
        } catch (e) { }
        return undefined;
    },

    async deleteBlogPost(id: string) { await supabase.from('blog_posts').delete().eq('id', id); },

    async createBlogPost(post: Partial<BlogPost>) {
        const { data, error = null } = await supabase.from('blog_posts').insert({ title: post.title, summary: post.summary, content: post.content, image_url: post.imageUrl, author: post.author || 'Admin', created_at: new Date().toISOString() }).select().single();
        if (error) throw error;
        return data;
    },

    async updateBlogPost(post: Partial<BlogPost>) {
        if (!post.id) throw new Error("ID chýba");
        await supabase.from('blog_posts').update({ title: post.title, summary: post.summary, content: post.content, image_url: post.imageUrl, author: post.author }).eq('id', post.id);
    },

    async getPromoSlides(): Promise<PromoSlide[]> {
        try {
            const { data } = await supabase.from('promo_slides').select('*').order('created_at', { ascending: true });
            if (!data) return [];
            return data.map((row: any) => ({ id: row.id, title: row.title, description: row.description, link: row.link, imageUrl: row.image_url, badge: row.badge, cta: row.cta, iconType: row.icon_type }));
        } catch (e) { return []; }
    },

    async createPromoSlide(slide: Partial<PromoSlide>) {
        const { data, error = null } = await supabase.from('promo_slides').insert({ title: slide.title, description: slide.description, link: slide.link, image_url: slide.imageUrl, badge: slide.badge, cta: slide.cta, icon_type: slide.iconType || 'star' }).select().single();
        if (error) throw error;
        return data;
    },

    async deletePromoSlide(id: string) { await supabase.from('promo_slides').delete().eq('id', id); },

    async subscribeToNewsletter(email: string) {
        const { error } = await supabase.from('newsletter_subscribers').insert({ email, created_at: new Date().toISOString() });
        if (error) { if (error.code === '23505') throw new Error("Tento e-mail je už prihlásený na odber."); throw error; }
    }
};
