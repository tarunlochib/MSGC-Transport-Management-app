const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Get user activities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      userId: req.userId
    };
    
    if (type && type !== 'all') {
      where.type = type;
    }

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.userActivity.count({ where })
    ]);

    res.json({
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// Create user activity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, action, details, metadata } = req.body;
    
    if (!type || !action || !details) {
      return res.status(400).json({ error: 'Type, action, and details are required' });
    }

    const validTypes = ['booking', 'challan', 'customer', 'transporter', 'expense', 'settings', 'login'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid activity type' });
    }

    const activity = await prisma.userActivity.create({
      data: {
        userId: req.userId,
        type,
        action,
        details,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating user activity:', error);
    res.status(500).json({ error: 'Failed to create user activity' });
  }
});

// Clear user activities
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await prisma.userActivity.deleteMany({
      where: {
        userId: req.userId
      }
    });

    res.json({ message: 'All user activities cleared successfully' });
  } catch (error) {
    console.error('Error clearing user activities:', error);
    res.status(500).json({ error: 'Failed to clear user activities' });
  }
});

// Get activity statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await prisma.userActivity.groupBy({
      by: ['type'],
      where: {
        userId: req.userId
      },
      _count: {
        type: true
      }
    });

    const totalActivities = await prisma.userActivity.count({
      where: {
        userId: req.userId
      }
    });

    const recentActivity = await prisma.userActivity.findFirst({
      where: {
        userId: req.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      totalActivities,
      typeStats: stats,
      lastActivity: recentActivity
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

module.exports = router;
