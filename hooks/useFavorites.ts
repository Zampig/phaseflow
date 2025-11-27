import { useState, useEffect } from 'react';
import { PhaseType } from '../types';

export interface Favorites {
  [key: string]: {
    exercise: string[];
    food: string[];
    supplements: string[];
  };
}

const STORAGE_KEY = 'phaseflow_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorites>({
    [PhaseType.MENSTRUAL]: { exercise: [], food: [], supplements: [] },
    [PhaseType.FOLLICULAR]: { exercise: [], food: [], supplements: [] },
    [PhaseType.OVULATION]: { exercise: [], food: [], supplements: [] },
    [PhaseType.LUTEAL]: { exercise: [], food: [], supplements: [] },
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure structure is correct even if reading old format
        const migrated = Object.keys(parsed).reduce((acc, key) => {
            acc[key] = {
                exercise: parsed[key].exercise || [],
                food: parsed[key].food || [],
                supplements: parsed[key].supplements || []
            };
            return acc;
        }, {} as any);
        setFavorites(prev => ({ ...prev, ...migrated }));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const toggleFavorite = (phase: PhaseType, category: 'exercise' | 'food' | 'supplements', item: string) => {
    setFavorites(prev => {
      const phaseFavs = prev[phase] || { exercise: [], food: [], supplements: [] };
      const list = phaseFavs[category] || [];
      const exists = list.includes(item);
      
      const newList = exists 
        ? list.filter(i => i !== item) 
        : [...list, item];
      
      const newFavorites = {
        ...prev,
        [phase]: {
          ...phaseFavs,
          [category]: newList
        }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (phase: PhaseType, category: 'exercise' | 'food' | 'supplements', item: string) => {
    return favorites[phase]?.[category]?.includes(item) || false;
  };

  return { favorites, toggleFavorite, isFavorite };
};