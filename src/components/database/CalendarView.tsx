import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { DatabaseRow, DatabaseProperty } from '../../types';

interface CalendarViewProps {
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
  onUpdateRow: (row: DatabaseRow) => void;
  onAddRow: () => void;
  onOpenRowModal: (row: DatabaseRow) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  properties,
  rows,
  onAddRow,
  onOpenRowModal,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateProp = properties.find((p) => p.type === 'date');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="rounded-2xl border border-[#e5e5df] dark:border-[#363630] bg-white dark:bg-[#242421] p-5 shadow-xs">
      {/* Calendar Month Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#5a5a40] dark:text-[#a4a485]" />
          <h3 className="font-serif italic text-xl text-[#2c2c2a] dark:text-[#f0f0ea]">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-1.5 text-[#5a5a40] dark:text-[#a4a485] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-md border border-[#dadad0] dark:border-[#3c3c34] bg-[#ecece4] dark:bg-[#2c2c28] px-2.5 py-1 text-xs font-semibold text-[#5a5a40] dark:text-[#c2c2a8] hover:bg-[#e2e2da] transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-1.5 text-[#5a5a40] dark:text-[#a4a485] hover:bg-[#ecece4] dark:hover:bg-[#2c2c28] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-px border-b border-[#e5e5df] dark:border-[#363630] pb-2 text-center text-xs font-bold uppercase tracking-wider text-[#9c9c94]">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 pt-2">
        {blankDays.map((_, i) => (
          <div key={`blank_${i}`} className="min-h-[85px] rounded-lg bg-[#f5f5f0]/30 dark:bg-[#1c1c1a]/30 p-1.5" />
        ))}

        {daysArray.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayRows = rows.filter((r) => {
            if (!dateProp) return false;
            return r.values[dateProp.id] === dateStr;
          });

          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={`day_${day}`}
              className={`min-h-[85px] rounded-lg border p-2 transition-colors flex flex-col justify-between ${
                isToday
                  ? 'border-[#5a5a40] bg-[#ecece4]/40 dark:border-[#8c8c6d] dark:bg-[#2c2c28]/40'
                  : 'border-[#e5e5df]/60 hover:border-[#dadad0] dark:border-[#363630]/60 dark:hover:border-[#42423b]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? 'bg-[#5a5a40] text-white dark:bg-[#8c8c6d] dark:text-[#1c1c1a]'
                      : 'text-[#9c9c94]'
                  }`}
                >
                  {day}
                </span>
              </div>

              <div className="space-y-1 mt-1 flex-1 overflow-y-auto">
                {dayRows.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onOpenRowModal(r)}
                    className="truncate rounded bg-[#ecece4] px-1.5 py-0.5 text-[10px] font-medium text-[#5a5a40] dark:bg-[#2c2c28] dark:text-[#c2c2a8] cursor-pointer hover:bg-[#dadad0]"
                  >
                    {r.title || 'Untitled'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
