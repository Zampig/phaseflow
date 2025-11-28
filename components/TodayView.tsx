import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInDays, subDays } from 'date-fns';
import { UserProfile, DailyLog, MOOD_OPTIONS, SYMPTOM_OPTIONS, Period, FavoritesMap } from '../types';
import { calculatePhase, getLogKey, getUpcomingEvents, CycleEvent } from '../utils/cycleLogic';
import { getPersonalizedSuggestion } from '../utils/suggestions';
import { PHASE_CONTENT } from '../utils/phaseContent';
import { PhaseCard } from './PhaseCard';
import { Button } from './Button';
import { DailyInsights } from './DailyInsights';
import { Droplets, Smile, Thermometer, Sparkles, Heart, Activity, Utensils, ChevronRight, CalendarClock, Zap, Moon, Bell, X, Droplet } from 'lucide-react';

interface TodayViewProps {
  profile: UserProfile;
  logs: DailyLog[];
  favorites: FavoritesMap;
  onPhaseClick?: () => void;
  onProfileUpdate: (p: UserProfile) => void; // Updates Settings + Period array logic
  onSaveLog: (log: DailyLog) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  profile,
  logs,
  favorites,
  onPhaseClick,
  onProfileUpdate,
  onSaveLog
}) => {
  const [today] = useState(new Date());
  const phase = calculatePhase(today, profile);
  const logKey = getLogKey(today);

  // State for the log
  const [log, setLog] = useState<DailyLog>({
    date: logKey,
    moods: [],
    symptoms: [],
    note: ''
  });

  const [isSaved, setIsSaved] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CycleEvent[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerEvent, setBannerEvent] = useState<CycleEvent | null>(null);

  const modules = profile.modules;

  // Sync state with passed logs
  useEffect(() => {
    const existingLog = logs.find(l => l.date === logKey);
    if (existingLog) {
      setLog(existingLog);
    }
  }, [logKey, logs]);

  useEffect(() => {
    // Generate suggestion based on logs prop
    setSuggestion(getPersonalizedSuggestion(phase.type, profile, logs));

    // Calculate Upcoming Events
    const events = getUpcomingEvents(profile, today);
    setUpcomingEvents(events);

    // Check for Today Banner
    const todayEvent = events.find(e => e.daysUntil === 0);
    if (todayEvent) {
      const dismissedKey = `dismissed_banner_${format(today, 'yyyy-MM-dd')}_${todayEvent.type}`;
      const isDismissed = localStorage.getItem(dismissedKey);

      if (!isDismissed) {
        setBannerEvent(todayEvent);
        setShowBanner(true);
      }
    }
  }, [phase.type, profile, today, logs]);

  const handleDismissBanner = () => {
    if (bannerEvent) {
      const dismissedKey = `dismissed_banner_${format(today, 'yyyy-MM-dd')}_${bannerEvent.type}`;
      localStorage.setItem(dismissedKey, 'true');
      setShowBanner(false);
    }
  };

  const handleSave = () => {
    onSaveLog(log);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleMood = (m: string) => {
    setLog(prev => ({
      ...prev,
      moods: prev.moods.includes(m) ? prev.moods.filter(i => i !== m) : [...prev.moods, m]
    }));
  };

  const toggleSymptom = (s: string) => {
    setLog(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(i => i !== s) : [...prev.symptoms, s]
    }));
  };

  // PERIOD MANAGEMENT LOGIC
  const todayStr = format(today, 'yyyy-MM-dd');
  const activePeriod = (profile.periods || []).find(p => !p.endDate && p.startDate <= todayStr);
  const periodDay = activePeriod
    ? differenceInDays(today, parseISO(activePeriod.startDate)) + 1
    : 0;

  const handleStartPeriod = () => {
    const newPeriods = [...(profile.periods || [])];

    // Close any previous open periods
    newPeriods.forEach(p => {
      if (!p.endDate) {
        p.endDate = format(subDays(today, 1), 'yyyy-MM-dd');
      }
    });

    const newPeriod: Period = {
      startDate: todayStr,
      endDate: null
    };
    newPeriods.push(newPeriod);

    onProfileUpdate({
      ...profile,
      periods: newPeriods
    });
  };

  const handleEndPeriod = () => {
    if (!activePeriod) return;

    const newPeriods = (profile.periods || []).map(p => {
      if (p === activePeriod) {
        return { ...p, endDate: todayStr };
      }
      return p;
    });

    onProfileUpdate({
      ...profile,
      periods: newPeriods
    });
  };

  const currentPhaseFavs = favorites[phase.type] || { exercise: [], food: [], supplements: [] };
  const hasFavs = currentPhaseFavs.exercise.length > 0 || currentPhaseFavs.food.length > 0 || currentPhaseFavs.supplements.length > 0;

  // Is item favorite?
  const isFavorite = (cat: 'exercise' | 'food' | 'supplements', item: string) => {
    return currentPhaseFavs[cat]?.includes(item);
  };

  const energyOptions = [
    { value: 1, label: 'Very Low' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Med' },
    { value: 4, label: 'High' },
    { value: 5, label: 'Very High' },
  ];

  const getEventText = (event: CycleEvent) => {
    if (event.daysUntil === 0) {
      if (event.type === 'PERIOD_START') return 'Your period is predicted to start today';
      if (event.type === 'OVULATION_START') return 'Your ovulation window starts today';
      if (event.type === 'PMS_START') return 'Your PMS window starts today';
    }
    const dayText = event.daysUntil === 1 ? 'Tomorrow' : `In ${event.daysUntil} days`;
    return `${dayText}: ${event.label}`;
  };

  // "Phase at a Glance" logic
  const currentContent = PHASE_CONTENT[phase.type];

  const getTopItems = (items: string[], category: 'exercise' | 'food' | 'supplements') => {
    const favs = items.filter(i => isFavorite(category, i));
    if (favs.length > 0) return favs.slice(0, 2);
    return items.slice(0, 2);
  };

  const glanceExercise = getTopItems(currentContent.exercise.recommended, 'exercise');
  const glanceFood = getTopItems(currentContent.nutrition.focus, 'food');
  const favSupps = currentContent.hydration.supplements.filter(s => isFavorite('supplements', s));
  const glanceHydration = favSupps.length > 0
    ? [favSupps[0], currentContent.hydration.tips[0]]
    : currentContent.hydration.tips.slice(0, 2);


  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-fade-in relative">

      {showBanner && bannerEvent && (
        <div className="mb-6 bg-slate-800 text-white p-4 rounded-2xl shadow-lg flex items-start gap-3 animate-slide-up relative">
          <Bell className="w-5 h-5 shrink-0 mt-0.5 text-rose-300" />
          <div className="flex-1">
            <p className="text-sm font-semibold pr-4">{getEventText(bannerEvent)}</p>
          </div>
          <button onClick={handleDismissBanner} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hello, dear</h1>
          <p className="text-slate-500">Here's your daily insight.</p>
        </div>
      </header>

      <PhaseCard
        phase={phase}
        dateStr={format(today, 'EEEE, MMM do')}
        onClick={onPhaseClick}
        showExercise={modules.exercise}
        showFood={modules.food}
        showMood={modules.mood}
        estimated={profile.irregularMode && !activePeriod}
      />

      <DailyInsights
        phase={phase.type}
        day={phase.dayOfCycle}
        symptoms={log.symptoms}
        moods={log.moods}
      />

      <div
        onClick={onPhaseClick}
        className="mt-6 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm animate-fade-in cursor-pointer hover:border-rose-200 transition-colors"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-400" /> {phase.type} at a glance
          </h3>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>

        <div className="space-y-3">
          {modules.exercise && (
            <div className="flex gap-3 items-start">
              <Activity className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 leading-snug">
                <span className="font-semibold text-slate-700">Move:</span> {glanceExercise.join(', ')}
              </p>
            </div>
          )}
          {modules.food && (
            <div className="flex gap-3 items-start">
              <Utensils className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 leading-snug">
                <span className="font-semibold text-slate-700">Eat:</span> {glanceFood.join(', ')}
              </p>
            </div>
          )}
          <div className="flex gap-3 items-start">
            <Droplet className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600 leading-snug">
              <span className="font-semibold text-slate-700">Hydrate:</span> {glanceHydration[0]}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm animate-fade-in">
        <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
          <CalendarClock className="w-4 h-4 text-slate-400" /> Period Status
        </h3>

        <div className="flex justify-between items-center gap-4">
          {activePeriod ? (
            <div>
              <span className="block text-lg font-bold text-rose-600">Day {periodDay} of period</span>
              <span className="text-xs text-slate-500">Started on {format(parseISO(activePeriod.startDate), 'MMM do')}</span>
            </div>
          ) : (
            <div>
              <span className="block text-lg font-bold text-slate-700">Not currently in period</span>
              <span className="text-xs text-slate-500">Based on your logs</span>
            </div>
          )}

          {activePeriod ? (
            <button
              onClick={handleEndPeriod}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap"
            >
              Mark Ended
            </button>
          ) : (
            <button
              onClick={handleStartPeriod}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-600 active:scale-95 transition-all whitespace-nowrap"
            >
              Start Period
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {suggestion && modules.suggestions && (
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm animate-fade-in flex gap-4 items-start mb-8">
            <div className="bg-indigo-50 p-2.5 rounded-2xl shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wide">Personal Suggestion</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {suggestion}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm mb-8 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Bell className="w-4 h-4 text-slate-400" /> Upcoming (7 Days)
          </h3>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${event.type === 'PERIOD_START' ? 'bg-rose-500' :
                    event.type === 'OVULATION_START' ? 'bg-teal-500' : 'bg-slate-400'
                    }`}></div>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-800">
                      {event.daysUntil === 0 ? 'Today' : event.daysUntil === 1 ? 'Tomorrow' : `In ${event.daysUntil} days`}:
                    </span> {event.label}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No upcoming cycle events to show right now.</p>
          )}
        </div>

        {modules.favorites && (
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm mb-8 animate-fade-in">
            <h3 className="text-sm font-bold text-rose-500 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Heart className="w-4 h-4 fill-rose-500" /> Today's Favorites
            </h3>

            {hasFavs ? (
              <div className="flex flex-wrap gap-2">
                {currentPhaseFavs.exercise.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                    <Activity className="w-3 h-3 text-slate-400" /> {item}
                  </span>
                ))}
                {currentPhaseFavs.food.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                    <Utensils className="w-3 h-3 text-slate-400" /> {item}
                  </span>
                ))}
                {currentPhaseFavs.supplements.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                    <Droplet className="w-3 h-3 text-slate-400" /> {item}
                  </span>
                ))}
              </div>
            ) : (
              <div
                onClick={onPhaseClick}
                className="text-slate-500 text-sm cursor-pointer hover:text-slate-700 transition-colors flex items-center justify-between"
              >
                <span>No favorites yet. Tap the hearts in the Phases tab to save your go-to options.</span>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
              </div>
            )}
          </div>
        )}

        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-rose-400 rounded-full"></span>
          Daily Log
        </h3>

        <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-slate-100">
          <label className="text-sm font-semibold text-slate-600 mb-3 block flex items-center gap-2">
            <Droplets className="w-4 h-4 text-rose-500" /> Flow
          </label>
          <div className="flex justify-between gap-2">
            {['None', 'Light', 'Medium', 'Heavy'].map((level) => (
              <button
                key={level}
                onClick={() => setLog({ ...log, flow: level as any })}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${log.flow === level
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-slate-100">
          <label className="text-sm font-semibold text-slate-600 mb-3 block flex items-center gap-2">
            <Smile className="w-4 h-4 text-amber-500" /> Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map(mood => (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${log.moods.includes(mood)
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-slate-100">
          <label className="text-sm font-semibold text-slate-600 mb-3 block flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-purple-500" /> Symptoms
          </label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map(sym => (
              <button
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${log.symptoms.includes(sym)
                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-slate-100">
          <label className="text-sm font-semibold text-slate-600 mb-4 block flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Energy Level
          </label>
          <div className="flex justify-between gap-1 mb-6">
            {energyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLog({ ...log, energyLevel: opt.value })}
                className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${log.energyLevel === opt.value
                  ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
              >
                <span className="block text-sm font-bold mb-0.5">{opt.value}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <label className="text-sm font-semibold text-slate-600 mb-3 block flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" /> Sleep last night: <span className="text-indigo-600 font-bold">{log.sleepHours || 0} hrs</span>
          </label>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={log.sleepHours || 7}
              onChange={(e) => setLog({ ...log, sleepHours: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">
              <span>0 hrs</span>
              <span>6 hrs</span>
              <span>12+ hrs</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-slate-100">
          <label className="text-sm font-semibold text-slate-600 mb-3 block">Note</label>
          <textarea
            value={log.note}
            onChange={(e) => setLog({ ...log, note: e.target.value })}
            placeholder="How are you feeling today?"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            rows={3}
          />
        </div>

        <Button fullWidth onClick={handleSave} disabled={isSaved}>
          {isSaved ? 'Saved!' : 'Save Entry'}
        </Button>
      </div>
    </div>
  );
};