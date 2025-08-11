import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const expenses = await prisma.expense.findMany({
          include: {
            vehicle: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.json(expenses);
        break;

      case 'POST':
        const newExpense = await prisma.expense.create({
          data: req.body,
          include: {
            vehicle: true
          }
        });
        res.status(201).json(newExpense);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
