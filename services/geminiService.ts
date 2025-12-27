import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Pet, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `
Si Labka asistent pre slovenskú adopčnú platformu "LabkaNádeje". 
Tvojím cieľom je pomáhať ľuďom nájsť ideálne zvieratko. 
Si expert na etológiu zvierat a psychológiu majiteľov.
Odpovedaj vždy v slovenskom jazyku, empaticky a profesionálne.
`;

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[],
  petsContext: string = ''
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `${BASE_SYSTEM_INSTRUCTION}\n\nAKTUÁLNY ZOZNAM ZVIERAT NA ADOPCIU:\n${petsContext}`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });
    const result = await chat.sendMessage({ message });
    return result.text || "Ospravedlňujeme sa, nerozumel som.";
  } catch (error) {
    return "Nastala chyba pri komunikácii.";
  }
};

export const getMatchAnalysis = async (pet: Pet, user: User): Promise<{ score: number, reason: string }> => {
  try {
    const prompt = `
      Analyzuj zhodu (Match) medzi človekom a zvieratkom pre funkciu "Labka zhoda".
      
      ZVIERA (${pet.name}):
      - Plemeno: ${pet.breed}, Druh: ${pet.type}, Veľkosť: ${pet.size}
      - Aktivita: ${pet.requirements.activityLevel}, Samota: ${pet.training.aloneTime ? 'Áno' : 'Nie'}
      - Sociálne: Deti (${pet.social.children}), Psi (${pet.social.dogs})

      ČLOVEK (Preferencie):
      - Chce plemená: ${user.preferences?.preferredBreeds?.join(', ') || 'Akékoľvek'}
      - Životný štýl (Aktivita): ${user.preferences?.activityLevel || 'Stredná'}
      - Bývanie: ${user.household?.housingType || 'Neuvedené'}
      - Domácnosť: Deti (${user.household?.hasChildren ? 'Áno' : 'Nie'}), Zvieratá (${user.household?.hasOtherPets ? 'Áno' : 'Nie'})
      - Hľadaná povaha: ${user.preferences?.temperament?.join(', ') || 'Akékoľvek'}

      KRITÉRIÁ SKÓRE:
      1. Ak plemeno psa sedí s "Chce plemená", daj +20 bodov.
      2. Ak je človek "Gaučák" a pes má "Vysokú aktivitu", daj -30 bodov.
      3. Ak má človek deti a pes je "Nevhodný k deťom", daj -50 bodov.
      4. Ak býva v byte a pes je veľký a neznáša samotu, daj -20 bodov.

      Vráť JSON:
      {
        "score": number (0-100),
        "reason": "Krátke slovenské zdôvodnenie Labka zhody (max 180 znakov)."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{"score": 0, "reason": "Chýbajúce dáta pre výpočet Labka zhody."}');
  } catch (error) {
    return { score: 50, reason: "Na výpočet presnej Labka zhody potrebujeme viac údajov o vašich preferenciách." };
  }
};

export const generatePetDescription = async (name: string, breed: string, traits: string[]): Promise<string> => {
  try {
    const prompt = `Si Labka asistent. Napíš pútavý inzerát pre ${name} (${breed}). Vlastnosti: ${traits.join(', ')}. Max 3 vety, slovensky.`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "";
  } catch (error) { return ""; }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const prompt = `Prelož nasledujúci text o zvieratku z útulku do jazyka: ${targetLanguage}.
    Zachovaj emotívny a milý tón. Zachovaj formátovanie (nové riadky).
    
    TEXT:
    ${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    return response.text || text;
  } catch (error) {
    console.error("Translation failed", error);
    return text; // Fallback to original text
  }
};