import { GoogleGenAI, Type } from "@google/genai";

export const generateHRMaterials = async (data: any) => {
  // Az API kulcsot kizárólag a process.env.API_KEY változóból nyerjük ki az előírások szerint.
  const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
  
  const systemInstruction = `Te egy 2026-os szintű Senior HR Technológus és ATS Optimalizálási Szakértő vagy. 
Az a feladatod, hogy a megadott adatok alapján generálj egy professzionális pályázati csomagot.
FONTOS SZABÁLYOK:
1. A kiválasztott hangnem (${data.tone}) kötelező érvényű MINDEN dokumentumra (Email és Motivációs levél is). 
   - Ha 'Tegező', akkor közvetlen, de tisztelettudó hangnemet használj (pl. 'Szia', 'Üdvözöllek', tegeződés).
   - Ha 'Magázó', akkor formális hangnemet használj (pl. 'Tisztelt Hölgyem/Uram', 'Ön', magázódás).
   - Ha 'Üzleties', akkor tömör, eredményorientált, de udvarias hangnemet használj.
2. A stílus (${data.style}) határozza meg a tartalom fókuszát.
3. A kimenetnek JSON formátumúnak kell lennie a megadott sémával.
4. A szövegben a kiemeléseket **szöveg** formátumban készítsd el, hogy a rendszer vastagítva tudja megjeleníteni.`;

  const prompt = `
POZÍCIÓ: ${data.position}
CÉG: ${data.company}
BÉRIGÉNY: ${data.salary || 'Nincs megadva'}
HIRDETÉS SZÖVEGE: ${data.jdData}
PÁLYÁZÓ ADATAI: ${data.cvData || (data.cvFile ? 'Feltöltött CV fájl alapján elemezz' : 'Nincs adat')}
AI KÉSZSÉGEK (1-5 skálán): ${JSON.stringify(data.aiSkills)}

Generálj:
- Egy figyelemfelkeltő email tárgyat.
- Egy email sablont a kiválasztott ${data.tone} hangnemben.
- Egy motivációs levelet a kiválasztott ${data.tone} hangnemben. FONTOS: Ha a hangnem 'Tegező', a motivációs levélben is tegeződj!
- Egy rövid megjegyzést a bérigényhez.
- Egy rövid elemzést a CV-ről (mi hiányzik, mit érdemes javítani).
- Egy készség-illeszkedési listát (min 3 készség, 0-100% pontszámmal).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          emailTemplate: { type: Type.STRING },
          coverLetter: { type: Type.STRING },
          salaryNote: { type: Type.STRING },
          cvAnalysisReport: { type: Type.STRING },
          skillAlignment: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["label", "score"]
            }
          }
        },
        required: ["subject", "emailTemplate", "coverLetter", "salaryNote", "cvAnalysisReport", "skillAlignment"]
      }
    }
  });

  return JSON.parse(response.text);
};