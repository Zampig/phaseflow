import { DailyLog, PhaseType, UserProfile } from '../types';
import { calculatePhase } from './cycleLogic';
import { parseISO } from 'date-fns';

export const getPersonalizedSuggestion = (currentPhase: PhaseType, profile: UserProfile, logs: DailyLog[]): string | null => {
  // Filter logs that match the current phase
  const relevantLogs = logs.filter(log => {
    const date = parseISO(log.date);
    const p = calculatePhase(date, profile);
    return p.type === currentPhase;
  });

  if (relevantLogs.length < 3) {
      return null;
  }

  const count = relevantLogs.length;
  // Threshold: > 40% occurrence to be considered "often" or "frequent"
  const threshold = Math.max(3, count * 0.4); 

  const moods: Record<string, number> = {};
  const symptoms: Record<string, number> = {};

  for (const log of relevantLogs) {
    if (log.moods) log.moods.forEach(m => moods[m] = (moods[m] || 0) + 1);
    if (log.symptoms) log.symptoms.forEach(s => symptoms[s] = (symptoms[s] || 0) + 1);
  }

  // Priority Rules
  // Symptoms
  if ((symptoms['Cramps'] || 0) > threshold) return "Cramps are common for you in this phase. Keep a heat pack nearby and consider magnesium-rich foods.";
  if ((symptoms['Headache'] || 0) > threshold) return "You often experience headaches now. Staying hydrated and reducing screen time might help.";
  if ((symptoms['Bloating'] || 0) > threshold) return "Bloating is frequent for you here. Try herbal teas and reducing sodium intake.";
  if ((symptoms['Acne'] || 0) > threshold) return "Your skin tends to be sensitive in this phase. Stick to your gentle skincare routine.";
  if ((symptoms['Cravings'] || 0) > threshold) return "Cravings are common for you now. Balanced meals with protein can help stabilize energy.";
  if ((symptoms['Insomnia'] || 0) > threshold) return "Sleep is often disrupted for you in this phase. A calming bedtime routine is recommended.";
  if ((symptoms['Backache'] || 0) > threshold) return "Back pain often appears now. Gentle stretching or a warm bath may provide relief.";

  // Moods
  if ((moods['Tired'] || 0) > threshold) return "You often report feeling tired in this phase. Prioritize sleep and lighter activities today.";
  if ((moods['Irritable'] || 0) > threshold) return "Irritability is common for you here. Be kind to yourself and take breaks when needed.";
  if ((moods['Anxious'] || 0) > threshold) return "Anxiety tends to rise for you now. Grounding exercises or a walk can be very helpful.";
  if ((moods['Sensitive'] || 0) > threshold) return "You often feel more sensitive during this time. Allow yourself space to process emotions.";
  if ((moods['Energetic'] || 0) > threshold) return "You usually have high energy in this phase! It's a great time to move your body and get things done.";
  if ((moods['Happy'] || 0) > threshold) return "You tend to feel great in this phase! Enjoy this boost in mood and confidence.";

  return null;
}