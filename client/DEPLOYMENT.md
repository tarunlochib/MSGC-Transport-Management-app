# 🚀 MSGC Transport Management App - Deployment Guide

## 📋 **Prerequisites**
- [Vercel Account](https://vercel.com) (Free)
- [Supabase Account](https://supabase.com) (Free)
- [GitHub Account](https://github.com) (Free)

## 🗄️ **Step 1: Set Up Supabase Database**

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `msgc-transport-app`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"

### 1.2 Get Database Connection String
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password

### 1.3 Set Up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Run the following SQL to create tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (Prisma will handle this automatically)
-- Just ensure the database is ready
```

## 🔧 **Step 2: Configure Environment Variables**

### 2.1 Create .env file
Create a `.env` file in your client directory:

```env
# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT Secret for Authentication
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 2.2 Get Supabase Keys
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🚀 **Step 3: Deploy to Vercel**

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Login to Vercel
```bash
vercel login
```

### 3.3 Deploy Your App
```bash
vercel --prod
```

### 3.4 Configure Environment Variables in Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the same variables from your `.env` file

## 📊 **Step 4: Initialize Database**

### 4.1 Generate Prisma Client
```bash
npx prisma generate
```

### 4.2 Push Schema to Database
```bash
npx prisma db push
```

### 4.3 (Optional) Seed Database
```bash
npx prisma db seed
```

## 🔍 **Step 5: Verify Deployment**

### 5.1 Check Frontend
- Visit your Vercel URL
- Ensure the app loads without errors

### 5.2 Check API Endpoints
- Test `/api/bookings`
- Test `/api/expenses`
- Test `/api/auth`

### 5.3 Check Database Connection
- Verify data is being saved/retrieved
- Check Supabase dashboard for data

## 🛠️ **Troubleshooting**

### Common Issues:

#### 1. **Database Connection Error**
- Verify `DATABASE_URL` is correct
- Check if Supabase is accessible
- Ensure database password is correct

#### 2. **API Functions Not Working**
- Check Vercel function logs
- Verify environment variables are set
- Check function timeout (10 seconds max)

#### 3. **Build Errors**
- Ensure all dependencies are installed
- Check for TypeScript errors
- Verify Prisma schema is correct

#### 4. **Authentication Issues**
- Verify `JWT_SECRET` is set
- Check token expiration
- Ensure bcrypt is working

## 📱 **Post-Deployment**

### 1. **Custom Domain** (Optional)
- In Vercel dashboard, go to **Settings** → **Domains**
- Add your custom domain

### 2. **Monitoring**
- Set up Vercel Analytics (free)
- Monitor function execution times
- Check database usage in Supabase

### 3. **Backup**
- Set up automated database backups in Supabase
- Export data regularly

## 💰 **Cost Breakdown**

### **Vercel (Free Tier)**
- ✅ Frontend hosting: **$0/month**
- ✅ API functions: **$0/month** (100GB-hours)
- ✅ Custom domains: **$0/month**
- ✅ SSL certificates: **$0/month**

### **Supabase (Free Tier)**
- ✅ Database: **$0/month** (500MB)
- ✅ Authentication: **$0/month**
- ✅ Real-time subscriptions: **$0/month**
- ✅ File storage: **$0/month** (1GB)

### **Total Monthly Cost: $0**

## 🎯 **Next Steps**

1. **Test all functionality** after deployment
2. **Set up monitoring** and alerts
3. **Configure backups** for your data
4. **Set up CI/CD** for automatic deployments
5. **Add analytics** to track usage

## 📞 **Support**

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

---

**🎉 Congratulations! Your transport management app is now live for free!**
