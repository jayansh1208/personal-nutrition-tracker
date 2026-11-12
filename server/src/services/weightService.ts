import prisma from '../prisma';
import { getTodayDateString } from '../utils/dateUtils';

export interface CreateWeightDto {
  weightKg: number;
  date?: string;
  recordedAt?: string;
  notes?: string | null;
}

export interface UpdateWeightDto {
  weightKg?: number;
  date?: string;
  recordedAt?: string;
  notes?: string | null;
}

export class WeightService {
  /**
   * Retrieves weight history and overview metrics
   */
  async getWeightHistory(startDate?: string, endDate?: string, limit?: number) {
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const entries = await prisma.weightEntries.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      take: limit ? Number(limit) : undefined
    });

    const formatted = entries.map((e) => ({
      id: e.id,
      weightKg: Number(e.weightKg),
      date: e.date,
      recordedAt: e.recordedAt,
      notes: e.notes,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));

    // Find starting weight (earliest ever)
    const earliest = await prisma.weightEntries.findFirst({
      orderBy: { date: 'asc' }
    });

    // Find current weight (latest ever)
    const latest = await prisma.weightEntries.findFirst({
      orderBy: { date: 'desc' }
    });

    const startingWeight = earliest ? Number(earliest.weightKg) : null;
    const currentWeight = latest ? Number(latest.weightKg) : null;
    const totalChange = (startingWeight !== null && currentWeight !== null)
      ? Math.round((currentWeight - startingWeight) * 100) / 100
      : 0;

    return {
      startingWeight,
      currentWeight,
      totalChange,
      startingDate: earliest?.date || null,
      latestDate: latest?.date || null,
      totalEntries: formatted.length,
      history: formatted
    };
  }

  /**
   * Gets weight for a specific date
   */
  async getWeightByDate(dateStr?: string) {
    const targetDate = dateStr || getTodayDateString();

    const entry = await prisma.weightEntries.findFirst({
      where: { date: targetDate },
      orderBy: { recordedAt: 'desc' }
    });

    if (!entry) return null;

    return {
      id: entry.id,
      weightKg: Number(entry.weightKg),
      date: entry.date,
      recordedAt: entry.recordedAt,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    };
  }

  /**
   * Adds or updates weight entry for a date
   */
  async addOrUpdateWeight(dto: CreateWeightDto) {
    const targetDate = dto.date || getTodayDateString();
    const recordedAt = dto.recordedAt ? new Date(dto.recordedAt) : new Date();

    // Check if entry already exists for this date
    const existing = await prisma.weightEntries.findFirst({
      where: { date: targetDate }
    });

    if (existing) {
      const updated = await prisma.weightEntries.update({
        where: { id: existing.id },
        data: {
          weightKg: dto.weightKg,
          recordedAt,
          notes: dto.notes !== undefined ? dto.notes : existing.notes
        }
      });
      return {
        id: updated.id,
        weightKg: Number(updated.weightKg),
        date: updated.date,
        recordedAt: updated.recordedAt,
        notes: updated.notes,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      };
    }

    const created = await prisma.weightEntries.create({
      data: {
        weightKg: dto.weightKg,
        date: targetDate,
        recordedAt,
        notes: dto.notes || null
      }
    });

    return {
      id: created.id,
      weightKg: Number(created.weightKg),
      date: created.date,
      recordedAt: created.recordedAt,
      notes: created.notes,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    };
  }

  /**
   * Updates an existing weight entry by ID
   */
  async updateWeight(id: string, dto: UpdateWeightDto) {
    const data: any = {};
    if (dto.weightKg !== undefined) data.weightKg = dto.weightKg;
    if (dto.date !== undefined) data.date = dto.date;
    if (dto.recordedAt !== undefined) data.recordedAt = new Date(dto.recordedAt);
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await prisma.weightEntries.update({
      where: { id },
      data
    });

    return {
      id: updated.id,
      weightKg: Number(updated.weightKg),
      date: updated.date,
      recordedAt: updated.recordedAt,
      notes: updated.notes,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  /**
   * Deletes a weight entry
   */
  async deleteWeight(id: string) {
    await prisma.weightEntries.delete({
      where: { id }
    });

    return { success: true, id };
  }
}

export const weightService = new WeightService();
