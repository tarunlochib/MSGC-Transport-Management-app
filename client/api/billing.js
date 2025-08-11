import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const bills = await prisma.bill.findMany({
          include: {
            transporter: true,
            bookings: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.json(bills);
        break;

      case 'POST':
        const newBill = await prisma.bill.create({
          data: req.body,
          include: {
            transporter: true,
            bookings: true
          }
        });
        res.status(201).json(newBill);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Billing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
