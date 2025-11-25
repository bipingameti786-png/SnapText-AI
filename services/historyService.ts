import { HistoryItem } from '../types';

const HISTORY_KEY = 'snaptext_history_v1';

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as HistoryItem[];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveToHistory = (text: string, imageBase64?: string): HistoryItem => {
  const history = getHistory();
  
  // Create a small thumbnail or just save text to save space
  // We won't save the full image to localStorage to avoid quota limits (usually 5MB)
  // Just extracting a snippet for preview
  
  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    text: text,
    date: Date.now(),
  };

  const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return newItem;
};

export const deleteFromHistory = (id: string): HistoryItem[] => {
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};
