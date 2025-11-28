import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { PhaseType } from '../types';

interface DailyInsightsProps {
    phase: PhaseType;
    day: number;
    symptoms: string[];
    moods: string[];
}

interface InsightData {
    diet: string;
    exercise: string;
    lifestyle: string;
}

export const DailyInsights: React.FC<DailyInsightsProps> = ({ phase, day, symptoms, moods }) => {
    const [insights, setInsights] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/generate-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase, day, symptoms, moods }),
            });

            if (!res.ok) throw new Error('Failed to fetch insights');

            const data = await res.json();
            setInsights(data);
        } catch (err) {
            setError('Could not generate insights. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!insights && !loading && !error) {
        return (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-500">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800">Daily AI Insights</h3>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                    Get personalized tips for your {phase.toLowerCase()} phase based on your recent logs.
                </p>
                <button
                    onClick={generateInsights}
                    className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" /> Generate Insights
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400"></div>

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800">Your Daily Insights</h3>
                </div>
                {!loading && (
                    <button onClick={generateInsights} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-20 bg-slate-50 rounded-xl"></div>
                    <div className="h-20 bg-slate-50 rounded-xl"></div>
                    <div className="h-20 bg-slate-50 rounded-xl"></div>
                </div>
            ) : insights ? (
                <div className="space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Nutrition</span>
                        <p className="text-slate-700 text-sm">{insights.diet}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Movement</span>
                        <p className="text-slate-700 text-sm">{insights.exercise}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">Self Care</span>
                        <p className="text-slate-700 text-sm">{insights.lifestyle}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
