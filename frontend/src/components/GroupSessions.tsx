import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import type { StudyGroup, StudySession } from '../types';

type GroupSessionsProps = {
  group: StudyGroup | null;
  token: string | null;
};

type SessionForm = {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
};

const emptyForm: SessionForm = {
  title: '',
  startTime: '',
  endTime: '',
  location: '',
  notes: ''
};

function formatSessionTime(dateValue: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(dateValue));
}

function getSessionStatus(startTime: string) {
  return new Date(startTime).getTime() >= Date.now() ? 'Upcoming' : 'Completed';
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

export function GroupSessions({ group, token }: GroupSessionsProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((first, second) => new Date(first.startTime).getTime() - new Date(second.startTime).getTime());
  }, [sessions]);

  useEffect(() => {
    if (!group) {
      setSessions([]);
      setForm(emptyForm);
      setStatus('');
      return;
    }

    const groupId = group.id;

    async function loadSessions() {
      setIsLoading(true);
      setStatus('');
      try {
        const data = await apiRequest<StudySession[]>(`/groups/${groupId}/sessions`, { token });
        setSessions(data);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Could not load sessions.');
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions().catch(console.error);
  }, [group, token]);

  async function createSession(event: FormEvent) {
    event.preventDefault();

    if (!group) {
      return;
    }

    if (!form.title.trim() || !form.startTime || !form.endTime) {
      setStatus('Please enter a title, start time, and end time.');
      return;
    }

    if (new Date(form.endTime).getTime() <= new Date(form.startTime).getTime()) {
      setStatus('End time must be after the start time.');
      return;
    }

    setIsSaving(true);
    setStatus('');

    try {
      const session = await apiRequest<StudySession>(`/groups/${group.id}/sessions`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: form.title.trim(),
          startTime: toIsoDateTime(form.startTime),
          endTime: toIsoDateTime(form.endTime),
          location: form.location.trim() || undefined,
          notes: form.notes.trim() || undefined
        })
      });

      setSessions((current) => [...current, session]);
      setForm(emptyForm);
      setStatus('Study session scheduled.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not schedule session.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!group) {
    return (
      <section className="card session-panel empty-state">
        <p className="eyebrow">Study Sessions</p>
        <h2>Select a group</h2>
        <p className="muted">Choose a group to view and schedule upcoming study sessions.</p>
      </section>
    );
  }

  return (
    <section className="card session-panel">
      <div className="card-header">
        <div>
          <p className="eyebrow">Study Sessions</p>
          <h2>{group.title}</h2>
          <p className="muted">Plan meeting times so members know when and where to study together.</p>
        </div>
        <span className="pill">{group.course.code}</span>
      </div>

      {status && <p className={status.includes('scheduled') ? 'success' : 'error'}>{status}</p>}

      <div className="session-list">
        {isLoading ? (
          <p className="muted">Loading sessions...</p>
        ) : sortedSessions.length === 0 ? (
          <p className="muted">No sessions scheduled yet. Create the first study session for this group.</p>
        ) : (
          sortedSessions.map((session) => (
            <article className="session-item" key={session.id}>
              <div>
                <div className="message-meta">
                  <strong>{session.title}</strong>
                  <span>{getSessionStatus(session.startTime)}</span>
                </div>
                <p className="muted">
                  {formatSessionTime(session.startTime)} - {formatSessionTime(session.endTime)}
                </p>
                <p>{session.location || 'Location TBD'}</p>
                {session.notes && <p className="session-notes">{session.notes}</p>}
              </div>
            </article>
          ))
        )}
      </div>

      <form className="session-form" onSubmit={createSession}>
        <div className="form-grid two-column">
          <label>
            Session title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Exam 1 review"
            />
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              placeholder="Library study room or Zoom"
            />
          </label>
          <label>
            Start time
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(event) => setForm({ ...form, startTime: event.target.value })}
            />
          </label>
          <label>
            End time
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(event) => setForm({ ...form, endTime: event.target.value })}
            />
          </label>
        </div>
        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Add topics, materials to bring, or meeting instructions."
          />
        </label>
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Scheduling...' : 'Schedule session'}
        </button>
      </form>
    </section>
  );
}
