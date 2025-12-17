
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
    description: 'Bary je energický a priateľský pes, ktorý miluje dlhé prechádzky a aportovanie. Našiel sa pri lese, bol trochu bojazlivý, ale rýchlo si zvykol na ľudí. Hľadá aktívnu rodinu, ktorá sa mu bude venovať.',
    
    health: {
      isVaccinated: true,
      isDewormed: true,
      isCastrated: true,
      isChipped: true,
      hasAllergies: true,
      allergiesDescription: 'Kuracie mäso',
      diet: 'Hypoalergénne granule'
    },
    social: {
      children: 'Vhodný',
      dogs: 'Vhodný',
      cats: 'Neznáme'
    },
    training: {
      toiletTrained: true,
      leashTrained: true,
      carTravel: true,
      aloneTime: false
    },
    requirements: {
      activityLevel: 'Vysoká',
      suitableFor: ['Rodinný dom', 'Aktívni ľudia', 'Turistika'],
      unsuitableFor: ['Byt', 'Seniori']
    },
    adoptionFee: 50,

    shelterId: 's1',
    tags: ['Aktívny', 'Vhodný k deťom', 'Priateľský'],
    postedDate: '2023-10-15',
    importantNotes: 'Vyžaduje hypoalergénne krmivo.',
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
    description: 'Micka je prítulná mačička, ktorá rada spí na gauči. Je trochu plachá pri cudzích ľuďoch, ale veľmi verná svojim majiteľom.',
    
    health: {
      isVaccinated: true,
      isDewormed: true,
      isCastrated: true,
      isChipped: true,
      hasAllergies: false
    },
    social: {
      children: 'Opatrne',
      dogs: 'Nevhodný',
      cats: 'Vhodný'
    },
    training: {
      toiletTrained: true,
      leashTrained: false,
      carTravel: false,
      aloneTime: true
    },
    requirements: {
      activityLevel: 'Nízka',
      suitableFor: ['Byt', 'Seniori', 'Pokojná domácnosť'],
      unsuitableFor: ['Hlučná domácnosť', 'Malé deti']
    },
    adoptionFee: 30,

    shelterId: 's1',
    tags: ['Kľudná', 'Vhodná do bytu'],
    postedDate: '2023-10-20',
    adoptionStatus: 'Available',
    isVisible: true,
    needsFoster: true,
    views: 89
  },
  {
    id: '3',
    name: 'Rex',
    type: PetType.DOG,
    breed: 'Nemecký ovčiak',
    age: 5,
    gender: Gender.MALE,
    size: Size.LARGE,
    location: 'Žilina',
    imageUrl: 'https://picsum.photos/id/1025/800/600',
    description: 'Rex je strážny pes so zlatým srdcom. Potrebuje skúseného majiteľa, ktorý mu dá hranice a lásku.',
    
    health: {
      isVaccinated: true,
      isDewormed: true,
      isCastrated: false,
      isChipped: true,
      hasAllergies: false
    },
    social: {
      children: 'Nevhodný',
      dogs: 'Nevhodný',
      cats: 'Nevhodný'
    },
    training: {
      toiletTrained: true,
      leashTrained: true,
      carTravel: true,
      aloneTime: true
    },
    requirements: {
      activityLevel: 'Stredná',
      suitableFor: ['Dom so záhradou', 'Skúsený majiteľ'],
      unsuitableFor: ['Byt', 'Začiatočník', 'Iné zvieratá']
    },
    adoptionFee: 40,

    shelterId: 's2',
    tags: ['Strážny', 'Inteligentný'],
    postedDate: '2023-09-10',
    importantNotes: 'Rex sa neznesie s inými psami samcami. Odporúčame ako jedináčika.',
    adoptionStatus: 'Reserved',
    isVisible: true,
    needsFoster: false,
    views: 256
  },
  {
    id: '4',
    name: 'Luna',
    type: PetType.DOG,
    breed: 'Border Kólia',
    age: 3,
    gender: Gender.FEMALE,
    size: Size.MEDIUM,
    location: 'Košice',
    imageUrl: 'https://picsum.photos/id/169/800/600',
    description: 'Luna je extrémne inteligentná a potrebuje veľa mentálnej stimulácie. Miluje agility a učenie nových trikov.',
    
    health: {
      isVaccinated: true,
      isDewormed: true,
      isCastrated: true,
      isChipped: true,
      hasAllergies: false
    },
    social: {
      children: 'Vhodný',
      dogs: 'Vhodný',
      cats: 'Opatrne'
    },
    training: {
      toiletTrained: true,
      leashTrained: true,
      carTravel: true,
      aloneTime: false
    },
    requirements: {
      activityLevel: 'Vysoká',
      suitableFor: ['Aktívni ľudia', 'Športovci'],
      unsuitableFor: ['Byt', 'Ľudia s nedostatkom času']
    },
    adoptionFee: 60,

    shelterId: 's2',
    tags: ['Aktívna', 'Inteligentná', 'Agility'],
    postedDate: '2023-10-25',
    adoptionStatus: 'Available',
    isVisible: true,
    needsFoster: true,
    views: 312
  },
  {
    id: '5',
    name: 'Felix',
    type: PetType.CAT,
    breed: 'Britská modrá',
    age: 4,
    gender: Gender.MALE,
    size: Size.MEDIUM,
    location: 'Bratislava',
    imageUrl: 'https://picsum.photos/id/219/800/600',
    description: 'Pán domu. Felix má rád svoj pokoj a kvalitné jedlo. Je to aristokrat medzi mačkami.',
    
    health: {
      isVaccinated: true,
      isDewormed: true,
      isCastrated: true,
      isChipped: true,
      hasAllergies: false,
      diet: 'Grain-free'
    },
    social: {
      children: 'Neznáme',
      dogs: 'Neznáme',
      cats: 'Vhodný'
    },
    training: {
      toiletTrained: true,
      leashTrained: false,
      carTravel: false,
      aloneTime: true
    },
    requirements: {
      activityLevel: 'Nízka',
      suitableFor: ['Byt', 'Interiér'],
      unsuitableFor: ['Vonkajší pobyt']
    },
    adoptionFee: 40,

    shelterId: 's1',
    tags: ['Nezávislý', 'Kľudný'],
    postedDate: '2023-10-01',
    importantNotes: 'Vyžaduje pravidelné vyčesávanie srsti.',
    adoptionStatus: 'Adopted',
    isVisible: false,
    needsFoster: false,
    views: 450
  }
];

