import type { Course } from '../types';

export type GroupSortOption = 'DEFAULT' | 'MOST_ACTIVE' | 'MOST_MEMBERS' | 'MOST_SPACE' | 'TITLE';

export type GroupFilterState = {
  query: string;
  courseId: string;
  meetingMode: string;
  sortBy: GroupSortOption;
};

type GroupDiscoveryFiltersProps = {
  courses: Course[];
  filters: GroupFilterState;
  resultCount: number;
  totalCount: number;
  onChange: (filters: GroupFilterState) => void;
  onClear: () => void;
};

export function GroupDiscoveryFilters({
  courses,
  filters,
  resultCount,
  totalCount,
  onChange,
  onClear
}: GroupDiscoveryFiltersProps) {
  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.courseId !== 'ALL' ||
    filters.meetingMode !== 'ALL' ||
    filters.sortBy !== 'DEFAULT';

  return (
    <section className="card stack">
      <div className="card-header">
        <div>
          <p className="eyebrow">Group Discovery</p>
          <h2>Find your study fit</h2>
          <p className="muted">
            Showing {resultCount} of {totalCount} groups
          </p>
        </div>
        {hasActiveFilters && (
          <button className="ghost" type="button" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>

      <label>
        Search groups
        <input
          type="search"
          value={filters.query}
          placeholder="Search title, course, goal, or location"
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>

      <div className="form-grid two-column">
        <label>
          Course
          <select
            value={filters.courseId}
            onChange={(event) => onChange({ ...filters, courseId: event.target.value })}
          >
            <option value="ALL">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Meeting mode
          <select
            value={filters.meetingMode}
            onChange={(event) => onChange({ ...filters, meetingMode: event.target.value })}
          >
            <option value="ALL">All modes</option>
            <option value="IN_PERSON">In person</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </label>
      </div>

      <label>
        Sort results
        <select
          value={filters.sortBy}
          onChange={(event) =>
            onChange({ ...filters, sortBy: event.target.value as GroupSortOption })
          }
        >
          <option value="DEFAULT">Recommended order</option>
          <option value="MOST_ACTIVE">Most sessions</option>
          <option value="MOST_MEMBERS">Most members</option>
          <option value="MOST_SPACE">Most open seats</option>
          <option value="TITLE">Title A–Z</option>
        </select>
      </label>
    </section>
  );
}
