import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../api/client';
import type { StudyGroup, StudySession } from '../types';
import { GroupSessions } from './GroupSessions';

vi.mock('../api/client', () => ({
  apiRequest: vi.fn()
}));

const mockedApiRequest = vi.mocked(apiRequest);

const group: StudyGroup = {
  id: 'group-1',
  title: 'CSC 4350 Sprint Prep',
  meetingMode: 'HYBRID',
  maxMembers: 6,
  isOpen: true,
  course: {
    id: 'course-1',
    code: 'CSC 4350',
    title: 'Software Engineering'
  }
};

const createdSession: StudySession = {
  id: 'session-1',
  groupId: group.id,
  title: 'Exam Review',
  startTime: '2026-07-20T18:00:00.000Z',
  endTime: '2026-07-20T19:30:00.000Z',
  location: 'Library Room 204',
  notes: 'Bring practice problems',
  createdAt: '2026-07-13T12:00:00.000Z'
};

describe('GroupSessions', () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  it('schedules a session when the student enters valid session times', async () => {
    mockedApiRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(createdSession);

    const user = userEvent.setup();
    render(<GroupSessions group={group} token="test-token" />);

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith('/groups/group-1/sessions', {
        token: 'test-token'
      });
    });

    await user.type(screen.getByLabelText(/session title/i), 'Exam Review');
    await user.type(screen.getByLabelText(/location/i), 'Library Room 204');
    await user.type(screen.getByLabelText(/start time/i), '2026-07-20T14:00');
    await user.type(screen.getByLabelText(/end time/i), '2026-07-20T15:30');
    await user.type(screen.getByLabelText(/notes/i), 'Bring practice problems');
    await user.click(screen.getByRole('button', { name: /schedule session/i }));

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    expect(mockedApiRequest).toHaveBeenLastCalledWith('/groups/group-1/sessions', {
      method: 'POST',
      token: 'test-token',
      body: expect.any(String)
    });
    expect(await screen.findByText('Study session scheduled.')).toBeInTheDocument();
    expect(screen.getByText('Exam Review')).toBeInTheDocument();
    expect(screen.getByText('Library Room 204')).toBeInTheDocument();
  });

  it('rejects a session when the end time is before the start time', async () => {
    mockedApiRequest.mockResolvedValueOnce([]);

    const user = userEvent.setup();
    render(<GroupSessions group={group} token="test-token" />);

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByLabelText(/session title/i), 'Invalid Session');
    await user.type(screen.getByLabelText(/start time/i), '2026-07-20T16:00');
    await user.type(screen.getByLabelText(/end time/i), '2026-07-20T15:00');
    await user.click(screen.getByRole('button', { name: /schedule session/i }));

    expect(screen.getByText('End time must be after the start time.')).toBeInTheDocument();
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });
});
