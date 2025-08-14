# 🚛 MSGC Transport Management App

A comprehensive transport management system built with React, Node.js, and Prisma.

## 🚀 **Quick Deploy**

### **Deploy to Render + Supabase in 5 minutes:**
1. **Supabase**: Create project & get database URL
2. **Render**: Connect repo & deploy with Docker
3. **Environment**: Set DATABASE_URL & JWT_SECRET
4. **Test**: Visit your live app!

📖 **[Full Deployment Guide](DEPLOYMENT.md)** | ⚡ **[Quick Start](QUICK_START.md)**

## 🏗️ **Architecture**

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Containerization**: Docker
- **Deployment**: Render

## 🗄️ **Database Schema**

- **Users**: Authentication & roles
- **Customers**: Consignors & consignees
- **Transporters**: Transport companies
- **Vehicles**: Fleet management
- **Drivers**: Driver information
- **Bookings**: Transport orders
- **Packages**: Cargo details
- **Invoices**: Billing management
- **Expenses**: Cost tracking

## 🚀 **Local Development**

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Database operations
npm run db:generate
npm run db:push
npm run db:studio
```

## 🐳 **Docker Development**

```bash
# Build and run locally
docker build -t msgc-transport-app .
docker run -p 10000:10000 msgc-transport-app

# Test production config
docker-compose -f docker-compose.prod.yml up --build
```

## 🌐 **API Endpoints**

- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/auth/login` - User authentication
- `GET /api/customers` - Customer management
- `GET /api/bookings` - Booking management
- `GET /api/vehicles` - Vehicle management
- `GET /api/drivers` - Driver management
- `GET /api/expenses` - Expense tracking

## 🔧 **Environment Variables**

```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
PORT=10000
CORS_ORIGIN="*"
```

## 📱 **Features**

- **Dashboard**: Overview & analytics
- **Customer Management**: CRUD operations
- **Booking System**: Transport order management
- **Vehicle Fleet**: Fleet tracking & maintenance
- **Driver Management**: License & permit tracking
- **Expense Tracking**: Cost management
- **Billing System**: Invoice generation
- **Reports**: Analytics & insights

## 🚀 **Deployment Status**

- ✅ **Local Development**: Working
- ✅ **Docker Build**: Working
- ✅ **Database Connection**: Working
- ✅ **API Endpoints**: Working
- 🚧 **Render Deployment**: Ready to deploy
- 🚧 **Supabase Integration**: Ready to configure

## 📚 **Documentation**

- **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[Quick Start](QUICK_START.md)** - 5-minute setup guide
- **[API Documentation](docs/api.md)** - API reference
- **[Database Schema](docs/schema.md)** - Database structure

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: Check the docs folder
- **Deployment Help**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Built with ❤️ by MSGC Team** 