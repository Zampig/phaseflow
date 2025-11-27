import React from 'react';
import { PhaseInfo } from '../types';
import { Activity, Utensils, Smile, CloudRain } from 'lucide-react';

interface PhaseCardProps {
  phase: PhaseInfo;
  dateStr: string;
  onClick?: () => void;
  showExercise?: boolean;
  showFood?: boolean;
  showMood?: boolean;
  estimated?: boolean;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ 
  phase, 
  dateStr, 
  onClick, 
  showExercise = true,
  showFood = true,
  showMood = true,
  estimated = false
}) => {
  return (
    <div 
      onClick={onClick}
      className={`w-full p-6 rounded-3xl shadow-sm ${phase.bgColor} transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
            <p className="text-sm uppercase tracking-wider opacity-70 font-semibold mb-1">{dateStr}</p>
            <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-3xl font-bold ${phase.color}`}>{phase.type}</h2>
                {estimated && (
                   <span className="px-2 py-0.5 bg-white/40 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600 border border-slate-200/30">
                     Estimated
                   </span>
                )}
                {phase.isPmsDay && (
                    <span className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wide text-slate-700 border border-slate-200/50 shadow-sm flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-slate-500" />
                        PMS Window
                    </span>
                )}
            </div>
        </div>
        <div className={`px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full text-sm font-semibold ${phase.color}`}>
          Day {phase.dayOfCycle}
        </div>
      </div>
      
      <p className="text-slate-700 mb-6 text-lg leading-relaxed font-medium">
        {phase.description}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {showExercise && (
          <div className="bg-white/60 p-3 rounded-xl flex items-center gap-3">
            <Activity className={`w-5 h-5 ${phase.color}`} />
            <span className="text-slate-700 text-sm">{phase.tips.exercise}</span>
          </div>
        )}
        
        {showFood && (
          <div className="bg-white/60 p-3 rounded-xl flex items-center gap-3">
            <Utensils className={`w-5 h-5 ${phase.color}`} />
            <span className="text-slate-700 text-sm">{phase.tips.food}</span>
          </div>
        )}

        {showMood && (
          <div className="bg-white/60 p-3 rounded-xl flex flex-col gap-1">
             <div className="flex items-center gap-3">
                  <Smile className={`w-5 h-5 ${phase.color}`} />
                  <span className="text-slate-700 text-sm">{phase.tips.mood}</span>
             </div>
             {phase.isPmsDay && phase.pmsTip && (
                 <div className="mt-2 pl-8 text-xs text-slate-500 italic flex items-start gap-1">
                     <span className="shrink-0 text-slate-400">*</span>
                     {phase.pmsTip}
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};