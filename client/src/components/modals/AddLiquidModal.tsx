import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { LiquidEntry } from '../../types/nutrition';
import { api } from '../../services/api';
import { Droplet, ShieldAlert } from 'lucide-react';

interface AddLiquidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: string;
  editingEntry?: LiquidEntry | null;
}

const QUICK_AMOUNTS = [100, 250, 500, 750];
const POPULAR_DRINKS = ['Water', 'Milk', 'Buttermilk', 'Black Coffee', 'Green Tea', 'Protein Shake', 'Coconut Water'];

export const AddLiquidModal: React.FC<AddLiquidModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  editingEntry = null
}) => {
  const [drinkName, setDrinkName] = useState('Water');
  const [quantityMl, setQuantityMl] = useState('250');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingEntry) {
      setDrinkName(editingEntry.drinkName);
      setQuantityMl(editingEntry.quantityMl.toString());
    } else {
      setDrinkName('Water');
      setQuantityMl('250');
    }
    setError(null);
  }, [editingEntry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ml = parseFloat(quantityMl);
    if (isNaN(ml) || ml <= 0) {
      setError('Please enter a valid amount in ml (> 0)');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEntry) {
        await api.updateLiquid(editingEntry.id, {
          drinkName: drinkName.trim() || 'Water',
          quantityMl: ml
        });
      } else {
        await api.addLiquid({
          date: selectedDate,
          drinkName: drinkName.trim() || 'Water',
          quantityMl: ml
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save liquid entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    try {
      setIsSubmitting(true);
      await api.addLiquid({
        date: selectedDate,
        drinkName: 'Water',
        quantityMl: amount
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add quick liquid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Edit Liquid Entry' : 'Log Liquid Intake'}
      subtitle={`Track fluid consumption for ${selectedDate}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Add Water Buttons (only when creating new) */}
        {!editingEntry && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Instant Quick Add (Water)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickAdd(amt)}
                  className="py-2.5 px-2 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 active:scale-95"
                >
                  <Droplet className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                  <span>+{amt} ml</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular drink presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Drink Type
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {POPULAR_DRINKS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDrinkName(d)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  drinkName.toLowerCase() === d.toLowerCase()
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <input
            type="text"
            required
            placeholder="Custom drink name..."
            value={drinkName}
            onChange={(e) => setDrinkName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-all"
          />
        </div>

        {/* Quantity in ml */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Quantity</span>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">millilitres (ml)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder="e.g. 350"
              value={quantityMl}
              onChange={(e) => setQuantityMl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-base font-bold transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
              ml
            </span>
          </div>
        </div>

        {/* Submit */}
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
            className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Droplet className="w-4 h-4 fill-white" />
            )}
            <span>{editingEntry ? 'Save Changes' : 'Record Drink'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
