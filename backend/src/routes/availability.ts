import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

export const availabilityRouter = Router();

const availabilitySchema = z.object({
  windows: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/)
    })
  )
});

availabilityRouter.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const availability = await prisma.availability.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });

    return res.json(availability);
  } catch (error) {
    return next(error);
  }
});

availabilityRouter.put('/me', async (req: AuthRequest, res, next) => {
  try {
    const data = availabilitySchema.parse(req.body);

    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({ where: { userId: req.user!.id } });

      if (data.windows.length > 0) {
        await tx.availability.createMany({
          data: data.windows.map((window) => ({
            userId: req.user!.id,
            dayOfWeek: window.dayOfWeek,
            startTime: window.startTime,
            endTime: window.endTime
          }))
        });
      }
    });

    const updated = await prisma.availability.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});
