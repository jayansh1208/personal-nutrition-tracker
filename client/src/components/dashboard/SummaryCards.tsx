import React from 'react';
import { DailyNutritionSummary } from '../../types/nutrition';
import { Flame, Dumbbell, Droplets, Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

interface SummaryCardsProps {
  summary: DailyNutritionSummary['summary'];
  onAddMeal: () => void;
  onAddLiquid: () => void;
  onAddWeight: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  onAddMeal,
  onAddLiquid,
  onAddWeight
}) => {
  const { calories, protein, liquid, weight } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Calories Card */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Calories
          </span>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5 fill-amber-500/20" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {calories.consumed}
          </span>
          <span className="text-sm font-medium text-slate-400">
            / {calories.target} kcal
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span>Remaining:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {calories.remaining} kcal
          </span>
        </div>

        <ProgressBar
          progress={calories.progress}
          colorClass="bg-gradient-to-r from-amber-400 to-amber-500"
        />

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {calories.progress}% of daily goal
          </span>
          <button
            onClick={onAddMeal}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Add Food
          </button>
        </div>
      </div>

      {/* Protein Card */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Protein
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {protein.consumed}
          </span>
          <span className="text-sm font-medium text-slate-400">
            / {protein.target} g
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span>Remaining:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {protein.remaining} g
          </span>
        </div>

        <ProgressBar
          progress={protein.progress}
          colorClass="bg-gradient-to-r from-emerald-400 to-emerald-600"
        />

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {protein.progress}% of target
          </span>
          <button
            onClick={onAddMeal}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Log Protein
          </button>
        </div>
      </div>

      {/* Water & Liquid Card */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Liquid Intake
          </span>
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform">
            <Droplets className="w-5 h-5 fill-sky-500/20" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {liquid.consumed}
          </span>
          <span className="text-sm font-medium text-slate-400">
            / {liquid.target} ml
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span>Pure Water: <strong className="text-sky-600 dark:text-sky-400">{liquid.water} ml</strong></span>
          <span>Remaining: <strong className="text-slate-700 dark:text-slate-300">{liquid.remaining} ml</strong></span>
        </div>

        <ProgressBar
          progress={liquid.progress}
          colorClass="bg-gradient-to-r from-sky-400 to-blue-600"
        />

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {liquid.progress}% hydrated
          </span>
          <button
            onClick={onAddLiquid}
            className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            + Log Drink
          </button>
        </div>
      </div>

      {/* Current Weight Card */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Body Weight
          </span>
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {weight.current !== null ? weight.current : '--'}
          </span>
          <span className="text-sm font-semibold text-slate-400">
            kg
          </span>
        </div>

        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
          {weight.current !== null ? (
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Recorded today</span>
            </span>
          ) : (
            <span className="text-slate-400">No weigh-in recorded today</span>
          )}
        </div>

        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
          <div
            className="h-full bg-violet-500 rounded-full"
            style={{ width: weight.current ? '100%' : '0%' }}
          />
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {weight.current !== null ? 'Logged' : 'Pending entry'}
          </span>
          <button
            onClick={onAddWeight}
            className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
          >
            {weight.current !== null ? 'Update Weight' : '+ Log Weight'}
          </button>
        </div>
      </div>
    </div>
  );
};
