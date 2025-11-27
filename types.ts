export enum PhaseType {
  MENSTRUAL = 'Menstrual',
  FOLLICULAR = 'Follicular',
  OVULATION = 'Ovulation',
  LUTEAL = 'Luteal',
}

export interface Period {
  id?: string; // UUID from DB
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate: string | null; // ISO Date string YYYY-MM-DD or null if ongoing
}

export interface UserProfile {
  lastPeriodStart: string; // ISO Date string YYYY-MM-DD (Legacy/Fallback)
  cycleLength: number; // Typical/Target length
  periodLength: number; // Typical/Target length
  pmsLength: number; // Duration of PMS window in days
  irregularMode: boolean; // Treat predictions as estimates
  modules: {
    exercise: boolean;
    food: boolean;
    mood: boolean;
    suggestions: boolean;
    favorites: boolean;
  };
  notifications: {
    periodSoon: boolean;
    ovulationWindow: boolean;
    pmsWindow: boolean;
  };
  periods: Period[]; // History of recorded periods
}

export interface DailyLog {
  id?: string; // UUID from DB
  date: string; // ISO Date string YYYY-MM-DD
  flow?: 'None' | 'Light' | 'Medium' | 'Heavy';
  moods: string[];
  symptoms: string[];
  note: string;
  energyLevel?: number; // 1 (Very Low) to 5 (Very High)
  sleepHours?: number; // 0-12+
}

export interface FavoriteItem {
  id?: string;
  phase: PhaseType;
  itemType: 'exercise' | 'food' | 'supplements';
  label: string;
}

// Helper type for the favorites map used in UI
export interface FavoritesMap {
  [key: string]: {
    exercise: string[];
    food: string[];
    supplements: string[];
  };
}

export interface PhaseInfo {
  type: PhaseType;
  dayOfCycle: number;
  description: string;
  color: string;
  bgColor: string;
  isPmsDay: boolean;
  pmsTip?: string;
  isRecordedPeriod?: boolean;
  tips: {
    food: string;
    exercise: string;
    mood: string;
  };
}

export const MOOD_OPTIONS = ['Happy', 'Energetic', 'Sensitive', 'Irritable', 'Calm', 'Anxious', 'Tired'];
export const SYMPTOM_OPTIONS = ['Cramps', 'Headache', 'Bloating', 'Acne', 'Cravings', 'Backache', 'Insomnia'];