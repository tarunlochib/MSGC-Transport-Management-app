export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('1. Starting signin process...');
    
    const { email, password } = req.body;
    console.log('2. Received credentials:', { email, hasPassword: !!password });
    
    // Test database connection
    console.log('3. Testing database connection...');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('4. Prisma client created successfully');
    
    // Test basic database query
    console.log('5. Testing database query...');
    const userCount = await prisma.user.count();
    console.log('6. User count in database:', userCount);
    
    // Try to find the specific user
    console.log('7. Looking for user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('8. User not found');
      return res.status(400).json({ 
        error: 'User not found',
        debug: { email, userCount, step: 'user_lookup' }
      });
    }
    
    console.log('8. User found:', { id: user.id, name: user.name, email: user.email });
    
    // Test password comparison
    console.log('9. Testing password comparison...');
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('10. Password invalid');
      return res.status(400).json({ 
        error: 'Invalid password',
        debug: { step: 'password_check' }
      });
    }
    
    console.log('10. Password valid, generating JWT...');
    
    // Generate JWT
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('11. JWT generated successfully');
    
    // Return success
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      debug: { step: 'success' }
    });
    
  } catch (error) {
    console.error('ERROR in signin function:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      debug: { 
        message: error.message,
        step: 'error_handling',
        stack: error.stack
      }
    });
  }
}
