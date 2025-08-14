# 🚀 Deployment Guide: MSGC Transport App

## 📋 Prerequisites
- [Render Account](https://render.com)
- [Supabase Account](https://supabase.com)
- Docker installed locally (for testing)

## 🗄️ **Step 1: Supabase Database Setup**

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `msgc-transport-db`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Database Connection String
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 1.3 Run Database Migrations
```bash
# Set your DATABASE_URL
export DATABASE_URL="your-supabase-connection-string"

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Optional: Run migrations
npx prisma migrate deploy
```

## 🌐 **Step 2: Render Deployment**

### 2.1 Connect Your Repository
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `MSGC-Transport-Management-app`

### 2.2 Configure the Service
- **Name**: `msgc-transport-app`
- **Environment**: `Docker`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `docker build -t msgc-transport-app .`
- **Start Command**: `docker run -p $PORT:10000 msgc-transport-app`

### 2.3 Set Environment Variables
Add these in Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres` | Supabase connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | Random string for JWT signing |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Application port |
| `CORS_ORIGIN` | `*` | CORS policy |

### 2.4 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Monitor the build logs for any issues

## 🔧 **Step 3: Local Testing with Production Config**

### 3.1 Test with Docker Compose
```bash
# Copy your .env file
cp env.example .env

# Edit .env with your Supabase credentials
# Then run:
docker-compose -f docker-compose.prod.yml up --build
```

### 3.2 Test Endpoints
```bash
# Health check
curl http://localhost:10000/api/health

# Test endpoint
curl http://localhost:10000/api/test
```

## 📊 **Step 4: Monitoring & Maintenance**

### 4.1 Render Dashboard
- Monitor service health
- View logs
- Check performance metrics
- Set up alerts

### 4.2 Supabase Dashboard
- Monitor database performance
- Check connection pool usage
- View query performance
- Set up backups

## 🚨 **Troubleshooting**

### Common Issues:
1. **Build Failures**: Check Docker build logs
2. **Database Connection**: Verify DATABASE_URL format
3. **Port Issues**: Ensure PORT environment variable is set
4. **Prisma Errors**: Check if migrations are applied

### Debug Commands:
```bash
# Check container logs
docker logs <container-name>

# Check environment variables
docker exec <container-name> env

# Test database connection
docker exec <container-name> npx prisma db push --preview-feature
```

## 🔒 **Security Considerations**

1. **Environment Variables**: Never commit secrets to Git
2. **Database Access**: Use connection pooling in production
3. **CORS**: Restrict CORS_ORIGIN in production
4. **HTTPS**: Render provides automatic HTTPS
5. **Rate Limiting**: Consider adding rate limiting middleware

## 📈 **Scaling**

- **Render**: Upgrade to higher plans for more resources
- **Supabase**: Upgrade plan for more database connections
- **Monitoring**: Set up external monitoring (e.g., Sentry, LogRocket)

## 🎯 **Next Steps**

1. Deploy to Render
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up CI/CD pipeline
5. Performance testing and optimization
