import React from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChartDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

export type AssessmentType = 'quiz' | 'chat';

export interface QuestionOption {
  value: number | string;
  label: string;
  color?: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  options?: QuestionOption[]; // Optional, can use global default options
}

export interface AssessmentConfig {
  id: string;
  type: AssessmentType; // Determines if it's a structured quiz or AI chat
  title: string;
  description: string;
  
  // For Chat Mode
  systemInstruction?: string; 
  initialMessage?: string;
  
  // For Quiz Mode
  questions?: Question[];
  
  icon?: string;
  gradient?: string;
}

export interface Answer {
  questionId: number;
  value: number | string;
  category: string;
}
