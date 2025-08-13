# 🚀 Render Deployment Guide for MSGC Transport Management App

## 📋 **Prerequisites**
- GitHub account with your project
- Render account (free)
- Supabase database credentials

## 🔧 **Step 1: Prepare Your Project**

### 1.1 Update Root Package.json
Your `package.json` is already configured for Render deployment.

### 1.2 Ensure Build Scripts Work
Run these commands locally to test:
```bash
npm install
npm run build
```

## 🌐 **Step 2: Create Render Account**

1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. Verify your email address

## 📦 **Step 3: Deploy Your App**

### 3.1 Connect GitHub Repository
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub account
4. Select your repository: `MSGC-Transport-Management-app`

### 3.2 Configure Web Service
Fill in these details:

**Basic Settings:**
- **Name**: `msgc-transport-management`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `production` (your production branch)

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free`

**Environment Variables:**
Add these variables:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_supabase_database_url
JWT_SECRET=your_jwt_secret
```

### 3.3 Advanced Settings
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: ✅ Enabled
- **Build Filter**: Leave default

## 🔐 **Step 4: Configure Environment Variables**

### 4.1 Get Supabase Database URL
1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the "Connection string" (URI format)
4. Replace `your_supabase_database_url` with this value

### 4.2 Set JWT Secret
1. Generate a secure random string (32+ characters)
2. Use this as your `JWT_SECRET`
3. Example: `JWT_SECRET=msgc_transport_2024_secure_key_12345`

## 🚀 **Step 5: Deploy**

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your React app
   - Start your server
3. Wait for build to complete (5-10 minutes)

## ✅ **Step 6: Verify Deployment**

### 6.1 Check Build Logs
- Monitor the build process in Render dashboard
- Look for any error messages
- Ensure build completes successfully

### 6.2 Test Your App
- Visit your app URL: `https://msgc-transport-management.onrender.com`
- Test the health endpoint: `/api/health`
- Try logging in with your credentials

### 6.3 Check API Endpoints
Test these endpoints:
- `GET /api/health` - Should return status
- `POST /api/auth/signin` - Login endpoint
- `GET /api/auth/me` - User info endpoint

## 🔧 **Step 7: Troubleshooting**

### Common Issues:

**Build Fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

**App Won't Start:**
- Check start command: `npm start`
- Verify PORT environment variable
- Check server logs in Render dashboard

**Database Connection Issues:**
- Verify DATABASE_URL is correct
- Check Supabase connection settings
- Ensure database is accessible from Render

**React App Not Loading:**
- Verify build completed successfully
- Check if `client/dist` folder exists
- Ensure static file serving is configured

## 📱 **Step 8: Custom Domain (Optional)**

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `transport.yourcompany.com`)
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

## 🔄 **Step 9: Continuous Deployment**

- Every push to your main branch triggers automatic deployment
- Monitor deployments in Render dashboard
- Rollback to previous version if needed

## 💰 **Cost Breakdown**

- **Web Service**: FREE (750 hours/month)
- **Custom Domain**: FREE
- **SSL Certificate**: FREE
- **Bandwidth**: FREE (100GB/month)
- **Total**: $0/month

## 📞 **Support**

- Render Documentation: [docs.render.com](https://docs.render.com)
- Community Forum: [community.render.com](https://community.render.com)
- Email Support: Available on paid plans

## 🎯 **Next Steps After Deployment**

1. Test all functionality thoroughly
2. Update your team with the new URL
3. Set up monitoring and alerts
4. Configure backup strategies
5. Document deployment process for your team

---

**Your app will be available at:**
`https://msgc-transport-management.onrender.com`

**Estimated deployment time:** 10-15 minutes
**Total cost:** $0/month
