export type User = {
  id: string;
  name: string;
  email: string;
  major?: string | null;
  bio?: string | null;
  studyPreference?: string | null;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  _count?: {
    students: number;
    groups: number;
  };
};

export type AvailabilityWindow = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type StudyGroup = {
  id: string;
  title: string;
  description?: string | null;
  studyGoal?: string | null;
  location?: string | null;
  meetingMode: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  maxMembers: number;
  isOpen: boolean;
  course: Course;
  owner?: Pick<User, 'id' | 'name'>;
  _count?: {
    memberships: number;
    sessions: number;
    messages: number;
  };
};

export type Match = {
  id: string;
  name: string;
  major?: string | null;
  studyPreference?: string | null;
  sharedCourses: Course[];
  overlapCount: number;
  averageRating: number | null;
  score: number;
};


export type GroupMessage = {
  id: string;
  groupId: string;
  userId: string;
  body: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name'>;
};
