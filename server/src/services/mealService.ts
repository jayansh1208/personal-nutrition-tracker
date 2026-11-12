import { MealCategory } from '@prisma/client';
import prisma from '../prisma';
import { getTodayDateString } from '../utils/dateUtils';

export interface CreateMealItemDto {
  date?: string;
  category: MealCategory;
  foodName: string;
  calories: number;
  protein: number;
  quantity?: number | null;
  quantityUnit?: string;
  notes?: string | null;
}

export interface UpdateMealItemDto {
  category?: MealCategory;
  foodName?: string;
  calories?: number;
  protein?: number;
  quantity?: number | null;
  quantityUnit?: string;
  notes?: string | null;
}

export class MealService {
  /**
   * Retrieves all meals and items for a specific date
   */
  async getMealsByDate(dateStr?: string) {
    const targetDate = dateStr || getTodayDateString();

    const meals = await prisma.meals.findMany({
      where: { date: targetDate },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Compute totals and format
    let totalCalories = 0;
    let totalProtein = 0;

    const formattedMeals = meals.map((meal) => {
      let mealCalories = 0;
      let mealProtein = 0;

      const items = meal.items.map((item) => {
        const cal = Number(item.calories);
        const pro = Number(item.protein);
        mealCalories += cal;
        mealProtein += pro;

        return {
          id: item.id,
          mealId: item.mealId,
          foodName: item.foodName,
          quantity: item.quantity !== null ? Number(item.quantity) : null,
          quantityUnit: item.quantityUnit,
          calories: cal,
          protein: pro,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        };
      });

      totalCalories += mealCalories;
      totalProtein += mealProtein;

      return {
        id: meal.id,
        date: meal.date,
        category: meal.category,
        totalCalories: Math.round(mealCalories * 10) / 10,
        totalProtein: Math.round(mealProtein * 10) / 10,
        itemCount: items.length,
        items,
        createdAt: meal.createdAt,
        updatedAt: meal.updatedAt
      };
    });

    return {
      date: targetDate,
      totalCalories: Math.round(totalCalories * 10) / 10,
      totalProtein: Math.round(totalProtein * 10) / 10,
      meals: formattedMeals
    };
  }

  /**
   * Retrieves a single meal by ID
   */
  async getMealById(id: string) {
    const meal = await prisma.meals.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!meal) return null;

    let totalCalories = 0;
    let totalProtein = 0;

    const items = meal.items.map((item) => {
      const cal = Number(item.calories);
      const pro = Number(item.protein);
      totalCalories += cal;
      totalProtein += pro;

      return {
        id: item.id,
        mealId: item.mealId,
        foodName: item.foodName,
        quantity: item.quantity !== null ? Number(item.quantity) : null,
        quantityUnit: item.quantityUnit,
        calories: cal,
        protein: pro,
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    return {
      id: meal.id,
      date: meal.date,
      category: meal.category,
      totalCalories: Math.round(totalCalories * 10) / 10,
      totalProtein: Math.round(totalProtein * 10) / 10,
      items,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt
    };
  }

  /**
   * Adds a meal item, creating or finding parent Meal category automatically
   */
  async addMealItem(dto: CreateMealItemDto) {
    const targetDate = dto.date || getTodayDateString();

    // Find or create the meal container for date + category
    let meal = await prisma.meals.findUnique({
      where: {
        date_category: {
          date: targetDate,
          category: dto.category
        }
      }
    });

    if (!meal) {
      meal = await prisma.meals.create({
        data: {
          date: targetDate,
          category: dto.category
        }
      });
    }

    const item = await prisma.mealItems.create({
      data: {
        mealId: meal.id,
        foodName: dto.foodName,
        calories: dto.calories,
        protein: dto.protein,
        quantity: dto.quantity !== undefined ? dto.quantity : null,
        quantityUnit: dto.quantityUnit || 'g',
        notes: dto.notes || null
      }
    });

    return {
      id: item.id,
      mealId: item.mealId,
      category: dto.category,
      date: targetDate,
      foodName: item.foodName,
      quantity: item.quantity !== null ? Number(item.quantity) : null,
      quantityUnit: item.quantityUnit,
      calories: Number(item.calories),
      protein: Number(item.protein),
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }

  /**
   * Updates an existing meal item
   */
  async updateMealItem(id: string, dto: UpdateMealItemDto) {
    const existing = await prisma.mealItems.findUnique({
      where: { id },
      include: { meal: true }
    });

    if (!existing) {
      throw new Error('Meal item not found');
    }

    let targetMealId = existing.mealId;

    // If category changed, move item to the meal container with the new category
    if (dto.category && dto.category !== existing.meal.category) {
      let targetMeal = await prisma.meals.findUnique({
        where: {
          date_category: {
            date: existing.meal.date,
            category: dto.category
          }
        }
      });

      if (!targetMeal) {
        targetMeal = await prisma.meals.create({
          data: {
            date: existing.meal.date,
            category: dto.category
          }
        });
      }

      targetMealId = targetMeal.id;
    }

    const updated = await prisma.mealItems.update({
      where: { id },
      data: {
        mealId: targetMealId,
        ...(dto.foodName !== undefined && { foodName: dto.foodName }),
        ...(dto.calories !== undefined && { calories: dto.calories }),
        ...(dto.protein !== undefined && { protein: dto.protein }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.quantityUnit !== undefined && { quantityUnit: dto.quantityUnit }),
        ...(dto.notes !== undefined && { notes: dto.notes })
      },
      include: { meal: true }
    });

    // Cleanup old meal if it has no items left
    if (targetMealId !== existing.mealId) {
      const remainingItems = await prisma.mealItems.count({
        where: { mealId: existing.mealId }
      });
      if (remainingItems === 0) {
        await prisma.meals.delete({
          where: { id: existing.mealId }
        }).catch(() => {});
      }
    }

    return {
      id: updated.id,
      mealId: updated.mealId,
      category: updated.meal.category,
      date: updated.meal.date,
      foodName: updated.foodName,
      quantity: updated.quantity !== null ? Number(updated.quantity) : null,
      quantityUnit: updated.quantityUnit,
      calories: Number(updated.calories),
      protein: Number(updated.protein),
      notes: updated.notes,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  /**
   * Deletes a meal item
   */
  async deleteMealItem(id: string) {
    const item = await prisma.mealItems.findUnique({
      where: { id }
    });

    if (!item) {
      throw new Error('Meal item not found');
    }

    await prisma.mealItems.delete({
      where: { id }
    });

    // Clean up empty meal container
    const remaining = await prisma.mealItems.count({
      where: { mealId: item.mealId }
    });

    if (remaining === 0) {
      await prisma.meals.delete({
        where: { id: item.mealId }
      }).catch(() => {});
    }

    return { success: true, id };
  }

  /**
   * Deletes an entire meal container and its items
   */
  async deleteMeal(mealId: string) {
    await prisma.meals.delete({
      where: { id: mealId }
    });

    return { success: true, id: mealId };
  }
}

export const mealService = new MealService();
