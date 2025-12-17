
export enum PetType {
  DOG = 'Pes',
  CAT = 'Mačka',
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
  suitableFor: string[]; // e.g. "Seniori", "Dom so záhradou"
  unsuitableFor: string[]; // e.g. "Malé deti", "Byt"
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: number; // in years
  gender: Gender;
  size: Size;
  location: string;
  imageUrl: string;
  gallery?: string[]; // Array of additional images (Base64 or URLs)
  description: string;
  
  // New structured fields
  health: PetHealth;
  social: PetSocial;
  training: PetTraining;
  requirements: PetRequirements;
  
  adoptionFee: number;
  videoUrl?: string;

  shelterId: string;
  tags: string[]; // e.g. "Vhodný k deťom", "Aktívny"
  postedDate: string;
  importantNotes?: string;
  adoptionStatus: 'Available' | 'Reserved' | 'Adopted';
  isVisible: boolean;
  needsFoster: boolean; // New field for temporary care
  views: number; // Real view count
}

export interface Shelter {
  id: string;
  role: 'shelter'; // Added role
  isSuperAdmin?: boolean; // Admin flag
  isVerified?: boolean; // Verification status
  password?: string; // Simulated password
  name: string;
  location: string;
  email: string;
  phone: string;
  description?: string;
  openingHours?: string;
  bankAccount?: string;
  shippingAddress?: string; // New field for full address
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

export interface AdoptionInquiry {
  id: string;
  shelterId: string; // Linked to specific shelter
  petId: string;
  petName: string;
  applicantName: string;
  email: string;
  phone: string;
  date: string;
  status: 'Nová' | 'Kontaktovaný' | 'Schválená' | 'Zamietnutá';
  message: string;
  // Extended info about applicant from their profile
  applicantDetails?: {
      location?: string;
      household?: UserHousehold;
      availability?: string;
      bio?: string;
  };
}

export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  role: string; // e.g. "Venčenie", "Upratovanie"
  status: 'Aktívny' | 'Čakateľ';
}

export interface ShelterSupply {
  id: string;
  item: string;
  priority: 'Nízka' | 'Stredná' | 'Vysoká';
  link?: string; // Optional URL to buy the item
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string[]; // Array of paragraphs
  imageUrl: string;
  date: string;
  author: string;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface VirtualAdoption {
  petId: string;
  amount: number;
  startDate: string;
}

// --- New User Interfaces ---

export type HousingType = 'Byt' | 'Dom' | 'Dom so záhradou' | 'Farma';
export type WorkMode = 'Práca z domu' | 'Hybrid' | 'V kancelárii/Terén' | 'Študent/Doma';
export type ExperienceLevel = 'Začiatočník' | 'Mierne pokročilý' | 'Skúsený';

export interface UserPreferences {
  types: PetType[];
  sizes: Size[];
  genders: Gender[];
  ageRange: string[]; // e.g. 'Mláďa', 'Dospelý'
  temperament: string[];
  specialNeedsAccepted: boolean;
}

export interface UserHousehold {
  housingType: HousingType;
  hasChildren: boolean;
  hasOtherPets: boolean;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
}

export interface UserVerification {
  email: boolean;
  phone: boolean;
  identity: boolean; // e.g. ID card check
}

export interface User {
  id: string;
  role: 'user'; // Added role
  isSuperAdmin?: boolean; // Admin flag
  password?: string; // Simulated password
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  
  // Basic Info
  bio?: string;
  location?: string;
  birthYear?: number;
  preferredContact?: 'Email' | 'Telefón' | 'Chat';
  
  // Availability
  availability?: string; // e.g. 'Víkendy', 'Poobedia'
  maxTravelDistance?: number; // km
  isFosterParent?: boolean; // Ochota byť dočasnou opaterou

  // Complex Data
  verification: UserVerification;
  household?: UserHousehold;
  preferences?: UserPreferences;
  badges: string[]; // Gamification badges

  // Activity
  virtualAdoptions: VirtualAdoption[];
  favorites: string[]; // List of pet IDs
  applications?: AdoptionInquiry[]; // History of applications sent
}

// Toast Notification Types
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}