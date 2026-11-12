import prisma from '../prisma';
import { getTodayDateString, getWeekDateRange, getMonthDateRange } from '../utils/dateUtils';
import { nutritionService } from './nutritionService';
import { weightService } from './weightService';

export class AnalyticsService {
  /**
   * Weekly analytics breakdown for charts
   */
  async getWeeklyAnalytics(referenceDate?: string) {
    const targetDate = referenceDate || getTodayDateString();
    const weeklyData = await nutritionService.getWeeklyNutrition(targetDate);

    // Number of meal entries total
    const totalMealEntries = weeklyData.days.reduce((acc, d) => acc + d.mealItemCount, 0);

    return {
      referenceDate: targetDate,
      startDate: weeklyData.startDate,
      endDate: weeklyData.endDate,
      averages: weeklyData.averages,
      targets: weeklyData.targets,
      loggedDaysCount: weeklyData.loggedDaysCount,
      totalMealEntries,
      chartData: weeklyData.days.map((d) => ({
        date: d.date,
        dayName: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        calories: d.calories,
        calorieTarget: d.calorieTarget,
        protein: d.protein,
        proteinTarget: d.proteinTarget,
        liquid: d.liquid,
        liquidTarget: d.liquidTarget,
        water: d.water,
        weight: d.weight,
        mealItemCount: d.mealItemCount
      }))
    };
  }

  /**
   * Monthly analytics breakdown for charts
   */
  async getMonthlyAnalytics(monthStr?: string) {
    const targetMonth = monthStr || getTodayDateString().substring(0, 7);
    const monthlyData = await nutritionService.getMonthlyNutrition(targetMonth);

    // Calculate days targets were met
    let calorieGoalMetDays = 0;
    let proteinGoalMetDays = 0;

    monthlyData.days.forEach((d) => {
      // Within 10% of calorie target or at least met
      if (d.calories >= d.calorieTarget * 0.9 && d.calories <= d.calorieTarget * 1.1) {
        calorieGoalMetDays++;
      }
      if (d.protein >= d.proteinTarget) {
        proteinGoalMetDays++;
      }
    });

    return {
      month: monthlyData.month,
      startDate: monthlyData.startDate,
      endDate: monthlyData.endDate,
      totalDays: monthlyData.totalDays,
      loggedDaysCount: monthlyData.loggedDaysCount,
      consistencyPercentage: monthlyData.consistencyPercentage,
      averages: monthlyData.averages,
      weightChange: monthlyData.weightChange,
      startWeight: monthlyData.startWeight,
      endWeight: monthlyData.endWeight,
      goalsMet: {
        calorieGoalMetDays,
        proteinGoalMetDays
      },
      chartData: monthlyData.days.map((d) => ({
        date: d.date,
        dayNumber: parseInt(d.date.split('-')[2], 10),
        calories: d.calories,
        calorieTarget: d.calorieTarget,
        protein: d.protein,
        proteinTarget: d.proteinTarget,
        liquid: d.liquid,
        water: d.water,
        weight: d.weight
      }))
    };
  }

  /**
   * Comprehensive weight trends and analytics
   */
  async getWeightAnalytics() {
    const weightOverview = await weightService.getWeightHistory();
    const history = weightOverview.history;

    if (history.length === 0) {
      return {
        startingWeight: null,
        currentWeight: null,
        lowestWeight: null,
        highestWeight: null,
        totalChange: 0,
        totalEntries: 0,
        chartData: []
      };
    }

    const weights = history.map((h) => h.weightKg);
    const lowestWeight = Math.min(...weights);
    const highestWeight = Math.max(...weights);

    // Calculate moving average (last 7 points)
    const chartData = history.map((entry, index) => {
      const slice = history.slice(Math.max(0, index - 6), index + 1);
      const movingAvg = Math.round((slice.reduce((acc, curr) => acc + curr.weightKg, 0) / slice.length) * 100) / 100;

      return {
        id: entry.id,
        date: entry.date,
        weightKg: entry.weightKg,
        movingAvg,
        notes: entry.notes
      };
    });

    return {
      startingWeight: weightOverview.startingWeight,
      currentWeight: weightOverview.currentWeight,
      lowestWeight,
      highestWeight,
      totalChange: weightOverview.totalChange,
      startingDate: weightOverview.startingDate,
      latestDate: weightOverview.latestDate,
      totalEntries: weightOverview.totalEntries,
      chartData
    };
  }
}

export const analyticsService = new AnalyticsService();
