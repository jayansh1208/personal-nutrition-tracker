import React, { useEffect, useState, useCallback } from 'react';
import { useDate } from '../context/DateContext';
import { useModals } from '../layouts/MainLayout';
import { api } from '../services/api';
import { DailyNutritionSummary, MealCategory, MealItem } from '../types/nutrition';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { MacroOverview } from '../components/dashboard/MacroOverview';
import { MealCategoryCard } from '../components/dashboard/MealCategoryCard';
import { Plus, Flame, Dumbbell, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIES: MealCategory[] = ['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER', 'OTHER'];

export const DashboardPage: React.FC = () => {
  const { selectedDate, formattedDateLabel } = useDate();
  const { openAddMeal, openAddLiquid, openAddWeight, refreshTrigger, triggerRefresh } = useModals();

  const [data, setData] = useState<DailyNutritionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getDailyNutrition(selectedDate);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to load daily nutrition data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.deleteMealItem(itemId);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete meal item');
    }
  };

  const handleEditItem = (item: MealItem & { category: MealCategory }) => {
    openAddMeal(item.category, item);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Daily Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking summary for <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formattedDateLabel}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => openAddMeal('LUNCH')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Meal Entry</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-bold underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
            ))}
          </div>
          <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {data && (
        <>
          {/* Section 4.A: Daily Summary Cards */}
          <SummaryCards
            summary={data.summary}
            onAddMeal={() => openAddMeal('LUNCH')}
            onAddLiquid={() => openAddLiquid()}
            onAddWeight={() => openAddWeight()}
          />

          {/* Section 4.B: Macro Progress */}
          <MacroOverview summary={data.summary} />

          {/* Section 4.C: Daily Meal Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daily Meals & Entries
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  All food entries recorded for {selectedDate}
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total logged:{' '}
                <span className="text-slate-900 dark:text-white font-bold">
                  {data.meals.reduce((sum, m) => sum + m.itemCount, 0)} items
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <MealCategoryCard
                  key={cat}
                  category={cat}
                  meal={data.mealsByCategory[cat]}
                  onAddItem={(c) => openAddMeal(c)}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                />
              ))}
            </div>

            {/* Daily Running Total Bar */}
            <div className="bg-white dark:bg-[#131b2a] border border-emerald-500/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Flame className="w-5 h-5 fill-emerald-500/20" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daily Running Nutrition Totals
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grand total of all recorded entries for {selectedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Total Calories
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline justify-end space-x-1">
                    <span>{data.summary.calories.consumed}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      / {data.summary.calories.target} kcal
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="text-right">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Total Protein
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline justify-end space-x-1">
                    <span>{data.summary.protein.consumed}g</span>
                    <span className="text-xs font-semibold text-slate-400">
                      / {data.summary.protein.target}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
