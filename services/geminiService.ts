import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // In a real app, strict handling needed
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeCropDisease = async (base64Image: string, lang: string) => {
  try {
    const prompt = lang === 'mr' 
      ? "हे पीक ओळखा. या पिकाला कोणता रोग झाला आहे का ते तपासा. जर रोग असेल, तर त्याचे नाव, कारण आणि सोपे घरगुती व औषधी उपाय सांगा. उत्तर मराठीत द्या. उत्तर structure: 'रोग:', 'कारण:', 'उपाय:', 'औषध:'"
      : "Identify this crop. Check if it has any disease. If yes, tell disease name, cause, and organic/chemical remedies. Answer in Hindi or English based on request. Structure: 'Disease:', 'Cause:', 'Remedy:', 'Medicine:'";

    // Removing the prefix if present for the API call data
    const base64Data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return lang === 'mr' ? "तपासणीत त्रुटी आली. पुन्हा प्रयत्न करा." : "Error in analysis. Try again.";
  }
};

export const getAIFarmingAdvice = async (query: string, lang: string, cropContext: string) => {
  try {
    const systemInstruction = `You are 'AI Krushi Mitra', a helpful agricultural expert for Indian farmers. 
    Context: The farmer is growing ${cropContext}. 
    Answer simply, without jargon. 
    If the language code is 'mr', answer in Marathi. 
    If 'hi', answer in Hindi. 
    If 'en', answer in English. 
    Keep answers concise (under 100 words) as it is spoken out.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return lang === 'mr' ? "क्षमस्व, मी आता उत्तर देऊ शकत नाही." : "Sorry, I cannot answer right now.";
  }
};

export const getSoilAdvice = async (npk: {n: number, p: number, k: number}, crop: string, lang: string) => {
    try {
        const prompt = `Soil NPK values are N:${npk.n}, P:${npk.p}, K:${npk.k}. Crop is ${crop}. 
        Provide fertilizer recommendation in ${lang === 'mr' ? 'Marathi' : 'English'}. 
        Format as list of fertilizers and kg per acre.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (e) {
        return "Error fetching advice.";
    }
}