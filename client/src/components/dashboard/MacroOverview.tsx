import React from 'react';
import { DailyNutritionSummary } from '../../types/nutrition';
import { CircularProgress } from '../common/CircularProgress';
import { Flame, Dumbbell } from 'lucide-react';

interface MacroOverviewProps {
  summary: DailyNutritionSummary['summary'];
}

export const MacroOverview: React.FC<MacroOverviewProps> = ({ summary }) => {
  const { calories, protein } = summary;

  return (
    <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Macro Progress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time daily calorie and protein tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Calories Circular Ring */}
        <div className="flex items-center space-x-6 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
          <CircularProgress
            value={calories.progress}
            size={110}
            strokeWidth={9}
            color="#f59e0b" // amber-500
          >
            <div className="flex flex-col items-center">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20 mb-0.5" />
              <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                {Math.round(calories.progress)}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">cal</span>
            </div>
          </CircularProgress>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Daily Calories
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {calories.consumed} <span className="text-xs font-normal text-slate-400">/ {calories.target} kcal</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-amber-600 dark:text-amber-400 font-bold">{calories.remaining} kcal</strong> remaining to reach goal
            </p>
          </div>
        </div>

        {/* Protein Circular Ring */}
        <div className="flex items-center space-x-6 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
          <CircularProgress
            value={protein.progress}
            size={110}
            strokeWidth={9}
            color="#10b981" // emerald-500
          >
            <div className="flex flex-col items-center">
              <Dumbbell className="w-4 h-4 text-emerald-500 mb-0.5" />
              <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                {Math.round(protein.progress)}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">protein</span>
            </div>
          </CircularProgress>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Daily Protein
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {protein.consumed} <span className="text-xs font-normal text-slate-400">/ {protein.target} g</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{protein.remaining} g</strong> remaining to hit target
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
