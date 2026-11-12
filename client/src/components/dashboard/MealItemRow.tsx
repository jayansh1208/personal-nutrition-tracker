import React, { useState } from 'react';
import { MealItem, MealCategory } from '../../types/nutrition';
import { Edit2, Trash2, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface MealItemRowProps {
  item: MealItem;
  category: MealCategory;
  onEdit: (item: MealItem & { category: MealCategory }) => void;
  onDelete: (id: string) => Promise<void>;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({
  item,
  category,
  onEdit,
  onDelete
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedTime = (() => {
    try {
      return format(parseISO(item.createdAt), 'h:mm a');
    } catch {
      return '';
    }
  })();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(item.id);
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group flex items-center justify-between py-3 px-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
              {item.foodName}
            </span>
            {item.quantity && (
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                {item.quantity} {item.quantityUnit}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {formattedTime && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formattedTime}</span>
              </span>
            )}
            {item.notes && (
              <span className="truncate italic text-slate-400">
                "{item.notes}"
              </span>
            )}
          </div>
        </div>

        {/* Nutritional values & actions */}
        <div className="flex items-center space-x-5">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {item.calories} <span className="text-[11px] font-normal text-slate-400">kcal</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {item.protein}g <span className="text-[10px] text-slate-400 font-normal">protein</span>
            </div>
          </div>

          {/* Action buttons (revealed on hover or mobile tap) */}
          <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit({ ...item, category })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
              title="Edit entry"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Food Entry"
        message={`Are you sure you want to remove "${item.foodName}" (${item.calories} kcal, ${item.protein}g protein)? Daily totals will be immediately updated.`}
        confirmLabel="Delete Food"
        isLoading={isDeleting}
      />
    </>
  );
};
