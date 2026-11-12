import prisma from '../prisma';
import { getTodayDateString } from '../utils/dateUtils';
import { goalService } from './goalService';

export interface CreateLiquidDto {
  drinkName?: string;
  quantityMl: number;
  date?: string;
  consumedAt?: string;
}

export interface UpdateLiquidDto {
  drinkName?: string;
  quantityMl?: number;
  date?: string;
  consumedAt?: string;
}

export class LiquidService {
  /**
   * Retrieves liquid entries for a specific date with water vs other liquid separation
   */
  async getLiquidByDate(dateStr?: string) {
    const targetDate = dateStr || getTodayDateString();

    const entries = await prisma.liquidEntries.findMany({
      where: { date: targetDate },
      orderBy: { consumedAt: 'asc' }
    });

    let totalMl = 0;
    let waterMl = 0;
    let otherMl = 0;

    const formattedEntries = entries.map((e) => {
      const ml = Number(e.quantityMl);
      totalMl += ml;

      const isWater = e.drinkName.trim().toLowerCase() === 'water';
      if (isWater) {
        waterMl += ml;
      } else {
        otherMl += ml;
      }

      return {
        id: e.id,
        drinkName: e.drinkName,
        quantityMl: ml,
        date: e.date,
        consumedAt: e.consumedAt,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        isWater
      };
    });

    const goal = await goalService.getEffectiveGoal(targetDate);
    const target = goal.liquidTarget;
    const remainingMl = Math.max(0, target - totalMl);
    const progressPercentage = target > 0 ? Math.min(100, Math.round((totalMl / target) * 100)) : 0;

    return {
      date: targetDate,
      totalMl: Math.round(totalMl),
      waterMl: Math.round(waterMl),
      otherMl: Math.round(otherMl),
      targetMl: target,
      remainingMl: Math.round(remainingMl),
      progressPercentage,
      entriesCount: formattedEntries.length,
      entries: formattedEntries
    };
  }

  /**
   * Adds a new liquid entry
   */
  async addLiquid(dto: CreateLiquidDto) {
    const targetDate = dto.date || getTodayDateString();
    const consumedAt = dto.consumedAt ? new Date(dto.consumedAt) : new Date();

    const entry = await prisma.liquidEntries.create({
      data: {
        drinkName: dto.drinkName ? dto.drinkName.trim() : 'Water',
        quantityMl: dto.quantityMl,
        date: targetDate,
        consumedAt
      }
    });

    return {
      id: entry.id,
      drinkName: entry.drinkName,
      quantityMl: Number(entry.quantityMl),
      date: entry.date,
      consumedAt: entry.consumedAt,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    };
  }

  /**
   * Updates an existing liquid entry
   */
  async updateLiquid(id: string, dto: UpdateLiquidDto) {
    const data: any = {};
    if (dto.drinkName !== undefined) data.drinkName = dto.drinkName.trim();
    if (dto.quantityMl !== undefined) data.quantityMl = dto.quantityMl;
    if (dto.date !== undefined) data.date = dto.date;
    if (dto.consumedAt !== undefined) data.consumedAt = new Date(dto.consumedAt);

    const updated = await prisma.liquidEntries.update({
      where: { id },
      data
    });

    return {
      id: updated.id,
      drinkName: updated.drinkName,
      quantityMl: Number(updated.quantityMl),
      date: updated.date,
      consumedAt: updated.consumedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  /**
   * Deletes a liquid entry
   */
  async deleteLiquid(id: string) {
    await prisma.liquidEntries.delete({
      where: { id }
    });

    return { success: true, id };
  }
}

export const liquidService = new LiquidService();
