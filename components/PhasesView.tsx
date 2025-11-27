import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PhaseType, FavoritesMap } from '../types';
import { calculatePhase } from '../utils/cycleLogic';
import { PHASE_CONTENT, PHASE_COLORS } from '../utils/phaseContent';
import { ChevronRight, ArrowLeft, Activity, Utensils, Droplets, Calendar, AlertCircle, Heart } from 'lucide-react';

interface PhasesViewProps {
  profile: UserProfile;
  favorites: FavoritesMap;
  onToggleFavorite: (phase: PhaseType, category: 'exercise' | 'food' | 'supplements', item: string) => void;
}

export const PhasesView: React.FC<PhasesViewProps> = ({ profile, favorites, onToggleFavorite }) => {
  const [currentPhase, setCurrentPhase] = useState<PhaseType>(PhaseType.MENSTRUAL);
  const [selectedPhase, setSelectedPhase] = useState<PhaseType | null>(null);
  
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const modules = profile.modules;

  useEffect(() => {
    const phaseInfo = calculatePhase(new Date(), profile);
    setCurrentPhase(phaseInfo.type);
  }, [profile]);

  useEffect(() => {
    if (!selectedPhase && cardRefs.current[currentPhase]) {
      setTimeout(() => {
        cardRefs.current[currentPhase]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentPhase, selectedPhase]);

  const isFavorite = (phase: PhaseType, category: 'exercise' | 'food' | 'supplements', item: string) => {
    return favorites[phase]?.[category]?.includes(item) || false;
  };

  if (selectedPhase) {
    const content = PHASE_CONTENT[selectedPhase];
    const styles = PHASE_COLORS[selectedPhase];
    const phaseFavs = favorites[selectedPhase];

    return (
      <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen animate-slide-up">
        <header className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => setSelectedPhase(null)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">{selectedPhase} Phase</h1>
        </header>

        <div className="space-y-6">
          <section className={`p-6 rounded-3xl ${styles.bg}`}>
            <h2 className={`text-lg font-bold ${styles.text} mb-3 uppercase tracking-wider`}>Overview</h2>
            <p className="text-slate-800 text-lg leading-relaxed font-medium">
              {content.overview}
            </p>
          </section>

          {modules.exercise && (
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${styles.icon}`}>
                    <Activity className={`w-4 h-4 ${styles.text}`} />
                </span>
                Exercise
                </h2>
                
                <div className="mb-6">
                    <span className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Recommended</span>
                    <ul className="space-y-2">
                        {content.exercise.recommended.map((item, i) => {
                            const isFav = isFavorite(selectedPhase, 'exercise', item);
                            return (
                            <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                <span className="text-slate-700 font-medium text-sm">{item}</span>
                                {modules.favorites && (
                                    <button 
                                        onClick={() => onToggleFavorite(selectedPhase, 'exercise', item)}
                                        className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
                                    >
                                        <Heart className={`w-5 h-5 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                                    </button>
                                )}
                            </li>
                            );
                        })}
                    </ul>
                </div>

                <div>
                    <span className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> What to go easy on
                    </span>
                    <ul className="space-y-1 ml-1">
                        {content.exercise.avoid.map((item, i) => (
                            <li key={i} className="text-slate-500 text-sm list-disc list-inside">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
          )}

          {modules.food && (
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${styles.icon}`}>
                    <Utensils className={`w-4 h-4 ${styles.text}`} />
                </span>
                Nutrition
                </h2>
                
                <div className="mb-6">
                    <span className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Foods to Focus On</span>
                    <div className="flex flex-wrap gap-2">
                        {content.nutrition.focus.map((item, i) => {
                             const isFav = isFavorite(selectedPhase, 'food', item);
                             return (
                                <button
                                    key={i}
                                    onClick={() => modules.favorites && onToggleFavorite(selectedPhase, 'food', item)}
                                    className={`
                                        inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
                                        ${isFav ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-700 hover:border-slate-200'}
                                    `}
                                >
                                    {item}
                                    {modules.favorites && (
                                         <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-indigo-500 text-indigo-500' : 'text-slate-300'}`} />
                                    )}
                                </button>
                             )
                        })}
                    </div>
                </div>

                 <div>
                    <span className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Foods to Limit</span>
                    <ul className="space-y-1 ml-1">
                        {content.nutrition.limit.map((item, i) => (
                            <li key={i} className="text-slate-500 text-sm list-disc list-inside">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
          )}

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${styles.icon}`}>
                    <Droplets className={`w-4 h-4 ${styles.text}`} />
                </span>
                Hydration & Wellness
            </h2>

            <div className="mb-6">
                <ul className="space-y-3">
                    {content.hydration.tips.map((item, i) => (
                         <li key={i} className="flex gap-3 items-start">
                             <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${styles.bg.replace('bg-', 'bg-slate-400')}`}></div>
                             <span className="text-slate-700 text-sm">{item}</span>
                         </li>
                    ))}
                </ul>
            </div>

            <div>
                 <span className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Wellness Tips (Not Medical Advice)</span>
                 <ul className="space-y-2">
                    {content.hydration.supplements.map((item, i) => {
                        const isFav = isFavorite(selectedPhase, 'supplements', item);
                        return (
                             <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                <span className="text-slate-700 font-medium text-sm">{item}</span>
                                {modules.favorites && (
                                    <button 
                                        onClick={() => onToggleFavorite(selectedPhase, 'supplements', item)}
                                        className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
                                    >
                                        <Heart className={`w-5 h-5 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                                    </button>
                                )}
                            </li>
                        )
                    })}
                 </ul>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${styles.icon}`}>
                    <Calendar className={`w-4 h-4 ${styles.text}`} />
                </span>
                Weekly Suggestions
            </h2>
            <div className="space-y-3">
                {content.weeklySuggestions.map((item, i) => (
                    <div key={i} className="flex gap-3">
                         <div className="flex flex-col items-center gap-1">
                             <div className={`w-0.5 h-full ${styles.bg}`}></div>
                         </div>
                         <div className="pb-2">
                             <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
                         </div>
                    </div>
                ))}
            </div>
          </section>

        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-fade-in" ref={listRef}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Phases</h1>
        <p className="text-slate-500">Understand your cycle.</p>
      </header>

      <div className="space-y-4">
        {[PhaseType.MENSTRUAL, PhaseType.FOLLICULAR, PhaseType.OVULATION, PhaseType.LUTEAL].map((type) => {
          const isCurrent = type === currentPhase;
          const styles = PHASE_COLORS[type];

          return (
            <div
              key={type}
              ref={(el) => { cardRefs.current[type] = el; }}
              onClick={() => setSelectedPhase(type)}
              className={`
                relative p-6 rounded-3xl transition-all duration-300 cursor-pointer group
                ${isCurrent ? `${styles.bg} shadow-md ring-2 ring-offset-2 ring-slate-900` : 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200'}
              `}
            >
              {isCurrent && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-white/60 px-2 py-1 rounded-full text-slate-800">
                  Current
                </span>
              )}
              
              <div className="flex justify-between items-center mb-2">
                <h2 className={`text-2xl font-bold ${styles.text}`}>{type}</h2>
                {!isCurrent && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />}
              </div>

              <p className={`text-sm line-clamp-2 ${isCurrent ? 'text-slate-700' : 'text-slate-500'}`}>
                {PHASE_CONTENT[type].overview}
              </p>

              <div className="flex gap-2 mt-4 opacity-70">
                 {modules.exercise && <div className="p-1.5 bg-white/50 rounded-full"><Activity className={`w-3 h-3 ${styles.text}`} /></div>}
                 {modules.food && <div className="p-1.5 bg-white/50 rounded-full"><Utensils className={`w-3 h-3 ${styles.text}`} /></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};