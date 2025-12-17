
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from '../contexts/PetContext';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { adoptVirtually } = useAuth();
  const { getPet } = usePets();
  
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');

  const petId = searchParams.get('petId');
  const amount = searchParams.get('amount');
  const session_id = searchParams.get('session_id'); // From Stripe

  useEffect(() => {
    const processAdoption = async () => {
      if (!petId || !amount) {
        setError('Chýbajúce údaje o platbe.');
        setProcessing(false);
        return;
      }

      // Simulácia overenia platby na backende
      // V realite by tu backend overil 'session_id' voči Stripe API
      setTimeout(async () => {
        try {
          await adoptVirtually(petId, parseFloat(amount));
          setProcessing(false);
        } catch (e) {
          setError('Nepodarilo sa zaznamenať adopciu do systému.');
          setProcessing(false);
        }
      }, 1500);
    };

    processAdoption();
  }, [petId, amount, adoptVirtually]);

  const pet = petId ? getPet(petId) : null;

  if (processing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 size={48} className="text-brand-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Spracovávame vašu platbu...</h2>
        <p className="text-gray-500">Prosím, nezatvárajte okno.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
          <Heart size={32} className="fill-current" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ups, niečo sa pokazilo</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <Link to="/" className="text-brand-600 font-bold hover:underline">Späť na domov</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Ďakujeme! ❤️</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Vaša virtuálna adopcia pre <strong>{pet?.name || 'zvieratko'}</strong> bola úspešná. 
          Vďaka vášmu príspevku <strong>{amount} €</strong> bude mať plné bruško a lepšiu starostlivosť.
        </p>

        <div className="bg-brand-50 rounded-xl p-6 mb-8 border border-brand-100">
           <h3 className="font-bold text-brand-800 mb-2">Čo teraz?</h3>
           <ul className="text-sm text-brand-700 space-y-2 text-left">
             <li className="flex gap-2"><CheckCircle size={16}/> Adopcia bola pridaná do vášho profilu.</li>
             <li className="flex gap-2"><CheckCircle size={16}/> Potvrdenie o platbe vám príde emailom.</li>
             <li className="flex gap-2"><CheckCircle size={16}/> Adopciu môžete kedykoľvek zrušiť v profile.</li>
           </ul>
        </div>

        <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/profile')} 
              className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-200"
            >
              Prejsť do môjho profilu
            </button>
            <Link to="/pets" className="text-gray-500 font-medium hover:text-gray-900 py-2">
              Späť na zoznam zvierat
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
