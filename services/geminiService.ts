import { GoogleGenAI, Type } from "@google/genai";
import { Message } from '../types';

// Initialize the SDK
// API KEY is strictly from process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: any = null;

/**
 * Starts a new chat session with a specific persona (System Instruction)
 */
export const startChatSession = async (modelName: string, systemInstruction: string) => {
  try {
    const modelId = 'gemini-3-flash-preview';

    chatSession = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: []
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
 * Generates a structured analysis report based on quiz scores (Quantitative Input)
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
                    archetype: { type: Type.STRING, description: "Short title of the personality type" },
                    summary: { type: Type.STRING, description: "2-3 sentences description" },
                    careers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 job titles" },
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
          summary: "Не удалось сгенерировать описание.",
          careers: ["-", "-", "-"],
          strengths: ["-", "-"]
      };
  }
};

/**
 * Generates a structured analysis report AND estimated scores based on Chat History (Qualitative Input)
 */
export const generateChatAnalysis = async (assessmentTitle: string, messages: Message[]): Promise<{
    scores: Record<string, number>;
    archetype: string;
    summary: string;
    careers: string[];
    strengths: string[];
}> => {
  try {
    const transcript = messages
        .map(m => `${m.role === 'user' ? 'User' : 'AI Mentor'}: ${m.text}`)
        .join('\n');

    const prompt = `
      Analyze the following conversation transcript for the assessment: "${assessmentTitle}".

      TRANSCRIPT:
      ${transcript}

      Task:
      1. Evaluate the User's responses.
      2. Estimate scores (0-100) for 5-6 relevant traits/categories based on the assessment type (e.g., for Soft Skills: Communication, Leadership, Empathy, Adaptability, Problem Solving).
      3. Identify the dominant archetype.
      4. Write a professional summary (addressing the user as "Вы").
      5. Suggest 3 career paths.
      6. List 2 key strengths.

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
                    scores: {
                        type: Type.OBJECT,
                        description: "Key-value pairs of estimated traits and scores (0-100). Example: {'Communication': 85, 'Empathy': 70}",
                        properties: {},
                    },
                    archetype: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    careers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
      console.error("Chat analysis failed:", error);
      return {
          scores: { "Participation": 100, "Completeness": 50 },
          archetype: "Данные не обработаны",
          summary: "Произошла ошибка при анализе диалога.",
          careers: [],
          strengths: []
      };
  }
};
