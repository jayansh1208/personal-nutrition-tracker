import prisma from '../prisma';

export interface UpdateSettingsDto {
  timezone?: string;
  defaultWeightUnit?: string;
  defaultCalorieUnit?: string;
}

export class SettingsService {
  /**
   * Retrieves the current app settings
   */
  async getSettings() {
    let settings = await prisma.appSettings.findFirst();

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          timezone: 'Asia/Kolkata',
          defaultWeightUnit: 'kg',
          defaultCalorieUnit: 'kcal'
        }
      });
    }

    return {
      id: settings.id,
      timezone: settings.timezone,
      defaultWeightUnit: settings.defaultWeightUnit,
      defaultCalorieUnit: settings.defaultCalorieUnit,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };
  }

  /**
   * Updates application settings
   */
  async updateSettings(dto: UpdateSettingsDto) {
    let settings = await prisma.appSettings.findFirst();

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          timezone: dto.timezone || 'Asia/Kolkata',
          defaultWeightUnit: dto.defaultWeightUnit || 'kg',
          defaultCalorieUnit: dto.defaultCalorieUnit || 'kcal'
        }
      });
    } else {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: {
          ...(dto.timezone !== undefined && { timezone: dto.timezone }),
          ...(dto.defaultWeightUnit !== undefined && { defaultWeightUnit: dto.defaultWeightUnit }),
          ...(dto.defaultCalorieUnit !== undefined && { defaultCalorieUnit: dto.defaultCalorieUnit })
        }
      });
    }

    return {
      id: settings.id,
      timezone: settings.timezone,
      defaultWeightUnit: settings.defaultWeightUnit,
      defaultCalorieUnit: settings.defaultCalorieUnit,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };
  }
}

export const settingsService = new SettingsService();
