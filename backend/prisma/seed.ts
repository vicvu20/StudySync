import bcrypt from 'bcryptjs';
import { MeetingMode, MembershipRole, MembershipStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.rating.deleteMany();
  await prisma.message.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.studyGroup.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.userCourse.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  const [jessica, maya, jordan] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Jessica He',
        email: 'jessica@studysync.dev',
        passwordHash,
        major: 'Computer Science',
        bio: 'CS student who likes focused study sessions and accountability.',
        studyPreference: 'Structured, goal-oriented, prefers clear session plans.'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Maya Patel',
        email: 'maya@studysync.dev',
        passwordHash,
        major: 'Computer Science',
        bio: 'Likes collaborative whiteboard review before exams.',
        studyPreference: 'Visual explanations, practice problems, and Pomodoro blocks.'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jordan Lee',
        email: 'jordan@studysync.dev',
        passwordHash,
        major: 'Information Systems',
        bio: 'Commuter student looking for dependable study groups.',
        studyPreference: 'Online or hybrid sessions after class.'
      }
    })
  ]);

  const [security, databases, softwareEngineering] = await Promise.all([
    prisma.course.create({
      data: { code: 'CSC 4222', title: 'Cybersecurity Principles and Practice' }
    }),
    prisma.course.create({
      data: { code: 'CSC 4710', title: 'Database Systems' }
    }),
    prisma.course.create({
      data: { code: 'CSC 4350', title: 'Software Engineering' }
    })
  ]);

  await prisma.userCourse.createMany({
    data: [
      { userId: jessica.id, courseId: security.id },
      { userId: jessica.id, courseId: softwareEngineering.id },
      { userId: maya.id, courseId: security.id },
      { userId: maya.id, courseId: databases.id },
      { userId: jordan.id, courseId: softwareEngineering.id },
      { userId: jordan.id, courseId: databases.id }
    ]
  });

  await prisma.availability.createMany({
    data: [
      { userId: jessica.id, dayOfWeek: 1, startTime: '15:00', endTime: '18:00' },
      { userId: jessica.id, dayOfWeek: 3, startTime: '13:00', endTime: '16:00' },
      { userId: maya.id, dayOfWeek: 1, startTime: '16:00', endTime: '19:00' },
      { userId: maya.id, dayOfWeek: 4, startTime: '12:00', endTime: '15:00' },
      { userId: jordan.id, dayOfWeek: 3, startTime: '14:00', endTime: '17:00' },
      { userId: jordan.id, dayOfWeek: 5, startTime: '10:00', endTime: '12:00' }
    ]
  });

  const group = await prisma.studyGroup.create({
    data: {
      title: 'CSC 4350 Sprint Prep',
      description: 'Weekly group for project planning, requirements, and implementation checkpoints.',
      courseId: softwareEngineering.id,
      ownerId: jessica.id,
      studyGoal: 'Finish deliverables before the deadline and keep everyone accountable.',
      location: 'Library study room or Discord',
      meetingMode: MeetingMode.HYBRID,
      memberships: {
        create: [
          { userId: jessica.id, role: MembershipRole.OWNER, status: MembershipStatus.APPROVED },
          { userId: jordan.id, role: MembershipRole.MEMBER, status: MembershipStatus.APPROVED }
        ]
      }
    }
  });

  await prisma.studySession.create({
    data: {
      groupId: group.id,
      title: 'Requirements review',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60),
      location: 'GSU Library',
      notes: 'Review use cases and backend schema.'
    }
  });

  await prisma.message.createMany({
    data: [
      { groupId: group.id, userId: jessica.id, body: 'I uploaded the requirements doc. Can we review the use cases next?' },
      { groupId: group.id, userId: jordan.id, body: 'Yes, I can handle the session scheduling part.' }
    ]
  });

  await prisma.rating.create({
    data: {
      groupId: group.id,
      raterId: jessica.id,
      rateeId: jordan.id,
      score: 5,
      comment: 'Showed up on time and contributed useful ideas.'
    }
  });

  console.log('Seed data created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
