import React, { useState, useEffect, useCallback } from 'react';
import { useDate } from '../context/DateContext';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Flame, Dumbbell, Droplets, Calendar, TrendingUp, Award, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const AnalyticsPage: React.FC = () => {
  const { selectedDate } = useDate();
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [weeklyData, setWeeklyData] = useState<any | null>(null);
  const [monthlyData, setMonthlyData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      if (viewMode === 'weekly') {
        const res = await api.getWeeklyAnalytics(selectedDate);
        setWeeklyData(res);
      } else {
        const month = selectedDate.substring(0, 7);
        const res = await api.getMonthlyAnalytics(month);
        setMonthlyData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Nutrition & Weight Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real database analytics, trend lines, and consistency metrics
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Weekly View (7 Days)
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'monthly'
                ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly View (30 Days)
          </button>
        </div>
      </div>

      {/* WEEKLY VIEW */}
      {viewMode === 'weekly' && weeklyData && (
        <>
          {/* Average metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Avg Daily Calories
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {weeklyData.averages.calories}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ {weeklyData.targets.calorieTarget} kcal</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Over {weeklyData.loggedDaysCount} logged days</p>
            </div>

            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Avg Daily Protein
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {weeklyData.averages.protein}g
                </span>
                <span className="text-sm font-semibold text-slate-400">/ {weeklyData.targets.proteinTarget}g</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Target consistency</p>
            </div>

            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Avg Daily Fluid
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-sky-500">
                  {weeklyData.averages.liquid}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ {weeklyData.targets.liquidTarget} ml</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Hydration average</p>
            </div>

            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Logged Meal Entries
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-purple-500">
                  {weeklyData.totalMealEntries}
                </span>
                <span className="text-sm font-semibold text-slate-400">meals logged</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{weeklyData.startDate} to {weeklyData.endDate}</p>
            </div>
          </div>

          {/* Daily Calorie Intake Chart */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Daily Calorie Consumption vs Target
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Target: {weeklyData.targets.calorieTarget} kcal</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="dayName" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                            <p className="font-bold text-slate-300">{item.date} ({item.dayName})</p>
                            <p className="text-sm font-extrabold text-amber-400 mt-1">{item.calories} kcal</p>
                            <p className="text-[11px] text-slate-400">Goal: {item.calorieTarget} kcal</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={weeklyData.targets.calorieTarget} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
                  <Bar dataKey="calories" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Protein Consumption Chart */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Daily Protein Consumption (g) vs Target
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Target: {weeklyData.targets.proteinTarget}g</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="dayName" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                            <p className="font-bold text-slate-300">{item.date} ({item.dayName})</p>
                            <p className="text-sm font-extrabold text-emerald-400 mt-1">{item.protein} g</p>
                            <p className="text-[11px] text-slate-400">Goal: {item.proteinTarget} g</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={weeklyData.targets.proteinTarget} stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} />
                  <Bar dataKey="protein" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Liquid and Water Intake Trends */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-sky-500 fill-sky-500/20" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hydration Trends (ml)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Target: {weeklyData.targets.liquidTarget} ml</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="dayName" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip />
                  <ReferenceLine y={weeklyData.targets.liquidTarget} stroke="#0284c7" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="liquid" stroke="#0284c7" strokeWidth={3} name="Total Liquid" />
                  <Line type="monotone" dataKey="water" stroke="#38bdf8" strokeWidth={2} strokeDasharray="2 2" name="Pure Water" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* MONTHLY VIEW */}
      {viewMode === 'monthly' && monthlyData && (
        <>
          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Monthly Calorie Avg
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {monthlyData.averages.calories}
                </span>
                <span className="text-sm font-semibold text-slate-400">kcal/day</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Across {monthlyData.loggedDaysCount} tracked days</p>
            </div>

            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Monthly Protein Avg
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {monthlyData.averages.protein}g
                </span>
                <span className="text-sm font-semibold text-slate-400">/day</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Consistency indicator</p>
            </div>

            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tracking Consistency
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-indigo-500">
                  {monthlyData.consistencyPercentage}%
                </span>
                <span className="text-sm font-semibold text-slate-400">of month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{monthlyData.loggedDaysCount} of {monthlyData.totalDays} days logged</p>
            </div>

            <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Monthly Weight Delta
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className={`text-3xl font-black ${
                  monthlyData.weightChange < 0
                    ? 'text-emerald-500'
                    : monthlyData.weightChange > 0
                    ? 'text-amber-500'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {monthlyData.weightChange > 0 ? `+${monthlyData.weightChange}` : monthlyData.weightChange}
                </span>
                <span className="text-sm font-semibold text-slate-400">kg</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {monthlyData.startWeight ? `Start: ${monthlyData.startWeight}kg → End: ${monthlyData.endWeight}kg` : 'No weigh-ins in month'}
              </p>
            </div>
          </div>

          {/* Monthly Multi-Day Trend */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Monthly Calorie Trend by Day ({monthlyData.month})
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="dayNumber" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine y={monthlyData.chartData[0]?.calorieTarget} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
