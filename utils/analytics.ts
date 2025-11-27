import { DailyLog, UserProfile, PhaseType } from '../types';
import { differenceInDays, parseISO, compareAsc, addDays, format } from 'date-fns';
import { calculatePhase } from './cycleLogic';

export interface CycleHistoryItem {
  startDate: string;
  endDate: string;
  cycleLength: number | null; 
  periodLength: number;
}

export interface CycleStats {
  avgCycleLength: number;
  avgPeriodLength: number;
  totalCycles: number;
  history: CycleHistoryItem[];
}

export interface PhaseStats {
  type: PhaseType;
  loggedDays: number;
  topMoods: string[];
  topSymptoms: string[];
  symptomIntensity: number;
  avgEnergy: number;
  avgSleep: number;
}

export const analyzeCycles = (profile: UserProfile, logs: DailyLog[]): CycleStats => {
  // Filter logs that have flow data
  const flowLogs = logs.filter(l => l.flow && l.flow !== 'None');

  // Sort logs by date
  flowLogs.sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));

  // Group logs into "Periods"
  const periods: { start: string; end: string }[] = [];
  
  if (flowLogs.length > 0) {
    let currentPeriodStart = flowLogs[0].date;
    let currentPeriodEnd = flowLogs[0].date;

    for (let i = 1; i < flowLogs.length; i++) {
      const currentLogDate = parseISO(flowLogs[i].date);
      const prevLogDate = parseISO(flowLogs[i-1].date);
      const diff = differenceInDays(currentLogDate, prevLogDate);

      if (diff > 7) {
        periods.push({ start: currentPeriodStart, end: currentPeriodEnd });
        currentPeriodStart = flowLogs[i].date;
        currentPeriodEnd = flowLogs[i].date;
      } else {
        currentPeriodEnd = flowLogs[i].date;
      }
    }
    periods.push({ start: currentPeriodStart, end: currentPeriodEnd });
  }

  const profileStart = profile.lastPeriodStart;
  const isProfileStartCovered = periods.some(p => {
    const diff = Math.abs(differenceInDays(parseISO(p.start), parseISO(profileStart)));
    return diff < 7;
  });

  if (!isProfileStartCovered) {
    const estimatedEnd = format(addDays(parseISO(profileStart), profile.periodLength - 1), 'yyyy-MM-dd');
    periods.push({ start: profileStart, end: estimatedEnd });
  }

  periods.sort((a, b) => compareAsc(parseISO(b.start), parseISO(a.start)));

  const processedHistory: CycleHistoryItem[] = [];
  let totalCycleDays = 0;
  let cycleCount = 0;
  let totalPeriodDays = 0;

  const chronologicalPeriods = [...periods].reverse(); 

  for (let i = 0; i < chronologicalPeriods.length; i++) {
    const current = chronologicalPeriods[i];
    const next = chronologicalPeriods[i + 1];
    
    const pLen = differenceInDays(parseISO(current.end), parseISO(current.start)) + 1;
    totalPeriodDays += pLen;
    
    let cLen: number | null = null;
    if (next) {
      cLen = differenceInDays(parseISO(next.start), parseISO(current.start));
      totalCycleDays += cLen;
      cycleCount++;
    }

    processedHistory.push({
      startDate: current.start,
      endDate: current.end,
      cycleLength: cLen,
      periodLength: pLen
    });
  }

  const avgCycleLength = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : profile.cycleLength;
  const avgPeriodLength = chronologicalPeriods.length > 0 ? Math.round(totalPeriodDays / chronologicalPeriods.length) : profile.periodLength;

  return {
    avgCycleLength,
    avgPeriodLength,
    totalCycles: chronologicalPeriods.length,
    history: processedHistory.reverse()
  };
};

export const analyzePhaseDetails = (profile: UserProfile, logs: DailyLog[]): PhaseStats[] => {
  const phaseData: Record<string, { 
    count: number; 
    moods: Record<string, number>; 
    symptoms: Record<string, number>;
    totalSymptomCount: number;
    totalEnergy: number;
    energyCount: number;
    totalSleep: number;
    sleepCount: number;
  }> = {
    [PhaseType.MENSTRUAL]: { count: 0, moods: {}, symptoms: {}, totalSymptomCount: 0, totalEnergy: 0, energyCount: 0, totalSleep: 0, sleepCount: 0 },
    [PhaseType.FOLLICULAR]: { count: 0, moods: {}, symptoms: {}, totalSymptomCount: 0, totalEnergy: 0, energyCount: 0, totalSleep: 0, sleepCount: 0 },
    [PhaseType.OVULATION]: { count: 0, moods: {}, symptoms: {}, totalSymptomCount: 0, totalEnergy: 0, energyCount: 0, totalSleep: 0, sleepCount: 0 },
    [PhaseType.LUTEAL]: { count: 0, moods: {}, symptoms: {}, totalSymptomCount: 0, totalEnergy: 0, energyCount: 0, totalSleep: 0, sleepCount: 0 },
  };

  logs.forEach(log => {
      try {
        if (log.date) {
            const date = parseISO(log.date);
            const phase = calculatePhase(date, profile).type;
            
            if (phaseData[phase]) {
                phaseData[phase].count++;
                
                if (log.moods) {
                    log.moods.forEach(m => {
                        phaseData[phase].moods[m] = (phaseData[phase].moods[m] || 0) + 1;
                    });
                }
                if (log.symptoms) {
                    log.symptoms.forEach(s => {
                        phaseData[phase].symptoms[s] = (phaseData[phase].symptoms[s] || 0) + 1;
                    });
                    phaseData[phase].totalSymptomCount += log.symptoms.length;
                }
                
                if (log.energyLevel !== undefined) {
                    phaseData[phase].totalEnergy += log.energyLevel;
                    phaseData[phase].energyCount++;
                }

                if (log.sleepHours !== undefined) {
                    phaseData[phase].totalSleep += log.sleepHours;
                    phaseData[phase].sleepCount++;
                }
            }
        }
      } catch (e) {
          // ignore bad logs
      }
  });

  return Object.values(PhaseType).map(type => {
      const data = phaseData[type];
      
      const sortedMoods = Object.entries(data.moods)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(x => x[0]);

      const sortedSymptoms = Object.entries(data.symptoms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(x => x[0]);
    
      const intensity = data.count > 0 ? data.totalSymptomCount / data.count : 0;
      const avgEnergy = data.energyCount > 0 ? parseFloat((data.totalEnergy / data.energyCount).toFixed(1)) : 0;
      const avgSleep = data.sleepCount > 0 ? parseFloat((data.totalSleep / data.sleepCount).toFixed(1)) : 0;

      return {
          type,
          loggedDays: data.count,
          topMoods: sortedMoods,
          topSymptoms: sortedSymptoms,
          symptomIntensity: intensity,
          avgEnergy,
          avgSleep
      };
  });
};