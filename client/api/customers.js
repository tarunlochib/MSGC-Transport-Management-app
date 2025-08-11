import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const customers = await prisma.customer.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.json(customers);
        break;

      case 'POST':
        const newCustomer = await prisma.customer.create({
          data: req.body
        });
        res.status(201).json(newCustomer);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
