import React from 'react';
import { Calendar } from 'lucide-react';

type Props = {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  label?: string;
  showTime?: boolean;
};

export default function DateTimePicker({ date, time, onDateChange, onTimeChange, label, showTime = true }: Props) {
  return (
    <div className="space-y-1">
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-krborder rounded-md bg-white/50 dark:bg-krblack/50 focus:border-krgold focus:ring-1 focus:ring-krgold"
          />
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        {showTime && (
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-32 px-3 py-2 border border-krborder rounded-md bg-white/50 dark:bg-krblack/50 focus:border-krgold focus:ring-1 focus:ring-krgold"
          />
        )}
      </div>
    </div>
  );
}