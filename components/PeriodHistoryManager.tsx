import React, { useState } from 'react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { Period } from '../types';
import { Trash2, Plus, Calendar, X, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface PeriodHistoryManagerProps {
    periods: Period[];
    onAddPeriod: (startDate: string, endDate: string | null) => Promise<void>;
    onDeletePeriod: (periodId: string) => Promise<void>;
    onClose: () => void;
}

export const PeriodHistoryManager: React.FC<PeriodHistoryManagerProps> = ({
    periods,
    onAddPeriod,
    onDeletePeriod,
    onClose
}) => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [newStartDate, setNewStartDate] = useState('');
    const [duration, setDuration] = useState(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sort periods by date descending
    const sortedPeriods = [...periods].sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const handleAdd = async () => {
        if (!newStartDate) {
            setError("Please select a start date");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const start = parseISO(newStartDate);
            const end = addDays(start, duration - 1);
            await onAddPeriod(newStartDate, format(end, 'yyyy-MM-dd'));
            setView('list');
            setNewStartDate('');
        } catch (e) {
            setError("Failed to add period. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this period?")) return;

        setLoading(true);
        try {
            await onDeletePeriod(id);
        } catch (e) {
            setError("Failed to delete period.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-rose-500" />
                        {view === 'list' ? 'Period History' : 'Add Past Period'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {error && (
                        <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {view === 'list' ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => setView('add')}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Past Period
                            </button>

                            {sortedPeriods.length === 0 ? (
                                <p className="text-center text-slate-400 py-8 italic">No recorded periods yet.</p>
                            ) : (
                                sortedPeriods.map(p => {
                                    const start = parseISO(p.startDate);
                                    const days = p.endDate
                                        ? differenceInDays(parseISO(p.endDate), start) + 1
                                        : 'Ongoing';

                                    return (
                                        <div key={p.id || p.startDate} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <span className="block font-bold text-slate-700">{format(start, 'MMM do, yyyy')}</span>
                                                <span className="text-xs text-slate-500">{days} days • {p.endDate ? 'Completed' : 'Active'}</span>
                                            </div>
                                            {p.id && (
                                                <button
                                                    onClick={() => handleDelete(p.id!)}
                                                    disabled={loading}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={newStartDate}
                                    onChange={(e) => setNewStartDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Days)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                    <span className="w-12 text-center bg-slate-50 py-2 rounded-lg font-bold text-slate-700 border border-slate-200">
                                        {duration}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setView('list')}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    onClick={handleAdd}
                                    disabled={loading || !newStartDate}
                                    className="flex-1"
                                >
                                    {loading ? 'Saving...' : 'Save Period'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
