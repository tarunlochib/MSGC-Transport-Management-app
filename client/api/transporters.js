import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const transporters = await prisma.transporter.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.json(transporters);
        break;

      case 'POST':
        const newTransporter = await prisma.transporter.create({
          data: req.body
        });
        res.status(201).json(newTransporter);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Transporters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
