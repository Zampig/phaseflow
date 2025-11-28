import { supabase } from '../lib/supabaseClient';
import { UserProfile, DailyLog, Period, FavoriteItem, FavoritesMap, PhaseType } from '../types';

// PROFILE & SETTINGS
export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) return null;

  // Fetch periods separately
  const { data: periods } = await supabase
    .from('periods')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });

  return {
    lastPeriodStart: profile.last_period_start_date,
    cycleLength: profile.typical_cycle_length_days,
    periodLength: profile.typical_period_length_days,
    pmsLength: profile.pms_window_length_days,
    irregularMode: profile.irregular_cycles_mode,
    modules: {
      exercise: profile.show_module_exercise,
      food: profile.show_module_food,
      mood: profile.show_module_mood,
      suggestions: profile.show_module_suggestions,
      favorites: profile.show_module_favorites,
    },
    notifications: {
      periodSoon: profile.notify_period_soon,
      ovulationWindow: profile.notify_ovulation_window,
      pmsWindow: profile.notify_pms_window,
    },
    periods: periods ? periods.map((p: any) => ({
      id: p.id,
      startDate: p.start_date,
      endDate: p.end_date
    })) : []
  };
};

export const updateProfileSettings = async (userId: string, profile: UserProfile) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      last_period_start_date: profile.lastPeriodStart,
      typical_cycle_length_days: profile.cycleLength,
      typical_period_length_days: profile.periodLength,
      pms_window_length_days: profile.pmsLength,
      irregular_cycles_mode: profile.irregularMode,
      show_module_exercise: profile.modules.exercise,
      show_module_food: profile.modules.food,
      show_module_mood: profile.modules.mood,
      show_module_suggestions: profile.modules.suggestions,
      show_module_favorites: profile.modules.favorites,
      notify_period_soon: profile.notifications.periodSoon,
      notify_ovulation_window: profile.notifications.ovulationWindow,
      notify_pms_window: profile.notifications.pmsWindow,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};

// PERIODS
export const addPeriod = async (userId: string, startDate: string): Promise<Period> => {
  const { data, error } = await supabase
    .from('periods')
    .insert({ user_id: userId, start_date: startDate })
    .select()
    .single();

  if (error) throw error;
  return { id: data.id, startDate: data.start_date, endDate: data.end_date };
};

export const updatePeriod = async (userId: string, period: Period) => {
  if (!period.id) return;
  const { error } = await supabase
    .from('periods')
    .update({ start_date: period.startDate, end_date: period.endDate })
    .eq('id', period.id)
    .eq('user_id', userId);

  if (error) throw error;
};

export const deletePeriod = async (userId: string, periodId: string) => {
  const { error } = await supabase
    .from('periods')
    .delete()
    .eq('id', periodId)
    .eq('user_id', userId);

  if (error) throw error;
};

// LOGS
export const fetchLogs = async (userId: string): Promise<DailyLog[]> => {
  const { data, error } = await supabase
    .from('day_logs')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((log: any) => ({
    id: log.id,
    date: log.log_date,
    flow: log.flow,
    moods: log.mood_tags || [],
    symptoms: log.symptom_tags || [],
    note: log.notes || '',
    energyLevel: log.energy_level,
    sleepHours: log.sleep_hours
  }));
};

export const saveLog = async (userId: string, log: DailyLog) => {
  const dbLog = {
    user_id: userId,
    log_date: log.date,
    flow: log.flow,
    mood_tags: log.moods,
    symptom_tags: log.symptoms,
    notes: log.note,
    energy_level: log.energyLevel,
    sleep_hours: log.sleepHours,
    updated_at: new Date().toISOString()
  };

  // Upsert based on unique constraint (user_id, log_date)
  const { error } = await supabase
    .from('day_logs')
    .upsert(dbLog, { onConflict: 'user_id, log_date' });

  if (error) throw error;
};

// FAVORITES
export const fetchFavorites = async (userId: string): Promise<FavoritesMap> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);

  const favMap: FavoritesMap = {
    [PhaseType.MENSTRUAL]: { exercise: [], food: [], supplements: [] },
    [PhaseType.FOLLICULAR]: { exercise: [], food: [], supplements: [] },
    [PhaseType.OVULATION]: { exercise: [], food: [], supplements: [] },
    [PhaseType.LUTEAL]: { exercise: [], food: [], supplements: [] },
  };

  if (data) {
    data.forEach((item: any) => {
      // Map DB item_type 'focus_food' or 'hydration' back to app types if needed
      // Schema said: item_type (exercise, focus_food, hydration, supplement)
      // App types: 'exercise' | 'food' | 'supplements'
      // Mapping: focus_food -> food, hydration -> supplements (based on UI usage)
      let cat: 'exercise' | 'food' | 'supplements' | null = null;
      if (item.item_type === 'exercise') cat = 'exercise';
      else if (item.item_type === 'focus_food') cat = 'food';
      else if (item.item_type === 'hydration' || item.item_type === 'supplement') cat = 'supplements';

      if (cat && favMap[item.phase]) {
        favMap[item.phase][cat].push(item.label);
      }
    });
  }
  return favMap;
};

export const toggleFavoriteDB = async (userId: string, phase: PhaseType, category: 'exercise' | 'food' | 'supplements', item: string, isAdding: boolean) => {
  // Map category to DB item_type
  let dbType = category === 'food' ? 'focus_food' : (category === 'supplements' ? 'supplement' : 'exercise');

  if (isAdding) {
    await supabase.from('favorites').insert({
      user_id: userId,
      phase,
      item_type: dbType,
      label: item
    });
  } else {
    // Delete might be tricky with just label if duplicates allowed, but unique constraint (user_id, phase, item_type, label) handles it
    // Note: If mapped types overlap (like hydration/supplement both -> supplements), this simple mapping might miss.
    // For MVP, we'll try to delete both potential types if category is supplements
    if (category === 'supplements') {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('phase', phase).in('item_type', ['supplement', 'hydration']).eq('label', item);
    } else {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('phase', phase).eq('item_type', dbType).eq('label', item);
    }
  }
};
