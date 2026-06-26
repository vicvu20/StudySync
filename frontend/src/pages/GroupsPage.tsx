import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { GroupCard } from '../components/GroupCard';
import { useAuth } from '../context/AuthContext';
import type { Course, StudyGroup } from '../types';

export function GroupsPage() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
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
        <div className="group-grid">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onJoin={joinGroup} />
          ))}
        </div>
      </section>
    </div>
  );
}
