import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { startChatSession, sendMessageToAI, isApiConfigured, getLiveApiKey } from '../services/geminiService';
import { getAssessmentById } from '../services/assessmentData';
import { AssessmentConfig, Message, Answer } from '../types';
import { PsychologistAvatar } from '../components/PsychologistAvatar';
import { GoogleGenAI, Modality } from '@google/genai';

// --- Audio helpers (PCM encoding/decoding for Gemini Live API) ---

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodeBase64(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const Assessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentConfig | null>(null);

  // -- CHAT STATE --
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // -- VOICE STATE --
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voiceEnabledRef = useRef(true);

  // -- LIVE API REFS --
  const liveSessionRef = useRef<any>(null);
  const liveSessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isGreetingCompleteRef = useRef(false);
  const liveInitRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Transcription accumulators
  const userTranscriptRef = useRef('');
  const aiTranscriptRef = useRef('');
  const [aiDisplayText, setAiDisplayText] = useState('');

  // -- AVATAR STATE --
  const avatarState = useMemo(() => {
    if (isSpeaking) return 'speak' as const;
    if (isRecording) return 'listen' as const;
    if (isTyping) return 'think' as const;
    if (inputValue.trim()) return 'listen' as const;
    return 'idle' as const;
  }, [isRecording, isSpeaking, isTyping, inputValue]);

  // -- QUIZ STATE --
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // Keep ref in sync with state
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);

  // -- STOP LIVE SESSION --
  const stopLiveSession = useCallback(() => {
    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch {}
      liveSessionRef.current = null;
    }
    liveSessionPromiseRef.current = null;
    if (inputAudioCtxRef.current) {
      try { inputAudioCtxRef.current.close(); } catch {}
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      try { outputAudioCtxRef.current.close(); } catch {}
      outputAudioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsRecording(false);
    setIsSpeaking(false);
  }, []);

  // -- STOP AI AUDIO (interrupt) --
  const stopSpeaking = useCallback(() => {
    sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsSpeaking(false);
  }, []);

  // -- START LIVE SESSION --
  const startLiveSession = useCallback(async (assessmentConfig: AssessmentConfig) => {
    if (liveInitRef.current) return;
    liveInitRef.current = true;

    try {
      setIsTyping(true);
      setApiError(null);

      const config = await getLiveApiKey();
      if (!config?.apiKey) {
        setApiError('AI-сервис недоступен. GEMINI_API_KEY не настроен на сервере.');
        setIsTyping(false);
        return;
      }

      // Request microphone access
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch (mediaError: any) {
        if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          setApiError('Микрофон не найден. Подключите устройство.');
        } else if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          setApiError('Доступ к микрофону отклонен.');
        } else {
          setApiError('Не удалось получить доступ к микрофону.');
        }
        setIsTyping(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: config.apiKey });

      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      isGreetingCompleteRef.current = false;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsTyping(false);
            setIsRecording(true);

            // Set up mic capture
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              // Don't send mic audio until greeting is complete, or if voice is disabled
              if (!isGreetingCompleteRef.current || !voiceEnabledRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              if (liveSessionRef.current) {
                liveSessionRef.current.sendRealtimeInput({ media: pcmBlob });
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);

            // Send initial greeting trigger
            const greetingPrompt = assessmentConfig.initialMessage
              ? `Начни разговор. Поприветствуй пользователя и скажи следующее: ${assessmentConfig.initialMessage}`
              : 'Поприветствуй пользователя и представься.';

            liveSessionPromiseRef.current!.then((session: any) => {
              session.sendClientContent({
                turns: [{
                  role: 'user',
                  parts: [{ text: greetingPrompt }]
                }],
                turnComplete: true
              });
            });
          },

          onmessage: async (message: any) => {
            // Handle user speech transcription
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              userTranscriptRef.current = text;
              setInputValue(text);
            }

            // Handle AI speech transcription
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              aiTranscriptRef.current = (aiTranscriptRef.current + ' ' + text).trim();
              setAiDisplayText(prev => (prev.length > 200 ? prev.slice(-200) : prev) + ' ' + text);
            }

            // Handle audio data
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              setIsSpeaking(true);
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const ctx = outputAudioCtxRef.current!;

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);

              const audioSource = ctx.createBufferSource();
              audioSource.buffer = audioBuffer;
              audioSource.connect(ctx.destination);
              audioSource.addEventListener('ended', () => {
                sourcesRef.current.delete(audioSource);
                if (sourcesRef.current.size === 0) {
                  setIsSpeaking(false);
                }
              });

              audioSource.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(audioSource);
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }

            // Handle turn complete
            if (message.serverContent?.turnComplete) {
              // Enable mic after greeting
              if (!isGreetingCompleteRef.current) {
                isGreetingCompleteRef.current = true;
              }

              // Save messages for later analysis
              if (userTranscriptRef.current.trim()) {
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  role: 'user',
                  text: userTranscriptRef.current.trim(),
                  timestamp: new Date()
                }]);
              }
              if (aiTranscriptRef.current.trim()) {
                setMessages(prev => [...prev, {
                  id: (Date.now() + 1).toString(),
                  role: 'model',
                  text: aiTranscriptRef.current.trim(),
                  timestamp: new Date()
                }]);
              }

              userTranscriptRef.current = '';
              aiTranscriptRef.current = '';
              setInputValue('');
              setAiDisplayText('');
            }
          },

          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setApiError('Ошибка соединения с AI.');
            setIsRecording(false);
            setIsSpeaking(false);
          },

          onclose: () => {
            setIsRecording(false);
            setIsSpeaking(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: assessmentConfig.systemInstruction || ''
        }
      });

      liveSessionPromiseRef.current = sessionPromise;
      liveSessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to start live session:', err);
      setApiError(err.message || 'Ошибка запуска голосовой сессии.');
      setIsTyping(false);
    }
  }, []);

  // -- SEND TEXT MESSAGE (via Live session or server fallback) --
  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || apiError) return;
    setInputValue('');

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: new Date() }]);

    if (liveSessionRef.current) {
      // Send through Live API as text
      liveSessionRef.current.sendClientContent({
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true
      });
    } else {
      // Fallback: server-side text chat
      setIsTyping(true);
      try {
        const responseText = await sendMessageToAI(text);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() }]);
      } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: 'Произошла ошибка. Попробуйте ещё раз.', timestamp: new Date() }]);
      }
      setIsTyping(false);
    }
  }, [inputValue, apiError]);

  // -- HANDLE FINISH --
  const handleFinishChat = () => {
    stopLiveSession();
    navigate(`/results/${id}`, { state: { messages: messages, assessmentId: id, type: 'chat' } });
  };

  // -- TOGGLE VOICE (mute/unmute mic + stop audio) --
  const toggleVoice = useCallback(() => {
    setVoiceEnabled(v => {
      if (v) {
        // Turning off: stop audio playback
        stopSpeaking();
      }
      return !v;
    });
  }, [stopSpeaking]);

  // -- INIT --
  useEffect(() => {
    const init = async () => {
      if (!id) return;
      const data = getAssessmentById(id);
      if (!data) return;
      setAssessment(data);

      if (data.type === 'chat') {
        // Try Live API first
        await startLiveSession(data);

        // If Live API failed (apiError will be set), set up initial message for display
        // The initial message from Live API comes as AI-spoken greeting
      }
    };
    init();
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopLiveSession(); };
  }, [stopLiveSession]);

  // -- QUIZ HANDLERS --
  const handleQuizAnswer = (value: number | string, category: string) => {
    if (!assessment?.questions) return;

    const questionId = assessment.questions[currentQuestionIndex].id;
    const newAnswer: Answer = { questionId, value, category };

    const filteredAnswers = answers.filter(a => a.questionId !== questionId);
    const updatedAnswers = [...filteredAnswers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < assessment.questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 250);
    } else {
        setTimeout(() => {
             navigate(`/results/${id}`, { state: { answers: updatedAnswers, assessmentId: id, type: 'quiz' } });
        }, 300);
    }
  };

  if (!assessment) return <div className="h-full flex items-center justify-center text-slate-400">Загрузка...</div>;

  // --- RENDER HEADER (Common) ---
  const Header = () => (
    <header className="flex-none z-20 w-full bg-white dark:bg-[#131b20] border-b border-gray-200 dark:border-[#283843] px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
              <Link to="/dashboard" className="md:hidden text-slate-500 hover:text-slate-700">
                  <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${assessment.gradient || 'from-primary to-blue-600'}`}>
                  <span className="material-symbols-outlined text-xl">{assessment.icon || 'quiz'}</span>
              </div>
              <div>
                  <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {assessment.title}
                  </h1>
                  <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${assessment.type === 'chat' ? (apiError ? 'bg-red-500' : 'bg-green-500') : 'bg-blue-500'}`}></span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                          {assessment.type === 'chat'
                            ? (apiError ? 'Не подключено' : 'AI-ассистент')
                            : `Вопрос ${currentQuestionIndex + 1} из ${assessment.questions?.length}`}
                      </span>
                  </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
            {assessment.type === 'chat' && messages.length > 2 && (
                 <button
                    onClick={handleFinishChat}
                    className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                 >
                    <span>Завершить</span>
                    <span className="material-symbols-outlined text-lg">check</span>
                 </button>
            )}
            <Link to="/dashboard" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-[#283843] transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
                <span>Выход</span>
            </Link>
          </div>
      </div>
    </header>
  );

  // --- RENDER CHAT (VOICE ASSISTANT) INTERFACE ---
  if (assessment.type === 'chat') {
    // Determine status text
    const statusText = isTyping ? 'Подключение…'
      : isSpeaking ? 'Говорю…'
      : isRecording ? (voiceEnabled ? 'Слушаю вас…' : 'Микрофон выкл')
      : apiError ? 'Не подключено'
      : 'Подключение…';

    // Last AI message for subtitle
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'model');
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a1a] via-[#0e1225] to-[#0a0a1a] overflow-hidden relative">
        {/* Top bar */}
        <header className="flex-none z-20 px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm hidden md:inline">Назад</span>
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-white/80">{assessment.title}</h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${apiError ? 'bg-red-500' : isTyping ? 'bg-yellow-500 animate-pulse' : isSpeaking ? 'bg-purple-500 animate-pulse' : isRecording ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></span>
              <span className="text-[10px] text-slate-400">{statusText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 2 && (
              <button onClick={handleFinishChat} className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span className="text-xs hidden md:inline">Завершить</span>
              </button>
            )}
          </div>
        </header>

        {apiError && (
          <div className="mx-4 mb-2 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-2 text-center">
            <p className="text-red-300 text-xs">{apiError}</p>
          </div>
        )}

        {/* Center: Animated sphere + subtitles */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
          {/* Animated sphere */}
          <div className="relative mb-8">
            <PsychologistAvatar
              state={avatarState}
              className="w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full"
            />
          </div>

          {/* Transcript / subtitle area */}
          <div className="w-full max-w-md text-center space-y-3 min-h-[80px]">
            {/* Show live user transcription */}
            {inputValue && isRecording && (
              <p className="text-white/90 text-base animate-pulse">
                "{inputValue}"
              </p>
            )}

            {/* Show user's last message after turn */}
            {!isRecording && !isSpeaking && !isTyping && lastUserMsg && !inputValue && (
              <p className="text-slate-500 text-sm">
                Вы: {lastUserMsg.text.length > 80 ? lastUserMsg.text.slice(0, 80) + '…' : lastUserMsg.text}
              </p>
            )}

            {/* Thinking dots (connecting) */}
            {isTyping && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400/60 typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400/60 typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400/60 typing-dot" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}

            {/* AI response subtitle (live streaming or last message) */}
            {!isTyping && (aiDisplayText || lastAiMsg) && (
              <p className={`text-slate-300 text-sm leading-relaxed transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'opacity-70'}`}>
                {aiDisplayText
                  ? (aiDisplayText.length > 200 ? aiDisplayText.slice(-200) : aiDisplayText)
                  : lastAiMsg
                    ? (lastAiMsg.text.length > 200 ? lastAiMsg.text.slice(0, 200) + '…' : lastAiMsg.text)
                    : ''}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: Controls */}
        <footer className="flex-none pb-8 pt-4 px-6">
          <div className="flex flex-col items-center gap-4">
            {/* Mic button — visual indicator / interrupt */}
            <div className="relative">
              {/* Pulse rings when recording & listening */}
              {isRecording && voiceEnabled && !isSpeaking && (
                <>
                  <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute -inset-3 rounded-full border-2 border-green-500/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                </>
              )}
              {isSpeaking && (
                <div className="absolute -inset-2 rounded-full border-2 border-purple-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
              )}

              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  }
                }}
                disabled={!!apiError || isTyping}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isSpeaking
                    ? 'bg-purple-600 text-white shadow-purple-500/30 hover:scale-105 active:scale-95'
                    : isRecording && voiceEnabled
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/30'
                      : isTyping
                        ? 'bg-slate-700 text-slate-400 cursor-wait'
                        : apiError
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {isSpeaking ? 'volume_up' : isRecording && voiceEnabled ? 'mic' : isTyping ? 'hourglass_top' : 'mic_off'}
                </span>
              </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center gap-6">
              {/* Text input */}
              <button
                onClick={() => {
                  const text = prompt('Введите текст:');
                  if (text?.trim()) {
                    handleSendMessage(text.trim());
                  }
                }}
                disabled={isTyping || !!apiError}
                className="text-slate-500 hover:text-white transition-colors flex flex-col items-center gap-1 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-xl">keyboard</span>
                <span className="text-[10px]">Текст</span>
              </button>

              {/* Volume/mic toggle */}
              <button
                onClick={toggleVoice}
                className={`flex flex-col items-center gap-1 transition-colors ${voiceEnabled ? 'text-blue-400 hover:text-blue-300' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <span className="material-symbols-outlined text-xl">{voiceEnabled ? 'mic' : 'mic_off'}</span>
                <span className="text-[10px]">{voiceEnabled ? 'Микрофон вкл' : 'Микрофон выкл'}</span>
              </button>

              {/* Finish */}
              {messages.length > 2 && (
                <button
                  onClick={handleFinishChat}
                  className="text-green-400 hover:text-green-300 transition-colors flex flex-col items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span className="text-[10px]">Готово</span>
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- RENDER QUIZ INTERFACE ---
  const question = assessment.questions ? assessment.questions[currentQuestionIndex] : null;
  const progress = assessment.questions ? ((currentQuestionIndex) / assessment.questions.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <Header />

      <div className="w-full h-1.5 bg-slate-200 dark:bg-[#1f2c34]">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          {question && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="text-center flex flex-col gap-4">
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {question.category}
                 </span>
                 <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                    {question.text}
                 </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {question.options?.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => handleQuizAnswer(opt.value, question.category)}
                        className={`
                            relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 group
                            hover:shadow-md active:scale-[0.98]
                            bg-white dark:bg-[#1e272e] border-slate-200 dark:border-slate-700
                            hover:border-primary dark:hover:border-primary
                        `}
                    >
                        <span className="text-base font-medium text-slate-700 dark:text-white group-hover:text-primary transition-colors">
                            {opt.label}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary`}></div>
                    </button>
                 ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 flex justify-center pb-10">
         <div className="flex gap-2">
             <button
                onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1f2c34] disabled:opacity-50 transition-colors"
             >
                 Назад
             </button>
             <div className="px-6 py-2 text-slate-400 text-sm flex items-center">
                 {currentQuestionIndex + 1} / {assessment.questions?.length}
             </div>
         </div>
      </footer>
    </div>
  );
};
