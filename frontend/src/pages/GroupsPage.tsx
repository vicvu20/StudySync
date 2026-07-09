import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { GroupCard } from '../components/GroupCard';
import { GroupDiscoveryFilters, type GroupFilterState } from '../components/GroupDiscoveryFilters';
import { GroupMessages } from '../components/GroupMessages';
import { GroupSessions } from '../components/GroupSessions';
import { useAuth } from '../context/AuthContext';
import type { Course, StudyGroup } from '../types';

export function GroupsPage() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [filters, setFilters] = useState<GroupFilterState>({
    query: '',
    courseId: 'ALL',
    meetingMode: 'ALL',
    sortBy: 'DEFAULT'
  });
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    studyGoal: '',
    location: '',
    meetingMode: 'HYBRID'
  });

  async function loadGroups() {
    const data = await apiRequest<StudyGroup[]>('/groups', { token });
    setGroups(data);
    setSelectedGroupId((current) => current ?? data[0]?.id ?? null);
  }

  useEffect(() => {
    loadGroups().catch(console.error);
    apiRequest<Course[]>('/courses', { token }).then((data) => {
      setCourses(data);
      setForm((current) => ({ ...current, courseId: data[0]?.id || '' }));
    });
  }, [token]);

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    await apiRequest('/groups', {
      method: 'POST',
      token,
      body: JSON.stringify({ ...form, maxMembers: 6 })
    });
    setForm({ title: '', description: '', courseId: courses[0]?.id || '', studyGoal: '', location: '', meetingMode: 'HYBRID' });
    setMessage('Group created.');
    await loadGroups();
  }

  async function joinGroup(groupId: string) {
    setMessage('');
    try {
      await apiRequest(`/groups/${groupId}/join`, { method: 'POST', token });
      setMessage('Join request sent. The group owner can approve it.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not join group.');
    }
  }

  const normalizedQuery = filters.query.trim().toLowerCase();
  const filteredGroups = groups
    .filter((group) => {
      const searchableText = [
        group.title,
        group.description,
        group.studyGoal,
        group.location,
        group.course.code,
        group.course.title
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesQuery = normalizedQuery === '' || searchableText.includes(normalizedQuery);
      const matchesCourse = filters.courseId === 'ALL' || group.course.id === filters.courseId;
      const matchesMode = filters.meetingMode === 'ALL' || group.meetingMode === filters.meetingMode;

      return matchesQuery && matchesCourse && matchesMode;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'MOST_ACTIVE') {
        return (b._count?.sessions ?? 0) - (a._count?.sessions ?? 0);
      }
      if (filters.sortBy === 'MOST_MEMBERS') {
        return (b._count?.memberships ?? 0) - (a._count?.memberships ?? 0);
      }
      if (filters.sortBy === 'MOST_SPACE') {
        const aSpace = a.maxMembers - (a._count?.memberships ?? 0);
        const bSpace = b.maxMembers - (b._count?.memberships ?? 0);
        return bSpace - aSpace;
      }
      if (filters.sortBy === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  function clearFilters() {
    setFilters({ query: '', courseId: 'ALL', meetingMode: 'ALL', sortBy: 'DEFAULT' });
  }

  return (
    <div className="page-grid">
      <section className="card">
        <p className="eyebrow">Study Group Management</p>
        <h1>Create a group</h1>
        <form className="stack" onSubmit={createGroup}>
          <label>
            Group title
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label>
            Course
            <select value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })}>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Study goal
            <input value={form.studyGoal} onChange={(event) => setForm({ ...form, studyGoal: event.target.value })} />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          <button type="submit">Create group</button>
        </form>
      </section>

      <section className="full-width">
        <div className="card-header page-title-row">
          <div>
            <p className="eyebrow">Available Groups</p>
            <h1>Join classmates by course</h1>
          </div>
          {message && <p className="success">{message}</p>}
        </div>
        <GroupDiscoveryFilters
          courses={courses}
          filters={filters}
          resultCount={filteredGroups.length}
          totalCount={groups.length}
          onChange={setFilters}
          onClear={clearFilters}
        />

        {filteredGroups.length > 0 ? (
          <div className="group-grid">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onJoin={joinGroup}
                onSelect={setSelectedGroupId}
                isSelected={group.id === selectedGroupId}
              />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <h2>No study groups match those filters</h2>
            <p className="muted">Try a different course, meeting mode, or search term.</p>
            <button className="ghost" type="button" onClick={clearFilters}>
              Show all groups
            </button>
          </div>
        )}
      </section>

      <section className="full-width group-detail-grid">
        <GroupSessions group={groups.find((group) => group.id === selectedGroupId) ?? null} token={token} />
        <GroupMessages group={groups.find((group) => group.id === selectedGroupId) ?? null} token={token} />
      </section>
    </div>
  );
}
