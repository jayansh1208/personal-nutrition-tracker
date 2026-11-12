import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { WeightEntry } from '../../types/nutrition';
import { api } from '../../services/api';
import { Scale, ShieldAlert } from 'lucide-react';

interface AddWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: string;
  editingEntry?: WeightEntry | null;
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  editingEntry = null
}) => {
  const [weightKg, setWeightKg] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingEntry) {
      setWeightKg(editingEntry.weightKg.toString());
      setDate(editingEntry.date);
      setNotes(editingEntry.notes || '');
    } else {
      setWeightKg('');
      setDate(selectedDate);
      setNotes('');
    }
    setError(null);
  }, [editingEntry, selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const wt = parseFloat(weightKg);
    if (isNaN(wt) || wt < 20 || wt > 500) {
      setError('Please enter a realistic weight in kg (between 20 and 500)');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEntry) {
        await api.updateWeight(editingEntry.id, {
          weightKg: wt,
          notes: notes.trim() || null
        });
      } else {
        await api.addWeight({
          date,
          weightKg: wt,
          notes: notes.trim() || null
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save weight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Edit Weight Entry' : 'Log Daily Weight'}
      subtitle="Track your body weight trend over time"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Weight in kg */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Body Weight</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Kilograms (kg)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.05"
              min="20"
              max="500"
              required
              placeholder="e.g. 74.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold transition-all"
              autoFocus
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">
              kg
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Fasted morning weigh-in, post-bathroom"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Scale className="w-4 h-4" />
            )}
            <span>{editingEntry ? 'Save Changes' : 'Record Weight'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
