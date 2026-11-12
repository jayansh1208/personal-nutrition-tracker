# Start PostgreSQL Cluster for NutriTrack
$pgData = "C:\Users\HP\AppData\Local\nutrition_tracker_pg"
$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "Checking PostgreSQL on port 5433..." -ForegroundColor Cyan

$testConn = & $psql -U postgres -h 127.0.0.1 -p 5433 -d nutrition_tracker -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL is already active and accepting connections on port 5433." -ForegroundColor Green
} else {
    Write-Host "Starting PostgreSQL cluster at $pgData on port 5433..." -ForegroundColor Yellow
    & $pgCtl -D $pgData -o "-p 5433" -l "$pgData\server.log" start
    Start-Sleep -Seconds 2
    Write-Host "PostgreSQL started successfully!" -ForegroundColor Green
}
