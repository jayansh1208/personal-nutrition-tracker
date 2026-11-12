import React, { useState, useEffect, useCallback } from 'react';
import { useDate } from '../context/DateContext';
import { useModals } from '../layouts/MainLayout';
import { api } from '../services/api';
import { WeightHistoryResponse, WeightEntry } from '../types/nutrition';
import { Scale, Plus, TrendingDown, TrendingUp, Minus, Calendar, Trash2, Edit2, LineChart as ChartIcon } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';

export const WeightPage: React.FC = () => {
  const { selectedDate } = useDate();
  const { openAddWeight, refreshTrigger, triggerRefresh } = useModals();

  const [data, setData] = useState<WeightHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWeightHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getWeightHistory();
      setData(res);
    } catch (err) {
      console.error('Failed to load weight history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeightHistory();
  }, [fetchWeightHistory, refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.deleteWeight(deleteId);
      setDeleteId(null);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete weight entry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Prepare chart data
  const chartData = (data?.history || []).map((entry: WeightEntry) => ({
    date: entry.date,
    formattedDate: (() => {
      try {
        return format(parseISO(entry.date), 'MMM d');
      } catch {
        return entry.date;
      }
    })(),
    weight: entry.weightKg
  }));

  const minWeight = chartData.length > 0 ? Math.floor(Math.min(...chartData.map((d: { weight: number }) => d.weight)) - 1) : 50;
  const maxWeight = chartData.length > 0 ? Math.ceil(Math.max(...chartData.map((d: { weight: number }) => d.weight)) + 1) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Weight Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track body weight progression and historical trends
          </p>
        </div>

        <button
          onClick={() => openAddWeight()}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record Weigh-in</span>
        </button>
      </div>

      {/* Metrics Row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Starting Weight */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Starting Weight
            </span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {data.startingWeight !== null ? data.startingWeight : '--'}
              </span>
              <span className="text-sm font-semibold text-slate-400">kg</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {data.startingDate ? `Recorded on ${data.startingDate}` : 'No records yet'}
            </p>
          </div>

          {/* Current Weight */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Weight
            </span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {data.currentWeight !== null ? data.currentWeight : '--'}
              </span>
              <span className="text-sm font-semibold text-slate-400">kg</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {data.latestDate ? `Latest on ${data.latestDate}` : 'Pending first weigh-in'}
            </p>
          </div>

          {/* Total Weight Change */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Weight Change
            </span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className={`text-3xl font-black ${
                data.totalChange < 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : data.totalChange > 0
                  ? 'text-amber-500'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {data.totalChange > 0 ? `+${data.totalChange}` : data.totalChange}
              </span>
              <span className="text-sm font-semibold text-slate-400">kg</span>
              {data.totalChange < 0 && <TrendingDown className="w-5 h-5 text-emerald-500" />}
              {data.totalChange > 0 && <TrendingUp className="w-5 h-5 text-amber-500" />}
              {data.totalChange === 0 && <Minus className="w-5 h-5 text-slate-400" />}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Since start of tracking ({data.totalEntries} entries)
            </p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <ChartIcon className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weight Trend (kg)
              </h3>
              <p className="text-xs text-slate-400">Historical weigh-in progress line chart</p>
            </div>
          </div>
        </div>

        {chartData.length < 2 ? (
          <div className="py-12">
            <EmptyState
              icon={Scale}
              title="Not enough data for chart"
              description="Record at least two weigh-ins on different days to visualize your progress curve."
              actionLabel="Add Weigh-in"
              onAction={() => openAddWeight()}
            />
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#475569', opacity: 0.3 }}
                />
                <YAxis
                  domain={[minWeight, maxWeight]}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#475569', opacity: 0.3 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                          <p className="font-semibold text-slate-300">{item.date}</p>
                          <p className="text-base font-bold text-emerald-400 mt-1">
                            {item.weight} kg
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weigh-in History Log
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {data?.totalEntries || 0} records
          </span>
        </div>

        {!data || data.history.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Scale}
              title="No weight entries recorded"
              description="Start recording your daily body weight to track historical progress."
              actionLabel="Record Weight"
              onAction={() => openAddWeight()}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3 px-4 sm:px-6">Date</th>
                  <th className="py-3 px-4">Weight (kg)</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {[...data.history].reverse().map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800 dark:text-slate-100">
                      {entry.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {entry.weightKg} kg
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 italic">
                      {entry.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openAddWeight(entry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit weigh-in"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(entry.id);
                            setDeleteLabel(`${entry.date} (${entry.weightKg} kg)`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete weigh-in"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Weigh-in"
        message={`Are you sure you want to delete weigh-in record for ${deleteLabel}?`}
        confirmLabel="Delete Record"
        isLoading={isDeleting}
      />
    </div>
  );
};
