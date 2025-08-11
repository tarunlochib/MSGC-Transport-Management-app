# 🚀 MSGC Transport Management App - Production Deployment Guide

## 📋 **Overview**
This guide will help you deploy your MSGC Transport Management app to production using Vercel. This is an **internal application** for MSGC staff only - no public signup is available.

## 🏗️ **Architecture**
- **Frontend**: React app deployed as static build
- **Backend**: Serverless API functions on Vercel
- **Database**: Supabase PostgreSQL (production)
- **Development**: Local Express server + SQLite (unchanged)
- **Authentication**: Internal MSGC staff login only

## 🎯 **What This Deployment Does NOT Affect**
✅ Your local development server (`server/` folder)  
✅ Your local SQLite database  
✅ Your development workflow  
✅ Your existing code structure  

## 📦 **Prerequisites**
1. **Vercel Account**: [vercel.com](https://vercel.com)
2. **Supabase Account**: [supabase.com](https://supabase.com)
3. **Vercel CLI**: `npm i -g vercel`
4. **Git Repository**: Your code pushed to GitHub

## 🗄️ **Step 1: Set Up Supabase Database**

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and API key

### 1.2 Get Database Connection String
```
postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
```

### 1.3 Set Up Database Schema
```bash
# Generate Prisma client for production
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

### 1.4 Create Initial Admin User
Since this is an internal app, you'll need to create the first admin user directly in the database:

```sql
-- Connect to your Supabase database and run:
INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'Admin User',
  'admin@msgc.com',
  '$2a$12$hashedpasswordhere', -- Use bcrypt to hash a secure password
  'ADMIN',
  NOW(),
  NOW()
);
```

**To generate a hashed password:**
```bash
# Install bcryptjs globally
npm install -g bcryptjs

# Generate hash (replace 'yourpassword' with actual password)
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('yourpassword', 12));"
```

## ⚙️ **Step 2: Configure Environment Variables**

### 2.1 Create Production Environment File
Copy `env.production.example` to `.env.local` and fill in:
```env
DATABASE_URL="your-supabase-connection-string"
JWT_SECRET="your-secure-jwt-secret"
NODE_ENV="production"
CORS_ORIGIN="https://your-app.vercel.app"
```

### 2.2 Set Vercel Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add CORS_ORIGIN
```

## 🚀 **Step 3: Deploy to Vercel**

### 3.1 Initial Deployment
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set build command: npm run build
# - Set output directory: client/dist
```

### 3.2 Production Deployment
```bash
vercel --prod
```

## 🔧 **Step 4: Update Frontend API Base URL**

### 4.1 Update Client Configuration
In your React app, update API calls to use production URL:
```javascript
// Development: http://localhost:5001/api
// Production: https://your-app.vercel.app/api

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api'
  : 'http://localhost:5001/api'
```

## ✅ **Step 5: Verify Deployment**

### 5.1 Test Production API
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test authentication (use the admin user you created)
curl -X POST https://your-app.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@msgc.com","password":"yourpassword"}'
```

### 5.2 Test Frontend
- Visit your Vercel URL
- Test login with admin credentials
- Test all major features

## 🔄 **Step 6: Set Up CI/CD (Optional)**

### 6.1 GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main, production]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 **Troubleshooting**

### Common Issues:
1. **Database Connection**: Check DATABASE_URL format
2. **JWT Errors**: Verify JWT_SECRET is set
3. **Build Failures**: Check client build process
4. **API 500 Errors**: Check Vercel function logs
5. **Login Fails**: Verify admin user exists in database

### **404 Routing Issues (FIXED)**
If you're getting 404 errors on routes like `/login`, `/dashboard`, etc.:

**Problem**: Vercel is trying to find files at these paths instead of serving your React app.

**Solution**: The `vercel.json` has been updated with proper SPA routing:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/client/index.html"
    }
  ]
}
```

This ensures all non-API routes serve your React app's `index.html`, allowing React Router to handle client-side routing.

### Debug Commands:
```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --function api/auth/signin

# Redeploy specific function
vercel --prod api/auth/signin
```

## 🔒 **Security Considerations**

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use strong, unique secret
3. **Database**: Restrict Supabase access
4. **CORS**: Configure allowed origins properly
5. **Admin Access**: Only authorized MSGC staff should have login credentials

## 📚 **Useful Commands**

```bash
# Development (unchanged)
npm run dev                    # Start both client and server
npm run dev:client            # Start only React dev server
npm run dev:server            # Start only Express server

# Production
npm run build                 # Build React app
npm run deploy                # Deploy to Vercel
vercel --prod                 # Deploy to production
vercel logs                   # View deployment logs
```

## 🎉 **Success!**

Your app is now deployed to production with:
- ✅ Frontend: Static React build on Vercel
- ✅ Backend: Serverless API functions on Vercel  
- ✅ Database: Supabase PostgreSQL
- ✅ Development: Completely untouched and working
- ✅ Authentication: Internal MSGC staff only

## 🔄 **Future Updates**

1. **Code Changes**: Push to GitHub, Vercel auto-deploys
2. **Database Changes**: Update schema, run `npx prisma db push`
3. **Environment Changes**: Update Vercel env vars
4. **Rollback**: Use Vercel dashboard or CLI
5. **User Management**: Add new users directly in database or create admin panel

---

**Need Help?** Check Vercel docs or create an issue in your repo!
