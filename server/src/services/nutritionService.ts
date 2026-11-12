import prisma from '../prisma';
import { getTodayDateString, getWeekDateRange, getMonthDateRange } from '../utils/dateUtils';
import { goalService } from './goalService';
import { mealService } from './mealService';
import { liquidService } from './liquidService';
import { weightService } from './weightService';

export class NutritionService {
  /**
   * Complete daily nutrition overview for dashboard
   */
  async getDailyNutrition(dateStr?: string) {
    const targetDate = dateStr || getTodayDateString();

    const [mealsData, liquidData, weightData, goalData] = await Promise.all([
      mealService.getMealsByDate(targetDate),
      liquidService.getLiquidByDate(targetDate),
      weightService.getWeightByDate(targetDate),
      goalService.getEffectiveGoal(targetDate)
    ]);

    const caloriesConsumed = mealsData.totalCalories;
    const proteinConsumed = mealsData.totalProtein;
    const liquidConsumed = liquidData.totalMl;
    const waterConsumed = liquidData.waterMl;

    const calorieTarget = goalData.calorieTarget;
    const proteinTarget = goalData.proteinTarget;
    const liquidTarget = goalData.liquidTarget;

    const caloriesRemaining = Math.max(0, Math.round((calorieTarget - caloriesConsumed) * 10) / 10);
    const proteinRemaining = Math.max(0, Math.round((proteinTarget - proteinConsumed) * 10) / 10);
    const liquidRemaining = Math.max(0, Math.round(liquidTarget - liquidConsumed));

    const calorieProgress = calorieTarget > 0 ? Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100)) : 0;
    const proteinProgress = proteinTarget > 0 ? Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100)) : 0;
    const liquidProgress = liquidTarget > 0 ? Math.min(100, Math.round((liquidConsumed / liquidTarget) * 100)) : 0;

    // Group meals by standard categories for UI
    const categoryOrder = ['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER', 'OTHER'];
    const mealsByCategory: Record<string, any> = {};

    categoryOrder.forEach((cat) => {
      const found = mealsData.meals.find((m) => m.category === cat);
      mealsByCategory[cat] = found || {
        id: null,
        date: targetDate,
        category: cat,
        totalCalories: 0,
        totalProtein: 0,
        itemCount: 0,
        items: []
      };
    });

    return {
      date: targetDate,
      summary: {
        calories: {
          consumed: caloriesConsumed,
          target: calorieTarget,
          remaining: caloriesRemaining,
          progress: calorieProgress,
          unit: 'kcal'
        },
        protein: {
          consumed: proteinConsumed,
          target: proteinTarget,
          remaining: proteinRemaining,
          progress: proteinProgress,
          unit: 'g'
        },
        liquid: {
          consumed: liquidConsumed,
          water: waterConsumed,
          other: liquidData.otherMl,
          target: liquidTarget,
          remaining: liquidRemaining,
          progress: liquidProgress,
          unit: 'ml'
        },
        weight: {
          current: weightData ? weightData.weightKg : null,
          recordedAt: weightData ? weightData.recordedAt : null,
          unit: 'kg'
        }
      },
      mealsByCategory,
      meals: mealsData.meals,
      liquid: liquidData,
      weight: weightData,
      goals: goalData
    };
  }

  /**
   * Retrieves weekly nutrition data for a given reference date (7 days)
   */
  async getWeeklyNutrition(selectedDate?: string) {
    const targetDate = selectedDate || getTodayDateString();
    const { startDate, endDate, dates } = getWeekDateRange(targetDate);

    // Fetch meals in date range
    const meals = await prisma.meals.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      },
      include: { items: true }
    });

    // Fetch liquids in date range
    const liquids = await prisma.liquidEntries.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });

    // Fetch weights in date range
    const weights = await prisma.weightEntries.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });

    // Effective goal
    const goal = await goalService.getEffectiveGoal(targetDate);

    // Aggregate by day
    let totalCalories = 0;
    let totalProtein = 0;
    let totalLiquid = 0;
    let loggedDaysCount = 0;

    const days = dates.map((d) => {
      const dayMeals = meals.filter((m) => m.date === d);
      let dayCalories = 0;
      let dayProtein = 0;
      let dayMealItemCount = 0;

      dayMeals.forEach((m) => {
        m.items.forEach((item) => {
          dayCalories += Number(item.calories);
          dayProtein += Number(item.protein);
          dayMealItemCount++;
        });
      });

      const dayLiquids = liquids.filter((l) => l.date === d);
      let dayLiquidMl = 0;
      let dayWaterMl = 0;
      dayLiquids.forEach((l) => {
        const ml = Number(l.quantityMl);
        dayLiquidMl += ml;
        if (l.drinkName.trim().toLowerCase() === 'water') {
          dayWaterMl += ml;
        }
      });

      const dayWeight = weights.find((w) => w.date === d);

      if (dayCalories > 0 || dayProtein > 0 || dayLiquidMl > 0 || dayWeight) {
        loggedDaysCount++;
      }

      totalCalories += dayCalories;
      totalProtein += dayProtein;
      totalLiquid += dayLiquidMl;

      return {
        date: d,
        calories: Math.round(dayCalories * 10) / 10,
        protein: Math.round(dayProtein * 10) / 10,
        liquid: Math.round(dayLiquidMl),
        water: Math.round(dayWaterMl),
        weight: dayWeight ? Number(dayWeight.weightKg) : null,
        calorieTarget: goal.calorieTarget,
        proteinTarget: goal.proteinTarget,
        liquidTarget: goal.liquidTarget,
        mealItemCount: dayMealItemCount
      };
    });

    const avgCalories = loggedDaysCount > 0 ? Math.round((totalCalories / loggedDaysCount) * 10) / 10 : 0;
    const avgProtein = loggedDaysCount > 0 ? Math.round((totalProtein / loggedDaysCount) * 10) / 10 : 0;
    const avgLiquid = loggedDaysCount > 0 ? Math.round(totalLiquid / loggedDaysCount) : 0;

    return {
      startDate,
      endDate,
      selectedDate: targetDate,
      averages: {
        calories: avgCalories,
        protein: avgProtein,
        liquid: avgLiquid
      },
      targets: {
        calorieTarget: goal.calorieTarget,
        proteinTarget: goal.proteinTarget,
        liquidTarget: goal.liquidTarget
      },
      loggedDaysCount,
      days
    };
  }

  /**
   * Retrieves monthly nutrition data for a given month YYYY-MM
   */
  async getMonthlyNutrition(yearMonth?: string) {
    const targetMonth = yearMonth || getTodayDateString().substring(0, 7);
    const { startDate, endDate, dates } = getMonthDateRange(targetMonth);

    const meals = await prisma.meals.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { items: true }
    });

    const liquids = await prisma.liquidEntries.findMany({
      where: { date: { gte: startDate, lte: endDate } }
    });

    const weights = await prisma.weightEntries.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    });

    const goal = await goalService.getEffectiveGoal(dates[0]);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalLiquid = 0;
    let loggedDaysCount = 0;

    const days = dates.map((d) => {
      const dayMeals = meals.filter((m) => m.date === d);
      let dayCalories = 0;
      let dayProtein = 0;
      let dayMealItemCount = 0;

      dayMeals.forEach((m) => {
        m.items.forEach((item) => {
          dayCalories += Number(item.calories);
          dayProtein += Number(item.protein);
          dayMealItemCount++;
        });
      });

      const dayLiquids = liquids.filter((l) => l.date === d);
      let dayLiquidMl = 0;
      let dayWaterMl = 0;
      dayLiquids.forEach((l) => {
        const ml = Number(l.quantityMl);
        dayLiquidMl += ml;
        if (l.drinkName.trim().toLowerCase() === 'water') {
          dayWaterMl += ml;
        }
      });

      const dayWeight = weights.find((w) => w.date === d);

      if (dayCalories > 0 || dayProtein > 0 || dayLiquidMl > 0 || dayWeight) {
        loggedDaysCount++;
      }

      totalCalories += dayCalories;
      totalProtein += dayProtein;
      totalLiquid += dayLiquidMl;

      return {
        date: d,
        calories: Math.round(dayCalories * 10) / 10,
        protein: Math.round(dayProtein * 10) / 10,
        liquid: Math.round(dayLiquidMl),
        water: Math.round(dayWaterMl),
        weight: dayWeight ? Number(dayWeight.weightKg) : null,
        calorieTarget: goal.calorieTarget,
        proteinTarget: goal.proteinTarget,
        mealItemCount: dayMealItemCount
      };
    });

    const avgCalories = loggedDaysCount > 0 ? Math.round((totalCalories / loggedDaysCount) * 10) / 10 : 0;
    const avgProtein = loggedDaysCount > 0 ? Math.round((totalProtein / loggedDaysCount) * 10) / 10 : 0;
    const avgLiquid = loggedDaysCount > 0 ? Math.round(totalLiquid / loggedDaysCount) : 0;

    const startWeight = weights.length > 0 ? Number(weights[0].weightKg) : null;
    const endWeight = weights.length > 0 ? Number(weights[weights.length - 1].weightKg) : null;
    const monthlyWeightChange = (startWeight !== null && endWeight !== null)
      ? Math.round((endWeight - startWeight) * 100) / 100
      : 0;

    const consistencyPercentage = dates.length > 0
      ? Math.round((loggedDaysCount / dates.length) * 100)
      : 0;

    return {
      month: targetMonth,
      startDate,
      endDate,
      totalDays: dates.length,
      loggedDaysCount,
      consistencyPercentage,
      averages: {
        calories: avgCalories,
        protein: avgProtein,
        liquid: avgLiquid
      },
      weightChange: monthlyWeightChange,
      startWeight,
      endWeight,
      targets: {
        calorieTarget: goal.calorieTarget,
        proteinTarget: goal.proteinTarget,
        liquidTarget: goal.liquidTarget
      },
      days
    };
  }
}

export const nutritionService = new NutritionService();
