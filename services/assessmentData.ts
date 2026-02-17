import { AssessmentConfig, QuestionOption } from '../types';

/**
 * DOCUMENTATION:
 * Этот файл содержит статическую базу данных всех диагностических методик.
 * 
 * Чтобы добавить новый тест:
 * 1. Определите новый набор options (если стандартные не подходят).
 * 2. Добавьте новый ключ в объект assessmentsDatabase.
 * 3. Убедитесь, что ID теста совпадает с ID в UI (pages/Dashboard.tsx).
 */

// Опции: Согласие (1-5)
const agreementOptions: QuestionOption[] = [
  { value: 1, label: "Категорически не согласен", color: "bg-red-100 text-red-700 border-red-200" },
  { value: 2, label: "Скорее не согласен", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: 3, label: "Нейтрально / Затрудняюсь", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: 4, label: "Скорее согласен", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: 5, label: "Полностью согласен", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

// Опции: Частота (1-5)
const frequencyOptions: QuestionOption[] = [
  { value: 1, label: "Никогда", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: 2, label: "Редко", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: 3, label: "Иногда", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: 4, label: "Часто", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: 5, label: "Постоянно", color: "bg-red-100 text-red-700 border-red-200" },
];

const assessmentsDatabase: Record<string, AssessmentConfig> = {
  // 1. КАРЬЕРА (RIASEC)
  "career-riasec": {
    id: "career-riasec",
    title: "Профессиональные склонности (RIASEC)",
    description: "Определите свой профессиональный тип личности по методике Холланда.",
    questions: [
      { id: 101, text: "Мне нравится работать с инструментами и механизмами.", category: "Реалистичный", options: agreementOptions },
      { id: 102, text: "Я люблю решать математические или логические задачи.", category: "Интеллектуальный", options: agreementOptions },
      { id: 103, text: "Мне важно выражать себя через творчество (письмо, рисование, музыка).", category: "Артистичный", options: agreementOptions },
      { id: 104, text: "Я люблю обучать других людей или помогать им в развитии.", category: "Социальный", options: agreementOptions },
      { id: 105, text: "Мне нравится лидировать и убеждать людей.", category: "Предприимчивый", options: agreementOptions },
      { id: 106, text: "Я предпочитаю четкие инструкции и работу с документами.", category: "Конвенциональный", options: agreementOptions }
    ]
  },

  // 2. ЛИЧНОСТЬ (Big Five / OCEAN)
  "personality-big5": {
    id: "personality-big5",
    title: "Личностный профиль (Big Five)",
    description: "Глубокий анализ черт характера: открытость, добросовестность, экстраверсия.",
    questions: [
      { id: 201, text: "Я – душа компании, люблю быть в центре внимания.", category: "Экстраверсия", options: agreementOptions },
      { id: 202, text: "Я всегда готовлюсь ко всему заранее и следую плану.", category: "Добросовестность", options: agreementOptions },
      { id: 203, text: "У меня богатое воображение и я люблю пробовать новое.", category: "Открытость", options: agreementOptions },
      { id: 204, text: "Я легко расстраиваюсь или поддаюсь стрессу.", category: "Нейротизм", options: agreementOptions },
      { id: 205, text: "Я стараюсь видеть в людях только хорошее и помогать им.", category: "Доброжелательность", options: agreementOptions }
    ]
  },

  // 3. ЗДОРОВЬЕ (Выгорание)
  "health-burnout": {
    id: "health-burnout",
    title: "Уровень профессионального выгорания",
    description: "Оценка эмоционального истощения и уровня стресса на работе.",
    questions: [
      { id: 301, text: "Я чувствую себя эмоционально опустошенным после работы.", category: "Истощение", options: frequencyOptions },
      { id: 302, text: "У меня возникает чувство безразличия к результатам моего труда.", category: "Цинизм", options: frequencyOptions },
      { id: 303, text: "Мне кажется, что я мало чего достигаю на своей должности.", category: "Редукция достижений", options: frequencyOptions },
      { id: 304, text: "Я чувствую усталость сразу после пробуждения, думая о работе.", category: "Истощение", options: frequencyOptions }
    ]
  },

  // 4. НАВЫКИ (Лидерство)
  "skills-leadership": {
    id: "skills-leadership",
    title: "Лидерский потенциал",
    description: "Анализ вашего стиля управления и способности вести за собой.",
    questions: [
      { id: 401, text: "В кризисной ситуации я быстро принимаю решения и беру ответственность.", category: "Решительность", options: agreementOptions },
      { id: 402, text: "Я предпочитаю делегировать задачи, доверяя команде.", category: "Делегирование", options: agreementOptions },
      { id: 403, text: "Мне важно вдохновлять людей общей идеей, а не просто давать указания.", category: "Харизма", options: agreementOptions },
      { id: 404, text: "Я легко признаю свои ошибки перед коллективом.", category: "Ответственность", options: agreementOptions }
    ]
  }
};

export const getAssessmentById = (id: string): AssessmentConfig | undefined => {
  return assessmentsDatabase[id];
};

export const getAllAssessments = () => Object.values(assessmentsDatabase);