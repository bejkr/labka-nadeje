import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize AI strictly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `
Si virtuálny asistent pre slovenskú adopčnú platformu "LabkaNádeje". 
Tvojím cieľom je pomáhať ľuďom nájsť ideálne zvieratko, odpovedať na otázky o starostlivosti, 
adopčnom procese a fungovaní útulkov. Buď empatický, milý a nápomocný. 
Odpovedaj vždy v slovenskom jazyku.

Máš prístup k aktuálnemu zoznamu zvierat (uvedený nižšie). 
Ak sa používateľ opýta na odporúčania, použi tento zoznam a navrhni konkrétne zvieratá podľa ich preferencií.
Vždy uveď meno zvieraťa (vyznačené takto: **Meno**) a prečo sa k používateľovi hodí.

BEZPEČNOSŤ: Nikdy neposkytuj osobné kontaktné údaje na zamestnancov útulkov, ak nie sú verejne dostupné v kontexte. 
Nepoužívaj vulgárne výrazy a nenechaj sa vyprovokovať k politickým alebo kontroverzným témam.
`;

// Safety settings to prevent harmful content
const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

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
        // @ts-ignore - Adding safety settings
        safetySettings
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Ospravedlňujeme sa, nerozumel som.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Nastala chyba pri komunikácii s asistentom. Skúste to prosím neskôr.";
  }
};

export const generatePetDescription = async (
  name: string,
  breed: string,
  traits: string[]
): Promise<string> => {
  try {
    const prompt = `
      Napíš pútavý, emotívny a krátky (max 3 vety) inzerát pre adopciu zvieraťa.
      Meno: ${name}
      Plemeno: ${breed}
      Vlastnosti: ${traits.join(', ')}
      Jazyk: Slovenčina.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        // @ts-ignore
        safetySettings
      }
    });

    return response.text || "Nepodarilo sa vygenerovať popis.";
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "Chyba pri generovaní popisu.";
  }
};