import React from 'react';
import { ArrowLeft, Info, Activity, ShieldCheck, Lightbulb } from 'lucide-react';

interface AboutHelpViewProps {
  onBack: () => void;
}

export const AboutHelpView: React.FC<AboutHelpViewProps> = ({ onBack }) => {
  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen animate-slide-up">
      <header className="mb-6 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">About & Help</h1>
      </header>

      <div className="space-y-6">
        
        {/* Section 1: What PhaseFlow does */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" /> What PhaseFlow does
          </h2>
          <p className="text-slate-700 leading-relaxed">
            PhaseFlow helps you track your period, understand your cycle phases, and see simple trends in your mood, energy, and symptoms. It uses a clean, simple approach to help you stay in tune with your body without overwhelming you with complex data.
          </p>
        </section>

        {/* Section 2: How predictions work */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> How predictions work
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Predictions are based on your last recorded period start date and your typical cycle length. We estimate ovulation to occur roughly 14 days before your next predicted period, with phases arranged around that window. These are estimates that become more accurate as you log more history over time.
          </p>
        </section>

        {/* Section 3: Wellness disclaimer */}
        <section className="bg-rose-50 p-6 rounded-3xl shadow-sm border border-rose-100">
          <h2 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Wellness Disclaimer
          </h2>
          <p className="text-slate-800 font-medium leading-relaxed text-sm">
            PhaseFlow is designed for general wellness tracking and educational purposes only. It is not a medical device and should not be used for contraception or medical diagnosis. Always consult a healthcare professional about any medical concerns.
          </p>
        </section>

        {/* Section 4: Getting started tips */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Getting Started Tips
          </h2>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                <span className="text-slate-700">Log your next period start date in the <strong>Today</strong> tab.</span>
            </li>
            <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                <span className="text-slate-700">Use the daily log to track your flow, mood, and energy levels.</span>
            </li>
            <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                <span className="text-slate-700">Visit the <strong>Phases</strong> tab to learn what to expect in each phase of your cycle.</span>
            </li>
            <li className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                <span className="text-slate-700">Check the <strong>Calendar</strong> to view upcoming predicted events.</span>
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
};