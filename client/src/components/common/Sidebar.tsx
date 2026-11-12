import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Droplets,
  Scale,
  LineChart,
  FileText,
  Settings,
  Activity,
  Heart
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/diary', label: 'Food Diary', icon: BookOpen },
  { path: '/liquid', label: 'Liquid Tracker', icon: Droplets },
  { path: '/weight', label: 'Weight Tracker', icon: Scale },
  { path: '/analytics', label: 'Analytics', icon: LineChart },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#131b2a] border-r border-slate-200/80 dark:border-slate-800/80 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
              NutriTrack
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
              Private Beta
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Pill */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
            U1
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              Primary User
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Daily Tracking Active
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
