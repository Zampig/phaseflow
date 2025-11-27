import React, { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Button } from './Button';
import { AboutHelpView } from './AboutHelpView';
import { Bell, Calendar, Clock, CloudRain, Layers, RefreshCcw, LayoutTemplate, HelpCircle, ChevronRight, LogOut } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdate }) => {
  const [viewMode, setViewMode] = useState<'settings' | 'about'>('settings');

  // Ensure we have defaults if adding new fields to an existing profile
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    pmsLength: profile.pmsLength || 5,
    irregularMode: profile.irregularMode || false,
    modules: profile.modules || {
      exercise: true,
      food: true,
      mood: true,
      suggestions: true,
      favorites: true
    },
    notifications: {
      ...profile.notifications,
      pmsWindow: profile.notifications.pmsWindow !== undefined ? profile.notifications.pmsWindow : true
    }
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (field: keyof UserProfile['modules']) => {
    setFormData(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [field]: !prev.modules[field]
      }
    }));
  };

  const handleNotificationChange = (field: keyof UserProfile['notifications']) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field]
      }
    }));
  };

  const saveSettings = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // App.tsx listener will handle the redirect/state change
  };

  // Helper for toggle switch
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`}></span>
    </button>
  );

  if (viewMode === 'about') {
    return <AboutHelpView onBack={() => setViewMode('settings')} />;
  }

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Personalization</h1>
        <p className="text-slate-500">Customize your experience.</p>
      </header>

      <div className="space-y-6">

        {/* CYCLE SECTION */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Cycle
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Period Start</label>
              <input
                type="date"
                value={formData.lastPeriodStart}
                onChange={(e) => handleChange('lastPeriodStart', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cycle Length</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.cycleLength}
                    onChange={(e) => handleChange('cycleLength', parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-medium">DAYS</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Period Length</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.periodLength}
                    onChange={(e) => handleChange('periodLength', parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-medium">DAYS</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PMS Window Length</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="1"
                  value={formData.pmsLength}
                  onChange={(e) => handleChange('pmsLength', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
                <span className="w-12 text-center bg-slate-50 py-1 rounded-lg text-sm font-bold text-slate-700 border border-slate-200">
                  {formData.pmsLength}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div>
                <span className="text-slate-700 font-medium block">Irregular cycles mode</span>
                <span className="text-xs text-slate-400">Treat future dates as estimates</span>
              </div>
              <Toggle checked={formData.irregularMode} onChange={() => handleChange('irregularMode', !formData.irregularMode)} />
            </div>
          </div>
        </section>

        {/* MODULES SECTION */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" /> Modules
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Show exercise suggestions</span>
              <Toggle checked={formData.modules.exercise} onChange={() => handleModuleChange('exercise')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Show food insights</span>
              <Toggle checked={formData.modules.food} onChange={() => handleModuleChange('food')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Show mood expectations</span>
              <Toggle checked={formData.modules.mood} onChange={() => handleModuleChange('mood')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Show Personal Suggestions</span>
              <Toggle checked={formData.modules.suggestions} onChange={() => handleModuleChange('suggestions')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Show Favorites</span>
              <Toggle checked={formData.modules.favorites} onChange={() => handleModuleChange('favorites')} />
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS SECTION */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Period Starting Soon</span>
              <Toggle checked={formData.notifications.periodSoon} onChange={() => handleNotificationChange('periodSoon')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Ovulation Window</span>
              <Toggle checked={formData.notifications.ovulationWindow} onChange={() => handleNotificationChange('ovulationWindow')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">PMS Window</span>
              <Toggle checked={formData.notifications.pmsWindow} onChange={() => handleNotificationChange('pmsWindow')} />
            </div>
          </div>
        </section>

        {/* INFO SECTION */}
        <section className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={() => setViewMode('about')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">About & Help</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </section>

        {/* ACCOUNT SECTION */}
        <section className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center justify-between hover:bg-rose-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 p-2 rounded-xl text-rose-500 group-hover:bg-rose-100 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium text-rose-600">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-200 group-hover:text-rose-300" />
          </button>
        </section>

        <Button fullWidth onClick={saveSettings}>
          {isSaved ? 'Settings Saved' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};