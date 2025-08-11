export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    if (req.method === 'GET') {
      // Get all drivers
      res.json({ 
        message: 'Drivers endpoint working!',
        method: req.method,
        data: []
      });
    } else if (req.method === 'POST') {
      // Create new driver
      res.json({ 
        message: 'Create driver endpoint working!',
        method: req.method,
        data: req.body
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