export const MOCK_SHELTER: Shelter = {
  id: 's1',
  role: 'shelter',
  name: 'Útulok Nádej Bratislava',
  location: 'Bratislava',
  email: 'info@utuloknadej.sk',
  phone: '+421 900 123 456',
  description: 'Sme útulok s dlhoročnou tradíciou. Naším poslaním je pomáhať opusteným a týraným zvieratám nájsť nový, milujúci domov.',
  openingHours: 'Po-Pia: 10:00 - 17:00, So: 09:00 - 12:00',
  bankAccount: 'SK12 1100 0000 0012 3456 7890',
  logoUrl: 'https://ui-avatars.com/api/?name=Utulok+Nadej&background=f97316&color=fff&size=128',
  stats: {
    adoptions: 142,
    currentAnimals: 45,
    views: 15600
  }
};

export const MOCK_INQUIRIES: AdoptionInquiry[] = [
  {
    id: 'i1',
    shelterId: 's1',
    petId: '1',
    petName: 'Bary',
    applicantName: 'Peter Nagy',
    email: 'peter.n@example.com',
    phone: '0905 111 222',
    date: '2023-10-27',
    status: 'Nová',
    message: 'Dobrý deň, máme záujem o Baryho. Máme rodinný dom a veľkú záhradu.'
  },
  {
    id: 'i2',
    shelterId: 's1',
    petId: '2',
    petName: 'Micka',
    applicantName: 'Lucia Krátka',
    email: 'lucia.k@example.com',
    phone: '0903 333 444',
    date: '2023-10-26',
    status: 'Kontaktovaný',
    message: 'Hľadám spoločníčku do bytu, Micka vyzerá úžasne.'
  },
  {
    id: 'i3',
    shelterId: 's1',
    petId: '5',
    petName: 'Felix',
    applicantName: 'Jozef Ostrý',
    email: 'jozef@example.com',
    phone: '0904 555 666',
    date: '2023-10-25',
    status: 'Schválená',
    message: 'Máme skúsenosti s mačkami, radi by sme si ho adoptovali.'
  }
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Jana Milá', email: 'jana@example.com', role: 'Venčenie', status: 'Aktívny' },
  { id: 'v2', name: 'Tomáš Rýchly', email: 'tomas@example.com', role: 'Fotograf', status: 'Aktívny' },
  { id: 'v3', name: 'Petra Nová', email: 'petra@example.com', role: 'Administratíva', status: 'Čakateľ' },
];

