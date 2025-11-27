import React, { useMemo } from 'react';
import { UserProfile, PhaseType, DailyLog } from '../types';
import { analyzeCycles, analyzePhaseDetails } from '../utils/analytics';
import { getCycleStats } from '../utils/cycleLogic';
import { PHASE_COLORS } from '../utils/phaseContent';
import { BarChart, Info, Zap, Moon } from 'lucide-react';

interface InsightsViewProps {
  profile: UserProfile;
  logs: DailyLog[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ profile, logs }) => {
  const summaryStats = useMemo(() => analyzeCycles(profile, logs), [profile, logs]);
  const phaseStats = useMemo(() => analyzePhaseDetails(profile, logs), [profile, logs]);
  const cycleStats = useMemo(() => getCycleStats(profile), [profile]);

  const totalIntensity = phaseStats.reduce((sum, p) => sum + p.symptomIntensity, 0);
  const avgIntensity = totalIntensity / 4;

  const maxLoggedDays = Math.max(...phaseStats.map(p => p.loggedDays), 1);

  const avgTotalSleep = phaseStats.reduce((sum, p) => sum + p.avgSleep, 0) / 4;
  const minSleepPhase = [...phaseStats].sort((a, b) => {
     if (a.avgSleep === 0) return 1;
     if (b.avgSleep === 0) return -1;
     return a.avgSleep - b.avgSleep;
  })[0];
  const hasSleepData = phaseStats.some(p => p.avgSleep > 0);

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Insights</h1>
        <p className="text-slate-500">Your cycle patterns.</p>
      </header>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-center text-center divide-x divide-slate-100">
            <div className="flex-1 px-2">
                <span className="block text-2xl font-bold text-slate-800 mb-1">{cycleStats.avgCycleLen}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Avg Cycle</span>
            </div>
            <div className="flex-1 px-2">
                <span className="block text-2xl font-bold text-slate-800 mb-1">{cycleStats.avgPeriodLen}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Avg Period</span>
            </div>
            <div className="flex-1 px-2">
                <span className="block text-2xl font-bold text-slate-800 mb-1">{(profile.periods || []).length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">History</span>
            </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4 font-medium">
           Based on your recorded history
        </p>
      </div>

      {/* Energy Across Phases */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Zap className="w-4 h-4 text-amber-500" />
            Energy Across Phases
        </h3>
        <div className="space-y-4">
            {phaseStats.map(phase => {
                const styles = PHASE_COLORS[phase.type];
                const widthPercent = (phase.avgEnergy / 5) * 100;
                const barColor = styles.text.replace('text-', 'bg-');

                return (
                    <div key={phase.type}>
                        <div className="flex justify-between items-end mb-1">
                            <span className={`text-xs font-bold ${styles.text} uppercase`}>{phase.type}</span>
                            <span className="text-xs font-semibold text-slate-600">{phase.avgEnergy > 0 ? phase.avgEnergy : '-'} / 5</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${widthPercent}%` }}
                                className={`h-full ${barColor} opacity-70 transition-all duration-500`}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

       {/* Sleep Trends */}
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Moon className="w-4 h-4 text-indigo-500" />
            Sleep Trends
        </h3>
        
        {hasSleepData ? (
             <div>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-slate-800">{avgTotalSleep.toFixed(1)}</span>
                    <span className="text-sm text-slate-500 font-medium">hours avg.</span>
                </div>
                
                {minSleepPhase && minSleepPhase.avgSleep > 0 && (
                    <div className="bg-indigo-50 p-3 rounded-xl flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-700 leading-relaxed">
                            You sleep slightly less in <strong>{minSleepPhase.type}</strong> phase ({minSleepPhase.avgSleep} hrs) compared to other phases.
                        </p>
                    </div>
                )}
             </div>
        ) : (
            <p className="text-sm text-slate-400 italic">No sleep data recorded yet.</p>
        )}
      </div>

      {/* Phase Analytics Cards */}
      <div className="space-y-4 mb-10">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
           Phase Patterns
        </h3>
        
        {phaseStats.map((phase) => {
          const styles = PHASE_COLORS[phase.type];
          const hasInsight = phase.symptomIntensity > avgIntensity * 1.3 && phase.loggedDays > 5;
          const noData = phase.loggedDays === 0;

          return (
            <div key={phase.type} className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.bg.replace('bg-', 'bg-')}`}></div>
               <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.text.replace('text-', 'bg-')}`}></div>
              
              <div className="flex justify-between items-start mb-3 pl-3">
                 <h4 className={`text-lg font-bold ${styles.text}`}>{phase.type}</h4>
                 <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg uppercase tracking-wider">
                   {phase.loggedDays} Days Logged
                 </span>
              </div>

              {noData ? (
                <p className="pl-3 text-sm text-slate-400 italic">No logs yet for this phase.</p>
              ) : (
                <div className="pl-3 space-y-2">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wide block mb-0.5">Most Common Moods</span>
                    {phase.topMoods.length > 0 ? phase.topMoods.join(', ') : 'None recorded'}
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wide block mb-0.5">Most Common Symptoms</span>
                    {phase.topSymptoms.length > 0 ? phase.topSymptoms.join(', ') : 'None recorded'}
                  </div>
                  
                  {hasInsight && (
                    <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2 items-start">
                        <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                            You tend to log more symptoms than average in this phase.
                        </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
         <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
            <BarChart className="w-4 h-4 text-slate-400" />
            Total Logged Days
        </h3>
        
        <div className="flex items-end justify-between gap-3 h-32">
            {phaseStats.map((phase) => {
                const styles = PHASE_COLORS[phase.type];
                const heightPercent = maxLoggedDays > 0 ? (phase.loggedDays / maxLoggedDays) * 100 : 5;
                const barColor = styles.text.replace('text-', 'bg-');

                return (
                    <div key={phase.type} className="flex-1 flex flex-col items-center gap-2">
                         <div className="w-full relative flex items-end justify-center h-full">
                             <div 
                                style={{ height: `${heightPercent}%` }}
                                className={`w-full max-w-[30px] rounded-t-lg opacity-80 ${barColor} transition-all duration-500`}
                             ></div>
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase truncate w-full text-center">
                            {phase.type.substring(0, 3)}
                         </span>
                    </div>
                )
            })}
        </div>
      </div>

    </div>
  );
};