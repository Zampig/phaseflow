import React from 'react';
import { Calendar, Settings, Sun, BarChart2, Layers } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'today' | 'calendar' | 'phases' | 'insights' | 'settings';
  onTabChange: (tab: 'today' | 'calendar' | 'phases' | 'insights' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-slate-50 relative">
      <main className="min-h-screen">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-40">
        <div className="max-w-md mx-auto flex justify-between items-center px-2">
          <button 
            onClick={() => onTabChange('today')}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 w-16 ${activeTab === 'today' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Sun className={`w-6 h-6 ${activeTab === 'today' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'today' ? 2 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Today</span>
          </button>

          <button 
            onClick={() => onTabChange('calendar')}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 w-16 ${activeTab === 'calendar' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Calendar className={`w-6 h-6 ${activeTab === 'calendar' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'calendar' ? 2 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Cal</span>
          </button>
          
          <button 
            onClick={() => onTabChange('phases')}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 w-16 ${activeTab === 'phases' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Layers className={`w-6 h-6 ${activeTab === 'phases' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'phases' ? 2 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Phases</span>
          </button>

          <button 
            onClick={() => onTabChange('insights')}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 w-16 ${activeTab === 'insights' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart2 className={`w-6 h-6 ${activeTab === 'insights' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'insights' ? 2 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Trends</span>
          </button>

          <button 
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center gap-1 transition-colors duration-300 w-16 ${activeTab === 'settings' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'settings' ? 2 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Set</span>
          </button>
        </div>
      </nav>
    </div>
  );
};