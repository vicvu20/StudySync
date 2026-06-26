import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';

export const coursesRouter = Router();

const courseSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional()
});

coursesRouter.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;

    const courses = await prisma.course.findMany({
      where: q
        ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } }
            ]
          }
        : undefined,
      include: {
        _count: {
          select: { students: true, groups: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    return res.json(courses);
  } catch (error) {
    return next(error);
  }
});

coursesRouter.post('/', async (req, res, next) => {
  try {
    const data = courseSchema.parse(req.body);
    const course = await prisma.course.create({ data });
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
});
