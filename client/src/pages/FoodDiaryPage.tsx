import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDate } from '../context/DateContext';
import { useModals } from '../layouts/MainLayout';
import { api } from '../services/api';
import { Meal, MealItem, MealCategory } from '../types/nutrition';
import { Plus, Search, Utensils, Flame, Dumbbell, Trash2, Edit2, Filter } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { format, parseISO } from 'date-fns';

export const FoodDiaryPage: React.FC = () => {
  const { selectedDate, formattedDateLabel } = useDate();
  const { openAddMeal, refreshTrigger, triggerRefresh } = useModals();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getMeals(selectedDate);
      setMeals(res.meals);
      setTotalCalories(res.totalCalories);
      setTotalProtein(res.totalProtein);
    } catch (err) {
      console.error('Failed to load food diary:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals, refreshTrigger]);

  // Flatten all items across all meal categories for table/list view
  const allItems = useMemo(() => {
    const items: (MealItem & { category: MealCategory })[] = [];
    meals.forEach((m) => {
      m.items.forEach((item) => {
        items.push({ ...item, category: m.category });
      });
    });
    return items;
  }, [meals]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch = item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allItems, searchQuery, categoryFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.deleteMealItem(deleteId);
      setDeleteId(null);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
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
            Food Diary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detailed meal journal for <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formattedDateLabel}</span>
          </p>
        </div>

        <button
          onClick={() => openAddMeal('LUNCH')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Food Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logged food items or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="EVENING_SNACK">Evening Snacks</option>
            <option value="DINNER">Dinner</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Diary Table */}
      <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Utensils}
              title="No food entries found"
              description={
                searchQuery || categoryFilter !== 'ALL'
                  ? 'No entries matched your search filters.'
                  : `You haven't logged any food for ${formattedDateLabel} yet.`
              }
              actionLabel="Add Food Entry"
              onAction={() => openAddMeal('LUNCH')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3.5 px-4 sm:px-6">Food Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Portion</th>
                  <th className="py-3.5 px-4 text-right">Calories</th>
                  <th className="py-3.5 px-4 text-right">Protein</th>
                  <th className="py-3.5 px-4 text-center">Time</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800 dark:text-slate-100">
                      <div>
                        {item.foodName}
                        {item.notes && (
                          <div className="text-xs text-slate-400 font-normal italic">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {item.quantity ? `${item.quantity} ${item.quantityUnit}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {item.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {item.protein}g
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                      {(() => {
                        try {
                          return format(parseISO(item.createdAt), 'h:mm a');
                        } catch {
                          return '—';
                        }
                      })()}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openAddMeal(item.category, item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteName(item.foodName);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-900/60 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                  <td colSpan={3} className="py-4 px-4 sm:px-6">
                    Total for Filtered Entries ({filteredItems.length} items)
                  </td>
                  <td className="py-4 px-4 text-right text-base text-amber-600 dark:text-amber-400 font-extrabold">
                    {Math.round(filteredItems.reduce((acc, i) => acc + i.calories, 0) * 10) / 10} kcal
                  </td>
                  <td className="py-4 px-4 text-right text-base text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {Math.round(filteredItems.reduce((acc, i) => acc + i.protein, 0) * 10) / 10}g
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Food Item"
        message={`Are you sure you want to delete "${deleteName}"? This will immediately recalculate daily nutrition totals.`}
        confirmLabel="Delete Item"
        isLoading={isDeleting}
      />
    </div>
  );
};
