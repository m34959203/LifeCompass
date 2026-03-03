import { Message } from '../types';
import { GoogleGenAI } from '@google/genai';

let currentSessionId: string | null = null;
let cachedApiKey: string | null = null;

/** Get API key for client-side Gemini Live API */
export const getLiveApiKey = async (): Promise<{ apiKey: string } | null> => {
  try {
    const res = await fetch('/api/live-config');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

/** Check if the Gemini API is configured on the server */
export const isApiConfigured = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    return data.configured;
  } catch {
    return false;
  }
};

/**
 * Starts a new chat session via server proxy
 */
export const startChatSession = async (_modelName: string, systemInstruction: string) => {
  const res = await fetch('/api/chat/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to start chat session');
  }

  const data = await res.json();
  currentSessionId = data.sessionId;
  return data;
};

/**
 * Sends a user message to the active session via server proxy
 */
export const sendMessageToAI = async (text: string): Promise<string> => {
  if (!currentSessionId) {
    throw new Error('Chat session not initialized');
  }

  try {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, text }),
    });

    if (!res.ok) throw new Error('Failed to send message');

    const data = await res.json();
    return data.text;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    return 'Извините, произошла ошибка связи с сервером. Попробуйте еще раз.';
  }
};

/**
 * Voice message: sends text to AI and gets text + audio response
 */
export const sendVoiceMessageToAI = async (text: string): Promise<{
  text: string;
  audio: string | null;
  audioMimeType: string | null;
}> => {
  if (!currentSessionId) {
    throw new Error('Chat session not initialized');
  }

  try {
    const res = await fetch('/api/chat/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, text }),
    });

    if (!res.ok) throw new Error('Failed to send voice message');

    return await res.json();
  } catch (error) {
    console.error('Error sending voice message:', error);
    return {
      text: 'Извините, произошла ошибка связи с сервером. Попробуйте еще раз.',
      audio: null,
      audioMimeType: null,
    };
  }
};

/**
 * Text-to-speech: sends text and gets back audio
 */
export const textToSpeech = async (text: string): Promise<{
  audio: string | null;
  mimeType: string;
}> => {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error('TTS request failed');

    const data = await res.json();
    return {
      audio: data.audio || null,
      mimeType: data.mimeType || 'audio/wav',
    };
  } catch (error) {
    console.error('TTS error:', error);
    return { audio: null, mimeType: 'audio/wav' };
  }
};

/**
 * Client-side fallback for quiz analysis
 */
