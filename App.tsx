import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { UserProfile, DailyLog, PhaseType, FavoritesMap } from './types';
import { Onboarding } from './components/Onboarding';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { InsightsView } from './components/InsightsView';
import { PhasesView } from './components/PhasesView';
import {
    fetchProfile,
    updateProfileSettings,
    addPeriod,
    updatePeriod,
    fetchLogs,
    saveLog,
    fetchFavorites,
    toggleFavoriteDB
} from './utils/db';
import { Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [hasFetchedProfile, setHasFetchedProfile] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [favorites, setFavorites] = useState<FavoritesMap>({
        [PhaseType.MENSTRUAL]: { exercise: [], food: [], supplements: [] },
        [PhaseType.FOLLICULAR]: { exercise: [], food: [], supplements: [] },
        [PhaseType.OVULATION]: { exercise: [], food: [], supplements: [] },
        [PhaseType.LUTEAL]: { exercise: [], food: [], supplements: [] },
    });
    const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'phases' | 'insights' | 'settings'>('today');

    // 1. Auth Init
    useEffect(() => {
        supabase.auth.getSession()
            .then(({ data: { session }, error }) => {
                if (error) throw error;
                setSession(session);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Supabase connection error:", err);
                setConnectionError("Could not connect to Supabase. Please check your project URL and API Key in lib/supabaseClient.ts");
                setLoading(false);
            });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Data Fetching
    useEffect(() => {
        if (session) {
            loadUserData(session.user.id);
        } else {
            setProfile(null);
            setLogs([]);
        }
    }, [session]);

    const loadUserData = async (userId: string) => {
        setDataLoading(true);
        try {
            const [prof, userLogs, userFavs] = await Promise.all([
                fetchProfile(userId),
                fetchLogs(userId),
                fetchFavorites(userId)
            ]);
            setProfile(prof);
            setLogs(userLogs);
            setFavorites(userFavs);
        } catch (e) {
            console.error('Error loading data', e);
        } finally {
            setDataLoading(false);
            setHasFetchedProfile(true);
        }
    };

    // HANDLERS
    const handleProfileUpdate = async (newProfile: UserProfile) => {
        if (!session) return;
        try {
            // 1. Update Settings
            await updateProfileSettings(session.user.id, newProfile);

            // 2. Check for Period updates (simplistic check: did length change?)
            const oldPeriods = profile?.periods || [];
            const newPeriods = newProfile.periods;

            // If new period added
            if (newPeriods.length > oldPeriods.length) {
                const latest = newPeriods[newPeriods.length - 1];
                const added = await addPeriod(session.user.id, latest.startDate);
                const updatedPeriods = [...newPeriods];
                updatedPeriods[updatedPeriods.length - 1] = added;
                setProfile({ ...newProfile, periods: updatedPeriods });
                return;
            }

            // If last period updated (ended)
            if (newPeriods.length === oldPeriods.length && newPeriods.length > 0) {
                const lastNew = newPeriods[newPeriods.length - 1];
                const lastOld = oldPeriods[oldPeriods.length - 1];
                if (lastNew.endDate !== lastOld.endDate) {
                    await updatePeriod(session.user.id, lastNew);
                }
            }

            setProfile(newProfile);

        } catch (e) {
            console.error("Failed to update profile", e);
        }
    };

    const handleSaveLog = async (log: DailyLog) => {
        if (!session) return;
        try {
            await saveLog(session.user.id, log);
            // Optimistic update
            setLogs(prev => {
                const idx = prev.findIndex(l => l.date === log.date);
                if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = log;
                    return copy;
                } else {
                    return [...prev, log];
                }
            });
        } catch (e) {
            console.error("Failed to save log", e);
        }
    };

    const handleToggleFavorite = async (phase: PhaseType, category: 'exercise' | 'food' | 'supplements', item: string) => {
        if (!session) return;
        const currentList = favorites[phase]?.[category] || [];
        const exists = currentList.includes(item);
        const isAdding = !exists;

        try {
            await toggleFavoriteDB(session.user.id, phase, category, item, isAdding);

            setFavorites(prev => {
                const newList = exists ? currentList.filter(i => i !== item) : [...currentList, item];
                return {
                    ...prev,
                    [phase]: {
                        ...prev[phase],
                        [category]: newList
                    }
                }
            });

        } catch (e) {
            console.error("Failed to toggle favorite", e);
        }
    };

    // ERROR STATE
    if (connectionError) {
        return (
            <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <h1 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h1>
                <p className="text-slate-600 max-w-xs">{connectionError}</p>
            </div>
        );
    }

    // INITIAL AUTH CHECK
    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
        </div>
    );

    if (!session) {
        return <Auth />;
    }

    // DATA LOADING
    if (dataLoading || (!hasFetchedProfile && session)) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
            </div>
        );
    }

    // ONBOARDING
    if (!profile) {
        const handleOnboardingComplete = async (p: UserProfile) => {
            if (!session) return;
            try {
                await updateProfileSettings(session.user.id, p);
                if (p.periods.length > 0) {
                    await addPeriod(session.user.id, p.periods[0].startDate);
                }
                await loadUserData(session.user.id);
            } catch (e) {
                console.error("Onboarding failed", e);
            }
        };
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    // MAIN APP
    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <div className="animate-fade-in">
                {activeTab === 'today' && (
                    <TodayView
                        profile={profile}
                        logs={logs}
                        favorites={favorites}
                        onPhaseClick={() => setActiveTab('phases')}
                        onProfileUpdate={handleProfileUpdate}
                        onSaveLog={handleSaveLog}
                    />
                )}
                {activeTab === 'calendar' && <CalendarView profile={profile} logs={logs} />}
                {activeTab === 'phases' && <PhasesView profile={profile} favorites={favorites} onToggleFavorite={handleToggleFavorite} />}
                {activeTab === 'insights' && <InsightsView profile={profile} logs={logs} />}
                {activeTab === 'settings' && <SettingsView profile={profile} onUpdate={handleProfileUpdate} />}
            </div>
        </Layout>
    );
};

export default App;