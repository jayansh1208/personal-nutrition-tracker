import prisma from '../prisma';
import { getTodayDateString } from '../utils/dateUtils';

export interface GoalData {
  calorieTarget: number;
  proteinTarget: number;
  liquidTarget: number;
  effectiveFrom?: string;
}

export class GoalService {
  /**
   * Retrieves the effective daily goal for a given date
   */
  async getEffectiveGoal(dateStr?: string) {
    const targetDate = dateStr || getTodayDateString();

    // Find the latest goal that became effective on or before the target date
    const goal = await prisma.dailyGoals.findFirst({
      where: {
        effectiveFrom: {
          lte: targetDate
        }
      },
      orderBy: {
        effectiveFrom: 'desc'
      }
    });

    if (goal) {
      return {
        id: goal.id,
        calorieTarget: Number(goal.calorieTarget),
        proteinTarget: Number(goal.proteinTarget),
        liquidTarget: Number(goal.liquidTarget),
        effectiveFrom: goal.effectiveFrom,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt
      };
    }

    // If no prior goal, find the earliest goal
    const earliestGoal = await prisma.dailyGoals.findFirst({
      orderBy: {
        effectiveFrom: 'asc'
      }
    });

    if (earliestGoal) {
      return {
        id: earliestGoal.id,
        calorieTarget: Number(earliestGoal.calorieTarget),
        proteinTarget: Number(earliestGoal.proteinTarget),
        liquidTarget: Number(earliestGoal.liquidTarget),
        effectiveFrom: earliestGoal.effectiveFrom,
        createdAt: earliestGoal.createdAt,
        updatedAt: earliestGoal.updatedAt
      };
    }

    // Default sensible fallback
    return {
      id: 'default',
      calorieTarget: 2000,
      proteinTarget: 125,
      liquidTarget: 3000,
      effectiveFrom: targetDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Returns all goals in chronological order (descending)
   */
  async getAllGoals() {
    const goals = await prisma.dailyGoals.findMany({
      orderBy: {
        effectiveFrom: 'desc'
      }
    });

    return goals.map((g) => ({
      id: g.id,
      calorieTarget: Number(g.calorieTarget),
      proteinTarget: Number(g.proteinTarget),
      liquidTarget: Number(g.liquidTarget),
      effectiveFrom: g.effectiveFrom,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt
    }));
  }

  /**
   * Creates a new goal effective from a given date
   */
  async createGoal(data: GoalData) {
    const effectiveFrom = data.effectiveFrom || getTodayDateString();

    // Check if a goal already exists for this exact effectiveFrom date
    const existing = await prisma.dailyGoals.findFirst({
      where: { effectiveFrom }
    });

    if (existing) {
      const updated = await prisma.dailyGoals.update({
        where: { id: existing.id },
        data: {
          calorieTarget: data.calorieTarget,
          proteinTarget: data.proteinTarget,
          liquidTarget: data.liquidTarget
        }
      });
      return {
        id: updated.id,
        calorieTarget: Number(updated.calorieTarget),
        proteinTarget: Number(updated.proteinTarget),
        liquidTarget: Number(updated.liquidTarget),
        effectiveFrom: updated.effectiveFrom,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      };
    }

    const created = await prisma.dailyGoals.create({
      data: {
        calorieTarget: data.calorieTarget,
        proteinTarget: data.proteinTarget,
        liquidTarget: data.liquidTarget,
        effectiveFrom
      }
    });

    return {
      id: created.id,
      calorieTarget: Number(created.calorieTarget),
      proteinTarget: Number(created.proteinTarget),
      liquidTarget: Number(created.liquidTarget),
      effectiveFrom: created.effectiveFrom,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    };
  }

  /**
   * Updates an existing goal by ID
   */
  async updateGoal(id: string, data: Partial<GoalData>) {
    const updated = await prisma.dailyGoals.update({
      where: { id },
      data: {
        ...(data.calorieTarget !== undefined && { calorieTarget: data.calorieTarget }),
        ...(data.proteinTarget !== undefined && { proteinTarget: data.proteinTarget }),
        ...(data.liquidTarget !== undefined && { liquidTarget: data.liquidTarget }),
        ...(data.effectiveFrom !== undefined && { effectiveFrom: data.effectiveFrom })
      }
    });

    return {
      id: updated.id,
      calorieTarget: Number(updated.calorieTarget),
      proteinTarget: Number(updated.proteinTarget),
      liquidTarget: Number(updated.liquidTarget),
      effectiveFrom: updated.effectiveFrom,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }
}

export const goalService = new GoalService();
