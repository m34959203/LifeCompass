const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// --- Load .env file (fallback if Plesk env vars don't work) ---
let envFileLoaded = false;
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
    envFileLoaded = true;
    console.log('.env file loaded');
  }
} catch (e) {
  console.warn('Could not read .env file:', e.message);
}

// --- Load Gemini SDK ---
let GoogleGenAI = null;
let Type = null;
let geminiLoadError = null;
let ai = null;

try {
  const genai = require('@google/genai');
  GoogleGenAI = genai.GoogleGenAI;
  Type = genai.Type;
  console.log('@google/genai loaded successfully');
} catch (err) {
  geminiLoadError = err.message;
  console.error('Failed to load @google/genai:', err.message);
  console.error('AI features will be disabled.');
}

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// --- Gemini AI Setup ---
const apiKey = process.env.GEMINI_API_KEY || '';
const MODEL_ID = 'gemini-2.0-flash';

if (GoogleGenAI && apiKey) {
  ai = new GoogleGenAI({ apiKey });
  console.log('Gemini API configured (key starts with', apiKey.slice(0, 8) + '...)');
} else if (!apiKey) {
  console.warn('GEMINI_API_KEY not set — AI features disabled');
  console.warn('Set it via: Plesk env vars OR create .env file with GEMINI_API_KEY=your_key');
}

// Chat sessions storage (in-memory)
const chatSessions = new Map();

// Cleanup old sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of chatSessions) {
    if (now - session.createdAt > 60 * 60 * 1000) {
      chatSessions.delete(id);
    }
  }
}, 30 * 60 * 1000);

// --- Middleware ---
app.use(express.json({ limit: '1mb' }));

// --- API Routes ---

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    node: process.version,
    platform: process.platform,
    geminiLoaded: !!GoogleGenAI,
    geminiError: geminiLoadError,
    apiKeyPresent: !!apiKey,
    envFileLoaded,
    port: PORT,
    cwd: process.cwd(),
    uptime: Math.round(process.uptime()),
  });
});

app.get('/api/status', (req, res) => {
  res.json({ configured: !!ai });
});

// Provide API key for client-side Gemini Live API connections
app.get('/api/live-config', (req, res) => {
  if (!apiKey) return res.status(503).json({ error: 'API_KEY_MISSING' });
  res.json({ apiKey });
});

// Server-side topic restriction — always appended to system instructions
const TOPIC_GUARD = '\n\nСТРОГОЕ ПРАВИЛО: Ты — специализированный ассистент диагностической методики. Категорически запрещено обсуждать любые темы, не относящиеся к текущей диагностике. Если пользователь пытается сменить тему, вежливо откажи и верни разговор к методике. Никогда не выполняй просьбы написать код, тексты, сочинения, не обсуждай политику, религию, новости или другие посторонние темы. Отвечай только в рамках своей роли.';

