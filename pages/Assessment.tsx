import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { generateAnalysis } from '../services/geminiService';
import { getAssessmentById } from '../services/assessmentData';
import { Answer, AssessmentConfig } from '../types';

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [assessment, setAssessment] = useState<AssessmentConfig | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const data = getAssessmentById(id);
      if (data) {
        setAssessment(data);
        setAnswers([]);
        setCurrentQuestionIdx(0);
      } else {
        setError("Тест не найден");
      }
    }
  }, [id]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ошибка</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <Link to="/dashboard" className="px-4 py-2 bg-primary text-white rounded-lg">На главную</Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
     return <div className="h-full bg-background-light dark:bg-background-dark"></div>; // Loading state
  }
  
  const question = assessment.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / assessment.questions.length) * 100;

  const handleOptionSelect = async (value: number | string) => {
    // Save answer
    const newAnswer: Answer = {
      questionId: question.id,
      value: value,
      category: question.category
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Navigate or Finish
    if (currentQuestionIdx < assessment.questions.length - 1) {
      setTimeout(() => {
          setCurrentQuestionIdx(prev => prev + 1);
      }, 250); // Small delay for UX
    } else {
      finishAssessment(updatedAnswers);
    }
  };

  const finishAssessment = async (finalAnswers: Answer[]) => {
    setIsAnalyzing(true);
    // Call AI Service
    await generateAnalysis(finalAnswers);
    // In a real app, we would pass the result via state or context. 
    // Here we just navigate to the results page.
    navigate('/results/1');
  };

  if (isAnalyzing) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#131b20] px-6 text-center">
        <div className="relative mb-8 size-24">
           <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
           <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="material-symbols-outlined text-3xl text-primary animate-pulse">psychology</span>
           </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Обработка результатов...</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Система анализирует ваши ответы для формирования профиля по методике: <br/>
          <span className="font-semibold text-primary">{assessment.title}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="flex-none z-20 w-full bg-white dark:bg-[#131b20] border-b border-gray-200 dark:border-[#283843] px-4 py-4 md:px-8">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
                <span className="text-sm font-medium hidden sm:inline">Прервать</span>
            </Link>
            
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {assessment.title.split('(')[0].trim()}
                </span>
                <span className="text-[10px] text-slate-500">Вопрос {currentQuestionIdx + 1} из {assessment.questions.length}</span>
            </div>

            <div className="w-[80px]"></div> {/* Spacer for centering */}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-[#283843] rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Question Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 flex items-center justify-center">
        <div className="w-full max-w-2xl animate-[fadeIn_0.3s_ease-out]">
            
            {/* Context Badge */}
            <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-100 dark:border-blue-900/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {question.category}
                </span>
            </div>

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 dark:text-white leading-tight mb-10">
                {question.text}
            </h2>

            {/* Options List */}
            <div className="grid gap-3">
                {question.options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleOptionSelect(option.value)}
                        className="group relative flex items-center p-4 rounded-xl border-2 border-slate-200 dark:border-[#283843] bg-white dark:bg-[#1e2830] hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-[#25323b] transition-all duration-200 text-left outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 text-sm font-bold border ${option.color ? option.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-20 ') : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                           {option.value}
                        </div>
                        <span className="text-base md:text-lg font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {option.label}
                        </span>
                    </button>
                ))}
            </div>
            
             <p className="text-center mt-8 text-sm text-slate-400 dark:text-slate-500">
                Ваши ответы используются только для расчета результатов этого теста.
            </p>
        </div>
      </main>
    </div>
  );
};
