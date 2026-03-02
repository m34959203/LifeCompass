import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { startChatSession, sendMessageToAI, sendVoiceMessageToAI, isApiConfigured } from '../services/geminiService';
import { getAssessmentById } from '../services/assessmentData';
import { AssessmentConfig, Message, Answer } from '../types';

import { PsychologistAvatar } from '../components/PsychologistAvatar';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasSpeechRecognition = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // -- AVATAR STATE --
  const avatarState = useMemo(() => {
    if (isRecording) return 'listen' as const;
    if (isSpeaking) return 'speak' as const;
    if (isTyping) return 'think' as const;
    if (inputValue.trim()) return 'listen' as const;
    return 'idle' as const;
  }, [isRecording, isSpeaking, isTyping, inputValue]);

  // -- QUIZ STATE --
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // Init
  useEffect(() => {
    const init = async () => {
      if (id) {
        const data = getAssessmentById(id);
        if (data) {
          setAssessment(data);

          if (data.type === 'chat') {
            const configured = await isApiConfigured();
            if (!configured) {
              setApiError('AI-сервис недоступен. GEMINI_API_KEY не настроен на сервере.');
              if (data.initialMessage) {
                setMessages([{
                  id: 'init-1',
                  role: 'model',
                  text: data.initialMessage,
                  timestamp: new Date()
                }]);
              }
              return;
            }

            try {
              await startChatSession('gemini-2.0-flash', data.systemInstruction || '');
              if (data.initialMessage) {
                setMessages([{
                  id: 'init-1',
                  role: 'model',
                  text: data.initialMessage,
                  timestamp: new Date()
                }]);
              }
            } catch (e: any) {
              console.error(e);
              if (e?.message === 'API_KEY_MISSING') {
                setApiError('AI-сервис недоступен. GEMINI_API_KEY не настроен на сервере.');
              } else {
                setApiError('Не удалось подключиться к AI. Проверьте интернет-соединение.');
              }
              if (data.initialMessage) {
                setMessages([{
                  id: 'init-1',
                  role: 'model',
                  text: data.initialMessage,
                  timestamp: new Date()
                }]);
              }
            }
          }
        }
      }
    };
    init();
  }, [id]);

  // -- AUDIO PLAYBACK --
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((base64Audio: string, mimeType: string) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(true);
    const audio = new Audio(`data:${mimeType};base64,${base64Audio}`);
    audioRef.current = audio;
    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      console.error('Audio playback error');
      setIsSpeaking(false);
      audioRef.current = null;
    };
    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      setIsSpeaking(false);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // -- CHAT HANDLERS --
  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || apiError) return;
    setInputValue('');

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      if (voiceEnabled) {
        // Use voice endpoint: get text + audio together
        const response = await sendVoiceMessageToAI(text);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response.text, timestamp: new Date() }]);
        setIsTyping(false);
        // Play audio
        if (response.audio && response.audioMimeType) {
          playAudio(response.audio, response.audioMimeType);
        }
      } else {
        // Text-only mode
        const responseText = await sendMessageToAI(text);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() }]);
        setIsTyping(false);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: 'Произошла ошибка. Попробуйте ещё раз.', timestamp: new Date() }]);
      setIsTyping(false);
    }
  }, [inputValue, apiError, voiceEnabled, playAudio]);

  const handleFinishChat = () => {
      navigate(`/results/${id}`, { state: { messages: messages, assessmentId: id, type: 'chat' } });
  };

  // -- STT: microphone recording --
  const pendingTranscript = useRef('');

  const startRecording = useCallback(() => {
    if (!hasSpeechRecognition) return;
    stopSpeaking();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';

    recognition.onstart = () => {
      setIsRecording(true);
      pendingTranscript.current = '';
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = '';
      let isFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        if (e.results[i].isFinal) isFinal = true;
      }
      setInputValue(transcript);
      if (isFinal) {
        pendingTranscript.current = transcript;
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', e.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      // Auto-send when speech ends
      const finalText = pendingTranscript.current.trim();
      if (finalText) {
        setInputValue('');
        handleSendMessage(finalText);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [hasSpeechRecognition, stopSpeaking, handleSendMessage]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
    const statusText = isRecording ? 'Слушаю вас…'
      : isTyping ? 'Думаю…'
      : isSpeaking ? 'Говорю…'
      : apiError ? 'Не подключено'
      : 'Нажмите на микрофон';

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
              <span className={`w-1.5 h-1.5 rounded-full ${apiError ? 'bg-red-500' : isRecording ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-purple-500 animate-pulse' : isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
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
            {/* Show what user said */}
            {isRecording && inputValue && (
              <p className="text-white/90 text-base animate-pulse">
                "{inputValue}"
              </p>
            )}

            {/* Show user's last message after sending */}
            {!isRecording && lastUserMsg && !isTyping && !isSpeaking && (
              <p className="text-slate-500 text-sm">
                Вы: {lastUserMsg.text.length > 80 ? lastUserMsg.text.slice(0, 80) + '…' : lastUserMsg.text}
              </p>
            )}

            {/* Thinking dots */}
            {isTyping && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400/60 typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400/60 typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400/60 typing-dot" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}

            {/* AI response subtitle */}
            {!isTyping && lastAiMsg && (
              <p className={`text-slate-300 text-sm leading-relaxed transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'opacity-70'}`}>
                {lastAiMsg.text.length > 200 ? lastAiMsg.text.slice(0, 200) + '…' : lastAiMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: Controls */}
        <footer className="flex-none pb-8 pt-4 px-6">
          <div className="flex flex-col items-center gap-4">
            {/* Mic button */}
            <div className="relative">
              {/* Pulse rings when recording */}
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute -inset-3 rounded-full border-2 border-red-500/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                </>
              )}
              {isSpeaking && (
                <div className="absolute -inset-2 rounded-full border-2 border-purple-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
              )}

              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else if (isTyping) {
                    // Can't interact while thinking
                  } else {
                    toggleRecording();
                  }
                }}
                disabled={!!apiError || isTyping}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isRecording
                    ? 'bg-red-500 text-white scale-110 shadow-red-500/40'
                    : isSpeaking
                      ? 'bg-purple-600 text-white shadow-purple-500/30'
                      : isTyping
                        ? 'bg-slate-700 text-slate-400 cursor-wait'
                        : apiError
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-blue-500/40 active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {isRecording ? 'stop' : isSpeaking ? 'volume_up' : 'mic'}
                </span>
              </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center gap-6">
              {/* Text input toggle */}
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

              {/* Volume toggle */}
              <button
                onClick={() => { setVoiceEnabled(v => { if (v) stopSpeaking(); return !v; }); }}
                className={`flex flex-col items-center gap-1 transition-colors ${voiceEnabled ? 'text-blue-400 hover:text-blue-300' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <span className="material-symbols-outlined text-xl">{voiceEnabled ? 'volume_up' : 'volume_off'}</span>
                <span className="text-[10px]">{voiceEnabled ? 'Звук вкл' : 'Звук выкл'}</span>
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
