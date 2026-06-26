import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { windowsOverlap } from '../utils/time.js';

export const usersRouter = Router();

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  major: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  studyPreference: z.string().optional().nullable()
});

const enrollSchema = z.object({
  courseId: z.string().min(1)
});

usersRouter.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        major: true,
        bio: true,
        studyPreference: true,
        courses: { include: { course: true } },
        availabilities: true,
        memberships: {
          include: { group: { include: { course: true } } },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

usersRouter.put('/me', async (req: AuthRequest, res, next) => {
  try {
    const data = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: { id: true, name: true, email: true, major: true, bio: true, studyPreference: true }
    });

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

usersRouter.post('/me/courses', async (req: AuthRequest, res, next) => {
  try {
    const data = enrollSchema.parse(req.body);
    const enrollment = await prisma.userCourse.create({
      data: { userId: req.user!.id, courseId: data.courseId },
      include: { course: true }
    });

    return res.status(201).json(enrollment);
  } catch (error) {
    return next(error);
  }
});

usersRouter.delete('/me/courses/:courseId', async (req: AuthRequest, res, next) => {
  try {
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: req.params.courseId
        }
      }
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

usersRouter.get('/matches', async (req: AuthRequest, res, next) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        courses: { include: { course: true } },
        availabilities: true
      }
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const courseIds = currentUser.courses.map((item) => item.courseId);

    const peers = await prisma.user.findMany({
      where: {
        id: { not: req.user!.id },
        courses: { some: { courseId: { in: courseIds } } }
      },
      include: {
        courses: { include: { course: true } },
        availabilities: true,
        ratingsReceived: true
      }
    });

    const matches = peers.map((peer) => {
      const sharedCourses = peer.courses
        .filter((enrollment) => courseIds.includes(enrollment.courseId))
        .map((enrollment) => enrollment.course);

      const overlapCount = currentUser.availabilities.reduce((count, currentWindow) => {
        const overlaps = peer.availabilities.some(
          (peerWindow) =>
            peerWindow.dayOfWeek === currentWindow.dayOfWeek &&
            windowsOverlap(
              currentWindow.startTime,
              currentWindow.endTime,
              peerWindow.startTime,
              peerWindow.endTime
            )
        );
        return overlaps ? count + 1 : count;
      }, 0);

      const averageRating = peer.ratingsReceived.length
        ? peer.ratingsReceived.reduce((sum, rating) => sum + rating.score, 0) / peer.ratingsReceived.length
        : null;

      return {
        id: peer.id,
        name: peer.name,
        major: peer.major,
        studyPreference: peer.studyPreference,
        sharedCourses,
        overlapCount,
        averageRating,
        score: sharedCourses.length * 2 + overlapCount
      };
    });

    return res.json(matches.sort((a, b) => b.score - a.score));
  } catch (error) {
    return next(error);
  }
});
