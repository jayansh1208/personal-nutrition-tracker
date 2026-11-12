import axios from 'axios';
import {
  ApiResponse,
  DailyNutritionSummary,
  Meal,
  MealItem,
  MealCategory,
  LiquidDayData,
  LiquidEntry,
  WeightHistoryResponse,
  WeightEntry,
  DailyGoal,
  WeeklyNutritionResponse,
  MonthlyNutritionResponse,
  AppSettings
} from '../types/nutrition';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to extract data payload
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Nutrition & Daily Overview
  getDailyNutrition: async (date: string): Promise<DailyNutritionSummary> => {
    const res = await apiClient.get<ApiResponse<DailyNutritionSummary>>(`/nutrition/daily?date=${date}`);
    return res.data.data;
  },

  getWeeklyNutrition: async (startDate: string): Promise<WeeklyNutritionResponse> => {
    const res = await apiClient.get<ApiResponse<WeeklyNutritionResponse>>(`/nutrition/weekly?startDate=${startDate}`);
    return res.data.data;
  },

  getMonthlyNutrition: async (month: string): Promise<MonthlyNutritionResponse> => {
    const res = await apiClient.get<ApiResponse<MonthlyNutritionResponse>>(`/nutrition/monthly?month=${month}`);
    return res.data.data;
  },

  // Meals & Meal Items
  getMeals: async (date: string): Promise<{ date: string; totalCalories: number; totalProtein: number; meals: Meal[] }> => {
    const res = await apiClient.get<ApiResponse<{ date: string; totalCalories: number; totalProtein: number; meals: Meal[] }>>(`/meals?date=${date}`);
    return res.data.data;
  },

  addMealItem: async (payload: {
    date: string;
    category: MealCategory;
    foodName: string;
    calories: number;
    protein: number;
    quantity?: number | null;
    quantityUnit?: string;
    notes?: string | null;
  }): Promise<MealItem> => {
    const res = await apiClient.post<ApiResponse<MealItem>>('/meal-items', payload);
    return res.data.data;
  },

  updateMealItem: async (id: string, payload: {
    category?: MealCategory;
    foodName?: string;
    calories?: number;
    protein?: number;
    quantity?: number | null;
    quantityUnit?: string;
    notes?: string | null;
  }): Promise<MealItem> => {
    const res = await apiClient.put<ApiResponse<MealItem>>(`/meal-items/${id}`, payload);
    return res.data.data;
  },

  deleteMealItem: async (id: string): Promise<{ success: boolean; id: string }> => {
    const res = await apiClient.delete<ApiResponse<{ success: boolean; id: string }>>(`/meal-items/${id}`);
    return res.data.data;
  },

  deleteMeal: async (id: string): Promise<{ success: boolean; id: string }> => {
    const res = await apiClient.delete<ApiResponse<{ success: boolean; id: string }>>(`/meals/${id}`);
    return res.data.data;
  },

  // Liquid Tracking
  getLiquid: async (date: string): Promise<LiquidDayData> => {
    const res = await apiClient.get<ApiResponse<LiquidDayData>>(`/liquid?date=${date}`);
    return res.data.data;
  },

  addLiquid: async (payload: {
    date: string;
    drinkName?: string;
    quantityMl: number;
    consumedAt?: string;
  }): Promise<LiquidEntry> => {
    const res = await apiClient.post<ApiResponse<LiquidEntry>>('/liquid', payload);
    return res.data.data;
  },

  updateLiquid: async (id: string, payload: {
    drinkName?: string;
    quantityMl?: number;
    date?: string;
    consumedAt?: string;
  }): Promise<LiquidEntry> => {
    const res = await apiClient.put<ApiResponse<LiquidEntry>>(`/liquid/${id}`, payload);
    return res.data.data;
  },

  deleteLiquid: async (id: string): Promise<{ success: boolean; id: string }> => {
    const res = await apiClient.delete<ApiResponse<{ success: boolean; id: string }>>(`/liquid/${id}`);
    return res.data.data;
  },

  // Weight Tracking
  getWeightHistory: async (startDate?: string, endDate?: string): Promise<WeightHistoryResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await apiClient.get<ApiResponse<WeightHistoryResponse>>(`/weight?${params.toString()}`);
    return res.data.data;
  },

  getWeightByDate: async (date: string): Promise<WeightEntry | null> => {
    const res = await apiClient.get<ApiResponse<WeightEntry | null>>(`/weight/date?date=${date}`);
    return res.data.data;
  },

  addWeight: async (payload: {
    date: string;
    weightKg: number;
    notes?: string | null;
  }): Promise<WeightEntry> => {
    const res = await apiClient.post<ApiResponse<WeightEntry>>('/weight', payload);
    return res.data.data;
  },

  updateWeight: async (id: string, payload: {
    weightKg?: number;
    notes?: string | null;
  }): Promise<WeightEntry> => {
    const res = await apiClient.put<ApiResponse<WeightEntry>>(`/weight/${id}`, payload);
    return res.data.data;
  },

  deleteWeight: async (id: string): Promise<{ success: boolean; id: string }> => {
    const res = await apiClient.delete<ApiResponse<{ success: boolean; id: string }>>(`/weight/${id}`);
    return res.data.data;
  },

  // Goals
  getGoals: async (date?: string): Promise<{ current: DailyGoal; all: DailyGoal[] }> => {
    const url = date ? `/goals?date=${date}` : '/goals';
    const res = await apiClient.get<ApiResponse<{ current: DailyGoal; all: DailyGoal[] }>>(url);
    return res.data.data;
  },

  updateGoal: async (payload: {
    calorieTarget: number;
    proteinTarget: number;
    liquidTarget: number;
    effectiveFrom?: string;
  }): Promise<DailyGoal> => {
    const res = await apiClient.post<ApiResponse<DailyGoal>>('/goals', payload);
    return res.data.data;
  },

  // Analytics
  getWeeklyAnalytics: async (date?: string) => {
    const url = date ? `/analytics/weekly?date=${date}` : '/analytics/weekly';
    const res = await apiClient.get(url);
    return res.data.data;
  },

  getMonthlyAnalytics: async (month?: string) => {
    const url = month ? `/analytics/monthly?month=${month}` : '/analytics/monthly';
    const res = await apiClient.get(url);
    return res.data.data;
  },

  getWeightAnalytics: async () => {
    const res = await apiClient.get('/analytics/weight');
    return res.data.data;
  },

  // Reports & Data
  getDailyReport: async (date: string) => {
    const res = await apiClient.get(`/reports/daily?date=${date}`);
    return res.data.data;
  },

  getWeeklyReport: async (startDate: string) => {
    const res = await apiClient.get(`/reports/weekly?startDate=${startDate}`);
    return res.data.data;
  },

  getMonthlyReport: async (month: string) => {
    const res = await apiClient.get(`/reports/monthly?month=${month}`);
    return res.data.data;
  },

  downloadCSV: (type: 'nutrition' | 'weight' | 'liquid') => {
    window.open(`${API_BASE}/reports/export?type=${type}`, '_blank');
  },

  downloadBackup: () => {
    window.open(`${API_BASE}/reports/export?type=backup`, '_blank');
  },

  clearAllData: async (confirmation: string) => {
    const res = await apiClient.post('/reports/clear', { confirmation });
    return res.data.data;
  },

  // Settings
  getSettings: async (): Promise<AppSettings> => {
    const res = await apiClient.get<ApiResponse<AppSettings>>('/settings');
    return res.data.data;
  },

  updateSettings: async (payload: Partial<AppSettings>): Promise<AppSettings> => {
    const res = await apiClient.put<ApiResponse<AppSettings>>('/settings', payload);
    return res.data.data;
  }
};
