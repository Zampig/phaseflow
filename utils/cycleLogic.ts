import { differenceInDays, addDays, parseISO, startOfDay, format, isWithinInterval, compareDesc, compareAsc } from 'date-fns';
import { PhaseType, UserProfile, PhaseInfo, Period } from '../types';

/**
 * Helper to get ISO string for local storage keys
 */
export const getLogKey = (date: Date) => format(date, 'yyyy-MM-dd');

/**
 * Calculates average cycle and period lengths based on history.
 * Falls back to profile "typical" values if not enough history.
 */
export const getCycleStats = (profile: UserProfile) => {
  const sortedPeriods = [...(profile.periods || [])].sort((a, b) => compareDesc(parseISO(a.startDate), parseISO(b.startDate)));
  
  // If no periods recorded (shouldn't happen if initialized correctly), use defaults
  if (sortedPeriods.length === 0) {
    return {
      avgCycleLen: profile.cycleLength,
      avgPeriodLen: profile.periodLength,
      lastStart: profile.lastPeriodStart
    };
  }

  const lastStart = sortedPeriods[0].startDate;

  // Calculate Average Cycle Length
  // We need at least 2 periods to calculate a cycle gap
  let totalCycleDays = 0;
  let cycleCount = 0;
  
  for (let i = 0; i < sortedPeriods.length - 1; i++) {
    const current = parseISO(sortedPeriods[i].startDate);
    const previous = parseISO(sortedPeriods[i+1].startDate);
    const diff = differenceInDays(current, previous);
    // Filter out unrealistic cycles (e.g. missed entry resulting in 60+ days or erroneous < 10 days)
    if (diff > 15 && diff < 100) {
      totalCycleDays += diff;
      cycleCount++;
    }
  }

  const avgCycleLen = cycleCount > 0 
    ? Math.round(totalCycleDays / cycleCount) 
    : profile.cycleLength;

  // Calculate Average Period Length
  // Only count closed periods
  let totalPeriodDays = 0;
  let periodCount = 0;

  for (const p of sortedPeriods) {
    if (p.endDate) {
      const len = differenceInDays(parseISO(p.endDate), parseISO(p.startDate)) + 1;
      if (len > 0 && len < 15) { // Sanity check
        totalPeriodDays += len;
        periodCount++;
      }
    }
  }

  const avgPeriodLen = periodCount > 0 
    ? Math.round(totalPeriodDays / periodCount) 
    : profile.periodLength;

  return { avgCycleLen, avgPeriodLen, lastStart };
};

/**
 * Calculates the current phase for a given date based on recorded history and rolling predictions.
 */
export const calculatePhase = (targetDate: Date, profile: UserProfile): PhaseInfo => {
  const target = startOfDay(targetDate);
  const targetStr = format(target, 'yyyy-MM-dd');

  // 1. Check if date is within a RECORDED period
  const recordedPeriod = (profile.periods || []).find(p => {
    const start = parseISO(p.startDate);
    // If end is null, assume it's still going if it's within 14 days of start (sanity limit for "open" display)
    // or if the target is today/recent. 
    // For specific date check: 
    // If closed: start <= target <= end
    // If open: start <= target && target <= today (roughly)
    
    if (p.endDate) {
      const end = parseISO(p.endDate);
      return isWithinInterval(target, { start, end });
    } else {
       // For an open period, we treat it as active for the target date if target >= start 
       // AND target isn't ridiculously far in future (e.g. next month). 
       // But simpler: Is target >= start? And is it reasonably "current"?
       // Let's just strictly check start. We'll handle "old open periods" by recommending closing them in UI.
       return target >= start && differenceInDays(target, start) < 20; 
    }
  });

  if (recordedPeriod) {
    const dayOfCycle = differenceInDays(target, parseISO(recordedPeriod.startDate)) + 1;
    return {
      type: PhaseType.MENSTRUAL,
      dayOfCycle,
      description: "Time to rest and recharge.",
      color: "text-rose-600",
      bgColor: "bg-rose-200", // Darker shade for recorded
      isPmsDay: false,
      isRecordedPeriod: true,
      tips: {
        exercise: "Light walking, yoga, or complete rest.",
        food: "Iron-rich foods, warm soups, hydration.",
        mood: "Introspective and quiet."
      }
    };
  }

  // 2. Predict based on history
  const { avgCycleLen, avgPeriodLen, lastStart } = getCycleStats(profile);
  const lastPeriodDate = startOfDay(parseISO(lastStart));
  
  const diff = differenceInDays(target, lastPeriodDate);
  
  let dayOfCycle = diff % avgCycleLen;
  if (dayOfCycle < 0) {
    dayOfCycle = avgCycleLen + dayOfCycle;
  }
  const currentDay = dayOfCycle + 1;

  // Define Boundaries
  const periodEnd = avgPeriodLen;
  const ovulationDay = avgCycleLen - 14;
  const fertileStart = ovulationDay - 2;
  const fertileEnd = ovulationDay + 1;

  // PMS Calculation
  const pmsLen = profile.pmsLength || 5;
  const pmsStart = avgCycleLen - pmsLen + 1;
  const isPmsDay = currentDay >= pmsStart && currentDay <= avgCycleLen;
  const pmsTip = isPmsDay ? "You may notice more sensitivity or cravings in this window, plan lighter commitments if possible." : undefined;

  let type = PhaseType.FOLLICULAR;
  let description = "Rising energy and focus.";
  let color = "text-purple-600";
  let bgColor = "bg-purple-100";
  let tips = {
    exercise: "Cardio, HIIT, or trying something new.",
    food: "Fermented foods, lean protein, veggies.",
    mood: "Social, open, and articulate."
  };

  if (currentDay <= periodEnd) {
    type = PhaseType.MENSTRUAL; // Predicted Menstrual
    description = "Time to rest and recharge.";
    color = "text-rose-500";
    bgColor = "bg-rose-100";
    tips = {
      exercise: "Light walking, yoga, or complete rest.",
      food: "Iron-rich foods, warm soups, hydration.",
      mood: "Introspective and quiet."
    };
  } else if (currentDay >= fertileStart && currentDay <= fertileEnd) {
    type = PhaseType.OVULATION;
    description = "Peak energy and confidence.";
    color = "text-teal-600";
    bgColor = "bg-teal-100";
    tips = {
      exercise: "High intensity, strength training.",
      food: "Cruciferous veggies, berries, antioxidants.",
      mood: "Communicative and confident."
    };
  } else if (currentDay > fertileEnd) {
    type = PhaseType.LUTEAL;
    description = "Winding down, prioritizing comfort.";
    color = "text-amber-600";
    bgColor = "bg-amber-100";
    tips = {
      exercise: "Pilates, light weights, nature walks.",
      food: "Complex carbs, magnesium-rich foods.",
      mood: "Detail-oriented, maybe nesting."
    };
  }

  return {
    type,
    dayOfCycle: currentDay,
    description,
    color,
    bgColor,
    isPmsDay,
    pmsTip,
    isRecordedPeriod: false,
    tips
  };
};

