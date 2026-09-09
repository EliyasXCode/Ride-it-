import { Router } from 'express';
import { SupportTicket } from '../models/SupportTicket';
import { isConnectedToMongo } from '../config/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { CreateSupportTicketSchema } from '@rideflow/shared';

export const supportRouter = Router();

supportRouter.use(requireAuth);

supportRouter.get('/tickets', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!._id;
    let tickets: any[] = [];

    if (isConnectedToMongo) {
      tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
    }

    return res.json({ success: true, data: { tickets } });
  } catch (err) {
    next(err);
  }
});

supportRouter.post('/tickets', async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = CreateSupportTicketSchema.parse(req.body);
    const userId = req.user!._id;
    const userName = req.user!.name;
    const userRole = req.user!.role;

    let ticket: any = null;

    if (isConnectedToMongo) {
      ticket = await SupportTicket.create({
        userId,
        rideId: input.rideId,
        category: input.category,
        subject: input.subject,
        status: 'open',
        messages: [
          {
            senderId: userId,
            senderRole: userRole,
            senderName: userName,
            message: input.message,
            createdAt: new Date(),
          },
        ],
      });
    } else {
      ticket = {
        id: `ticket_${Date.now()}`,
        subject: input.subject,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
    }

    return res.status(201).json({ success: true, data: { ticket } });
  } catch (err) {
    next(err);
  }
});
