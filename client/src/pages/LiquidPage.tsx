import React, { useState, useEffect, useCallback } from 'react';
import { useDate } from '../context/DateContext';
import { useModals } from '../layouts/MainLayout';
import { api } from '../services/api';
import { LiquidDayData, LiquidEntry } from '../types/nutrition';
import { Droplet, Plus, Trash2, Edit2, Clock, CheckCircle2, GlassWater } from 'lucide-react';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { format, parseISO } from 'date-fns';

const QUICK_AMOUNTS = [100, 250, 500, 750];

export const LiquidPage: React.FC = () => {
  const { selectedDate, formattedDateLabel } = useDate();
  const { openAddLiquid, refreshTrigger, triggerRefresh } = useModals();

  const [data, setData] = useState<LiquidDayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDrinkName, setDeleteDrinkName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLiquidData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getLiquid(selectedDate);
      setData(res);
    } catch (err) {
      console.error('Failed to load liquid entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchLiquidData();
  }, [fetchLiquidData, refreshTrigger]);

  const handleQuickAddWater = async (amount: number) => {
    try {
      await api.addLiquid({
        date: selectedDate,
        drinkName: 'Water',
        quantityMl: amount
      });
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add water');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.deleteLiquid(deleteId);
      setDeleteId(null);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Liquid Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily hydration and fluids for <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formattedDateLabel}</span>
          </p>
        </div>

        <button
          onClick={() => openAddLiquid()}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Drink / Beverage</span>
        </button>
      </div>

      {/* Progress & Intake Metric Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Hydration Progress */}
          <div className="md:col-span-2 bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daily Hydration Progress
                </span>
                <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                  {data.progressPercentage}%
                </span>
              </div>

              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {data.totalMl}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {data.targetMl} ml target
                </span>
              </div>

              <ProgressBar
                progress={data.progressPercentage}
                colorClass="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"
                heightClass="h-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <div>
                <span className="text-xs text-slate-400 block">Pure Water Intake</span>
                <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                  {data.waterMl} ml
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Other Liquids (Milk, Tea, Coffee)</span>
                <span className="text-lg font-bold text-indigo-500">
                  {data.otherMl} ml
                </span>
              </div>
            </div>
          </div>

          {/* Quick-add Water Panel */}
          <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2 text-sky-600 dark:text-sky-400">
                <Droplet className="w-4 h-4 fill-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick Add Water
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                1-tap hydration presets:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickAddWater(amt)}
                    className="p-3 rounded-xl border border-sky-100 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sm font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{amt} ml</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => openAddLiquid()}
              className="mt-4 w-full py-2 text-xs font-semibold text-center text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              + Log Custom Drink / Beverage
            </button>
          </div>
        </div>
      )}

      {/* History Log */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GlassWater className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Liquid History Log
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {data?.entriesCount || 0} entries
          </span>
        </div>

        {!data || data.entries.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Droplet}
              title="No liquid intake recorded"
              description={`You haven't logged any liquid for ${formattedDateLabel}. Stay hydrated!`}
              actionLabel="Add 250ml Water"
              onAction={() => handleQuickAddWater(250)}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {data.entries.map((entry) => {
              const formattedTime = (() => {
                try {
                  return format(parseISO(entry.consumedAt), 'h:mm a');
                } catch {
                  return '—';
                }
              })();

              return (
                <div
                  key={entry.id}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl ${
                      entry.isWater
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-500'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500'
                    }`}>
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {entry.drinkName}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formattedTime}</span>
                        </span>
                        {entry.isWater && (
                          <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.2 rounded-full">
                            Pure Water
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-5">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {entry.quantityMl}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        ml
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openAddLiquid(entry)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(entry.id);
                          setDeleteDrinkName(`${entry.drinkName} (${entry.quantityMl} ml)`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Liquid Entry"
        message={`Are you sure you want to remove ${deleteDrinkName}? Daily liquid totals will be recalculated immediately.`}
        confirmLabel="Delete Entry"
        isLoading={isDeleting}
      />
    </div>
  );
};
