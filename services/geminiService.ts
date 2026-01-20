// @ts-ignore
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateHRMaterials = async (data: any) => {
  // A Vercel Settings-ben megadott kulcsot keressük
  const apiKey = data.customApiKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) throw new Error("API Key is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate HR materials for ${data.position} at ${data.company}. 
                  Return JSON with: subject, emailTemplate, coverLetter, salaryNote, cvAnalysisReport, skillAlignment.`;

  // Egyszerűsített hívás a biztonság kedvéért
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Megkeressük a JSON részt, ha az AI szöveget is írna köré
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
};