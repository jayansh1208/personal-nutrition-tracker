# Setup NutriTrack Full-Stack Application
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  NutriTrack - Setup & Database Initialization   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start DB if needed
& "$PSScriptRoot\start-db.ps1"

# 2. Sync Prisma Schema & Generate Client
Write-Host "`nSyncing database schema with Prisma..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\server"
npx prisma db push
npm run prisma:seed

# 3. Build Client & Server
Write-Host "`nVerifying client and server builds..." -ForegroundColor Yellow
npm run build
Set-Location -Path "$PSScriptRoot\..\client"
npm run build

Set-Location -Path "$PSScriptRoot\.."
Write-Host "`nSetup complete! You can now start the application with:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor White
