import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const drivers = await prisma.driver.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.json(drivers);
        break;

      case 'POST':
        const newDriver = await prisma.driver.create({
          data: req.body
        });
        res.status(201).json(newDriver);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Drivers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
