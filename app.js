import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// --- App init (async to avoid top-level await) ---
async function main() {
  // Dynamic import of Gemini SDK (crash-safe)
  let GoogleGenAI = null;
  let Type = null;
  let geminiLoadError = null;

  try {
    const genaiModule = await import('@google/genai');
    GoogleGenAI = genaiModule.GoogleGenAI;
    Type = genaiModule.Type;
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
  const ai = (GoogleGenAI && apiKey) ? new GoogleGenAI({ apiKey }) : null;
  const MODEL_ID = 'gemini-2.0-flash';

  if (ai) {
    console.log('Gemini API configured (key starts with', apiKey.slice(0, 8) + '...)');
  } else if (!GoogleGenAI) {
    console.warn('Gemini SDK failed to load — AI features disabled');
  } else {
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

  app.post('/api/chat/start', (req, res) => {
    if (!ai) return res.status(503).json({ error: 'API_KEY_MISSING' });

    try {
      const { systemInstruction } = req.body;
      const sessionId = crypto.randomUUID();

      const chat = ai.chats.create({
        model: MODEL_ID,
        config: {
          systemInstruction: systemInstruction || '',
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
        2. Write a psychological summary (addressing the user as "Вы").
        3. Suggest 3 specific career paths/roles.
        4. List 2 key strengths.

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

      const prompt = `
        Analyze the following conversation transcript for the assessment: "${assessmentTitle}".

        TRANSCRIPT:
        ${transcript}

        Task:
        1. Evaluate the User's responses.
        2. Estimate scores (0-100) for 5-6 relevant traits/categories based on the assessment type.
        3. Identify the dominant archetype.
        4. Write a professional summary (addressing the user as "Вы").
        5. Suggest 3 career paths.
        6. List 2 key strengths.

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

  // SPA fallback (Express 5 requires named wildcard)
  app.get('*path', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`LifeCompass running on port ${PORT}`);
    console.log(`Node.js ${process.version} | Gemini: ${GoogleGenAI ? 'OK' : 'FAILED'}`);
  });
}

main().catch((err) => {
  console.error('FATAL: Failed to start LifeCompass:', err);
  process.exit(1);
});
