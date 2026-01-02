
export enum PetType {
  DOG = 'Pes',
  CAT = 'Mačka',
  RABBIT = 'Králik',
  BIRD = 'Vták',
  RODENT = 'Hlodavec',
  OTHER = 'Iné'
}

export enum Gender {
  MALE = 'Samec',
  FEMALE = 'Samica'
}

export enum Size {
  SMALL = 'Malý',
  MEDIUM = 'Stredný',
  LARGE = 'Veľký'
}

export interface PetHealth {
  isVaccinated: boolean;
  isDewormed: boolean;
  isCastrated: boolean;
  isChipped: boolean;
  hasAllergies: boolean;
  allergiesDescription?: string;
  medication?: string;
  diet?: string;
}

export interface PetSocial {
  children: 'Vhodný' | 'Nevhodný' | 'Opatrne' | 'Neznáme';
  dogs: 'Vhodný' | 'Nevhodný' | 'Opatrne' | 'Neznáme';
  cats: 'Vhodný' | 'Nevhodný' | 'Opatrne' | 'Neznáme';
}

export interface PetTraining {
  toiletTrained: boolean;
  leashTrained: boolean;
  carTravel: boolean;
  aloneTime: boolean;
}

export interface PetRequirements {
  activityLevel: 'Nízka' | 'Stredná' | 'Vysoká';
  suitableFor: string[];
  unsuitableFor: string[];
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: number;
  gender: Gender;
  size: Size;
  location: string;
  imageUrl: string;
  gallery?: string[];
  description: string;
  health: PetHealth;
  social: PetSocial;
  training: PetTraining;
  requirements: PetRequirements;
  adoptionFee: number;
  videoUrl?: string;
  shelterId: string;
  tags: string[];
  postedDate: string;
  importantNotes?: string;
  adoptionStatus: 'Available' | 'Reserved' | 'Adopted';
  isVisible: boolean;
  needsFoster: boolean;
  views: number;
  slug?: string;
  updates?: PetUpdate[];
}

export interface PetUpdate {
  id: string;
  petId: string;
  date: string;
  title: string;
  content: string;
  imageUrl?: string;
  type: 'photo' | 'video' | 'status' | 'story';
}

export type OrganizationType = 'shelter' | 'civic_association' | 'quarantine_station' | 'volunteer';

export interface Shelter {
  id: string;
  role: 'shelter';
  organizationType: OrganizationType;
  isSuperAdmin?: boolean;
  isVerified?: boolean;
  name: string;
  location: string;
  email: string;
  phone: string;
  emailNotificationsEnabled?: boolean;
  description?: string;
  openingHours?: string;
  bankAccount?: string;
  shippingAddress?: string;
  logoUrl?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  stats: {
    adoptions: number;
    currentAnimals: number;
    views: number;
  };
}

export interface UserPreferences {
  types: PetType[];
  sizes: Size[];
  genders: Gender[];
  ageRange: string[];
  temperament: string[];
  preferredBreeds: string[];
  activityLevel: 'Nízka (Gaučák)' | 'Stredná (Prechádzky)' | 'Vysoká (Športovec)';
  socialRequirements: string[];
  specialNeedsAccepted: boolean;
}

export interface UserHousehold {
  housingType: HousingType;
  hasChildren: boolean;
  hasOtherPets: boolean;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
}

export type HousingType = 'Byt' | 'Dom' | 'Dom so záhradou' | 'Farma';
export type WorkMode = 'Práca z domu' | 'Hybrid' | 'V kancelárii/Terén' | 'Študent/Doma' | 'V kancelárii';
export type ExperienceLevel = 'Začiatočník' | 'Mierne pokročilý' | 'Skúsený';

export interface VirtualAdoption {
  id: string; // Added ID for management
  userId: string;
  petId: string;
  petName: string; // Snapshot for display
  petImage: string; // Snapshot for display
  amount: number;
  currency: string;
  status: 'active' | 'cancelled' | 'paused';
  nextBillingDate: string;
  startDate: string;
}

export interface User {
  id: string;
  role: 'user';
  isSuperAdmin?: boolean;
  name: string;
  email: string;
  phone?: string;
  emailNotificationsEnabled?: boolean;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  birthYear?: number;
  availability?: string;
  maxTravelDistance?: number;
  isFosterParent?: boolean;
  verification: { email: boolean; phone: boolean; identity: boolean };
  household?: UserHousehold;
  preferences?: UserPreferences;
  badges: string[];
  virtualAdoptions: VirtualAdoption[];
  favorites: string[];
  applications?: AdoptionInquiry[];
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string | string[];
  imageUrl: string;
  date: string;
  author: string;
}

export interface AdoptionInquiry {
  id: string;
  shelterId: string;
  applicantId?: string;
  petId: string;
  petName: string;
  applicantName: string;
  email: string;
  phone: string;
  date: string;
  status: 'Nová' | 'Kontaktovaný' | 'Schválená' | 'Zamietnutá' | 'Zrušená';
  message: string;
  applicantDetails?: {
    location?: string;
    bio?: string;
    avatarUrl?: string;
    household?: UserHousehold;
    availability?: string;
  };
}

export interface Volunteer {
  id: string;
  shelterId: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface ShelterSupply {
  id: string;
  shelterId: string;
  item: string;
  priority: 'Nízka' | 'Stredná' | 'Vysoká';
  link?: string;
}

export interface PromoSlide {
  id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  badge: string;
  cta: string;
  iconType: 'shopping' | 'health' | 'shield' | 'star';
}

export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage { id: string; message: string; type: ToastType; }
