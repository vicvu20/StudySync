import { Router } from 'express';
import { MembershipRole, MembershipStatus, MeetingMode } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

export const groupsRouter = Router();

const groupSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  courseId: z.string().min(1),
  studyGoal: z.string().optional(),
  location: z.string().optional(),
  meetingMode: z.nativeEnum(MeetingMode).optional(),
  maxMembers: z.number().int().min(2).max(20).optional()
});

const sessionSchema = z.object({
  title: z.string().min(3),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  notes: z.string().optional()
});

const messageSchema = z.object({
  body: z.string().min(1).max(2000)
});

const ratingSchema = z.object({
  rateeId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

async function ensureApprovedMember(groupId: string, userId: string) {
  return prisma.membership.findFirst({
    where: { groupId, userId, status: MembershipStatus.APPROVED }
  });
}

groupsRouter.get('/', async (req, res, next) => {
  try {
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined;

    const groups = await prisma.studyGroup.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: true,
        owner: { select: { id: true, name: true } },
        _count: { select: { memberships: true, sessions: true, messages: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(groups);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = groupSchema.parse(req.body);

    const group = await prisma.studyGroup.create({
      data: {
        title: data.title,
        description: data.description,
        courseId: data.courseId,
        ownerId: req.user!.id,
        studyGoal: data.studyGoal,
        location: data.location,
        meetingMode: data.meetingMode,
        maxMembers: data.maxMembers,
        memberships: {
          create: {
            userId: req.user!.id,
            role: MembershipRole.OWNER,
            status: MembershipStatus.APPROVED
          }
        }
      },
      include: { course: true, memberships: true }
    });

    return res.status(201).json(group);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.get('/:groupId', async (req, res, next) => {
  try {
    const group = await prisma.studyGroup.findUnique({
      where: { id: req.params.groupId },
      include: {
        course: true,
        owner: { select: { id: true, name: true, email: true } },
        memberships: {
          include: { user: { select: { id: true, name: true, major: true, studyPreference: true } } }
        },
        sessions: { orderBy: { startTime: 'asc' } },
        messages: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        ratings: true
      }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    return res.json(group);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post('/:groupId/join', async (req: AuthRequest, res, next) => {
  try {
    const group = await prisma.studyGroup.findUnique({ where: { id: req.params.groupId } });

    if (!group || !group.isOpen) {
      return res.status(404).json({ message: 'Open group not found.' });
    }

    const membership = await prisma.membership.upsert({
      where: { userId_groupId: { userId: req.user!.id, groupId: req.params.groupId } },
      create: {
        userId: req.user!.id,
        groupId: req.params.groupId,
        role: MembershipRole.MEMBER,
        status: MembershipStatus.REQUESTED
      },
      update: { status: MembershipStatus.REQUESTED }
    });

    return res.status(201).json(membership);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post('/:groupId/approve', async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ userId: z.string().min(1) });
    const data = schema.parse(req.body);

    const group = await prisma.studyGroup.findUnique({ where: { id: req.params.groupId } });

    if (!group || group.ownerId !== req.user!.id) {
      return res.status(403).json({ message: 'Only the group owner can approve requests.' });
    }

    const membership = await prisma.membership.update({
      where: { userId_groupId: { userId: data.userId, groupId: req.params.groupId } },
      data: { status: MembershipStatus.APPROVED }
    });

    return res.json(membership);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.get('/:groupId/sessions', async (req, res, next) => {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { groupId: req.params.groupId },
      orderBy: { startTime: 'asc' }
    });

    return res.json(sessions);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post('/:groupId/sessions', async (req: AuthRequest, res, next) => {
  try {
    const membership = await ensureApprovedMember(req.params.groupId, req.user!.id);
    if (!membership) {
      return res.status(403).json({ message: 'Only approved group members can schedule sessions.' });
    }

    const data = sessionSchema.parse(req.body);
    const session = await prisma.studySession.create({
      data: {
        groupId: req.params.groupId,
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        location: data.location,
        notes: data.notes
      }
    });

    return res.status(201).json(session);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.get('/:groupId/messages', async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { groupId: req.params.groupId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(messages);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post('/:groupId/messages', async (req: AuthRequest, res, next) => {
  try {
    const membership = await ensureApprovedMember(req.params.groupId, req.user!.id);
    if (!membership) {
      return res.status(403).json({ message: 'Only approved group members can post messages.' });
    }

    const data = messageSchema.parse(req.body);
    const message = await prisma.message.create({
      data: {
        groupId: req.params.groupId,
        userId: req.user!.id,
        body: data.body
      },
      include: { user: { select: { id: true, name: true } } }
    });

    return res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post('/:groupId/ratings', async (req: AuthRequest, res, next) => {
  try {
    const membership = await ensureApprovedMember(req.params.groupId, req.user!.id);
    if (!membership) {
      return res.status(403).json({ message: 'Only approved group members can rate peers.' });
    }

    const data = ratingSchema.parse(req.body);

    if (data.rateeId === req.user!.id) {
      return res.status(400).json({ message: 'You cannot rate yourself.' });
    }

    const rating = await prisma.rating.upsert({
      where: {
        groupId_raterId_rateeId: {
          groupId: req.params.groupId,
          raterId: req.user!.id,
          rateeId: data.rateeId
        }
      },
      create: {
        groupId: req.params.groupId,
        raterId: req.user!.id,
        rateeId: data.rateeId,
        score: data.score,
        comment: data.comment
      },
      update: {
        score: data.score,
        comment: data.comment
      }
    });

    return res.status(201).json(rating);
  } catch (error) {
    return next(error);
  }
});
