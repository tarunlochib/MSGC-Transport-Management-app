const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs'); // Added fs module for file existence checks

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

app.use('/api/auth', authRoutes);
app.use('/api/transporters', transporterRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/customers', customerRoutes);

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

// Serve static files from the React app build
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible paths for the dist folder, prioritizing root level
  const possiblePaths = [
    path.join(__dirname, '../dist'),           // Root level dist (priority 1)
    path.join(__dirname, '../../dist'),        // Root level dist (priority 2)
    path.join(__dirname, '../../../dist'),     // Root level dist (priority 3)
    path.join(__dirname, '../client/dist'),    // Client dist (fallback)
    path.join(__dirname, '../../client/dist'), // Client dist (fallback)
    path.join(__dirname, '../../../client/dist'), // Client dist (fallback)
    path.join(__dirname, 'client/dist'),      // Server-relative client dist
    path.join(__dirname, '../dist-root'),     // Backup dist-root
    path.join(__dirname, '../../dist-root')   // Backup dist-root
  ];
  
  let staticPath = null;
  console.log('🔍 Searching for static files...');
  
  for (const testPath of possiblePaths) {
    try {
      const fullPath = path.resolve(testPath);
      console.log(`🔍 Checking: ${testPath} -> ${fullPath}`);
      
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Path exists: ${fullPath}`);
        
        if (fs.existsSync(path.join(fullPath, 'index.html'))) {
          staticPath = fullPath;
          console.log(`🎯 Found static files at: ${staticPath}`);
          break;
        } else {
          console.log(`⚠️ Path exists but no index.html: ${fullPath}`);
        }
      } else {
        console.log(`❌ Path not found: ${fullPath}`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${testPath}:`, error.message);
    }
  }
  
  if (staticPath) {
    console.log(`🚀 Serving static files from: ${staticPath}`);
    // Serve static files from the React build
    app.use(express.static(staticPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  } else {
    console.log('⚠️ No static files found, serving API only');
    console.log('🔍 Searched paths:', possiblePaths);
    app.get('*', (req, res) => {
      res.json({ 
        message: 'API is running, but frontend files not found',
        searchedPaths: possiblePaths,
        currentDir: __dirname,
        workingDir: process.cwd(),
        note: 'Check build logs to see where dist folder was created'
      });
    });
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Production mode: Looking for React app files...`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 