export interface CycleEvent {
  type: 'PERIOD_START' | 'OVULATION_START' | 'PMS_START';
  date: Date;
  daysUntil: number;
  label: string;
}

/**
 * Calculates upcoming events for the next N days based on current profile settings.
 */
export const getUpcomingEvents = (profile: UserProfile, today: Date, daysToCheck: number = 7): CycleEvent[] => {
  const events: CycleEvent[] = [];
  const { avgCycleLen, lastStart } = getCycleStats(profile);
  const lastPeriodDate = startOfDay(parseISO(lastStart));

  // Determine calculation boundaries based on current settings
  const ovulationDay = avgCycleLen - 14;
  const fertileStart = ovulationDay - 2;
  const pmsLen = profile.pmsLength || 5;
  const pmsStart = avgCycleLen - pmsLen + 1;

  for (let i = 0; i <= daysToCheck; i++) {
    const targetDate = addDays(today, i);
    const diff = differenceInDays(targetDate, lastPeriodDate);
    
    // Normalize to cycle day (1-based)
    let dayOfCycle = diff % avgCycleLen;
    if (dayOfCycle < 0) dayOfCycle = avgCycleLen + dayOfCycle;
    const currentDay = dayOfCycle + 1;

    // We only want predicted starts, so if it's already a recorded period (except day 1 of it if we are on day 1), 
    // we generally prioritize the recorded state in the UI, but here we are looking for "Upcoming" signals.
    // If today is day 1 of a recorded period, it's technically a "Period Start" event happening today.

    // Check Period Start (Day 1)
    if (currentDay === 1 && profile.notifications.periodSoon) {
       events.push({
         type: 'PERIOD_START',
         date: targetDate,
         daysUntil: i,
         label: 'Period is predicted to start'
       });
    }
    
    // Check Ovulation Window Start
    if (currentDay === fertileStart && profile.notifications.ovulationWindow) {
        events.push({
            type: 'OVULATION_START',
            date: targetDate,
            daysUntil: i,
            label: 'Ovulation window begins'
        });
    }

    // Check PMS Window Start
    if (currentDay === pmsStart && profile.notifications.pmsWindow) {
        events.push({
            type: 'PMS_START',
            date: targetDate,
            daysUntil: i,
            label: 'PMS window starts'
        });
    }
  }
  
  return events;
};

/**
 * Helper to check if a specific date is a start day for calendar markers
 */
export const getEventMarker = (date: Date, profile: UserProfile): 'PERIOD' | 'OVULATION' | 'PMS' | null => {
    const { avgCycleLen, lastStart } = getCycleStats(profile);
    const lastPeriodDate = startOfDay(parseISO(lastStart));
    const diff = differenceInDays(date, lastPeriodDate);
    
    let dayOfCycle = diff % avgCycleLen;
    if (dayOfCycle < 0) dayOfCycle = avgCycleLen + dayOfCycle;
    const currentDay = dayOfCycle + 1;

    const ovulationDay = avgCycleLen - 14;
    const fertileStart = ovulationDay - 2;
    const pmsLen = profile.pmsLength || 5;
    const pmsStart = avgCycleLen - pmsLen + 1;

    if (currentDay === 1) return 'PERIOD';
    if (currentDay === fertileStart) return 'OVULATION';
    if (currentDay === pmsStart) return 'PMS';

    return null;
};