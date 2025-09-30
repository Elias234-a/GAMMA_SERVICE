import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Eye } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'appointment' | 'reminder' | 'deadline';
  color: string;
}

interface ModernCalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

type CalendarView = 'month' | 'week' | 'day';

export const ModernCalendar: React.FC<ModernCalendarProps> = ({
  events = [],
  onEventClick,
  onDateSelect,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>('month');

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
    const isSelected = (date: Date) => selectedDate?.toDateString() === date.toDateString();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-semibold text-orange-300 uppercase tracking-wider">
              {day}
            </span>
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                relative p-2 min-h-[80px] cursor-pointer rounded-lg transition-all duration-300 group
                ${isCurrentMonthDay 
                  ? 'glass-content hover:bg-white/10' 
                  : 'opacity-40 hover:opacity-60'
                }
                ${isTodayDate 
                  ? 'ring-2 ring-orange-400/50 bg-orange-500/20' 
                  : ''
                }
                ${isSelectedDate 
                  ? 'bg-emerald-500/20 ring-2 ring-emerald-400/50' 
                  : ''
                }
              `}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-sm font-medium transition-colors
                  ${isTodayDate 
                    ? 'text-orange-300 font-bold' 
                    : isCurrentMonthDay 
                      ? 'text-white group-hover:text-orange-200' 
                      : 'text-gray-400'
                  }
                `}>
                  {date.getDate()}
                </span>
                
                {dayEvents.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs text-emerald-300">{dayEvents.length}</span>
                  </div>
                )}
              </div>

              {/* Events preview */}
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={`
                      px-2 py-1 rounded text-xs font-medium truncate cursor-pointer
                      transition-all duration-200 hover:scale-105
                      ${event.color} text-white opacity-90 hover:opacity-100
                    `}
                  >
                    {event.title}
                  </div>
                ))}
                
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-300 text-center">
                    +{dayEvents.length - 2} más
                  </div>
                )}
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-emerald-500/0 group-hover:from-orange-500/10 group-hover:to-emerald-500/10 rounded-lg transition-all duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderViewSelector = () => (
    <div className="flex items-center space-x-1 glass-content p-1 rounded-lg">
      {(['month', 'week', 'day'] as CalendarView[]).map((viewType) => (
        <button
          key={viewType}
          onClick={() => setView(viewType)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${view === viewType 
              ? 'bg-orange-500/30 text-orange-300 shadow-glow' 
              : 'text-gray-300 hover:text-white hover:bg-white/10'
            }
          `}
        >
          {viewType === 'month' ? 'Mes' : viewType === 'week' ? 'Semana' : 'Día'}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`glass-card-strong p-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 glass-content rounded-lg text-white hover:bg-white/10 transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 group-hover:text-orange-300" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 glass-content rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors hover:text-orange-300"
            >
              Hoy
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 glass-content rounded-lg text-white hover:bg-white/10 transition-colors group"
            >
              <ChevronRight className="h-4 w-4 group-hover:text-orange-300" />
            </button>
          </div>
        </div>

        {renderViewSelector()}
      </div>

      {/* Calendar Content */}
      <div className="calendar-content">
        {view === 'month' && renderMonthView()}
        {view === 'week' && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Vista semanal próximamente</p>
          </div>
        )}
        {view === 'day' && (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Vista diaria próximamente</p>
          </div>
        )}
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="mt-6 p-4 glass-content rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Fecha seleccionada</p>
              <p className="text-lg font-semibold text-white">
                {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Eventos</p>
              <p className="text-lg font-semibold text-emerald-300">
                {getEventsForDate(selectedDate).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};