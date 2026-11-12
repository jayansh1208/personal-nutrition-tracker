import React from 'react';
import { useDate } from '../../context/DateContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, ChevronRight, Calendar, Sun, Moon, Plus, Utensils } from 'lucide-react';

interface NavbarProps {
  onQuickAddMeal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickAddMeal }) => {
  const { selectedDate, setSelectedDate, prevDay, nextDay, setToday, isToday, formattedDateLabel } = useDate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Date Selector */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Previous Day */}
          <button
            onClick={prevDay}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Current Date Display & Hidden Date Input for picker */}
          <div className="relative flex items-center">
            <label className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 select-none">
                {formattedDateLabel}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Select date"
              />
            </label>
          </div>

          {/* Next Day */}
          <button
            onClick={nextDay}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* "Today" quick button (if not currently today) */}
          {!isToday && (
            <button
              onClick={setToday}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors hidden sm:inline-block"
            >
              Today
            </button>
          )}
        </div>

        {/* Right side tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Add Meal Action */}
          <button
            onClick={onQuickAddMeal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Food</span>
            <span className="sm:hidden">Food</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