async function analyzeQuizClientSide(
  assessmentTitle: string,
  scores: Record<string, number>
): Promise<{
  archetype: string;
  summary: string;
  careers: string[];
  strengths: string[];
}> {
  if (!cachedApiKey) {
    const config = await getLiveApiKey();
    if (config?.apiKey) cachedApiKey = config.apiKey;
  }
  if (!cachedApiKey) throw new Error('No API key available');

  const ai = new GoogleGenAI({ apiKey: cachedApiKey });
  const prompt = `
    Analyze the following ${assessmentTitle} results (0-100 scale per category):
    ${JSON.stringify(scores)}

    Task:
    1. Identify the dominant personality archetype.
    2. Write a detailed psychological summary (addressing the user as "Вы") with specific observations.
    3. Suggest 3 specific career paths/roles.
    4. List 3 key strengths.

    Language: Russian.
    Return valid JSON with keys: archetype (string), summary (string), careers (array of strings), strengths (array of strings).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  if (response.text) return JSON.parse(response.text);
  throw new Error('Empty response');
}

/**
 * Generates a structured analysis report based on quiz scores.
 * Tries server-side first, falls back to client-side.
 */
export const generateQuizAnalysis = async (
  assessmentTitle: string,
  scores: Record<string, number>
): Promise<{
  archetype: string;
  summary: string;
  careers: string[];
  strengths: string[];
}> => {
  try {
    const res = await fetch('/api/analyze/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentTitle, scores }),
    });
    const data = await res.json();

    if (data.archetype === 'API не настроен') {
      throw new Error('Server AI unavailable');
    }
    return data;
  } catch {
    try {
      return await analyzeQuizClientSide(assessmentTitle, scores);
    } catch (clientError) {
      console.error('Quiz analysis failed:', clientError);
      return {
        archetype: 'Анализ недоступен',
        summary: 'Не удалось сгенерировать описание. Проверьте подключение к интернету.',
        careers: ['-', '-', '-'],
        strengths: ['-', '-'],
      };
    }
  }
};

/**
 * Build analysis prompt for chat transcripts
 */
function buildChatAnalysisPrompt(assessmentTitle: string, messages: Message[]): string {
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'AI Mentor'}: ${m.text}`)
    .join('\n');

  return `
Analyze the following conversation transcript for the assessment: "${assessmentTitle}".

TRANSCRIPT:
${transcript}

Task:
1. Evaluate the User's responses thoroughly.
2. Estimate scores (0-100) for 5-6 relevant traits/categories based on the assessment type.
3. Identify the dominant archetype or profile type.
4. Write a detailed professional summary (addressing the user as "Вы"), including:
   - Specific observations from the conversation
   - Current state/level assessment with concrete indicators
   - Personalized recommendations (at least 3 specific techniques or actions)
5. Suggest 3 specific career paths or development directions.
6. List 3 key strengths identified from the conversation.

IMPORTANT: The summary must contain concrete, specific feedback based on what the user actually said. Avoid generic advice. If this is a stress/burnout assessment, clearly state the estimated stress level (low/moderate/high/critical) and specific burnout indicators found.

Note: The transcript may contain speech recognition artifacts or incomplete words — interpret the meaning from context.

Respond in Russian. Return valid JSON with keys: scores (object), archetype (string), summary (string), careers (array of strings), strengths (array of strings).
  `;
}

/**
 * Client-side fallback: analyze chat directly via Gemini API
 */
async function analyzeClientSide(
  assessmentTitle: string,
  messages: Message[]
): Promise<{
  scores: Record<string, number>;
  archetype: string;
  summary: string;
  careers: string[];
  strengths: string[];
}> {
  if (!cachedApiKey) {
    const config = await getLiveApiKey();
    if (config?.apiKey) cachedApiKey = config.apiKey;
  }

  if (!cachedApiKey) {
    throw new Error('No API key available');
  }

  const ai = new GoogleGenAI({ apiKey: cachedApiKey });
  const prompt = buildChatAnalysisPrompt(assessmentTitle, messages);

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error('Empty response from AI');
}

/**
 * Generates a structured analysis report AND estimated scores based on Chat History.
 * Tries server-side first, falls back to client-side if server AI is unavailable.
 */
export const generateChatAnalysis = async (
  assessmentTitle: string,
  messages: Message[]
): Promise<{
  scores: Record<string, number>;
  archetype: string;
  summary: string;
  careers: string[];
  strengths: string[];
}> => {
  // Try server-side first
  try {
    const res = await fetch('/api/analyze/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentTitle, messages }),
    });
    const data = await res.json();

    // Check if server returned the "not configured" fallback
    if (data.archetype === 'API не настроен' || data.archetype === 'Данные не обработаны') {
      throw new Error('Server AI unavailable, trying client-side');
    }

    return data;
  } catch {
    // Fallback: analyze client-side
    try {
      return await analyzeClientSide(assessmentTitle, messages);
    } catch (clientError) {
      console.error('Client-side chat analysis also failed:', clientError);
      return {
        scores: { 'Участие': 100, 'Полнота': 50 },
        archetype: 'Анализ недоступен',
        summary: 'Не удалось проанализировать диалог. Проверьте подключение к интернету.',
        careers: [],
        strengths: [],
      };
    }
  }
};