export const MOCK_SUPPLIES: ShelterSupply[] = [
  { id: 'sup1', item: 'Granule pre šteniatka (High Energy)', priority: 'Vysoká' },
  { id: 'sup2', item: 'Staré deky a uteráky', priority: 'Stredná' },
  { id: 'sup3', item: 'Čistiace prostriedky (Savo)', priority: 'Vysoká' },
  { id: 'sup4', item: 'Hračky pre mačky', priority: 'Nízka' },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: '10 vecí, ktoré musíte vedieť pred adopciou psa',
    summary: 'Adopcia psa je veľký záväzok. Prečítajte si nášho sprievodcu, aby ste boli pripravení na príchod nového člena rodiny.',
    content: [
      'Rozhodnutie adoptovať si psa je jedným z najkrajších, ale aj najzodpovednejších krokov, aké môžete v živote urobiť. Než sa však vyberiete do útulku, je dôležité si položiť niekoľko zásadných otázok.',
      '1. Máte dostatok času? Pes nie je len domáce zvieratko, je to člen rodiny, ktorý potrebuje vašu pozornosť, prechádzky a tréning. Šteniatka vyžadujú ešte viac času na socializáciu a učenie hygienických návykov.',
      '2. Finančná stránka. Adopčný poplatok je len začiatok. Musíte počítať s výdavkami na kvalitné krmivo, veterinárnu starostlivosť, očkovania, odčervenie a prípadné nečakané zdravotné komplikácie.',
      '3. Váš životný štýl. Ak ste aktívny športovec, husky alebo stavač bude skvelým parťákom. Ak preferujete večery pri knihe, zvoľte skôr staršieho psíka alebo plemeno s nižšou potrebou pohybu. Výber správneho psa k vášmu životnému štýlu je kľúčom k dlhodobému šťastiu oboch strán.',
      'Pamätajte, že adopcia je záväzok na 10 až 15 rokov. Ak ste pripravení dať psovi domov na celý jeho život, odmení sa vám bezpodmienečnou láskou.'
    ],
    imageUrl: 'https://picsum.photos/id/1062/600/400',
    date: '2023-10-12',
    author: 'Jana Nováková'
  },
  {
    id: 'b2',
    title: 'Prečo sú staršie psy skvelými spoločníkmi',
    summary: 'Šteniatka sú roztomilé, ale staršie psy majú svoje čaro. Zistite, prečo by ste mali zvážiť adopciu seniora.',
    content: [
      'Keď ľudia prichádzajú do útulku, ich oči často smerujú k roztomilým šteniatkam. Staršie psy však často ostávajú nepovšimnuté v úzadí, hoci práve ony môžu byť pre mnohých ľudí ideálnou voľbou.',
      'Starší pes už má zvyčajne vybudované hygienické návyky a neničí veci v byte, čo je častým problémom pri výchove šteniat. Už vedia chodiť na vodítku a ovládajú základné povely, takže preskočíte najnáročnejšiu fázu výcviku.',
      'Ich povaha je už ustálená. Pri adopcii dospelého psa presne viete, či je aktívny, pokojný, alebo či sa znáša s inými zvieratami. Nekupujete "mačku vo vreci".',
      'Seniori sú nesmierne vďační. Psy, ktoré strávili roky v útulku alebo prišli o domov v neskoršom veku, si teplo domova a plnú misku vážia dvojnásobne. Adopciou staršieho psa nezachraňujete len jeho život, ale získavate oddaného priateľa, ktorý vám bude robiť radosť každým dňom.'
    ],
    imageUrl: 'https://picsum.photos/id/582/600/400',
    date: '2023-09-28',
    author: 'Peter Kováč'
  },
  {
    id: 'b3',
    title: 'Význam kastrácie pre zdravie zvierat',
    summary: 'Kastrácia nie je len o kontrole populácie. Má významný vplyv aj na zdravie a správanie vášho miláčika.',
    content: [
      'Kastrácia je téma, ktorá stále vyvoláva mnoho otázok a mýtov. Veterinári a odborníci sa však zhodujú: je to jeden z najlepších krokov, ktoré môžete pre zdravie svojho zvieraťa urobiť.',
      'U sučiek kastrácia pred prvým háraním takmer úplne eliminuje riziko nádorov mliečnej žľazy a úplne zabraňuje nebezpečnému zápalu maternice (pyometra), ktorý môže byť smrteľný. U psov samcov znižuje riziko problémov s prostatou a eliminuje rakovinu semenníkov.',
      'Okrem zdravotných benefitov má kastrácia pozitívny vplyv aj na správanie. Kastrované zvieratá sú často pokojnejšie, menej utekajú za "láskou" a u samcov sa znižuje tendencia značkovať si teritórium v byte.',
      'A samozrejme, je tu etický rozmer. Útulky sú preplnené nechcenými šteniatkami a mačiatkami. Zodpovedným prístupom a kastráciou pomáhate riešiť problém bezdomovectva zvierat priamo pri zdroji.'
    ],
    imageUrl: 'https://picsum.photos/id/96/600/400',
    date: '2023-09-15',
    author: 'MVDr. Martin Veselý'
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  role: 'user',
  name: 'Filip Dobrý',
  email: 'filip@example.com',
  phone: '+421 915 555 666',
  avatarUrl: 'https://ui-avatars.com/api/?name=Filip+Dobry&background=f97316&color=fff',
  bio: 'Milovník zvierat, najmä psov. Mám skúsenosti s výcvikom a rád trávim čas v prírode. Hľadám parťáka na turistiku.',
  location: 'Pezinok, Bratislavský kraj',
  birthYear: 1990,
  preferredContact: 'Email',
  availability: 'Víkendy a pracovné dni po 17:00',
  maxTravelDistance: 50,
  isFosterParent: true,
  badges: ['Zodpovedný adoptér', 'Srdciar', 'Dočaskár'],
  verification: {
    email: true,
    phone: true,
    identity: false
  },
  household: {
    housingType: 'Dom so záhradou',
    hasChildren: true,
    hasOtherPets: true,
    workMode: 'Hybrid',
    experienceLevel: 'Skúsený'
  },
  preferences: {
    types: [PetType.DOG],
    sizes: [Size.MEDIUM, Size.LARGE],
    genders: [Gender.MALE, Gender.FEMALE],
    ageRange: ['Mladý', 'Dospelý'],
    temperament: ['Aktívny', 'Priateľský', 'Vhodný k deťom'],
    specialNeedsAccepted: false
  },
  virtualAdoptions: [
    { petId: '2', amount: 15, startDate: '2023-09-01' }
  ],
  favorites: ['1', '4'],
  applications: [
    {
       id: 'app1',
       shelterId: 's2',
       petId: '4',
       petName: 'Luna',
       applicantName: 'Filip Dobrý',
       email: 'filip@example.com',
       phone: '...',
       date: '2023-10-20',
       status: 'Nová',
       message: 'Mal by som záujem o Lunu.'
    }
  ]
};
