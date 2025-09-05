'use client';

import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  showPresets?: boolean;
}

export function DatePicker({ selectedDate, onDateChange, showPresets = false }: DatePickerProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const presetDates = [
    { label: 'Today', action: () => onDateChange(new Date()) },
    { label: 'Tomorrow', action: () => onDateChange(addDays(new Date(), 1)) },
    { label: 'Next Week', action: () => onDateChange(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7)) },
    { label: 'Next Month', action: () => onDateChange(addMonths(startOfMonth(new Date()), 1)) },
    { label: 'In 3 Days', action: () => onDateChange(addDays(new Date(), 3)) },
    { label: 'In 1 Week', action: () => onDateChange(addWeeks(new Date(), 1)) },
  ];

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-3">
      <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={goToPreviousDay}
          className="p-2.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Previous Day"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="flex items-center px-3 py-2.5 min-w-0">
          <Calendar size={16} className="text-muted-foreground mr-2.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-foreground">
              {format(selectedDate, 'MMM d')}
            </div>
            <div className="text-muted-foreground text-xs">
              {format(selectedDate, 'yyyy')}
            </div>
          </div>
        </div>
        
        <button
          onClick={goToNextDay}
          className="p-2.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Next Day"
        >
          <ChevronRight size={16} />
        </button>
        
        {!isToday && (
          <button
            onClick={goToToday}
            className="px-3 py-2.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors border-l border-border"
          >
            Today
          </button>
        )}
      </div>
      
      {showPresets && (
        <div className="grid grid-cols-2 gap-2">
          {presetDates.map((preset) => (
            <button
              key={preset.label}
              onClick={preset.action}
              className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors border border-border hover:border-muted-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}