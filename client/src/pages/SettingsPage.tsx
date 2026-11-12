import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AppSettings, DailyGoal } from '../types/nutrition';
import { Settings as SettingsIcon, Target, Globe, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney'
];

export const SettingsPage: React.FC = () => {
  const [calorieTarget, setCalorieTarget] = useState('2000');
  const [proteinTarget, setProteinTarget] = useState('125');
  const [liquidTarget, setLiquidTarget] = useState('3000');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [calorieUnit, setCalorieUnit] = useState('kcal');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historicalGoals, setHistoricalGoals] = useState<DailyGoal[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const [settingsRes, goalsRes] = await Promise.all([
          api.getSettings(),
          api.getGoals()
        ]);

        if (settingsRes) {
          setTimezone(settingsRes.timezone || 'Asia/Kolkata');
          setWeightUnit(settingsRes.defaultWeightUnit || 'kg');
          setCalorieUnit(settingsRes.defaultCalorieUnit || 'kcal');
        }

        if (goalsRes?.current) {
          setCalorieTarget(goalsRes.current.calorieTarget.toString());
          setProteinTarget(goalsRes.current.proteinTarget.toString());
          setLiquidTarget(goalsRes.current.liquidTarget.toString());
        }

        if (goalsRes?.all) {
          setHistoricalGoals(goalsRes.all);
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err);
        setError(err.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    const cal = parseFloat(calorieTarget);
    const pro = parseFloat(proteinTarget);
    const liq = parseFloat(liquidTarget);

    if (isNaN(cal) || cal < 500) {
      setError('Daily calorie target must be at least 500 kcal');
      return;
    }

    if (isNaN(pro) || pro < 10) {
      setError('Daily protein target must be at least 10g');
      return;
    }

    if (isNaN(liq) || liq < 500) {
      setError('Daily liquid target must be at least 500 ml');
      return;
    }

    try {
      setIsSaving(true);

      // 1. Update goals effective from today (preserves past historical goal calculations)
      const today = new Date().toISOString().split('T')[0];
      await api.updateGoal({
        calorieTarget: cal,
        proteinTarget: pro,
        liquidTarget: liq,
        effectiveFrom: today
      });

      // 2. Update app settings
      await api.updateSettings({
        timezone,
        defaultWeightUnit: weightUnit,
        defaultCalorieUnit: calorieUnit
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      // Refresh goals list
      const goalsRes = await api.getGoals();
      if (goalsRes?.all) setHistoricalGoals(goalsRes.all);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Goals & Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure daily targets, units, timezone, and nutritional thresholds
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          <span className="text-sm font-semibold">Settings and daily goals saved to database!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Daily Nutrition Targets */}
        <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Nutrition Targets
              </h2>
              <p className="text-xs text-slate-400">
                These goals are stored with effective dates so historical records remain unchanged
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Calorie Target */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Calorie Target</span>
                <span className="text-amber-500 font-bold text-[10px]">kcal</span>
              </label>
              <input
                type="number"
                step="50"
                min="500"
                required
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Recommended: 1800 - 2500</span>
            </div>

            {/* Protein Target */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Protein Target</span>
                <span className="text-emerald-500 font-bold text-[10px]">grams</span>
              </label>
              <input
                type="number"
                step="5"
                min="10"
                required
                value={proteinTarget}
                onChange={(e) => setProteinTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Recommended: 1.6 - 2.2g / kg bodyweight</span>
            </div>

            {/* Liquid Target */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Liquid Target</span>
                <span className="text-sky-500 font-bold text-[10px]">ml</span>
              </label>
              <input
                type="number"
                step="100"
                min="500"
                required
                value={liquidTarget}
                onChange={(e) => setLiquidTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 3000 ml (3 Litres)</span>
            </div>
          </div>
        </div>

        {/* Units & Preferences */}
        <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Timezone & Measurement Units
              </h2>
              <p className="text-xs text-slate-400">
                Prevents UTC conversion bugs by locking to your local timezone
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Local Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Weight Unit
              </label>
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Energy Unit
              </label>
              <select
                value={calorieUnit}
                onChange={(e) => setCalorieUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="kcal">Kilocalories (kcal)</option>
                <option value="kJ">Kilojoules (kJ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Historical Goals Log */}
      {historicalGoals.length > 0 && (
        <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Goal Revision History
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Changes to your targets take effect from their recorded start date and preserve all prior history.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {historicalGoals.map((g) => (
              <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Effective From: {g.effectiveFrom}
                  </span>
                  <div className="text-slate-400 mt-0.5">
                    Saved on {new Date(g.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-x-3 text-right">
                  <span className="font-bold text-amber-500">{g.calorieTarget} kcal</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-500">{g.proteinTarget}g protein</span>
                  <span>•</span>
                  <span className="font-bold text-sky-500">{g.liquidTarget} ml</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
