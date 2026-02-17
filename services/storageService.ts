import { Answer, ChartDataPoint } from '../types';

export interface TestResult {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentIcon: string;
  assessmentGradient: string;
  type: 'quiz' | 'chat';
  date: string; // ISO string
  scores: ChartDataPoint[];
  archetype: string;
  summary: string;
  careers: string[];
  strengths: string[];
  answers?: Answer[];
}

export interface UserProfile {
  name: string;
  email: string;
  age: string;
  field: string;
  location: string;
  memberSince: string;
  avatarUrl: string;
}

const STORAGE_KEYS = {
  RESULTS: 'lifecompass_results',
  PROFILE: 'lifecompass_profile',
  THEME: 'lifecompass_theme',
  NOTIFICATIONS: 'lifecompass_notifications',
} as const;

// --- Test Results ---

export const saveTestResult = (result: TestResult): void => {
  const results = getAllResults();
  results.unshift(result);
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
};

export const getAllResults = (): TestResult[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getResultById = (id: string): TestResult | undefined => {
  return getAllResults().find(r => r.id === id);
};

export const getLatestResult = (): TestResult | undefined => {
  const results = getAllResults();
  return results.length > 0 ? results[0] : undefined;
};

export const getResultsByAssessment = (assessmentId: string): TestResult[] => {
  return getAllResults().filter(r => r.assessmentId === assessmentId);
};

export const deleteResult = (id: string): void => {
  const results = getAllResults().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
};

export const clearAllResults = (): void => {
  localStorage.removeItem(STORAGE_KEYS.RESULTS);
};

// --- User Profile ---

const defaultProfile: UserProfile = {
  name: 'Пользователь',
  email: '',
  age: '',
  field: '',
  location: '',
  memberSince: new Date().toISOString(),
  avatarUrl: '',
};

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export const saveUserProfile = (profile: Partial<UserProfile>): void => {
  const current = getUserProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
};

// --- Theme ---

export type Theme = 'light' | 'dark' | 'system';

export const getTheme = (): Theme => {
  return (localStorage.getItem(STORAGE_KEYS.THEME) as Theme) || 'system';
};

export const setTheme = (theme: Theme): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

// --- Notifications ---

export const getNotificationsEnabled = (): boolean => {
  const val = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return val === null ? true : val === 'true';
};

export const setNotificationsEnabled = (enabled: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, String(enabled));
};

// --- Utility ---

export const generateResultId = (): string => {
  return `result_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
