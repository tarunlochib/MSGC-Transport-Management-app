# 🚀 Quick Start: Deploy to Render + Supabase

## ⚡ **5-Minute Setup**

### 1. **Supabase Setup** (2 minutes)
1. Go to [supabase.com](https://supabase.com) → "New Project"
2. Name: `msgc-transport-db`
3. Set password & region
4. Copy connection string from Settings → Database

### 2. **Render Setup** (3 minutes)
1. Go to [render.com](https://render.com) → "New Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: `msgc-transport-app`
   - **Environment**: `Docker`
   - **Build Command**: `docker build -t msgc-transport-app .`
   - **Start Command**: `docker run -p $PORT:10000 msgc-transport-app`

### 3. **Environment Variables** (Copy these to Render)
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=10000
CORS_ORIGIN=*
```

### 4. **Deploy & Test**
1. Click "Create Web Service"
2. Wait for build (5-10 minutes)
3. Test: `https://your-app.onrender.com/api/health`

## 🔧 **Local Testing First**

```bash
# Copy environment template
cp env.example .env

# Edit .env with your Supabase credentials
# Then test locally:
docker-compose -f docker-compose.prod.yml up --build
```

## 📱 **Your App Will Be Available At**
- **Local**: http://localhost:10000
- **Production**: https://your-app.onrender.com

## 🆘 **Need Help?**
- Check `DEPLOYMENT.md` for detailed instructions
- Run `scripts/deploy-test.ps1` (Windows) or `scripts/deploy-test.sh` (Mac/Linux)
- Monitor build logs in Render dashboard

## ✅ **Success Indicators**
- ✅ Docker build completes
- ✅ Health check returns 200
- ✅ Database connection established
- ✅ React frontend loads
- ✅ API endpoints respond

**Ready to deploy? Let's go! 🚀**
