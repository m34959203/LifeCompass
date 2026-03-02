import { Message } from '../types';

let currentSessionId: string | null = null;

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
 * Generates a structured analysis report based on quiz scores
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
    return await res.json();
  } catch (error) {
    console.error('Analysis generation failed:', error);
    return {
      archetype: 'Анализ недоступен',
      summary: 'Не удалось сгенерировать описание. Проверьте подключение к интернету.',
      careers: ['-', '-', '-'],
      strengths: ['-', '-'],
    };
  }
};

/**
 * Generates a structured analysis report AND estimated scores based on Chat History
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
  try {
    const res = await fetch('/api/analyze/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentTitle, messages }),
    });
    return await res.json();
  } catch (error) {
    console.error('Chat analysis failed:', error);
    return {
      scores: { Participation: 100, Completeness: 50 },
      archetype: 'Данные не обработаны',
      summary: 'Произошла ошибка при анализе диалога. Проверьте подключение к интернету.',
      careers: [],
      strengths: [],
    };
  }
};
