import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { startChatSession, sendMessageToAI, isApiConfigured } from '../services/geminiService';
import { getAssessmentById } from '../services/assessmentData';
import { AssessmentConfig, Message, Answer } from '../types';

export const Assessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentConfig | null>(null);

  // -- CHAT STATE --
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
            if (!isApiConfigured()) {
              setApiError('Для AI-диалогов необходимо указать GEMINI_API_KEY в файле .env');
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
              await startChatSession('gemini-3-flash-preview', data.systemInstruction || '');
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
                setApiError('Для AI-диалогов необходимо указать GEMINI_API_KEY в файле .env');
              } else {
                setApiError('Не удалось подключиться к AI. Проверьте интернет-соединение и API-ключ.');
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

  // -- CHAT HANDLERS --
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (assessment?.type === 'chat') scrollToBottom(); }, [messages, isTyping, assessment]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || apiError) return;
    const userText = inputValue.trim();
    setInputValue('');

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      const responseText = await sendMessageToAI(userText);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: 'Произошла ошибка. Попробуйте ещё раз.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinishChat = () => {
      navigate(`/results/${id}`, { state: { messages: messages, assessmentId: id, type: 'chat' } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  // --- RENDER CHAT INTERFACE ---
  if (assessment.type === 'chat') {
    return (
      <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] overflow-hidden relative">
        <Header />

        {apiError && (
          <div className="flex-none bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0">warning</span>
              <div className="flex-1">
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">{apiError}</p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">Создайте файл <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">.env</code> с переменной <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">GEMINI_API_KEY=ваш_ключ</code></p>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
             <div className="flex justify-center my-4">
                <span className="bg-slate-200 dark:bg-[#1f2c34] text-slate-600 dark:text-slate-400 text-xs px-3 py-1 rounded-full shadow-sm text-center">
                    {assessment.description} <br/>
                    <span className="opacity-70">Отвечайте развернуто для точного анализа.</span>
                </span>
            </div>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] md:max-w-[80%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600 hidden md:flex' : 'bg-white dark:bg-[#1f2c34] border border-slate-100 dark:border-slate-700 text-primary'}`}>
                            <span className="material-symbols-outlined text-sm">{msg.role === 'user' ? 'person' : 'smart_toy'}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-[#1f2c34] text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#283843] rounded-bl-none'}`}>
                            {msg.role === 'user' ? (
                              <div className="whitespace-pre-wrap">{msg.text}</div>
                            ) : (
                              <Markdown
                                className="prose dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-headings:text-slate-900 dark:prose-headings:text-white prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-blockquote:my-2 prose-blockquote:border-primary/50 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:not-italic prose-blockquote:px-3 prose-blockquote:py-1 prose-blockquote:rounded-r prose-strong:text-slate-900 dark:prose-strong:text-white [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                              >
                                {msg.text}
                              </Markdown>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex w-full justify-start">
                     <div className="flex gap-2 ml-10">
                        <div className="bg-white dark:bg-[#1f2c34] border border-slate-100 dark:border-[#283843] px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 h-[46px]">
                            <div className="w-2 h-2 rounded-full bg-slate-400/60 typing-dot"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-400/60 typing-dot"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-400/60 typing-dot"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="flex-none p-4 bg-white dark:bg-[#131b20] border-t border-slate-200 dark:border-[#283843]">
           <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {messages.length > 2 && (
                <button onClick={handleFinishChat} className="md:hidden w-full py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold border border-green-200 dark:border-green-800">
                    Завершить диагностику и получить результат
                </button>
            )}
            <div className="relative flex items-end gap-2">
                <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={apiError ? "AI недоступен — настройте API ключ" : "Ваш ответ..."} className={`w-full bg-slate-100 dark:bg-[#1f2c34] text-slate-900 dark:text-white rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent ${apiError ? 'opacity-60' : ''}`} disabled={isTyping || !!apiError} />
                <button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping || !!apiError} className={`h-[50px] w-[50px] flex items-center justify-center rounded-full transition-all shrink-0 ${inputValue.trim() && !isTyping && !apiError ? 'bg-primary text-white hover:bg-primary-hover shadow-lg' : 'bg-slate-200 dark:bg-[#283843] text-slate-400 cursor-not-allowed'}`}><span className="material-symbols-outlined">send</span></button>
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
