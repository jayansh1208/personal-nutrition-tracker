import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Droplets,
  Scale,
  LineChart,
  Plus
} from 'lucide-react';

interface BottomNavProps {
  onQuickAddMeal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onQuickAddMeal }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#131b2a]/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/diary"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span>Diary</span>
      </NavLink>

      {/* Center Quick Add Button */}
      <button
        onClick={onQuickAddMeal}
        className="-mt-5 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border-4 border-white dark:border-[#131b2a] transition-all"
        aria-label="Quick Add Meal"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <NavLink
        to="/liquid"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Droplets className="w-5 h-5 mb-0.5" />
        <span>Liquid</span>
      </NavLink>

      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LineChart className="w-5 h-5 mb-0.5" />
        <span>Analytics</span>
      </NavLink>
    </nav>
  );
};
