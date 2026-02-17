import React, { useEffect, useState, useRef } from 'react';
import { RadarChart } from '../components/RadarChart';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Answer, ChartDataPoint, Message } from '../types';
import { getAssessmentById } from '../services/assessmentData';
import { generateQuizAnalysis, generateChatAnalysis } from '../services/geminiService';
import { saveResult } from '../services/historyService';
import { useAuth } from '../contexts/AuthContext';

interface ResultState {
    archetype: string;
    summary: string;
    careers: string[];
    strengths: string[];
}

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentTitle, setAssessmentTitle] = useState("Результаты");
  const [saved, setSaved] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    const processResults = async () => {
        const state = location.state || {};
        const assessmentId = state.assessmentId || id;
        const assessment = getAssessmentById(assessmentId || '');

        if (assessment) setAssessmentTitle(assessment.title);

        // --- PATH 0: FROM HISTORY (pre-computed) ---
        if (state.fromHistory && state.savedScores && state.savedResult) {
            setChartData(state.savedScores);
            setResult(state.savedResult);
            setSaved(true);
            savedRef.current = true;
            setLoading(false);
            return;
        }

        // --- PATH A: QUIZ RESULTS (Structured Answers) ---
        if (state.answers && state.answers.length > 0) {
            const stateAnswers = state.answers as Answer[];

            // 1. Calculate Scores locally
            const scores: Record<string, number> = {};
            const counts: Record<string, number> = {};
            const maxPerQuestion = 5;

            stateAnswers.forEach(a => {
                scores[a.category] = (scores[a.category] || 0) + Number(a.value);
                counts[a.category] = (counts[a.category] || 0) + 1;
            });

            const normalizedScores: ChartDataPoint[] = Object.keys(scores).map(category => {
                const totalScore = scores[category];
                const maxPossible = counts[category] * maxPerQuestion;
                return {
                    subject: category,
                    A: Math.round((totalScore / maxPossible) * 100),
                    fullMark: 100
                };
            });
            setChartData(normalizedScores);

            // 2. Call AI for Text Analysis
            const scoresMap = normalizedScores.reduce((acc, curr) => {
                acc[curr.subject] = curr.A;
                return acc;
            }, {} as Record<string, number>);

            try {
                const aiData = await generateQuizAnalysis(assessment ? assessment.title : 'Assessment', scoresMap);
                setResult(aiData);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
            return;
        }

        // --- PATH B: CHAT RESULTS (Unstructured Messages) ---
        if (state.messages && state.messages.length > 0) {
            const messages = state.messages as Message[];

            try {
                // Call specialized Chat Analysis which returns BOTH scores and text
                const aiData = await generateChatAnalysis(assessment ? assessment.title : 'Chat Assessment', messages);

                // Map AI generated scores to Chart Data
                const generatedChartData: ChartDataPoint[] = Object.keys(aiData.scores || {}).map(key => ({
                    subject: key,
                    A: aiData.scores[key],
                    fullMark: 100
                }));

                setChartData(generatedChartData);
                setResult({
                    archetype: aiData.archetype,
                    summary: aiData.summary,
                    careers: aiData.careers,
                    strengths: aiData.strengths
                });
            } catch (e) {
                console.error("Chat analysis failed", e);
            }
            setLoading(false);
            return;
        }

        // --- PATH C: DIRECT LINK / DEMO DATA ---
        setChartData([
            { subject: 'Реалистичный', A: 80, fullMark: 100 },
            { subject: 'Интеллектуальный', A: 90, fullMark: 100 },
            { subject: 'Артистичный', A: 40, fullMark: 100 },
            { subject: 'Социальный', A: 60, fullMark: 100 },
            { subject: 'Предприимчивый', A: 50, fullMark: 100 },
            { subject: 'Конвенциональный', A: 70, fullMark: 100 },
        ]);
        setResult({
            archetype: "Демо-режим",
            summary: "Это демонстрационные данные. Пройдите тест или диалог с AI для получения реального результата.",
            careers: ["Data Scientist", "Инженер", "Аналитик"],
            strengths: ["Логика", "Системность"]
        });
        setLoading(false);
    };

    processResults();
  }, [location, id]);

  // Save to history for authenticated users
  useEffect(() => {
    if (!user || !result || chartData.length === 0 || savedRef.current) return;
    const state = location.state || {};
    const assessmentId = state.assessmentId || id || '';
    const assessment = getAssessmentById(assessmentId);
    if (!assessment) return;

    savedRef.current = true;
    saveResult(user.id, {
      assessmentId,
      assessmentTitle: assessment.title,
      type: assessment.type,
      scores: chartData,
      result,
    });
    setSaved(true);
  }, [user, result, chartData, location, id]);

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#131b20]">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-4"></div>
              <p className="text-slate-500 animate-pulse text-center">
                  ИИ анализирует ваши ответы...<br/>
                  <span className="text-xs">Это может занять несколько секунд</span>
              </p>
          </div>
      );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-8 lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 text-[#99b1c2] text-sm">
          <Link to="/dashboard">Главная</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link to="/history">История</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white">Результаты</span>
        </div>
        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            {assessmentTitle}
        </h1>
        <p className="text-slate-500 dark:text-[#99b1c2] text-base font-normal max-w-2xl">
            Анализ завершен. Ниже представлен ваш персональный профиль.
        </p>
      </div>

      {/* Hero Result Card */}
      <div className="bg-white dark:bg-[#1c262e] rounded-xl overflow-hidden border border-slate-200 dark:border-[#283843] shadow-lg mb-8">
        <div className="flex flex-col lg:flex-row">
          {/* Left Visual */}
          <div className="lg:w-1/3 relative min-h-[250px] lg:min-h-full bg-gradient-to-br from-primary/20 via-slate-100 to-emerald-500/20 dark:from-primary/10 dark:via-[#151c22] dark:to-emerald-900/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-5xl text-primary">psychology</span>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/30">
                  Архетип
                </span>
              </div>
            </div>
          </div>
          {/* Right Content */}
          <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center">
            <h2 className="text-slate-500 dark:text-[#99b1c2] text-sm font-bold uppercase tracking-wider mb-2">Основной тип личности</h2>
            <h3 className="text-slate-900 dark:text-white text-3xl lg:text-5xl font-black leading-tight mb-4">
                {result?.archetype}
            </h3>
            <p className="text-slate-600 dark:text-[#d0dbe5] text-lg leading-relaxed mb-8 max-w-2xl">
                {result?.summary}
            </p>
            <div className="flex flex-wrap gap-4 items-center">
                <Link to="/dashboard" className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 transition-colors text-white font-bold shadow-[0_0_20px_rgba(46,135,194,0.3)]">
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Новый тест</span>
                </Link>
                <Link to="/dashboard" className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-slate-100 dark:bg-[#283843] hover:bg-slate-200 dark:hover:bg-[#344856] transition-colors text-slate-700 dark:text-white font-bold border border-slate-200 dark:border-[#3e5563]">
                    <span className="material-symbols-outlined">home</span>
                    <span>На главную</span>
                </Link>
                {saved && (
                  <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Сохранено в историю
                  </span>
                )}
            </div>
            {!user && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500">info</span>
                <span className="text-amber-700 dark:text-amber-300">
                  Результат не сохранён. <Link to="/register" className="text-primary font-medium hover:underline">Зарегистрируйтесь</Link>, чтобы вести историю прогресса.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Radar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1c262e] rounded-xl p-6 border border-slate-200 dark:border-[#283843]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold">Карта компетенций</h3>
                </div>
                {chartData.length > 0 ? (
                    <RadarChart data={chartData} />
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400">Нет данных для графика</div>
                )}
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-br from-[#2e87c2]/10 to-slate-50 dark:from-[#2e87c2]/20 dark:to-[#1c262e] border border-primary/20 rounded-xl p-6">
                <div className="flex gap-4">
                    <div className="min-w-10 size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">Сильные стороны</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {result?.strengths.map((str, i) => (
                                <span key={i} className="px-2 py-1 bg-white dark:bg-[#283843] rounded text-sm text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-600">
                                    {str}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Traits */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <h3 className="text-slate-900 dark:text-white text-2xl font-bold">Детальный анализ черт</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chartData.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-[#283843] rounded-xl p-5 hover:border-primary/40 transition-colors group">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-slate-900 dark:text-white font-bold truncate pr-2">{item.subject}</h4>
                            <span className={`font-black text-lg ${item.A > 70 ? 'text-primary' : 'text-slate-700 dark:text-white'}`}>{item.A}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#283843] h-2 rounded-full mb-3 overflow-hidden">
                            <div className={`bg-primary h-full rounded-full`} style={{ width: `${item.A}%`, opacity: item.A/100 + 0.3 }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-4">Рекомендуемые направления</h3>
                <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-[#283843] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#283843]">
                    {result?.careers.map((career, i) => (
                         <div key={i} className="p-5 flex gap-4 items-center hover:bg-slate-50 dark:hover:bg-[#232d36] transition-colors cursor-pointer">
                            <div className={`size-12 rounded-lg ${['bg-blue-500/10 text-blue-500', 'bg-purple-500/10 text-purple-500', 'bg-orange-500/10 text-orange-500'][i % 3]} flex items-center justify-center shrink-0`}>
                                <span className="material-symbols-outlined">work</span>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-slate-900 dark:text-white font-bold text-lg">{career}</h5>
                                <p className="text-slate-500 dark:text-[#99b1c2] text-sm">Рекомендовано AI на основе ваших ответов</p>
                            </div>
                             <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
