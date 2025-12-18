
import { Pet, PetType, Gender, Size, Shelter, BlogPost, User, AdoptionInquiry, Volunteer, ShelterSupply } from './types';

export const MOCK_PETS: Pet[] = [
  {
    id: '1',
    name: 'Bary',
    type: PetType.DOG,
    breed: 'Kríženec Labradora',
    age: 2,
    gender: Gender.MALE,
    size: Size.LARGE,
    location: 'Bratislava',
    imageUrl: 'https://picsum.photos/id/237/800/600',
    description: 'Bary je energický a priateľský pes, ktorý miluje dlhé prechádzky a aportovanie.',
    health: { isVaccinated: true, isDewormed: true, isCastrated: true, isChipped: true, hasAllergies: true, allergiesDescription: 'Kuracie mäso', diet: 'Hypoalergénne granule' },
    social: { children: 'Vhodný', dogs: 'Vhodný', cats: 'Neznáme' },
    training: { toiletTrained: true, leashTrained: true, carTravel: true, aloneTime: false },
    requirements: { activityLevel: 'Vysoká', suitableFor: ['Rodinný dom', 'Aktívni ľudia'], unsuitableFor: ['Byt'] },
    adoptionFee: 50,
    shelterId: 's1',
    tags: ['Aktívny', 'Vhodný k deťom'],
    postedDate: '2023-10-15',
    adoptionStatus: 'Available',
    isVisible: true,
    needsFoster: false,
    views: 124
  },
  {
    id: '2',
    name: 'Micka',
    type: PetType.CAT,
    breed: 'Európska krátkosrstá',
    age: 1,
    gender: Gender.FEMALE,
    size: Size.SMALL,
    location: 'Trnava',
    imageUrl: 'https://picsum.photos/id/40/800/600',
    description: 'Micka je prítulná mačička, ktorá rada spí na gauči.',
    health: { isVaccinated: true, isDewormed: true, isCastrated: true, isChipped: true, hasAllergies: false },
    social: { children: 'Opatrne', dogs: 'Nevhodný', cats: 'Vhodný' },
    training: { toiletTrained: true, leashTrained: false, carTravel: false, aloneTime: true },
    requirements: { activityLevel: 'Nízka', suitableFor: ['Byt', 'Seniori'], unsuitableFor: ['Hlučná domácnosť'] },
    adoptionFee: 30,
    shelterId: 's1',
    tags: ['Kľudná'],
    postedDate: '2023-10-20',
    adoptionStatus: 'Available',
    isVisible: true,
    needsFoster: true,
    views: 89
  }
];

// Pridané viaceré útulky pre testovanie mapy
export const MOCK_SHELTERS: Shelter[] = [
  {
    id: 's1',
    role: 'shelter',
    name: 'Útulok Nádej Bratislava',
    location: 'Bratislava',
    email: 'info@utuloknadej.sk',
    phone: '+421 900 123 456',
    isVerified: true,
    stats: { adoptions: 142, currentAnimals: 45, views: 15600 }
  },
  {
    id: 's2',
    role: 'shelter',
    name: 'Východniarska Labka',
    location: 'Košice',
    email: 'kosice@labka.sk',
    phone: '+421 905 555 666',
    isVerified: true,
    stats: { adoptions: 89, currentAnimals: 32, views: 8400 }
  },
  {
    id: 's3',
    role: 'shelter',
    name: 'Útulok Žilina - Priatelia',
    location: 'Žilina',
    email: 'zilina@utulok.sk',
    phone: '+421 911 222 333',
    isVerified: false,
    stats: { adoptions: 210, currentAnimals: 56, views: 12000 }
  },
  {
    id: 's4',
    role: 'shelter',
    name: 'Nitriansky Ňufáčik',
    location: 'Nitra',
    email: 'nitra@nufacik.sk',
    phone: '+421 944 000 111',
    isVerified: true,
    stats: { adoptions: 54, currentAnimals: 18, views: 4200 }
  }
];

// Ponechávame jeden pre spätne kompatibilné referencie v iných komponentoch
export const MOCK_SHELTER = MOCK_SHELTERS[0];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: '10 vecí pred adopciou',
    summary: 'Adopcia psa je záväzok.',
    content: ['Obsah článku...'],
    imageUrl: 'https://picsum.photos/id/1062/600/400',
    date: '2023-10-12',
    author: 'Jana Nováková'
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  role: 'user',
  name: 'Filip Dobrý',
  email: 'filip@example.com',
  badges: ['Zodpovedný adoptér'],
  verification: { email: true, phone: true, identity: false },
  virtualAdoptions: [],
  favorites: ['1'],
  applications: []
};
