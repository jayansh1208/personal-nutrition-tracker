import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { MealCategory, MealItem } from '../../types/nutrition';
import { api } from '../../services/api';
import { Utensils, Zap, ShieldAlert } from 'lucide-react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: string;
  defaultCategory?: MealCategory;
  editingItem?: MealItem & { category?: MealCategory } | null;
}

const CATEGORIES: { value: MealCategory; label: string }[] = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'EVENING_SNACK', label: 'Evening Snacks' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'OTHER', label: 'Other' }
];

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  defaultCategory = 'LUNCH',
  editingItem = null
}) => {
  const [category, setCategory] = useState<MealCategory>(defaultCategory);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('g');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync editing item
  useEffect(() => {
    if (editingItem) {
      setFoodName(editingItem.foodName);
      setCalories(editingItem.calories.toString());
      setProtein(editingItem.protein.toString());
      setQuantity(editingItem.quantity ? editingItem.quantity.toString() : '');
      setQuantityUnit(editingItem.quantityUnit || 'g');
      setNotes(editingItem.notes || '');
      if (editingItem.category) {
        setCategory(editingItem.category);
      }
    } else {
      setFoodName('');
      setCalories('');
      setProtein('');
      setQuantity('');
      setQuantityUnit('g');
      setNotes('');
      setCategory(defaultCategory);
    }
    setError(null);
  }, [editingItem, defaultCategory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!foodName.trim()) {
      setError('Food name is required');
      return;
    }

    const calNum = parseFloat(calories);
    if (isNaN(calNum) || calNum < 0) {
      setError('Please enter valid calories (>= 0)');
      return;
    }

    const proNum = parseFloat(protein);
    if (isNaN(proNum) || proNum < 0) {
      setError('Please enter valid protein in grams (>= 0)');
      return;
    }

    const qtyNum = quantity.trim() ? parseFloat(quantity) : null;
    if (qtyNum !== null && (isNaN(qtyNum) || qtyNum < 0)) {
      setError('Quantity must be a positive number');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingItem) {
        await api.updateMealItem(editingItem.id, {
          foodName: foodName.trim(),
          category,
          calories: calNum,
          protein: proNum,
          quantity: qtyNum,
          quantityUnit,
          notes: notes.trim() || null
        });
      } else {
        await api.addMealItem({
          date: selectedDate,
          category,
          foodName: foodName.trim(),
          calories: calNum,
          protein: proNum,
          quantity: qtyNum,
          quantityUnit,
          notes: notes.trim() || null
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Edit Meal Entry' : 'Quick Add Meal'}
      subtitle={editingItem ? 'Update meal nutritional details' : `Add food to your log for ${selectedDate}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Meal Category Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Meal Category
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                  category === cat.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Food / Meal Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. Paneer Tikka, Oatmeal, Whey Protein"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Nutritional Values Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Calories <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">kcal</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="e.g. 350"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold transition-all"
            />
          </div>

          {/* Protein */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Protein <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">grams</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="e.g. 28"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold transition-all"
            />
          </div>
        </div>

        {/* Optional Quantity */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Portion / Quantity (Optional)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 150"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Unit
            </label>
            <select
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium transition-all"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="serving">serving</option>
              <option value="piece">piece</option>
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
            </select>
          </div>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Homemade, low oil, post-workout"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        {/* Submit Actions */}
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
              <Zap className="w-4 h-4 fill-white" />
            )}
            <span>{editingItem ? 'Save Changes' : 'Log Food'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
