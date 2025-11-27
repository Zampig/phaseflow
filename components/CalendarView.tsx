import React, { useState } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths,
  subMonths,
  isAfter,
  startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { UserProfile, PhaseType, DailyLog } from '../types';
import { calculatePhase, getLogKey, getEventMarker } from '../utils/cycleLogic';

interface CalendarViewProps {
  profile: UserProfile;
  logs: DailyLog[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ profile, logs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const logKey = getLogKey(day);
    const foundLog = logs.find(l => l.date === logKey);
    setSelectedLog(foundLog || null);
  };

  const closeSheet = () => {
    setSelectedDate(null);
    setSelectedLog(null);
  };

  const getDayColor = (date: Date) => {
    const phase = calculatePhase(date, profile);
    
    if (phase.isRecordedPeriod) {
        return 'bg-rose-500 text-white font-bold shadow-sm';
    }

    let baseClass = '';
    const isFuture = isAfter(date, startOfDay(new Date()));
    const isEstimate = profile.irregularMode && isFuture;

    switch (phase.type) {
        case PhaseType.MENSTRUAL: baseClass = 'bg-rose-300 text-white opacity-90'; break;
        case PhaseType.OVULATION: baseClass = 'bg-teal-400 text-white'; break;
        case PhaseType.FOLLICULAR: baseClass = 'bg-purple-200 text-purple-900'; break;
        case PhaseType.LUTEAL: baseClass = 'bg-amber-100 text-amber-900'; break;
        default: baseClass = 'bg-slate-50 text-slate-500'; break;
    }

    if (isEstimate) {
        return `${baseClass} opacity-60 bg-opacity-70`;
    }

    return baseClass;
  };

  const selectedPhase = selectedDate ? calculatePhase(selectedDate, profile) : null;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-full flex flex-col">
       <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
        <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600"/>
            </button>
            <span className="py-2 px-3 font-semibold text-slate-700 min-w-[100px] text-center">
                {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600"/>
            </button>
        </div>
      </header>

      {profile.irregularMode && (
          <div className="mb-4 bg-blue-50 text-blue-800 text-xs p-3 rounded-xl flex items-start gap-2 border border-blue-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Predictions may be less accurate due to irregular cycles mode. Future phases are estimates.</p>
          </div>
      )}

      {/* Legend */}
      <div className="flex justify-between mb-6 px-2 flex-wrap gap-y-2">
        {[
            { label: 'Recorded', color: 'bg-rose-500' },
            { label: 'Pred. Period', color: 'bg-rose-300' },
            { label: 'Follic.', color: 'bg-purple-200' },
            { label: 'Ovul.', color: 'bg-teal-400' },
            { label: 'Luteal', color: 'bg-amber-100' },
        ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">{item.label}</span>
            </div>
        ))}
         <div className="flex items-center gap-1.5">
             <span className="w-2 h-2 rounded-full bg-slate-400"></span>
             <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">PMS</span>
         </div>
      </div>
      
      {/* Event Markers Legend */}
      <div className="flex justify-start mb-6 px-2 flex-wrap gap-4 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white shadow-sm"></span>
              <span className="text-[10px] font-semibold text-slate-500">Upcoming Period</span>
          </div>
          <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 ring-2 ring-white shadow-sm"></span>
              <span className="text-[10px] font-semibold text-slate-500">Upcoming Ovulation</span>
          </div>
          <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 ring-2 ring-white shadow-sm"></span>
              <span className="text-[10px] font-semibold text-slate-500">Upcoming PMS</span>
          </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-bold text-slate-400">
                {day}
            </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            const phase = calculatePhase(day, profile);
            
            const isFuture = isAfter(day, startOfDay(new Date()));
            const eventMarker = isFuture ? getEventMarker(day, profile) : null;

            return (
                <button 
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`
                        aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative
                        ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                        ${getDayColor(day)}
                        ${isToday ? 'ring-2 ring-slate-800 ring-offset-2' : ''}
                    `}
                >
                    {format(day, 'd')}
                    
                    {phase.isPmsDay && !phase.isRecordedPeriod && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-500/80"></span>
                    )}

                    {eventMarker === 'PERIOD' && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white shadow-sm -mt-0.5 -mr-0.5"></span>
                    )}
                    {eventMarker === 'OVULATION' && (
                         <span className="absolute top-0 right-0 w-2 h-2 bg-teal-500 rounded-full border border-white shadow-sm -mt-0.5 -mr-0.5"></span>
                    )}
                    {eventMarker === 'PMS' && (
                         <span className="absolute top-0 right-0 w-2 h-2 bg-slate-500 rounded-full border border-white shadow-sm -mt-0.5 -mr-0.5"></span>
                    )}
                </button>
            );
        })}
      </div>

      {selectedDate && selectedPhase && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
              <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={closeSheet}
              ></div>
              
              <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pointer-events-auto shadow-2xl transform transition-transform animate-slide-up pb-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{format(selectedDate, 'MMMM do')}</h3>
                        <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${selectedPhase.color}`}>
                                {selectedPhase.isRecordedPeriod ? 'Period (Recorded)' : `${selectedPhase.type} Phase`} • Day {selectedPhase.dayOfCycle}
                            </p>
                            {selectedPhase.isPmsDay && !selectedPhase.isRecordedPeriod && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">PMS</span>
                            )}
                        </div>
                    </div>
                    <button onClick={closeSheet} className="p-2 bg-slate-100 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <hr className="border-slate-100 mb-4" />

                {selectedLog ? (
                    <div className="space-y-4">
                        {selectedLog.flow && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-slate-400">Flow</span>
                                <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full font-medium">{selectedLog.flow}</span>
                            </div>
                        )}
                        
                        {selectedLog.moods.length > 0 && (
                            <div>
                                <span className="text-xs font-bold uppercase text-slate-400 block mb-2">Moods</span>
                                <div className="flex flex-wrap gap-1">
                                    {selectedLog.moods.map(m => (
                                        <span key={m} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-100">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedLog.symptoms.length > 0 && (
                            <div>
                                <span className="text-xs font-bold uppercase text-slate-400 block mb-2">Symptoms</span>
                                <div className="flex flex-wrap gap-1">
                                    {selectedLog.symptoms.map(s => (
                                        <span key={s} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-100">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedLog.note && (
                            <div className="bg-slate-50 p-3 rounded-xl">
                                <p className="text-slate-600 text-sm italic">"{selectedLog.note}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <p>No log entry for this day.</p>
                    </div>
                )}
              </div>
          </div>
      )}
    </div>
  );
};