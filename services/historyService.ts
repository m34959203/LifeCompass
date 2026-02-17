import { ChartDataPoint } from '../types';

export interface HistoryEntry {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  type: 'quiz' | 'chat';
  date: string;
  scores: ChartDataPoint[];
  result: {
    archetype: string;
    summary: string;
    careers: string[];
    strengths: string[];
  };
}

const HISTORY_PREFIX = 'lifecompass_history_';

const getKey = (userId: string) => `${HISTORY_PREFIX}${userId}`;

export const getHistory = (userId: string): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(getKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveResult = (
  userId: string,
  entry: Omit<HistoryEntry, 'id' | 'date'>
): HistoryEntry => {
  const history = getHistory(userId);
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
    date: new Date().toISOString(),
  };
  history.unshift(newEntry);
  // Keep max 50 results
  if (history.length > 50) history.length = 50;
  localStorage.setItem(getKey(userId), JSON.stringify(history));
  return newEntry;
};

export const deleteResult = (userId: string, entryId: string): void => {
  const history = getHistory(userId).filter(e => e.id !== entryId);
  localStorage.setItem(getKey(userId), JSON.stringify(history));
};

export const clearHistory = (userId: string): void => {
  localStorage.removeItem(getKey(userId));
};
