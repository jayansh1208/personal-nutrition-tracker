export type MealCategory = 'BREAKFAST' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER' | 'OTHER';

export interface MealItem {
  id: string;
  mealId: string;
  foodName: string;
  quantity: number | null;
  quantityUnit: string;
  calories: number;
  protein: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meal {
  id: string;
  date: string;
  category: MealCategory;
  totalCalories: number;
  totalProtein: number;
  itemCount: number;
  items: MealItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LiquidEntry {
  id: string;
  drinkName: string;
  quantityMl: number;
  date: string;
  consumedAt: string;
  createdAt: string;
  updatedAt: string;
  isWater?: boolean;
}

export interface LiquidDayData {
  date: string;
  totalMl: number;
  waterMl: number;
  otherMl: number;
  targetMl: number;
  remainingMl: number;
  progressPercentage: number;
  entriesCount: number;
  entries: LiquidEntry[];
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  date: string;
  recordedAt: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeightHistoryResponse {
  startingWeight: number | null;
  currentWeight: number | null;
  totalChange: number;
  startingDate: string | null;
  latestDate: string | null;
  totalEntries: number;
  history: WeightEntry[];
}

export interface DailyGoal {
  id: string;
  calorieTarget: number;
  proteinTarget: number;
  liquidTarget: number;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  summary: {
    calories: {
      consumed: number;
      target: number;
      remaining: number;
      progress: number;
      unit: string;
    };
    protein: {
      consumed: number;
      target: number;
      remaining: number;
      progress: number;
      unit: string;
    };
    liquid: {
      consumed: number;
      water: number;
      other: number;
      target: number;
      remaining: number;
      progress: number;
      unit: string;
    };
    weight: {
      current: number | null;
      recordedAt: string | null;
      unit: string;
    };
  };
  mealsByCategory: Record<MealCategory, Meal>;
  meals: Meal[];
  liquid: LiquidDayData;
  weight: WeightEntry | null;
  goals: DailyGoal;
}

export interface WeeklyNutritionDay {
  date: string;
  calories: number;
  protein: number;
  liquid: number;
  water: number;
  weight: number | null;
  calorieTarget: number;
  proteinTarget: number;
  liquidTarget: number;
  mealItemCount: number;
}

export interface WeeklyNutritionResponse {
  startDate: string;
  endDate: string;
  selectedDate: string;
  averages: {
    calories: number;
    protein: number;
    liquid: number;
  };
  targets: {
    calorieTarget: number;
    proteinTarget: number;
    liquidTarget: number;
  };
  loggedDaysCount: number;
  days: WeeklyNutritionDay[];
}

export interface MonthlyNutritionResponse {
  month: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  loggedDaysCount: number;
  consistencyPercentage: number;
  averages: {
    calories: number;
    protein: number;
    liquid: number;
  };
  weightChange: number;
  startWeight: number | null;
  endWeight: number | null;
  targets: {
    calorieTarget: number;
    proteinTarget: number;
    liquidTarget: number;
  };
  days: {
    date: string;
    calories: number;
    protein: number;
    liquid: number;
    water: number;
    weight: number | null;
    calorieTarget: number;
    proteinTarget: number;
    mealItemCount: number;
  }[];
}

export interface AppSettings {
  id: string;
  timezone: string;
  defaultWeightUnit: string;
  defaultCalorieUnit: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: any;
}
