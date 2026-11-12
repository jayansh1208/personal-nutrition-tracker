# NutriTrack - Personal Nutrition & Fitness Tracker (Private Beta)

NutriTrack is a production-quality, responsive personal nutrition and fitness tracking web application built specifically for single-user precision tracking. It prioritizes speed, accuracy, maintainability, and a premium SaaS user experience (inspired by Linear, Apple Health, and Notion).

---

## 🚀 Key Highlights & Philosophy

- **10–15 Second Food Logging**: Zero clutter, no overwhelming automatic database lookups or AI guesses—fast, precise manual calorie and protein logging.
- **Pure PostgreSQL Source of Truth**: All calculations (daily totals, remaining targets, weekly/monthly averages, consistency metrics) are computed from real PostgreSQL database records. No dummy data or localStorage databases.
- **Timezone-Safe Architecture**: Configured with local timezone management (`Asia/Kolkata` default) to prevent date-shifting UTC conversion bugs.
- **Dedicated Liquid & Hydration System**: Track pure water vs other fluids (milk, tea, buttermilk, protein shakes) with 1-click quick-add buttons.
- **Body Weight Analytics**: Historical weigh-ins, starting weight, current weight, total change, and interactive Recharts trend curves.
- **Historical Goals Preservation**: Goal updates store effective dates, preserving the integrity of historical nutrition records.
- **Exports & Backup**: Instant CSV export for meals, weight, liquids, and full JSON snapshot backup with strict confirmation protection.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom Emerald & Dark charcoal themes
- **Animations**: Framer Motion (page transitions, progress animations, modals)
- **Charts**: Recharts (interactive line and bar charts with reference lines)
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized error interceptors
- **Date Utilities**: `date-fns` & `date-fns-tz`

### Backend
- **Runtime**: Node.js (v20+) with TypeScript
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Validation**: Zod schema validation middleware
- **CSV Engine**: `csv-stringify`
- **Testing**: Vitest & Supertest

---

## 📁 Monorepo Folder Structure

```
nutrition-tracker/
│
├── client/                      # Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # CircularProgress, ProgressBar, Modal, Navbar, Sidebar, BottomNav
│   │   │   ├── dashboard/       # SummaryCards, MacroOverview, MealCategoryCard, MealItemRow
│   │   │   └── modals/          # AddMealModal, AddLiquidModal, AddWeightModal
│   │   ├── context/             # ThemeContext (Light/Dark), DateContext (Local Timezone)
│   │   ├── layouts/             # MainLayout (Responsive shell + global modal manager)
│   │   ├── pages/               # Dashboard, FoodDiary, Liquid, Weight, Analytics, Reports, Settings
│   │   ├── services/            # Axios API client with typed endpoints
│   │   ├── types/               # Full TypeScript type definitions
│   │   ├── App.tsx              # Router setup
│   │   ├── main.tsx             # DOM root
│   │   └── index.css            # Tailwind layers & styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                      # Backend Application
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Initial seed for settings and default goals
│   ├── src/
│   │   ├── controllers/         # Meal, Liquid, Weight, Goals, Nutrition, Analytics, Reports, Settings
│   │   ├── middleware/          # ErrorHandler, Zod Validator
│   │   ├── routes/              # Modular Express REST routers
│   │   ├── services/            # Business logic and database aggregation
│   │   ├── utils/               # Timezone-safe dateUtils, response formatters
│   │   ├── validators/          # Zod schemas for all models
│   │   ├── index.ts             # Server entry point
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── __tests__/           # Integration tests (Vitest + Supertest)
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/
│   ├── start-db.ps1             # Start native PostgreSQL cluster on port 5433
│   └── setup.ps1                # 1-click database init & verification
├── start.bat                    # Double-click Windows startup batch script
├── docker-compose.yml           # Optional Docker Compose for PostgreSQL
├── .env.example                 # Environment variables template
├── package.json                 # Monorepo root scripts
└── README.md
```

---

## 🗄️ Database Design (PostgreSQL + Prisma)

### Tables

1. **`daily_goals`**: Stores calorie, protein, and liquid targets with `effectiveFrom` date partitioning.
2. **`meals`**: Groups food items by date and category (`BREAKFAST`, `LUNCH`, `EVENING_SNACK`, `DINNER`, `OTHER`).
3. **`meal_items`**: Individual food logs (name, quantity, quantityUnit, calories, protein, notes) with Decimal precision.
4. **`liquid_entries`**: Fluid intake (drinkName, quantityMl, date, consumedAt).
5. **`weight_entries`**: Daily weigh-ins (weightKg, date, recordedAt, notes).
6. **`app_settings`**: User preferences (timezone, default units).

---

## 🚦 Quick Start & Installation

### Option A: Running with Native Local PostgreSQL (Recommended)

PostgreSQL is configured on port `5433` with database `nutrition_tracker`:

1. **Start Database**:
   ```powershell
   powershell -File ./scripts/start-db.ps1
   ```

2. **Run Migrations & Seed**:
   ```bash
   cd server
   npx prisma db push
   npm run prisma:seed
   cd ..
   ```

