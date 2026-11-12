import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../prisma';

describe('NutriTrack Backend Integration Tests', () => {
  const testDate = '2026-11-12';
  let createdMealItemId: string;
  let createdLiquidId: string;
  let createdWeightId: string;

  beforeAll(async () => {
    // Clean up test data for testDate if any exists
    await prisma.mealItems.deleteMany({
      where: { meal: { date: testDate } }
    });
    await prisma.meals.deleteMany({
      where: { date: testDate }
    });
    await prisma.liquidEntries.deleteMany({
      where: { date: testDate }
    });
    await prisma.weightEntries.deleteMany({
      where: { date: testDate }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.mealItems.deleteMany({
      where: { meal: { date: testDate } }
    });
    await prisma.meals.deleteMany({
      where: { date: testDate }
    });
    await prisma.liquidEntries.deleteMany({
      where: { date: testDate }
    });
    await prisma.weightEntries.deleteMany({
      where: { date: testDate }
    });
    await prisma.$disconnect();
  });

  it('Health Check returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('Creates a meal item and computes daily calories and protein correctly', async () => {
    const res = await request(app)
      .post('/api/meal-items')
      .send({
        date: testDate,
        category: 'LUNCH',
        foodName: 'Grilled Chicken Breast',
        calories: 330,
        protein: 62,
        quantity: 200,
        quantityUnit: 'g',
        notes: 'High protein lunch'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.foodName).toBe('Grilled Chicken Breast');
    expect(res.body.data.calories).toBe(330);
    expect(res.body.data.protein).toBe(62);
    createdMealItemId = res.body.data.id;

    // Check daily nutrition API
    const dailyRes = await request(app).get(`/api/nutrition/daily?date=${testDate}`);
    expect(dailyRes.status).toBe(200);
    expect(dailyRes.body.data.summary.calories.consumed).toBe(330);
    expect(dailyRes.body.data.summary.protein.consumed).toBe(62);
  });

  it('Adds a second meal item and verifies running total', async () => {
    const res = await request(app)
      .post('/api/meal-items')
      .send({
        date: testDate,
        category: 'DINNER',
        foodName: 'Paneer Salad',
        calories: 250,
        protein: 18,
        quantity: 150
      });

    expect(res.status).toBe(201);
    const dailyRes = await request(app).get(`/api/nutrition/daily?date=${testDate}`);
    expect(dailyRes.body.data.summary.calories.consumed).toBe(580);
    expect(dailyRes.body.data.summary.protein.consumed).toBe(80);
  });

  it('Updates a meal item and reflects updated totals', async () => {
    const res = await request(app)
      .put(`/api/meal-items/${createdMealItemId}`)
      .send({
        foodName: 'Grilled Chicken Breast Large',
        calories: 400,
        protein: 75
      });

    expect(res.status).toBe(200);
    expect(res.body.data.calories).toBe(400);

    const dailyRes = await request(app).get(`/api/nutrition/daily?date=${testDate}`);
    // 400 + 250 = 650 calories, 75 + 18 = 93 protein
    expect(dailyRes.body.data.summary.calories.consumed).toBe(650);
    expect(dailyRes.body.data.summary.protein.consumed).toBe(93);
  });

  it('Creates liquid entries and calculates water and total liquid correctly', async () => {
    // Add Water
    const res1 = await request(app)
      .post('/api/liquid')
      .send({
        date: testDate,
        drinkName: 'Water',
        quantityMl: 500
      });
    expect(res1.status).toBe(201);
    createdLiquidId = res1.body.data.id;

    // Add Green Tea
    const res2 = await request(app)
      .post('/api/liquid')
      .send({
        date: testDate,
        drinkName: 'Green Tea',
        quantityMl: 250
      });
    expect(res2.status).toBe(201);

    const liquidRes = await request(app).get(`/api/liquid?date=${testDate}`);
    expect(liquidRes.status).toBe(200);
    expect(liquidRes.body.data.totalMl).toBe(750);
    expect(liquidRes.body.data.waterMl).toBe(500);
    expect(liquidRes.body.data.otherMl).toBe(250);
  });

  it('Creates and retrieves weight entry', async () => {
    const res = await request(app)
      .post('/api/weight')
      .send({
        date: testDate,
        weightKg: 74.5,
        notes: 'Morning weigh-in'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.weightKg).toBe(74.5);
    createdWeightId = res.body.data.id;

    const weightRes = await request(app).get(`/api/weight/date?date=${testDate}`);
    expect(weightRes.status).toBe(200);
    expect(weightRes.body.data.weightKg).toBe(74.5);
  });

  it('Deletes a meal item and recalculates totals', async () => {
    const res = await request(app).delete(`/api/meal-items/${createdMealItemId}`);
    expect(res.status).toBe(200);

    const dailyRes = await request(app).get(`/api/nutrition/daily?date=${testDate}`);
    // Only Paneer Salad (250 kcal, 18g) remains
    expect(dailyRes.body.data.summary.calories.consumed).toBe(250);
    expect(dailyRes.body.data.summary.protein.consumed).toBe(18);
  });

  it('Creates and retrieves daily goals', async () => {
    const res = await request(app)
      .post('/api/goals')
      .send({
        calorieTarget: 2200,
        proteinTarget: 140,
        liquidTarget: 3200,
        effectiveFrom: testDate
      });

    expect(res.status).toBe(201);
    expect(res.body.data.calorieTarget).toBe(2200);
    expect(res.body.data.proteinTarget).toBe(140);
  });
});
