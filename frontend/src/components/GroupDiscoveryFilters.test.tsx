import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import {
  GroupDiscoveryFilters,
  type GroupFilterState
} from './GroupDiscoveryFilters';
import type { Course } from '../types';

const courses: Course[] = [
  {
    id: 'course-csc4350',
    code: 'CSC 4350',
    title: 'Software Engineering'
  },
  {
    id: 'course-geol1122',
    code: 'GEOL 1122',
    title: 'Introductory Geosciences II'
  }
];

const defaultFilters: GroupFilterState = {
  query: '',
  courseId: 'ALL',
  meetingMode: 'ALL',
  sortBy: 'DEFAULT'
};

function renderFilters(
  overrides: Partial<{
    filters: GroupFilterState;
    resultCount: number;
    totalCount: number;
    onChange: ReturnType<typeof vi.fn>;
    onClear: ReturnType<typeof vi.fn>;
  }> = {}
) {
  const onChange = overrides.onChange ?? vi.fn();
  const onClear = overrides.onClear ?? vi.fn();

  render(
    <GroupDiscoveryFilters
      courses={courses}
      filters={overrides.filters ?? defaultFilters}
      resultCount={overrides.resultCount ?? 2}
      totalCount={overrides.totalCount ?? 2}
      onChange={onChange}
      onClear={onClear}
    />
  );

  return { onChange, onClear };
}

describe('GroupDiscoveryFilters', () => {
  it('updates the search query when a student searches for a group', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();

  function TestWrapper() {
    const [filters, setFilters] =
      useState<GroupFilterState>(defaultFilters);

    function handleChange(updatedFilters: GroupFilterState) {
      setFilters(updatedFilters);
      onChange(updatedFilters);
    }

    return (
      <GroupDiscoveryFilters
        courses={courses}
        filters={filters}
        resultCount={2}
        totalCount={2}
        onChange={handleChange}
        onClear={vi.fn()}
      />
    );
  }

  render(<TestWrapper />);

  await user.type(
    screen.getByRole('searchbox', { name: /search groups/i }),
    'CSC 4350'
  );

  expect(onChange).toHaveBeenLastCalledWith({
    ...defaultFilters,
    query: 'CSC 4350'
  });

  expect(
    screen.getByRole('searchbox', { name: /search groups/i })
  ).toHaveValue('CSC 4350');
});

  it('updates the meeting mode when a student selects online groups', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilters();

    await user.selectOptions(
      screen.getByRole('combobox', { name: /meeting mode/i }),
      'ONLINE'
    );

    expect(onChange).toHaveBeenCalledWith({
      ...defaultFilters,
      meetingMode: 'ONLINE'
    });
  });

  it('shows the live number of matching groups', () => {
    renderFilters({ resultCount: 1, totalCount: 5 });

    expect(screen.getByText(/showing 1 of 5 groups/i)).toBeInTheDocument();
  });

  it('allows a student to clear active filters', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    renderFilters({
      filters: {
        ...defaultFilters,
        query: 'software'
      },
      onClear
    });

    await user.click(
      screen.getByRole('button', { name: /clear filters/i })
    );

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
