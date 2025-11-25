export interface HistoryItem {
  id: string;
  text: string;
  date: number; // Timestamp
  preview?: string; // Base64 thumbnail (optional, kept small)
}

export enum AppRoute {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY'
}

export interface OcrResult {
  text: string;
  originalImage: string; // Base64
  detectedLanguage?: string;
}

export interface IconProps {
  className?: string;
  onClick?: () => void;
}
