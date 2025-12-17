import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize AI strictly as per guidelines
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `
Si virtuálny asistent pre slovenskú adopčnú platformu "LabkaNádeje". 
Tvojím cieľom je pomáhať ľuďom nájsť ideálne zvieratko, odpovedať na otázky o starostlivosti, 
adopčnom procese a fungovaní útulkov. Buď empatický, milý a nápomocný. 
Odpovedaj vždy v slovenskom jazyku.

Máš prístup k aktuálnemu zoznamu zvierat (uvedený nižšie). 
Ak sa používateľ opýta na odporúčania, použi tento zoznam a navrhni konkrétne zvieratá podľa ich preferencií.
Vždy uveď meno zvieraťa (vyznačené takto: **Meno**) a prečo sa k používateľovi hodí.
`;

export const sendChatMessage = async (
  message: string, 
  history: ChatMessage[],
  petsContext: string = ''
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        // Append current pet data to the system instruction so the AI "knows" the database
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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nepodarilo sa vygenerovať popis.";
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "Chyba pri generovaní popisu.";
  }
};