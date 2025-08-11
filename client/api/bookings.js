import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const bookings = await prisma.booking.findMany({
          include: {
            transporter: true,
            driver: true,
            vehicle: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.json(bookings);
        break;

      case 'POST':
        const newBooking = await prisma.booking.create({
          data: req.body,
          include: {
            transporter: true,
            driver: true,
            vehicle: true
          }
        });
        res.status(201).json(newBooking);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
