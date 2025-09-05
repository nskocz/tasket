'use client';

import { format, addDays, addWeeks, startOfWeek, startOfMonth, addMonths } from 'date-fns';
import { Calendar, X } from 'lucide-react';

interface DueDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  showPresets?: boolean;
}

export function DueDatePicker({ selectedDate, onDateChange, showPresets = true }: DueDatePickerProps) {
  const presetDates = [
    { 
      label: 'Today', 
      action: () => onDateChange(format(new Date(), 'yyyy-MM-dd'))
    },
    { 
      label: 'Tomorrow', 
      action: () => onDateChange(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
    },
    { 
      label: 'In 3 Days', 
      action: () => onDateChange(format(addDays(new Date(), 3), 'yyyy-MM-dd'))
    },
    { 
      label: 'Next Week', 
      action: () => onDateChange(format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7), 'yyyy-MM-dd'))
    },
    { 
      label: 'In 2 Weeks', 
      action: () => onDateChange(format(addWeeks(new Date(), 2), 'yyyy-MM-dd'))
    },
    { 
      label: 'Next Month', 
      action: () => onDateChange(format(addMonths(startOfMonth(new Date()), 1), 'yyyy-MM-dd'))
    },
  ];

  const clearDate = () => {
    onDateChange('');
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        {selectedDate && (
          <button
            type="button"
            onClick={clearDate}
            className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
            title="Clear date"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {showPresets && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Quick select:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presetDates.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={preset.action}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-gray-200 hover:border-blue-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}