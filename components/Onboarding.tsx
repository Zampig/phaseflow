import React, { useState } from 'react';
import { UserProfile, Period } from '../types';
import { Button } from './Button';
import { addDays, format, parseISO } from 'date-fns';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [lastPeriod, setLastPeriod] = useState(new Date().toISOString().split('T')[0]);
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Create initial period history based on user input
      const initialPeriod: Period = {
          startDate: lastPeriod,
          endDate: format(addDays(parseISO(lastPeriod), periodLen - 1), 'yyyy-MM-dd')
      };

      const profile: UserProfile = {
        lastPeriodStart: lastPeriod,
        cycleLength: cycleLen,
        periodLength: periodLen,
        pmsLength: 5, 
        irregularMode: false,
        modules: {
            exercise: true,
            food: true,
            mood: true,
            suggestions: true,
            favorites: true
        },
        notifications: {
          periodSoon: true,
          ovulationWindow: true,
          pmsWindow: true
        },
        periods: [initialPeriod]
      };
      onComplete(profile);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !lastPeriod) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10 justify-center">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
            ))}
        </div>

        {step === 1 && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Let's get started.</h1>
            <p className="text-slate-500 mb-8">When did your last period start?</p>
            <input
              type="date"
              value={lastPeriod}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-lg text-slate-700 shadow-sm focus:ring-2 focus:ring-rose-200 focus:outline-none"
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Cycle Length</h1>
            <p className="text-slate-500 mb-8">How many days are usually in your cycle?</p>
            <div className="flex items-center justify-center gap-6">
                <button onClick={() => setCycleLen(Math.max(20, cycleLen - 1))} className="w-12 h-12 rounded-full bg-white shadow-sm text-2xl text-slate-600 hover:bg-slate-50">-</button>
                <div className="text-5xl font-bold text-slate-800 w-24">{cycleLen}</div>
                <button onClick={() => setCycleLen(Math.min(45, cycleLen + 1))} className="w-12 h-12 rounded-full bg-white shadow-sm text-2xl text-slate-600 hover:bg-slate-50">+</button>
            </div>
            <p className="text-xs text-slate-400 mt-4">28 days is the average.</p>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Period Length</h1>
            <p className="text-slate-500 mb-8">How long does your period usually last?</p>
             <div className="flex items-center justify-center gap-6">
                <button onClick={() => setPeriodLen(Math.max(1, periodLen - 1))} className="w-12 h-12 rounded-full bg-white shadow-sm text-2xl text-slate-600 hover:bg-slate-50">-</button>
                <div className="text-5xl font-bold text-slate-800 w-24">{periodLen}</div>
                <button onClick={() => setPeriodLen(Math.min(10, periodLen + 1))} className="w-12 h-12 rounded-full bg-white shadow-sm text-2xl text-slate-600 hover:bg-slate-50">+</button>
            </div>
          </div>
        )}

        <div className="mt-12">
            <Button fullWidth onClick={handleNext} disabled={isNextDisabled()}>
                {step === 3 ? 'Finish Setup' : 'Next'}
            </Button>
        </div>
      </div>
    </div>
  );
};