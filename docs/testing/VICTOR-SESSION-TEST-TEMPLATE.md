# Victor's Study Session Test Template

This file is intentionally documentation instead of an active test file.
Victor should copy the code below into:

`frontend/src/components/GroupSessions.test.tsx`

He should then run the tests, make any small changes needed, and commit the
new test file from his own branch so his contribution appears separately in
GitHub history.

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupSessions } from './GroupSessions';
import type { StudyGroup } from '../types';

vi.mock('../api/client', () => ({
  apiRequest: vi.fn()
}));

import { apiRequest } from '../api/client';

const mockedApiRequest = vi.mocked(apiRequest);

const group: StudyGroup = {
  id: 'group-1',
  title: 'CSC 4350 Sprint Prep',
  description: 'Prepare for the software engineering sprint.',
  studyGoal: 'Finish the sprint successfully',
  location: 'Library Room 204',
  meetingMode: 'HYBRID',
  maxMembers: 6,
  isOpen: true,
  course: {
    id: 'course-1',
    code: 'CSC 4350',
    title: 'Software Engineering'
  },
  _count: {
    memberships: 4,
    sessions: 0,
    messages: 0
  }
};

describe('GroupSessions', () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
    mockedApiRequest.mockResolvedValueOnce([]);
  });

  it('schedules a valid study session', async () => {
    const user = userEvent.setup();

    mockedApiRequest.mockResolvedValueOnce({
      id: 'session-1',
      groupId: group.id,
      title: 'Exam Review',
      startTime: '2026-07-20T18:00:00.000Z',
      endTime: '2026-07-20T19:00:00.000Z',
      location: 'Library Room 204',
      notes: null,
      createdAt: '2026-07-10T12:00:00.000Z'
    });

    render(<GroupSessions group={group} token="test-token" />);

    await user.type(
      screen.getByRole('textbox', { name: /session title/i }),
      'Exam Review'
    );
    await user.type(
      screen.getByRole('textbox', { name: /location/i }),
      'Library Room 204'
    );

    const startInput = screen.getByLabelText(/start time/i);
    const endInput = screen.getByLabelText(/end time/i);

    await user.type(startInput, '2026-07-20T18:00');
    await user.type(endInput, '2026-07-20T19:00');
    await user.click(
      screen.getByRole('button', { name: /schedule session/i })
    );

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith(
        `/groups/${group.id}/sessions`,
        expect.objectContaining({
          method: 'POST',
          token: 'test-token'
        })
      );
    });

    expect(
      await screen.findByText(/study session scheduled/i)
    ).toBeInTheDocument();
  });

  it('rejects a session whose end time is before its start time', async () => {
    const user = userEvent.setup();

    render(<GroupSessions group={group} token="test-token" />);

    await user.type(
      screen.getByRole('textbox', { name: /session title/i }),
      'Invalid Session'
    );

    await user.type(
      screen.getByLabelText(/start time/i),
      '2026-07-20T19:00'
    );
    await user.type(
      screen.getByLabelText(/end time/i),
      '2026-07-20T18:00'
    );

    await user.click(
      screen.getByRole('button', { name: /schedule session/i })
    );

    expect(
      await screen.findByText(/end time must be after the start time/i)
    ).toBeInTheDocument();

    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });
});
```

## Victor's commands

```bash
git checkout main
git pull origin main
git checkout -b victor/session-unit-tests

# Copy the code above into:
# frontend/src/components/GroupSessions.test.tsx

npm run test:run --workspace frontend

git add frontend/src/components/GroupSessions.test.tsx
git commit -m "test: add study session scheduling scenarios"
git push -u origin victor/session-unit-tests
```

The first API call in each test loads existing sessions. The invalid-time test
expects only that initial GET-like call and verifies that no POST request is
made.
