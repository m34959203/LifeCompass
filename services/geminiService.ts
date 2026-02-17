import { GoogleGenAI, Type } from "@google/genai";

// Initialize the SDK
// API KEY is strictly from process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: any = null;

/**
 * Starts a new chat session with a specific persona (System Instruction)
 */
export const startChatSession = async (modelName: string, systemInstruction: string) => {
  try {
    // Determine model based on complexity, strictly adhering to guidelines
    // Using 'gemini-3-flash-preview' for responsive chat interaction
    const modelId = 'gemini-3-flash-preview'; 

    chatSession = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly creative/friendly
      },
      history: [] // Start fresh
    });
    
    return chatSession;
  } catch (error) {
    console.error("Failed to start chat session:", error);
    throw error;
  }
};

/**
 * Sends a user message to the active session and gets the response
 */
export const sendMessageToAI = async (text: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({
      message: text
    });
    
    return result.text;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return "Извините, произошла ошибка связи с сервером. Попробуйте еще раз.";
  }
};

/**
 * Generates a structured analysis report based on quiz scores
 */
export const generateQuizAnalysis = async (assessmentTitle: string, scores: Record<string, number>): Promise<{
    archetype: string;
    summary: string;
    careers: string[];
    strengths: string[];
}> => {
  try {
    const prompt = `
      Analyze the following ${assessmentTitle} results (0-100 scale per category):
      ${JSON.stringify(scores)}
      
      Task:
      1. Identify the dominant personality archetype.
      2. Write a psychological summary (addressing the user as "Вы").
      3. Suggest 3 specific career paths/roles.
      4. List 2 key strengths.

      Language: Russian.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    archetype: { type: Type.STRING, description: "Short title of the personality type, e.g. 'Creative Thinker'" },
                    summary: { type: Type.STRING, description: "2-3 sentences description of personality" },
                    careers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 recommended job titles" },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2 key strengths" }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
      console.error("Analysis generation failed:", error);
      return {
          archetype: "Анализ недоступен",
          summary: "Не удалось сгенерировать описание. Попробуйте обновить страницу.",
          careers: ["-", "-", "-"],
          strengths: ["-", "-"]
      };
  }
};

