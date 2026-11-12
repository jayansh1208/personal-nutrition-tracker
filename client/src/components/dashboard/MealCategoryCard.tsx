import React from 'react';
import { Meal, MealCategory, MealItem } from '../../types/nutrition';
import { MealItemRow } from './MealItemRow';
import { Coffee, Sun, Sunset, Moon, MoreHorizontal, Plus } from 'lucide-react';

interface MealCategoryCardProps {
  category: MealCategory;
  meal?: Meal;
  onAddItem: (category: MealCategory) => void;
  onEditItem: (item: MealItem & { category: MealCategory }) => void;
  onDeleteItem: (id: string) => Promise<void>;
}

const CATEGORY_CONFIG: Record<MealCategory, { title: string; icon: any; color: string; badge: string }> = {
  BREAKFAST: {
    title: 'Breakfast',
    icon: Coffee,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    badge: 'Morning'
  },
  LUNCH: {
    title: 'Lunch',
    icon: Sun,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40',
    badge: 'Afternoon'
  },
  EVENING_SNACK: {
    title: 'Evening Snacks',
    icon: Sunset,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
    badge: 'Pre/Post Workout'
  },
  DINNER: {
    title: 'Dinner',
    icon: Moon,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
    badge: 'Night'
  },
  OTHER: {
    title: 'Other / Extra',
    icon: MoreHorizontal,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    badge: 'Snacks'
  }
};

export const MealCategoryCard: React.FC<MealCategoryCardProps> = ({
  category,
  meal,
  onAddItem,
  onEditItem,
  onDeleteItem
}) => {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  const items = meal?.items || [];
  const totalCalories = meal?.totalCalories || 0;
  const totalProtein = meal?.totalProtein || 0;

  return (
    <div className="bg-white dark:bg-[#131b2a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Category Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {config.title}
              </h4>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {config.badge}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {totalCalories} kcal
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {totalProtein}g protein
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onAddItem(category)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Items List */}
      <div className="p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/40">
        {items.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No foods logged in {config.title.toLowerCase()} yet.
            </p>
            <button
              onClick={() => onAddItem(category)}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              + Quick add {config.title.toLowerCase()}
            </button>
          </div>
        ) : (
          items.map((item) => (
            <MealItemRow
              key={item.id}
              item={item}
              category={category}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))
        )}
      </div>

      {/* Category Subtotal Bar (when items present) */}
      {items.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{config.title} Subtotal</span>
          <div className="space-x-4">
            <span>Calories: <strong className="text-slate-800 dark:text-slate-200">{totalCalories} kcal</strong></span>
            <span>Protein: <strong className="text-emerald-600 dark:text-emerald-400">{totalProtein}g</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
