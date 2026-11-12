import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // percentage 0-100+
  colorClass?: string;
  heightClass?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  colorClass = 'bg-emerald-500',
  heightClass = 'h-2.5',
  showLabel = false
}) => {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClass}`}>
        <motion.div
          className={`${heightClass} rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>Progress</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};
