import React from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface AssessmentModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  isNew?: boolean;
  completed?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface RecentResult {
  id: string;
  title: string;
  date: string;
  icon: string;
  colorClass: string;
  scoreDisplay: React.ReactNode;
  summary: string;
}

export interface ChartDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

// Новые типы для опросников
export interface QuestionOption {
  value: number | string;
  label: string;
  color?: string; // Для визуального выделения
}

export interface Question {
  id: number;
  text: string;
  category: string; // Например, 'R' (Realistic) для RIASEC
  options: QuestionOption[];
}

export interface AssessmentConfig {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Answer {
  questionId: number;
  value: number | string;
  category: string;
}