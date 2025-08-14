# MSGC Transport App Deployment Test Script (PowerShell)

Write-Host "🚀 Testing MSGC Transport App Deployment Configuration" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please copy env.example to .env and configure your variables." -ForegroundColor Red
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        $name = $matches[1]
        $value = $matches[2].Trim('"')
        Set-Variable -Name $name -Value $value -Scope Global
    }
}

# Check required variables
if (-not $DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not set in .env" -ForegroundColor Red
    exit 1
}

if (-not $JWT_SECRET) {
    Write-Host "❌ JWT_SECRET not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables configured" -ForegroundColor Green

# Build and test Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
docker build -t msgc-transport-app-test .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

# Test with Docker Compose
Write-Host "🧪 Testing with Docker Compose..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Wait for service to start
Write-Host "⏳ Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test health endpoint
Write-Host "🏥 Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:10000/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Health check failed (HTTP $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test test endpoint
Write-Host "🧪 Testing test endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:10000/api/test" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Test endpoint passed (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Test endpoint failed (HTTP $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Deployment test completed!" -ForegroundColor Green
Write-Host "🌐 Your app is running at: http://localhost:10000" -ForegroundColor Cyan
Write-Host "📊 Health check: http://localhost:10000/api/health" -ForegroundColor Cyan

# Stop the service
Write-Host "🛑 Stopping test service..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

Write-Host "✨ Test completed successfully!" -ForegroundColor Green
