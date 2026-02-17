import React, { useEffect, useState } from 'react';
import { RadarChart } from '../components/RadarChart';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Answer, ChartDataPoint } from '../types';
import { getAssessmentById } from '../services/assessmentData';
import { generateQuizAnalysis } from '../services/geminiService';
import { saveTestResult, getResultById, generateResultId, TestResult } from '../services/storageService';
import { useToast } from '../components/Toast';

interface ResultState {
    archetype: string;
    summary: string;
    careers: string[];
    strengths: string[];
}

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentTitle, setAssessmentTitle] = useState("Результаты");
  const [savedResultId, setSavedResultId] = useState<string | null>(null);

  useEffect(() => {
    const processResults = async () => {
        const stateAnswers = location.state?.answers as Answer[];
        const assessmentId = location.state?.assessmentId || id;
        const existingResultId = location.state?.savedResultId as string | undefined;

        // Check if we're viewing a saved result
        if (existingResultId) {
            const saved = getResultById(existingResultId);
            if (saved) {
                setChartData(saved.scores);
                setResult({
                    archetype: saved.archetype,
                    summary: saved.summary,
                    careers: saved.careers,
                    strengths: saved.strengths,
                });
                setAssessmentTitle(saved.assessmentTitle);
                setSavedResultId(saved.id);
                setLoading(false);
                return;
            }
        }

        if (!stateAnswers || stateAnswers.length === 0) {
            // Try to load latest result for this assessment from storage
            const { getAllResults } = await import('../services/storageService');
            const savedResults = getAllResults().filter(r => r.assessmentId === assessmentId);
            if (savedResults.length > 0) {
                const latest = savedResults[0];
                setChartData(latest.scores);
                setResult({
                    archetype: latest.archetype,
                    summary: latest.summary,
                    careers: latest.careers,
                    strengths: latest.strengths,
                });
                setAssessmentTitle(latest.assessmentTitle);
                setSavedResultId(latest.id);
                setLoading(false);
                return;
            }

            // Fallback for direct link access (Demo data)
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
                summary: "Это демонстрационные данные, так как тест не был пройден. Пройдите тест для получения реального результата.",
                careers: ["Data Scientist", "Инженер", "Аналитик"],
                strengths: ["Логика", "Системность"]
            });
            setLoading(false);
            return;
        }

        // 1. Calculate Scores
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

        // 2. Get Assessment Info
        const assessment = getAssessmentById(assessmentId || '');
        if (assessment) setAssessmentTitle(assessment.title);

        // 3. Call AI for Analysis
        const scoresMap = normalizedScores.reduce((acc, curr) => {
            acc[curr.subject] = curr.A;
            return acc;
        }, {} as Record<string, number>);

        try {
            const aiData = await generateQuizAnalysis(assessment ? assessment.title : 'Assessment', scoresMap);
            setResult(aiData);

            // 4. Save result to localStorage
            if (assessment && aiData) {
                const resultId = generateResultId();
                const testResult: TestResult = {
                    id: resultId,
                    assessmentId: assessment.id,
                    assessmentTitle: assessment.title,
                    assessmentIcon: assessment.icon || 'quiz',
                    assessmentGradient: assessment.gradient || 'from-slate-500 to-slate-600',
                    type: assessment.type,
                    date: new Date().toISOString(),
                    scores: normalizedScores,
                    archetype: aiData.archetype,
                    summary: aiData.summary,
                    careers: aiData.careers,
                    strengths: aiData.strengths,
                    answers: stateAnswers,
                };
                saveTestResult(testResult);
                setSavedResultId(resultId);
                showToast('Результат сохранён в историю', 'success');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    processResults();
  }, [location, id]);

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#131b20]">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-4"></div>
              <p className="text-slate-500 animate-pulse">ИИ анализирует ваши ответы...</p>
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
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => showToast('Экспорт в PDF будет доступен в следующем обновлении', 'info')}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 transition-colors text-white font-bold shadow-[0_0_20px_rgba(46,135,194,0.3)]"
                >
                    <span className="material-symbols-outlined">download</span>
                    <span>Скачать PDF</span>
                </button>
                <Link to="/dashboard" className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-slate-100 dark:bg-[#283843] hover:bg-slate-200 dark:hover:bg-[#344856] transition-colors text-slate-700 dark:text-white font-bold border border-slate-200 dark:border-[#3e5563]">
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Новый тест</span>
                </Link>
            </div>
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
                <RadarChart data={chartData} />
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
                            <h4 className="text-slate-900 dark:text-white font-bold">{item.subject}</h4>
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
