import React, { useState, useEffect } from 'react';
import { useDate } from '../context/DateContext';
import { api } from '../services/api';
import { Download, FileSpreadsheet, ShieldAlert, Database, Trash2, CheckCircle2, FileText, Calendar } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const ReportsPage: React.FC = () => {
  const { selectedDate } = useDate();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear data dialog state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      if (reportType === 'daily') {
        const res = await api.getDailyReport(selectedDate);
        setReportData(res);
      } else if (reportType === 'weekly') {
        const res = await api.getWeeklyReport(selectedDate);
        setReportData(res);
      } else {
        const month = selectedDate.substring(0, 7);
        const res = await api.getMonthlyReport(month);
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDate]);

  const handleClearData = async () => {
    if (confirmationInput !== 'DELETE_ALL_DATA_CONFIRMED') {
      alert('Confirmation phrase does not match exactly.');
      return;
    }

    try {
      setIsClearing(true);
      await api.clearAllData(confirmationInput);
      setClearSuccess(true);
      setIsClearModalOpen(false);
      setConfirmationInput('');
      fetchReport();
    } catch (err: any) {
      alert(err.message || 'Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Reports & Data Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export nutrition records, generate period summaries, and manage backups
        </p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Export Nutrition CSV */}
        <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nutrition History
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Export all logged meals, foods, quantities, calories, and protein as CSV.
            </p>
          </div>
          <button
            onClick={() => api.downloadCSV('nutrition')}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Export Weight CSV */}
        <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weight History
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Export complete weigh-in history and notes as a spreadsheet.
            </p>
          </div>
          <button
            onClick={() => api.downloadCSV('weight')}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Export Liquid CSV */}
        <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Liquid History
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Export all liquid intake entries, beverages, and millilitres as CSV.
            </p>
          </div>
          <button
            onClick={() => api.downloadCSV('liquid')}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Full Backup JSON */}
        <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 w-fit mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete Personal Backup
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Full database snapshot in JSON including all goals, meals, liquids, and weights.
            </p>
          </div>
          <button
            onClick={() => api.downloadBackup()}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Backup</span>
          </button>
        </div>
      </div>

      {/* Report Generator Section */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Generated Period Summary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Summary report computed from PostgreSQL database records
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === 'weekly'
                  ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === 'monthly'
                  ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Report Content */}
        {reportData && (
          <div className="mt-6 space-y-4">
            {reportType === 'daily' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Calories Consumed</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {reportData.summary.calories.consumed} kcal
                  </div>
                  <span className="text-xs text-slate-400">Target: {reportData.summary.calories.target} kcal</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Protein Consumed</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {reportData.summary.protein.consumed}g
                  </div>
                  <span className="text-xs text-slate-400">Target: {reportData.summary.protein.target}g</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Hydration Logged</span>
                  <div className="text-2xl font-black text-sky-500 mt-1">
                    {reportData.summary.liquid.consumed} ml
                  </div>
                  <span className="text-xs text-slate-400">Water: {reportData.summary.liquid.water} ml</span>
                </div>
              </div>
            )}

            {(reportType === 'weekly' || reportType === 'monthly') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Average Daily Calories</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {reportData.averages.calories} kcal
                  </div>
                  <span className="text-xs text-slate-400">Across logged days</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Average Daily Protein</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {reportData.averages.protein}g
                  </div>
                  <span className="text-xs text-slate-400">Target: {reportData.targets.proteinTarget}g</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Logged Days Count</span>
                  <div className="text-2xl font-black text-purple-500 mt-1">
                    {reportData.loggedDaysCount} days
                  </div>
                  <span className="text-xs text-slate-400">Consistency metric</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="bg-white dark:bg-[#131b2a] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 mb-1">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold">
                Clear Personal Tracking Records
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Permanently purge all meal entries, liquid records, and weight history. Daily goals and settings will be preserved. This action requires strict typing confirmation.
            </p>
          </div>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center space-x-2 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Tracking Records</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Confirm Data Deletion"
        subtitle="This action CANNOT be undone"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            To confirm permanent deletion of all nutrition, liquid, and weight entries, type <strong className="text-rose-600 dark:text-rose-400 select-all font-mono">DELETE_ALL_DATA_CONFIRMED</strong> below:
          </p>

          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder="Type DELETE_ALL_DATA_CONFIRMED"
            className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              disabled={confirmationInput !== 'DELETE_ALL_DATA_CONFIRMED' || isClearing}
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
            >
              {isClearing ? 'Purging...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
