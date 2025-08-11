@echo off
echo 🚀 MSGC Transport App - Quick Deploy
echo ======================================

echo.
echo 📦 Installing dependencies...
npm install

echo.
echo 🔧 Setting up Prisma...
npx prisma generate

echo.
echo 🌐 Installing Vercel CLI...
npm install -g vercel

echo.
echo 🔑 Login to Vercel (will open browser)...
vercel login

echo.
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment complete!
echo 📍 Check your Vercel dashboard for the live URL
echo.
pause
