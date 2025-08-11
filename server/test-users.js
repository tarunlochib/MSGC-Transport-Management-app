const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:', users);
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      
      const testUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@msgc.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxq3Hy', // password: admin123
          role: 'admin'
        }
      });
      
      console.log('Test user created:', testUser);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 