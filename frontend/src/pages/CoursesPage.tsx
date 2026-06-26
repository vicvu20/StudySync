import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Course } from '../types';

export function CoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiRequest<Course[]>('/courses', { token }).then(setCourses).catch(console.error);
  }, [token]);

  async function enroll(courseId: string) {
    setMessage('');
    try {
      await apiRequest('/users/me/courses', {
        method: 'POST',
        token,
        body: JSON.stringify({ courseId })
      });
      setMessage('Course added to your profile.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not enroll.');
    }
  }

  return (
    <section className="card full-width">
      <p className="eyebrow">Course Selection</p>
      <h1>Pick classes for matching</h1>
      <p className="muted">StudySync uses shared courses to recommend partners and groups.</p>
      {message && <p className="success">{message}</p>}

      <div className="course-grid">
        {courses.map((course) => (
          <article key={course.id} className="card compact-card">
            <p className="eyebrow">{course.code}</p>
            <h3>{course.title}</h3>
            <p>{course.description || 'No description provided.'}</p>
            <p className="muted">
              {course._count?.students ?? 0} student(s), {course._count?.groups ?? 0} group(s)
            </p>
            <button onClick={() => enroll(course.id)}>Add course</button>
          </article>
        ))}
      </div>
    </section>
  );
}