3. **Start Full Application (Frontend + Backend concurrently)**:
   ```bash
   npm run dev
   ```
   Or double-click `start.bat` on Windows.

   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000/api`

---

### Option B: Running with Docker Compose

If you prefer using Docker:

1. **Start PostgreSQL Container**:
   ```bash
   docker-compose up -d
   ```

2. **Sync Schema & Start**:
   ```bash
   cd server
   npx prisma db push
   npm run prisma:seed
   cd ..
   npm run dev
   ```

---

## ☁️ Cloud Deployment (1-Click & Automated)

### Option 1: 1-Click Deployment on Render.com (PostgreSQL + Backend + Frontend)
This repository includes a [`render.yaml`](./render.yaml) blueprint that automatically provisions:
- Free managed PostgreSQL database (`nutrition_tracker_db`)
- Express backend Node.js Web Service (running migrations and seed automatically)
- React Vite Static Site with SPA rewrites

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jayansh1208/personal-nutrition-tracker)

1. Click the **Deploy to Render** button above or connect your GitHub repository `jayansh1208/personal-nutrition-tracker` on [dashboard.render.com](https://dashboard.render.com).
2. Render will automatically read `render.yaml` and deploy all three components with zero manual configuration required.

---

### Option 2: Frontend on Vercel + Backend on Render / Railway
1. **Backend**: Deploy the `server/` directory on [Render](https://render.com) or [Railway](https://railway.app) with your PostgreSQL connection string.
2. **Frontend**: Import the `client/` directory into [Vercel](https://vercel.com).
   - Set Environment Variable: `VITE_API_URL=https://your-backend-service.onrender.com/api`
   - Build Command: `npm run build`
   - Output Directory: `dist`

---

## 🧪 Testing

Integration tests verify CRUD operations, calorie and protein calculation, liquid separation, weight entries, and goals:

```bash
cd server
npm test
```

Test Results:
```
✓ NutriTrack Backend Integration Tests (8 tests)
  ✓ Health Check returns ok
  ✓ Creates a meal item and computes daily calories and protein correctly
  ✓ Adds a second meal item and verifies running total
  ✓ Updates a meal item and reflects updated totals
  ✓ Creates liquid entries and calculates water and total liquid correctly
  ✓ Creates and retrieves weight entry
  ✓ Deletes a meal item and recalculates totals
  ✓ Creates and retrieves daily goals

Test Files  1 passed (1)
     Tests  8 passed (8)
```

---

## 📡 REST API Documentation

### Nutrition & Dashboard
- `GET /api/nutrition/daily?date=YYYY-MM-DD` - Daily summary (consumed, targets, remaining, progress, meals, liquids, weight).
- `GET /api/nutrition/weekly?startDate=YYYY-MM-DD` - 7-day weekly breakdown and averages.
- `GET /api/nutrition/monthly?month=YYYY-MM` - Monthly totals and consistency metrics.

### Meals & Food Items
- `GET /api/meals?date=YYYY-MM-DD` - Get meals for date.
- `POST /api/meal-items` - Add food item (auto-attaches to category).
- `PUT /api/meal-items/:id` - Update food item.
- `DELETE /api/meal-items/:id` - Delete food item and update totals immediately.
- `DELETE /api/meals/:id` - Delete entire meal category.

### Liquid Tracking
- `GET /api/liquid?date=YYYY-MM-DD` - Daily liquids with water vs other separation.
- `POST /api/liquid` - Add beverage (`{ drinkName, quantityMl, date }`).
- `PUT /api/liquid/:id` - Update beverage entry.
- `DELETE /api/liquid/:id` - Delete beverage entry.

### Weight Tracking
- `GET /api/weight` - Weight history with starting weight, current weight, and total delta.
- `GET /api/weight/date?date=YYYY-MM-DD` - Weigh-in for specific date.
- `POST /api/weight` - Record or update daily weight (`{ weightKg, date, notes }`).
- `PUT /api/weight/:id` - Update weigh-in.
- `DELETE /api/weight/:id` - Delete weigh-in.

### Goals & Settings
- `GET /api/goals` - Active goal + historical revisions.
- `POST /api/goals` - Create new goal with effective date.
- `GET /api/settings` - Retrieve app settings.
- `PUT /api/settings` - Update timezone or unit preferences.

### Reports & Backup
- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily summary report.
- `GET /api/reports/weekly?startDate=YYYY-MM-DD` - Weekly report.
- `GET /api/reports/monthly?month=YYYY-MM` - Monthly report.
- `GET /api/reports/export?type=nutrition|weight|liquid` - Export CSV.
- `GET /api/reports/export?type=backup` - Full JSON database snapshot.
- `POST /api/reports/clear` - Safe purge with phrase `DELETE_ALL_DATA_CONFIRMED`.

---

## 🔒 Private Beta & Future Authentication

This private beta runs directly without login screens for an instant single-user experience. All database schemas and controllers are designed with user-isolation in mind so a `userId` column and session/JWT authentication can be integrated seamlessly in the future without schema restructuring.
