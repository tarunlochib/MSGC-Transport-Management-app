import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const vehicles = await prisma.vehicle.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.json(vehicles);
        break;

      case 'POST':
        const newVehicle = await prisma.vehicle.create({
          data: req.body
        });
        res.status(201).json(newVehicle);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Vehicles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