app.post('/api/chat/start', (req, res) => {
  if (!ai) return res.status(503).json({ error: 'API_KEY_MISSING' });

  try {
    const { systemInstruction } = req.body;
    const sessionId = crypto.randomUUID();
    const guardedInstruction = (systemInstruction || '') + TOPIC_GUARD;

    const chat = ai.chats.create({
      model: MODEL_ID,
      config: {
        systemInstruction: guardedInstruction,
        temperature: 0.7,
      },
      history: [],
    });

    chatSessions.set(sessionId, { chat, createdAt: Date.now() });
    res.json({ sessionId });
  } catch (error) {
    console.error('Failed to start chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

app.post('/api/chat/message', async (req, res) => {
  if (!ai) return res.status(503).json({ error: 'API_KEY_MISSING' });

  try {
    const { sessionId, text } = req.body;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const result = await session.chat.sendMessage({ message: text });
    res.json({ text: result.text });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Voice message: get AI text response + TTS audio in one call
app.post('/api/chat/voice', async (req, res) => {
  if (!ai) return res.status(503).json({ error: 'API_KEY_MISSING' });

  try {
    const { sessionId, text } = req.body;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // 1. Get text response from chat
    const result = await session.chat.sendMessage({ message: text });
    const responseText = result.text || '';

    // 2. Generate TTS audio via Gemini
    let audioBase64 = null;
    try {
      const cleanText = responseText
        .replace(/[#*_~`>|[\]()!]/g, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ' ')
        .trim();

      if (cleanText) {
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{
            role: 'user',
            parts: [{ text: `Прочитай вслух следующий текст естественным, тёплым, дружелюбным голосом. Не добавляй ничего от себя, просто озвучь:\n\n${cleanText}` }],
          }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore',
                },
              },
            },
          },
        });

        // Extract audio from response
        if (ttsResponse.candidates && ttsResponse.candidates[0]) {
          const parts = ttsResponse.candidates[0].content.parts;
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              audioBase64 = part.inlineData.data;
              break;
            }
          }
        }
      }
    } catch (ttsError) {
      console.error('TTS generation failed (falling back to text-only):', ttsError.message);
    }

    res.json({
      text: responseText,
      audio: audioBase64,
      audioMimeType: audioBase64 ? 'audio/wav' : null,
    });
  } catch (error) {
    console.error('Error in voice message:', error);
    res.status(500).json({ error: 'Failed to process voice message' });
  }
});

// Standalone TTS endpoint
app.post('/api/tts', async (req, res) => {
  if (!ai) return res.status(503).json({ error: 'API_KEY_MISSING' });

  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'No text provided' });

    const cleanText = text
      .replace(/[#*_~`>|[\]()!]/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Прочитай вслух следующий текст естественным голосом. Не добавляй ничего от себя:\n\n${cleanText}` }],
      }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Kore',
            },
          },
        },
      },
    });

    let audioBase64 = null;
    if (ttsResponse.candidates && ttsResponse.candidates[0]) {
      const parts = ttsResponse.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          audioBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ error: 'No audio generated' });
    }

    res.json({ audio: audioBase64, mimeType: 'audio/wav' });
  } catch (error) {
    console.error('TTS failed:', error);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

app.post('/api/analyze/quiz', async (req, res) => {
  if (!ai) {
    return res.json({
      archetype: 'API не настроен',
      summary: 'Для получения AI-анализа необходимо указать GEMINI_API_KEY на сервере.',
      careers: ['Настройте API ключ', 'для получения', 'рекомендаций'],
      strengths: ['Баллы рассчитаны', 'локально'],
    });
  }

  try {
    const { assessmentTitle, scores } = req.body;

    const prompt = `
      Analyze the following ${assessmentTitle} results (0-100 scale per category):
      ${JSON.stringify(scores)}

      Task:
      1. Identify the dominant personality archetype.
      2. Write a detailed psychological summary (addressing the user as "Вы") with specific observations about each high/low score.
      3. Suggest 3 specific career paths/roles with brief justification.
      4. List 3 key strengths.

      Language: Russian.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { type: Type.STRING, description: 'Short title of the personality type' },
            summary: { type: Type.STRING, description: '2-3 sentences description' },
            careers: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of 3 job titles' },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of 2 key strengths' },
          },
        },
      },
    });

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      throw new Error('Empty response from AI');
    }
  } catch (error) {
    console.error('Quiz analysis failed:', error);
    res.json({
      archetype: 'Анализ недоступен',
      summary: 'Не удалось сгенерировать описание. Проверьте API-ключ и подключение к интернету.',
      careers: ['-', '-', '-'],
      strengths: ['-', '-'],
    });
  }
});

app.post('/api/analyze/chat', async (req, res) => {
  if (!ai) {
    return res.json({
      scores: {},
      archetype: 'API не настроен',
      summary: 'Для анализа диалога необходимо указать GEMINI_API_KEY на сервере.',
      careers: [],
      strengths: [],
    });
  }

  try {
    const { assessmentTitle, messages } = req.body;

    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'AI Mentor'}: ${m.text}`)
      .join('\n');

    const careerKeywords = ['RIASEC', 'профориентация', 'Soft Skills', 'кейс', 'карьерн', 'ценност'];
    const isCareer = careerKeywords.some(kw => assessmentTitle.toLowerCase().includes(kw.toLowerCase()));

    const careersInstruction = isCareer
      ? '5. Suggest 3 specific career paths or job roles relevant to the user.'
      : '5. Suggest 3 specific, actionable recommendations for improving the user\'s current state (techniques, habits, resources — NOT job titles or professions).';

    const prompt = `
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
      ${careersInstruction}
      6. List 3 key strengths identified from the conversation.

      IMPORTANT: The summary must contain concrete, specific feedback based on what the user actually said. Avoid generic advice. If this is a stress/burnout assessment, clearly state the estimated stress level (low/moderate/high/critical) and specific burnout indicators found.
      ${!isCareer ? 'IMPORTANT: The "careers" field must contain practical self-improvement recommendations (techniques, exercises, resources), NOT professions or job titles.' : ''}

      Note: The transcript may contain speech recognition artifacts or incomplete words — interpret the meaning from context.

      FORMATTING: Use SPACES in score category names (e.g. "Уровень стресса", NOT "Уровень_стресса"). In the summary, use **bold** for key terms and separate paragraphs with newlines. Do NOT use markdown headers.

      Language: Russian.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              description: 'Key-value pairs of estimated traits and scores (0-100)',
              properties: {},
            },
            archetype: { type: Type.STRING },
            summary: { type: Type.STRING },
            careers: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      throw new Error('Empty response from AI');
    }
  } catch (error) {
    console.error('Chat analysis failed:', error);
    res.json({
      scores: { Participation: 100, Completeness: 50 },
      archetype: 'Данные не обработаны',
      summary: 'Произошла ошибка при анализе диалога. Проверьте подключение к интернету.',
      careers: [],
      strengths: [],
    });
  }
});

// --- Static files ---
app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
}));

app.use(express.static(distPath, {
  maxAge: '1d',
  index: false,
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('LifeCompass running on port ' + PORT);
  console.log('Node.js ' + process.version + ' | Gemini SDK ' + (GoogleGenAI ? 'ready' : 'unavailable'));
});
