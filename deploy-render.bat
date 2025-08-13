@echo off
echo 🚀 MSGC Transport Management App - Render Deployment
echo ===================================================
echo.

echo 📋 Checking prerequisites...
echo.

echo 1. Ensure you have committed all changes to GitHub
echo 2. Create a Render account at https://render.com
echo 3. Have your Supabase database URL ready
echo 4. Generate a JWT secret (32+ characters)
echo.

echo 🔧 Building project locally to test...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Local build successful!
echo.

echo 🌐 Next steps:
echo 1. Go to https://render.com
echo 2. Sign up/Login with GitHub
echo 3. Click "New +" → "Web Service"
echo 4. Connect your GitHub repository
echo 5. Use these settings:
echo    - Name: msgc-transport-management
echo    - Branch: production
echo    - Build Command: npm install && npm run build
echo    - Start Command: npm start
echo    - Plan: Free
echo.

echo 🔐 Environment Variables to set:
echo NODE_ENV=production
echo PORT=10000
echo DATABASE_URL=your_supabase_database_url
echo JWT_SECRET=your_jwt_secret
echo.

echo 📖 See RENDER_DEPLOYMENT.md for detailed instructions
echo.

pause
