import { Router } from 'express';
import { AIChatRequestSchema } from '@rideflow/shared';
import { GeminiService } from '../services/geminiService';
import { aiRateLimiter } from '../middleware/rateLimiter';

export const aiRouter = Router();

aiRouter.post('/chat', aiRateLimiter, async (req, res, next) => {
  try {
    const { message, conversationHistory } = AIChatRequestSchema.parse(req.body);

    const result = await GeminiService.processChat(message, conversationHistory);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
