
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, CreditCard, Edit2, Trash2, MapPin, 
  ShieldCheck, Award, Briefcase, Home, Clock, Phone, Mail, CheckCircle, 
  AlertCircle, Dog, Navigation, FileText, Bell, Lock, LogOut, X, Info,
  User as UserIcon, Save, MessageSquare, Check, XCircle, Calendar, Building2, Loader2,
  ChevronRight, Sparkles, Search, Camera, ChevronLeft
} from 'lucide-react';
import { User, PetType, Size, Gender, HousingType, WorkMode, ExperienceLevel, AdoptionInquiry, Pet } from '../types';
import ChatWindow from '../components/ChatWindow';
import { api } from '../services/api';

// --- Sub-components ---

interface BadgeItemProps {
  label: string;
  color: string;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ label, color }) => (
  <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${color}`}>
    <Award size={14} />
    {label}
  </div>
);

const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
    <div className="text-gray-400"><Icon size={20} /></div>
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value || 'Neuvedené'}</div>
    </div>
  </div>
);

interface EditAdoptionModalProps {
  petName: string;
  currentAmount: number;
  onSave: (amount: number) => void;
  onClose: () => void;
  onStopAdoption: () => void;
}

const EditAdoptionModal: React.FC<EditAdoptionModalProps> = ({ petName, currentAmount, onSave, onClose, onStopAdoption }) => {
  const [amount, setAmount] = useState(currentAmount);
  const [customAmount, setCustomAmount] = useState('');

  const handleSave = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (finalAmount > 0) {
      onSave(finalAmount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Upraviť podporu pre {petName}</h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full"><X size={20} /></button>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Vyberte novú výšku príspevku:</label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[5, 10, 20, 50].map((preset) => (
              <button
                key={preset}
                onClick={() => { setAmount(preset); setCustomAmount(''); }}
                className={`py-2 rounded-lg font-bold border transition ${
                  amount === preset && !customAmount
                    ? 'bg-brand-50 text-brand-700 border-brand-500 ring-1 ring-brand-500'
                    : 'border-gray-200 text-gray-600 hover:border-brand-300'
                }`}
              >
                {preset} €
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-1">Vlastná suma (€)</label>
            <input 
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Zadajte sumu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900"
              onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()}
            />
          </div>

          <div className="flex gap-3">
             <button 
              onClick={onStopAdoption}
              className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition text-sm flex-1 border border-transparent hover:border-red-100"
            >
              Zrušiť adopciu
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition flex-1 shadow-lg shadow-brand-200"
            >
              Uložiť zmeny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Edit Household Modal ---
interface EditHouseholdModalProps {
  user: User;
  onSave: (data: Partial<User>) => void;
  onClose: () => void;
}

const EditHouseholdModal: React.FC<EditHouseholdModalProps> = ({ user, onSave, onClose }) => {
  const [housingType, setHousingType] = useState<HousingType | ''>(user.household?.housingType || '');
  const [workMode, setWorkMode] = useState<WorkMode | ''>(user.household?.workMode || '');
  const [hasChildren, setHasChildren] = useState(user.household?.hasChildren || false);
  const [hasOtherPets, setHasOtherPets] = useState(user.household?.hasOtherPets || false);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(user.household?.experienceLevel || '');
  const [birthYear, setBirthYear] = useState<string>(user.birthYear ? user.birthYear.toString() : '');

  const handleSave = () => {
    onSave({
      birthYear: birthYear ? parseInt(birthYear) : undefined,
      household: {
        housingType: housingType as HousingType,
        workMode: workMode as WorkMode,
        hasChildren,
        hasOtherPets,
        experienceLevel: experienceLevel as ExperienceLevel
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-brand-600 p-4 flex justify-between items-center text-white flex-shrink-0">
          <h3 className="font-bold text-lg">Upraviť domácnosť a životný štýl</h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ bývania</label>
                <select 
                  value={housingType} 
                  onChange={(e) => setHousingType(e.target.value as HousingType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
                >
                  <option value="">Nevybraté</option>
                  <option value="Byt">Byt</option>
                  <option value="Dom">Dom</option>
                  <option value="Dom so záhradou">Dom so záhradou</option>
                  <option value="Farma">Farma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pracovný režim</label>
                <select 
                  value={workMode} 
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
                >
                  <option value="">Nevybraté</option>
                  <option value="Práca z domu">Práca z domu</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="V kancelárii/Terén">V kancelárii/Terén</option>
                  <option value="Študent/Doma">Študent/Doma</option>
                </select>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skúsenosti so zvieratami</label>
              <select 
                value={experienceLevel} 
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
              >
                <option value="">Nevybraté</option>
                <option value="Začiatočník">Začiatočník</option>
                <option value="Mierne pokročilý">Mierne pokročilý</option>
                <option value="Skúsený">Skúsený</option>
              </select>
           </div>

           <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasChildren} 
                  onChange={(e) => setHasChildren(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-gray-700 text-sm font-medium">Mám deti</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasOtherPets} 
                  onChange={(e) => setHasOtherPets(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-gray-700 text-sm font-medium">Mám iné zvieratá</span>
              </label>
           </div>

           <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rok narodenia (pre overenie veku)</label>
              <input 
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="napr. 1990"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
                onKeyDown={(e) => ['e', 'E', '-', '+', '.'].includes(e.key) && e.preventDefault()}
              />
           </div>

        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold">Zrušiť</button>
          <button onClick={handleSave} className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 shadow-md">Uložiť</button>
        </div>
      </div>
    </div>
  );
};

// --- Edit Availability Modal ---
interface EditAvailabilityModalProps {
  user: User;
  onSave: (data: Partial<User>) => void;
  onClose: () => void;
}

const EditAvailabilityModal: React.FC<EditAvailabilityModalProps> = ({ user, onSave, onClose }) => {
  const [availability, setAvailability] = useState(user.availability || '');
  const [maxTravelDistance, setMaxTravelDistance] = useState<string>(user.maxTravelDistance ? user.maxTravelDistance.toString() : '');
  const [preferredContact, setPreferredContact] = useState<'Email' | 'Telefón' | 'Chat' | ''>(user.preferredContact || '');

  const handleSave = () => {
    onSave({
      availability,
      maxTravelDistance: maxTravelDistance ? parseInt(maxTravelDistance) : undefined,
      preferredContact: preferredContact as 'Email' | 'Telefón' | 'Chat'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Upraviť dostupnosť</h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
           
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Časová dostupnosť</label>
              <input 
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="napr. Víkendy, Poobedia po 17:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
              />
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max. vzdialenosť pre adopciu (km)</label>
              <input 
                type="number"
                min="0"
                value={maxTravelDistance}
                onChange={(e) => setMaxTravelDistance(e.target.value)}
                placeholder="napr. 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
                onKeyDown={(e) => ['e', 'E', '-', '+', '.'].includes(e.key) && e.preventDefault()}
              />
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferovaný kontakt</label>
              <select 
                value={preferredContact} 
                onChange={(e) => setPreferredContact(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
              >
                <option value="">Nevybraté</option>
                <option value="Email">Email</option>
                <option value="Telefón">Telefón</option>
                <option value="Chat">Chat</option>
              </select>
           </div>

        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold">Zrušiť</button>
          <button onClick={handleSave} className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 shadow-md">Uložiť</button>
        </div>
      </div>
    </div>
  );
};

// --- Edit Preferences Modal ---
interface EditPreferencesModalProps {
    preferences: User['preferences'];
    onSave: (prefs: User['preferences']) => void;
    onClose: () => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <div className="mb-4">
        <h4 className="font-bold text-gray-700 text-sm mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

interface OptionProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const Option: React.FC<OptionProps> = ({ label, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        type="button"
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${isSelected ? 'bg-brand-600 text-white border-brand-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
    >
        {label}
    </button>
);

const EditPreferencesModal: React.FC<EditPreferencesModalProps> = ({ preferences, onSave, onClose }) => {
    const [localPrefs, setLocalPrefs] = useState<User['preferences']>(preferences || {
        types: [], sizes: [], genders: [], ageRange: [], temperament: [], specialNeedsAccepted: false
    });

    const toggleArrayItem = <T extends string>(arr: T[], item: T): T[] => {
        return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
    };

    const handleSave = () => {
        onSave(localPrefs);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-brand-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                    <h3 className="font-bold text-lg">Upraviť preferencie</h3>
                    <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <Section title="Druh zvieraťa">
                        {[PetType.DOG, PetType.CAT, PetType.OTHER].map(t => (
                            <Option key={t} label={t} isSelected={localPrefs.types.includes(t)} onClick={() => setLocalPrefs(prev => ({...prev, types: toggleArrayItem(prev.types, t)}))} />
                        ))}
                    </Section>
                    <Section title="Veľkosť">
                        {[Size.SMALL, Size.MEDIUM, Size.LARGE].map(t => (
                            <Option key={t} label={t} isSelected={localPrefs.sizes.includes(t)} onClick={() => setLocalPrefs(prev => ({...prev, sizes: toggleArrayItem(prev.sizes, t)}))} />
                        ))}
                    </Section>
                     <Section title="Pohlavie">
                        {[Gender.MALE, Gender.FEMALE].map(t => (
                            <Option key={t} label={t} isSelected={localPrefs.genders.includes(t)} onClick={() => setLocalPrefs(prev => ({...prev, genders: toggleArrayItem(prev.genders, t)}))} />
                        ))}
                    </Section>
                    <Section title="Vek">
                        {['Mláďa', 'Mladý', 'Dospelý', 'Senior'].map(t => (
                            <Option key={t} label={t} isSelected={localPrefs.ageRange.includes(t)} onClick={() => setLocalPrefs(prev => ({...prev, ageRange: toggleArrayItem(prev.ageRange, t)}))} />
                        ))}
                    </Section>
                    <Section title="Povaha">
                        {['Aktívny', 'Kľudný', 'Priateľský', 'Plachý', 'Vhodný k deťom', 'Strážny'].map(t => (
                            <Option key={t} label={t} isSelected={localPrefs.temperament.includes(t)} onClick={() => setLocalPrefs(prev => ({...prev, temperament: toggleArrayItem(prev.temperament, t)}))} />
                        ))}
                    </Section>
                    
                    <div className="pt-4 border-t border-gray-100">
                         <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-gray-50">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" 
                                checked={localPrefs.specialNeedsAccepted}
                                onChange={(e) => setLocalPrefs(prev => ({...prev, specialNeedsAccepted: e.target.checked}))}
                              />
                              <span className="font-medium text-gray-700 text-sm">Som ochotný adoptovať zviera so zdravotným znevýhodnením</span>
                          </label>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold">Zrušiť</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 shadow-md">Uložiť preferencie</button>
                </div>
            </div>
        </div>
    );
};

const UserProfilePage: React.FC = () => {
  const { currentUser, userRole, logout, updateAdoptionAmount, cancelAdoption, toggleFavorite, updateUserProfile } = useAuth();
  const { pets } = usePets(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'preferences' | 'activity' | 'settings'>('about');
  
  const [editingAdoption, setEditingAdoption] = useState<{petId: string, petName: string, amount: number} | null>(null);
  
  // Chat Modal State
  const [chatInquiry, setChatInquiry] = useState<AdoptionInquiry | null>(null);
  const [chatShelterName, setChatShelterName] = useState<string>('');

  // Edit States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isEditingHousehold, setIsEditingHousehold] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);

  // Location Edit State
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  // Phone Edit State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Guard
  useEffect(() => {
    if (!currentUser || userRole !== 'user') {
      navigate('/auth');
    }
  }, [currentUser, userRole, navigate]);

  // Load Shelter Name when Chat Opens
  useEffect(() => {
      const loadShelterName = async () => {
          if (chatInquiry?.shelterId) {
              try {
                  const s = await api.getPublicShelter(chatInquiry.shelterId);
                  setChatShelterName(s?.name || 'Útulok');
              } catch (e) {
                  setChatShelterName('Útulok');
              }
          }
      };
      loadShelterName();
  }, [chatInquiry]);

  if (!currentUser || userRole !== 'user') return null;

  const user = currentUser as User;

  // Bio Handlers
  const startEditingBio = () => {
      setBioInput(user.bio || '');
      setIsEditingBio(true);
  };

  const saveBio = () => {
      updateUserProfile({ bio: bioInput });
      setIsEditingBio(false);
  };

  // Location Handlers
  const startEditingLocation = () => {
      setLocationInput(user.location || '');
      setIsEditingLocation(true);
  };

  const saveLocation = () => {
      updateUserProfile({ location: locationInput });
      setIsEditingLocation(false);
  };

  // Phone Handlers
  const startEditingPhone = () => {
      setPhoneInput(user.phone || '');
      setIsEditingPhone(true);
  };

  const savePhone = () => {
      // Allow only numbers and plus
      const cleanPhone = phoneInput.replace(/[^0-9+]/g, '');
      updateUserProfile({ phone: cleanPhone });
      setIsEditingPhone(false);
  };

  // Avatar Handlers
  const handleAvatarClick = () => {
      if (fileInputRef.current && !isUploadingAvatar) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsUploadingAvatar(true);
          try {
              const url = await api.uploadFile(file, 'avatars');
              await updateUserProfile({ avatarUrl: url });
          } catch (error) {
              console.error("Avatar upload failed", error);
              alert("Nepodarilo sa nahrať fotku.");
          } finally {
              setIsUploadingAvatar(false);
          }
      }
  };

  const favoritePets = pets.filter(pet => user.favorites.includes(pet.id));

  // Edit Adoption Handlers
  const handleEditClick = (petId: string, petName: string, currentAmount: number) => {
    setEditingAdoption({ petId, petName, amount: currentAmount });
  };

  const handleSaveEdit = (newAmount: number) => {
    if (editingAdoption) {
      updateAdoptionAmount(editingAdoption.petId, newAmount);
      setEditingAdoption(null);
    }
  };

  const handleStopAdoption = () => {
      if(editingAdoption) {
          if(window.confirm(`Naozaj chcete zrušiť virtuálnu adopciu pre ${editingAdoption.petName}?`)) {
              cancelAdoption(editingAdoption.petId);
              setEditingAdoption(null);
          }
      }
  }

  // Get visual status helper
  const getStatusVisuals = (status: string) => {
      switch(status) {
          case 'Schválená': return { color: 'bg-green-500', icon: CheckCircle, label: 'Schválená', text: 'Útulok schválil vašu žiadosť.' };
          case 'Zamietnutá': return { color: 'bg-red-500', icon: XCircle, label: 'Zamietnutá', text: 'Žiadosť bola zamietnutá.' };
          case 'Kontaktovaný': return { color: 'bg-blue-500', icon: MessageSquare, label: 'V riešení', text: 'Útulok vás kontaktoval.' };
          default: return { color: 'bg-brand-600', icon: AlertCircle, label: 'Odoslaná', text: 'Čaká na prečítanie útulkom.' };
      }
  };

  // Find pet for chat modal
  const chatPet = chatInquiry ? pets.find(p => p.id === chatInquiry.petId) : null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDEBAR: Identity Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
               {/* Decorative Background */}
               <div className="absolute top-0 left-0 w-full h-24 bg-brand-600"></div>
               
               <div className="relative flex flex-col items-center text-center mt-8">
                  {/* Avatar Section */}
                  <div 
                    className="w-28 h-28 rounded-full bg-white p-1 shadow-lg relative group cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                     <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 relative">
                        {user.avatarUrl ? (
                            <img 
                                src={user.avatarUrl} 
                                alt={user.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-brand-600">{user.name.charAt(0)}</span>
                            </div>
                        )}
                        
                        {/* Upload Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                            {isUploadingAvatar ? (
                                <Loader2 className="text-white animate-spin" size={24} />
                            ) : (
                                <Camera className="text-white" size={24} />
                            )}
                        </div>
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                     />
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 mt-4 flex items-center gap-2">
                    {user.name}
                    {user.verification.identity && (
                      <span title="Overená identita">
                        <ShieldCheck className="text-blue-500" size={20} />
                      </span>
                    )}
                  </h1>
                  
                  {/* Location with Edit Functionality */}
                  {isEditingLocation ? (
                      <div className="mt-2 flex items-center gap-2 justify-center w-full px-4 animate-in fade-in duration-200">
                          <input 
                              type="text" 
                              value={locationInput} 
                              onChange={(e) => setLocationInput(e.target.value)}
                              className="w-full text-sm border border-brand-200 rounded px-2 py-1 outline-none focus:border-brand-500 text-center bg-white text-gray-900 placeholder-gray-400"
                              placeholder="Zadajte lokalitu"
                              autoFocus
                          />
                          <button onClick={saveLocation} className="text-green-600 hover:bg-green-50 p-1 rounded transition"><CheckCircle size={18}/></button>
                          <button onClick={() => setIsEditingLocation(false)} className="text-red-500 hover:bg-red-50 p-1 rounded transition"><X size={18}/></button>
                      </div>
                  ) : (
                      <div className="group relative mt-1">
                          <p 
                            className="text-gray-500 text-sm flex items-center gap-1 justify-center cursor-pointer hover:text-brand-600 transition" 
                            onClick={startEditingLocation}
                            title="Kliknite pre úpravu"
                          >
                              <MapPin size={12} /> {user.location || 'Lokalita neuvedená'} 
                              <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-400 ml-1"/>
                          </p>
                      </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {user.badges.map((badge, idx) => (
                      <BadgeItem 
                        key={idx} 
                        label={badge} 
                        color="bg-amber-50 text-amber-700 border-amber-200"
                      />
                    ))}
                  </div>

                  <hr className="w-full border-gray-100 my-6" />

                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 flex items-center gap-2"><Mail size={14}/> Email</span>
                       <span className="font-medium flex items-center gap-1 text-gray-900">
                         {user.email} 
                         {user.verification.email ? <CheckCircle size={14} className="text-green-500"/> : <AlertCircle size={14} className="text-yellow-500"/>}
                       </span>
                    </div>
                    
                    {/* Editable Phone Section */}
                    {isEditingPhone ? (
                        <div className="flex items-center gap-2 animate-in fade-in duration-200">
                            <span className="text-gray-500"><Phone size={14}/></span>
                            <input 
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9+]/g, ''))}
                                className="w-full text-sm border border-brand-200 rounded px-2 py-1 outline-none focus:border-brand-500 bg-white text-gray-900"
                                placeholder="+421..."
                                autoFocus
                            />
                            <button onClick={savePhone} className="text-green-600 hover:bg-green-50 p-1 rounded transition"><CheckCircle size={16}/></button>
                            <button onClick={() => setIsEditingPhone(false)} className="text-red-500 hover:bg-red-50 p-1 rounded transition"><X size={16}/></button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-sm group">
                           <span className="text-gray-500 flex items-center gap-2"><Phone size={14}/> Telefón</span>
                           <div className="flex items-center gap-2">
                               <span className="font-medium flex items-center gap-1 text-gray-900">
                                 {user.phone || '-'}
                                 {user.verification.phone ? <CheckCircle size={14} className="text-green-500"/> : <AlertCircle size={14} className="text-gray-300"/>}
                               </span>
                               <button 
                                  onClick={startEditingPhone}
                                  className="text-brand-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition p-1"
                                  title="Upraviť číslo"
                               >
                                  <Edit2 size={12} />
                               </button>
                           </div>
                        </div>
                    )}
                  </div>

                  {user.isFosterParent && (
                    <div className="mt-6 w-full bg-purple-50 text-purple-700 p-3 rounded-xl border border-purple-100 text-sm font-bold flex items-center justify-center gap-2">
                      <Heart className="fill-purple-500 text-purple-500" size={16} />
                      Dostupný pre dočasnú opateru
                    </div>
                  )}

                  {/* Moved Logout Button Here */}
                  <div className="w-full mt-6 pt-4 border-t border-gray-100">
                      <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 py-2.5 rounded-xl transition"
                      >
                         <LogOut size={18} /> Odhlásiť sa
                      </button>
                  </div>
               </div>
            </div>

            {/* Verification Status Widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-brand-600" size={20}/> Úroveň dôvery
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className={`p-1 rounded-full ${user.verification.email ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                     <CheckCircle size={16} />
                   </div>
                   <div className="text-sm">
                     <div className="font-medium text-gray-900">Overený Email</div>
                     <div className="text-xs text-gray-500">Základné overenie</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className={`p-1 rounded-full ${user.verification.phone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                     <CheckCircle size={16} />
                   </div>
                   <div className="text-sm">
                     <div className="font-medium text-gray-900">Overený Telefón</div>
                     <div className="text-xs text-gray-500">Pre rýchlejšiu komunikáciu</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className={`p-1 rounded-full ${user.verification.identity ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                     <CheckCircle size={16} />
                   </div>
                   <div className="text-sm">
                     <div className="font-medium text-gray-900">Overená Identita</div>
                     <div className="text-xs text-gray-500">Zvyšuje šancu na adopciu</div>
                   </div>
                   {!user.verification.identity && (
                     <button className="ml-auto text-xs bg-brand-600 text-white px-2 py-1 rounded">Overiť</button>
                   )}
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Content Tabs */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Tab Navigation */}
             <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex overflow-x-auto">
               <button onClick={() => setActiveTab('about')} className={`flex-1 min-w-[100px] py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'about' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>O mne</button>
               <button onClick={() => setActiveTab('preferences')} className={`flex-1 min-w-[100px] py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'preferences' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>Preferencie</button>
               <button onClick={() => setActiveTab('activity')} className={`flex-1 min-w-[100px] py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'activity' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>Moje zvieratá</button>
               <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[100px] py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'settings' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>Nastavenia</button>
             </div>

             {/* Tab Content */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                
                {/* TAB: ABOUT */}
                {activeTab === 'about' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Bio</h2>
                        {!isEditingBio && (
                            <button onClick={startEditingBio} className="text-brand-600 hover:text-brand-700 bg-brand-50 p-2 rounded-lg hover:bg-brand-100 transition"><Edit2 size={16}/></button>
                        )}
                      </div>
                      
                      {isEditingBio ? (
                          <div className="space-y-3">
                              <textarea 
                                value={bioInput}
                                onChange={(e) => setBioInput(e.target.value)}
                                className="w-full p-4 border border-brand-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 shadow-inner"
                                rows={4}
                                placeholder="Napíšte niečo o sebe..."
                              ></textarea>
                              <div className="flex gap-2 justify-end">
                                  <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold">Zrušiť</button>
                                  <button onClick={saveBio} className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-lg text-sm font-bold flex items-center gap-2"><Save size={16}/> Uložiť</button>
                              </div>
                          </div>
                      ) : (
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                            "{user.bio || 'Zatiaľ ste o sebe nič nenapísali.'}"
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Domácnosť & Životný štýl</h2>
                        <button onClick={() => setIsEditingHousehold(true)} className="text-brand-600 hover:text-brand-700 bg-brand-50 p-2 rounded-lg hover:bg-brand-100 transition"><Edit2 size={16}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={Home} label="Bývanie" value={user.household?.housingType} />
                        <InfoRow icon={Briefcase} label="Práca" value={user.household?.workMode} />
                        <InfoRow icon={UserIcon} label="Deti v domácnosti" value={user.household?.hasChildren ? 'Áno' : 'Nie'} />
                        <InfoRow icon={Dog} label="Iné zvieratá" value={user.household?.hasOtherPets ? 'Áno' : 'Nie'} />
                        <InfoRow icon={Award} label="Skúsenosti" value={user.household?.experienceLevel} />
                        <InfoRow icon={Clock} label="Narodenie" value={user.birthYear?.toString()} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Dostupnosť</h2>
                        <button onClick={() => setIsEditingAvailability(true)} className="text-brand-600 hover:text-brand-700 bg-brand-50 p-2 rounded-lg hover:bg-brand-100 transition"><Edit2 size={16}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={Clock} label="Časová dostupnosť" value={user.availability} />
                        <InfoRow icon={Navigation} label="Max. vzdialenosť pre adopciu" value={user.maxTravelDistance ? `${user.maxTravelDistance} km` : undefined} />
                        <InfoRow icon={Phone} label="Preferovaný kontakt" value={user.preferredContact} />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: PREFERENCES */}
                {activeTab === 'preferences' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Čo hľadám?</h2>
                        <button onClick={() => setIsEditingPreferences(true)} className="text-brand-600 hover:text-brand-700 bg-brand-50 p-2 rounded-lg hover:bg-brand-100 transition"><Edit2 size={16}/></button>
                     </div>
                     <p className="text-gray-500 text-sm">Tieto údaje pomáhajú útulkom ponúknuť vám najvhodnejšie zvieratko.</p>
                     
                     <div className="grid gap-6">
                        <div className="border-b border-gray-100 pb-4">
                          <h3 className="font-medium text-gray-700 mb-3">Druh a Veľkosť</h3>
                          <div className="flex flex-wrap gap-2">
                             {user.preferences?.types.map(t => <span key={t} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium">{t}</span>)}
                             {user.preferences?.sizes.map(t => <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">{t}</span>)}
                             {(!user.preferences?.types.length && !user.preferences?.sizes.length) && <span className="text-gray-400 text-sm">Nevybraté</span>}
                          </div>
                        </div>
                        
                        <div className="border-b border-gray-100 pb-4">
                          <h3 className="font-medium text-gray-700 mb-3">Vek a Pohlavie</h3>
                          <div className="flex flex-wrap gap-2">
                             {user.preferences?.ageRange.map(t => <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">{t}</span>)}
                             {user.preferences?.genders.map(t => <span key={t} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">{t}</span>)}
                             {(!user.preferences?.ageRange.length && !user.preferences?.genders.length) && <span className="text-gray-400 text-sm">Nevybraté</span>}
                          </div>
                        </div>

                        <div className="border-b border-gray-100 pb-4">
                          <h3 className="font-medium text-gray-700 mb-3">Povaha</h3>
                          <div className="flex flex-wrap gap-2">
                             {user.preferences?.temperament.map(t => <span key={t} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{t}</span>)}
                             {(!user.preferences?.temperament.length) && <span className="text-gray-400 text-sm">Nevybraté</span>}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-700 mb-3">Špeciálne potreby</h3>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                             {user.preferences?.specialNeedsAccepted ? 
                               <CheckCircle className="text-green-500" /> : 
                               <AlertCircle className="text-gray-400" />
                             }
                             <span className="text-sm text-gray-700">
                               {user.preferences?.specialNeedsAccepted 
                                 ? 'Mám skúsenosti a som ochotný adoptovať zviera so zdravotným znevýhodnením.'
                                 : 'Momentálne hľadám zdravé zvieratko.'
                               }
                             </span>
                          </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* TAB: ACTIVITY */}
                {activeTab === 'activity' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    
                    {/* 1. ADOPTION APPLICATIONS (Priority) */}
                    <div>
                       <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                          <FileText className="text-blue-600" size={24} /> Moje žiadosti o adopciu
                       </h3>
                       
                       <div className="space-y-4">
                         {user.applications && user.applications.length > 0 ? (
                            user.applications.map(app => (
                                <div 
                                    key={app.id} 
                                    onClick={() => setChatInquiry(app)}
                                    className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition cursor-pointer overflow-hidden"
                                >
                                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                        <div className="bg-blue-50 p-3 rounded-xl">
                                            <Dog className="text-blue-600" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Žiadosť ID: {app.id.slice(-6)}</div>
                                            <h4 className="font-bold text-xl text-gray-900">{app.petName}</h4>
                                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                <Calendar size={14}/> {new Date(app.date).toLocaleDateString('sk-SK')}
                                            </div>
                                        </div>
                                        
                                        {/* Status Tracker */}
                                        <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                            <div className={`flex flex-col items-center gap-1 ${app.status === 'Nová' || app.status === 'Kontaktovaný' || app.status === 'Schválená' ? 'text-brand-600' : 'text-gray-300'}`}>
                                                <div className={`w-3 h-3 rounded-full ${app.status === 'Nová' || app.status === 'Kontaktovaný' || app.status === 'Schválená' ? 'bg-brand-600' : 'bg-gray-200'}`}></div>
                                                <span className="text-[10px] font-bold uppercase">Odoslaná</span>
                                            </div>
                                            <div className={`h-0.5 w-8 ${app.status === 'Kontaktovaný' || app.status === 'Schválená' ? 'bg-brand-600' : 'bg-gray-200'}`}></div>
                                            <div className={`flex flex-col items-center gap-1 ${app.status === 'Kontaktovaný' || app.status === 'Schválená' ? 'text-blue-600' : 'text-gray-300'}`}>
                                                <div className={`w-3 h-3 rounded-full ${app.status === 'Kontaktovaný' || app.status === 'Schválená' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                                <span className="text-[10px] font-bold uppercase">V riešení</span>
                                            </div>
                                            <div className={`h-0.5 w-8 ${app.status === 'Schválená' ? 'bg-green-500' : (app.status === 'Zamietnutá' ? 'bg-red-200' : 'bg-gray-200')}`}></div>
                                            <div className={`flex flex-col items-center gap-1 ${app.status === 'Schválená' ? 'text-green-600' : (app.status === 'Zamietnutá' ? 'text-red-500' : 'text-gray-300')}`}>
                                                <div className={`w-3 h-3 rounded-full ${app.status === 'Schválená' ? 'bg-green-600' : (app.status === 'Zamietnutá' ? 'bg-red-500' : 'bg-gray-200')}`}></div>
                                                <span className="text-[10px] font-bold uppercase">Verdikt</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                            <MessageSquare size={16} /> Otvoriť chat s útulkom
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            app.status === 'Schválená' ? 'bg-green-100 text-green-700' : 
                                            app.status === 'Zamietnutá' ? 'bg-red-100 text-red-700' :
                                            app.status === 'Kontaktovaný' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                         ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Search className="text-gray-400" size={24}/>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">Žiadne aktívne žiadosti</h4>
                                <p className="text-gray-500 text-sm mb-4">Zatiaľ ste neprejavili záujem o žiadne zvieratko.</p>
                                <button onClick={() => navigate('/pets')} className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition">
                                    Hľadať zvieratko
                                </button>
                            </div>
                         )}
                       </div>
                    </div>

                    {/* 2. VIRTUAL ADOPTIONS */}
                    <div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                          <Heart className="text-brand-600" size={24} /> Moje virtuálne adopcie
                        </h3>
                        
                        {user.virtualAdoptions.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {user.virtualAdoptions.map((adoption) => {
                               const pet = pets.find(p => p.id === adoption.petId); // Use real pets
                               if (!pet) return null;
                               return (
                                 <div key={adoption.petId} className="relative bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-200 shadow-sm hover:shadow-md transition">
                                   <div className="absolute top-4 right-4">
                                       <Sparkles className="text-yellow-400 fill-yellow-400 animate-pulse" size={20} />
                                   </div>
                                   
                                   <div className="flex gap-5">
                                       <img src={pet.imageUrl} alt={pet.name} className="w-20 h-20 rounded-xl object-cover shadow-sm border border-white" />
                                       <div>
                                           <div className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-1">Virtuálny rodič</div>
                                           <h4 className="font-extrabold text-xl text-gray-900 mb-1">{pet.name}</h4>
                                           <p className="text-gray-500 text-xs">Podpora od: {new Date(adoption.startDate).toLocaleDateString()}</p>
                                       </div>
                                   </div>

                                   <div className="mt-6 pt-6 border-t border-brand-100 flex items-center justify-between">
                                       <div>
                                           <div className="text-xs text-gray-500 font-bold uppercase">Mesačný príspevok</div>
                                           <div className="text-2xl font-extrabold text-brand-600">{adoption.amount} €</div>
                                       </div>
                                       <button 
                                          onClick={() => handleEditClick(adoption.petId, pet.name, adoption.amount)} 
                                          className="p-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-brand-600 hover:text-white hover:border-brand-600 transition shadow-sm"
                                          title="Upraviť nastavenia"
                                       >
                                          <Edit2 size={18}/>
                                       </button>
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                        ) : (
                          <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Heart className="text-gray-400" size={24}/>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">Zatiaľ nikoho nepodporujete</h4>
                                <p className="text-gray-500 text-sm mb-4">Virtuálna adopcia pomáha zvieratkám, ktoré dlho čakajú na domov.</p>
                                <button onClick={() => navigate('/pets')} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition">
                                    Zobraziť zvieratá
                                </button>
                          </div>
                        )}
                    </div>

                    {/* 3. FAVORITES */}
                    <div>
                       <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                          <Heart className="text-red-500 fill-red-500" size={24} /> Uložené zvieratá
                       </h3>
                       
                       {favoritePets.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favoritePets.map(pet => (
                               <Link key={pet.id} to={`/pets/${pet.id}`} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition">
                                  <div className="relative h-48 overflow-hidden bg-gray-100">
                                      <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                      <div className="absolute bottom-4 left-4 text-white">
                                          <div className="font-bold text-lg">{pet.name}</div>
                                          <div className="text-xs font-medium opacity-90">{pet.location}</div>
                                      </div>
                                      
                                      <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(pet.id); }} 
                                        className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                  </div>
                                  <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                                      <span className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${pet.adoptionStatus === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                          {pet.adoptionStatus === 'Available' ? 'Na adopciu' : pet.adoptionStatus}
                                      </span>
                                      <span className="flex-shrink-0 whitespace-nowrap text-xs font-extrabold text-brand-600 group-hover:text-brand-700 transition-colors flex items-center gap-1">
                                          Zobraziť detail <ChevronRight size={14} />
                                      </span>
                                  </div>
                               </Link>
                            ))}
                         </div>
                       ) : (
                         <div className="p-6 bg-gray-50 rounded-2xl text-center text-gray-500 text-sm border-2 border-dashed border-gray-200">
                             Nemáte žiadne uložené inzeráty.
                         </div>
                       )}
                    </div>

                  </div>
                )}

                {/* TAB: SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <h2 className="text-xl font-bold text-gray-900">Nastavenia účtu</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                         <div className="flex items-center gap-3">
                            <Bell className="text-gray-600" />
                            <div>
                               <div className="font-bold text-gray-900">Upozornenia na nové zvieratá</div>
                               <div className="text-xs text-gray-500">Dostávať email keď pribudne zviera podľa mojich preferencií.</div>
                            </div>
                         </div>
                         <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                         <div className="flex items-center gap-3">
                            <Lock className="text-gray-600" />
                            <div>
                               <div className="font-bold text-gray-900">Súkromie profilu</div>
                               <div className="text-xs text-gray-500">Môj profil vidia iba útulky, ktoré kontaktujem.</div>
                            </div>
                         </div>
                         <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

             </div>
          </div>

        </div>
      </div>

      {/* Redesigned Chat Modal for Users */}
      {chatInquiry && (() => {
          const statusVis = getStatusVisuals(chatInquiry.status);
          const StatusIcon = statusVis.icon;
          const chatPet = pets.find(p => p.id === chatInquiry.petId);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center flex-shrink-0">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Detail žiadosti</h3>
                            <p className="text-xs text-gray-500">ID: {chatInquiry.id}</p>
                        </div>
                        <button onClick={() => setChatInquiry(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition text-gray-500"><X size={20}/></button>
                    </div>

                    <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
                        {/* Left Column: Context Info */}
                        <div className="lg:col-span-1 bg-gray-50 overflow-y-auto p-6 space-y-6 border-r border-gray-100">
                            
                            {/* Status Card */}
                            <div className={`${statusVis.color} rounded-2xl p-5 text-white shadow-lg shadow-gray-200`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/20 rounded-full"><StatusIcon size={24} /></div>
                                    <div className="font-bold text-lg">{statusVis.label}</div>
                                </div>
                                <p className="text-white/90 text-sm leading-relaxed">{statusVis.text}</p>
                            </div>

                            {/* Pet Context */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <Dog size={16} className="text-brand-600"/> O koho ide?
                                </h4>
                                <div className="flex items-center gap-4">
                                    {chatPet?.imageUrl ? (
                                        <img src={chatPet.imageUrl} alt={chatPet.name} className="w-16 h-16 rounded-xl object-cover bg-gray-200" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300"><Dog size={24}/></div>
                                    )}
                                    <div>
                                        <div className="font-bold text-lg text-gray-900">{chatInquiry.petName}</div>
                                        {chatPet && <div className="text-xs text-gray-500">{chatPet.breed} • {chatPet.age}r</div>}
                                    </div>
                                </div>
                                <Link to={`/pets/${chatInquiry.petId}`} className="mt-4 block text-center w-full py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-brand-100 transition">
                                    Zobraziť inzerát
                                </Link>
                            </div>

                            {/* Shelter Info */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <Building2 size={16} className="text-blue-600"/> Komunikujete s
                                </h4>
                                <div className="text-sm text-gray-900 font-bold text-lg mb-1">
                                    {chatShelterName || <Loader2 className="animate-spin inline" size={14}/>}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    Útulok spravujúci tento inzerát.
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Info size={12}/> Odpoveď zvyčajne do 24 hod.
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Chat */}
                        <div className="lg:col-span-2 flex flex-col h-full bg-white relative">
                            <ChatWindow 
                                inquiryId={chatInquiry.id} 
                                currentUser={currentUser} 
                                className="h-full border-none rounded-none"
                                initialMessage={{
                                    content: chatInquiry.message,
                                    date: chatInquiry.date,
                                    senderId: currentUser.id 
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
          );
      })()}

      {/* Edit Adoption Modal */}
      {editingAdoption && (
        <EditAdoptionModal 
          petName={editingAdoption.petName}
          currentAmount={editingAdoption.amount}
          onSave={handleSaveEdit}
          onClose={() => setEditingAdoption(null)}
          onStopAdoption={handleStopAdoption}
        />
      )}

      {/* Edit Preferences Modal */}
      {isEditingPreferences && (
          <EditPreferencesModal 
            preferences={user.preferences}
            onSave={(newPrefs) => updateUserProfile({ preferences: newPrefs })}
            onClose={() => setIsEditingPreferences(false)}
          />
      )}

      {/* Edit Household Modal */}
      {isEditingHousehold && (
        <EditHouseholdModal 
          user={user}
          onSave={(data) => updateUserProfile(data)}
          onClose={() => setIsEditingHousehold(false)}
        />
      )}

      {/* Edit Availability Modal */}
      {isEditingAvailability && (
        <EditAvailabilityModal 
          user={user}
          onSave={(data) => updateUserProfile(data)}
          onClose={() => setIsEditingAvailability(false)}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
