import { stringify } from 'csv-stringify/sync';
import prisma from '../prisma';
import { getTodayDateString, getWeekDateRange, getMonthDateRange } from '../utils/dateUtils';
import { nutritionService } from './nutritionService';

export class ReportService {
  /**
   * Generates a comprehensive daily report
   */
  async getDailyReport(dateStr?: string) {
    return await nutritionService.getDailyNutrition(dateStr);
  }

  /**
   * Generates a comprehensive weekly report
   */
  async getWeeklyReport(startDate?: string) {
    return await nutritionService.getWeeklyNutrition(startDate);
  }

  /**
   * Generates a comprehensive monthly report
   */
  async getMonthlyReport(month?: string) {
    return await nutritionService.getMonthlyNutrition(month);
  }

  /**
   * Exports data to CSV string
   */
  async exportCSV(type: 'nutrition' | 'weight' | 'liquid'): Promise<{ filename: string; content: string }> {
    const today = getTodayDateString();

    if (type === 'nutrition') {
      // Export all meal items with date, meal category, food, calories, protein, quantity
      const items = await prisma.mealItems.findMany({
        include: { meal: true },
        orderBy: [{ meal: { date: 'desc' } }, { createdAt: 'asc' }]
      });

      const records = items.map((item) => ({
        Date: item.meal.date,
        Category: item.meal.category,
        FoodName: item.foodName,
        Quantity: item.quantity !== null ? Number(item.quantity) : '',
        Unit: item.quantityUnit,
        Calories_kcal: Number(item.calories),
        Protein_g: Number(item.protein),
        Notes: item.notes || '',
        LoggedAt: item.createdAt.toISOString()
      }));

      const csv = stringify(records, { header: true });
      return {
        filename: `nutrition_history_${today}.csv`,
        content: csv
      };
    }

    if (type === 'weight') {
      const weights = await prisma.weightEntries.findMany({
        orderBy: { date: 'asc' }
      });

      const records = weights.map((w) => ({
        Date: w.date,
        Weight_kg: Number(w.weightKg),
        Notes: w.notes || '',
        RecordedAt: w.recordedAt.toISOString()
      }));

      const csv = stringify(records, { header: true });
      return {
        filename: `weight_history_${today}.csv`,
        content: csv
      };
    }

    if (type === 'liquid') {
      const liquids = await prisma.liquidEntries.findMany({
        orderBy: [{ date: 'desc' }, { consumedAt: 'asc' }]
      });

      const records = liquids.map((l) => ({
        Date: l.date,
        DrinkName: l.drinkName,
        Quantity_ml: Number(l.quantityMl),
        ConsumedAt: l.consumedAt.toISOString()
      }));

      const csv = stringify(records, { header: true });
      return {
        filename: `liquid_history_${today}.csv`,
        content: csv
      };
    }

    throw new Error('Invalid export type requested');
  }

  /**
   * Complete personal data backup in JSON
   */
  async exportFullBackup() {
    const [goals, meals, mealItems, liquids, weights, settings] = await Promise.all([
      prisma.dailyGoals.findMany(),
      prisma.meals.findMany(),
      prisma.mealItems.findMany(),
      prisma.liquidEntries.findMany(),
      prisma.weightEntries.findMany(),
      prisma.appSettings.findMany()
    ]);

    return {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0-beta',
      data: {
        goals,
        meals,
        mealItems,
        liquids,
        weights,
        settings
      }
    };
  }

  /**
   * Clears personal data after strict confirmation
   */
  async clearAllData(confirmation: string) {
    if (confirmation !== 'DELETE_ALL_DATA_CONFIRMED') {
      throw new Error('Invalid confirmation phrase. Data was NOT deleted.');
    }

    await prisma.$transaction([
      prisma.mealItems.deleteMany(),
      prisma.meals.deleteMany(),
      prisma.liquidEntries.deleteMany(),
      prisma.weightEntries.deleteMany()
    ]);

    return { success: true, message: 'All personal tracking records have been cleared.' };
  }
}

export const reportService = new ReportService();
