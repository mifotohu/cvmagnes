// @ts-ignore
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ApplicationData, GenerationResult } from "../types";

export const generateHRMaterials = async (data: ApplicationData & { customApiKey?: string }): Promise<GenerationResult> => {
  // VITE_ prefixszel kérjük le a kulcsot a Vercelről
  const apiKeyToUse = data.customApiKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKeyToUse) {
    throw new Error("Hiányzó API kulcs! Kérlek add meg a beállításokban.");
  }

  const genAI = new GoogleGenerativeAI(apiKeyToUse);
  // A legújabb stabil modell használata
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Vagy "gemini-1.5-pro", ha azt preferálod
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const promptText = `
    SZEREPKÖR:
    Te egy 2026-os szintű Senior HR Technológus és ATS Optimalizálási Szakértő vagy. 
    Feladatod olyan pályázati anyagok írása magyar nyelven.

    BEMENETI PARAMÉTEREK:
    - JD_DATA: ${data.jdData}
    - COMPANY: ${data.company}
    - POSITION: ${data.position}
    - SALARY: ${data.salary || 'Nincs megadva'}
    - TONE: ${data.tone}

    Válaszolj szigorúan JSON formátumban, az alábbi kulcsokkal:
    subject, emailTemplate, coverLetter, salaryNote, cvAnalysisReport, skillAlignment (tömb label és score mezőkkel).
  `;

  const contents: any[] = [{ text: promptText }];

  if (data.cvFile) {
    contents.push({
      inlineData: {
        data: data.cvFile.base64.split(',')[1] || data.cvFile.base64, // Levágjuk a data:image... részt ha ott van
        mimeType: data.cvFile.mimeType
      }
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts: contents }],
  });

  const response = await result.response;
  const text = response.text();
  
  if (!text) throw new Error("Üres válasz érkezett az AI-tól.");
  
  return JSON.parse(text) as GenerationResult;
};