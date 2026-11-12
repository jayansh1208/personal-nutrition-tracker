import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { AddMealModal } from '../components/modals/AddMealModal';
import { AddLiquidModal } from '../components/modals/AddLiquidModal';
import { AddWeightModal } from '../components/modals/AddWeightModal';
import { useDate } from '../context/DateContext';
import { MealCategory, MealItem, LiquidEntry, WeightEntry } from '../types/nutrition';

interface ModalContextType {
  openAddMeal: (category?: MealCategory, itemToEdit?: (MealItem & { category?: MealCategory }) | null) => void;
  openAddLiquid: (entryToEdit?: LiquidEntry | null) => void;
  openAddWeight: (entryToEdit?: WeightEntry | null) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModals must be used within MainLayout');
  return context;
};

export const MainLayout: React.FC = () => {
  const { selectedDate } = useDate();

  // Modals state
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [mealCategory, setMealCategory] = useState<MealCategory>('LUNCH');
  const [editingMealItem, setEditingMealItem] = useState<(MealItem & { category?: MealCategory }) | null>(null);

  const [isAddLiquidOpen, setIsAddLiquidOpen] = useState(false);
  const [editingLiquid, setEditingLiquid] = useState<LiquidEntry | null>(null);

  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);

  // Global refresh counter so pages re-fetch on any change
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const openAddMeal = (category: MealCategory = 'LUNCH', itemToEdit: (MealItem & { category?: MealCategory }) | null = null) => {
    setMealCategory(category);
    setEditingMealItem(itemToEdit);
    setIsAddMealOpen(true);
  };

  const openAddLiquid = (entryToEdit: LiquidEntry | null = null) => {
    setEditingLiquid(entryToEdit);
    setIsAddLiquidOpen(true);
  };

  const openAddWeight = (entryToEdit: WeightEntry | null = null) => {
    setEditingWeight(entryToEdit);
    setIsAddWeightOpen(true);
  };

  return (
    <ModalContext.Provider
      value={{
        openAddMeal,
        openAddLiquid,
        openAddWeight,
        refreshTrigger,
        triggerRefresh
      }}
    >
      <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
          <Navbar onQuickAddMeal={() => openAddMeal('LUNCH')} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav onQuickAddMeal={() => openAddMeal('LUNCH')} />

        {/* Global Modals */}
        <AddMealModal
          isOpen={isAddMealOpen}
          onClose={() => {
            setIsAddMealOpen(false);
            setEditingMealItem(null);
          }}
          onSuccess={triggerRefresh}
          selectedDate={selectedDate}
          defaultCategory={mealCategory}
          editingItem={editingMealItem}
        />

        <AddLiquidModal
          isOpen={isAddLiquidOpen}
          onClose={() => {
            setIsAddLiquidOpen(false);
            setEditingLiquid(null);
          }}
          onSuccess={triggerRefresh}
          selectedDate={selectedDate}
          editingEntry={editingLiquid}
        />

        <AddWeightModal
          isOpen={isAddWeightOpen}
          onClose={() => {
            setIsAddWeightOpen(false);
            setEditingWeight(null);
          }}
          onSuccess={triggerRefresh}
          selectedDate={selectedDate}
          editingEntry={editingWeight}
        />
      </div>
    </ModalContext.Provider>
  );
};
