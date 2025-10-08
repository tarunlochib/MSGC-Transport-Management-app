require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const transporterRoutes = require('./routes/transporters');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const bookingRoutes = require('./routes/bookings');
const expenseRoutes = require('./routes/expenses');
const billingRoutes = require('./routes/billing');
const customerRoutes = require('./routes/customers');
const challanRoutes = require('./routes/challans');
const incomeRoutes = require('./routes/income');
const weightMigrationRoutes = require('./routes/weight-migration');
const godownRoutes = require('./routes/godowns');
const stockExceptionsRoutes = require('./routes/stock-exceptions');
const companyRoutes = require('./routes/company');
const activityRoutes = require('./routes/activities');
const analyticsRoutes = require('./routes/analytics');
const predictiveAnalyticsRoutes = require('./routes/predictive-analytics');

app.use('/api/auth', authRoutes);
app.use('/api/transporters', transporterRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/migration', weightMigrationRoutes);
app.use('/api/godowns', godownRoutes);
app.use('/api/stock-exceptions', stockExceptionsRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/predictive-analytics', predictiveAnalyticsRoutes);

// Test route
app.get('/api/test', async (req, res) => {
  try {
    res.json({ 
      message: 'Backend is running successfully!',
      timestamp: new Date().toISOString(),
      status: 'connected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 