import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { AvailabilityEditor } from '../components/AvailabilityEditor';
import { useAuth } from '../context/AuthContext';
import type { Match } from '../types';

export function DashboardPage() {
  const { token, user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    apiRequest<Match[]>('/users/matches', { token }).then(setMatches).catch(console.error);
  }, [token]);

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome back, {user?.name?.split(' ')[0]}.</h1>
        <p>
          Your StudySync profile connects your courses, availability, groups, and reliability history so finding a study
          partner is less chaotic.
        </p>
      </section>

      <AvailabilityEditor />

      <section className="card full-width">
        <div className="card-header">
          <div>
            <p className="eyebrow">Matching Engine</p>
            <h2>Suggested study partners</h2>
          </div>
        </div>

        <div className="match-list">
          {matches.length === 0 && <p className="muted">Enroll in courses and add availability to generate matches.</p>}
          {matches.map((match) => (
            <article key={match.id} className="match-row">
              <div>
                <h3>{match.name}</h3>
                <p className="muted">{match.major || 'No major listed'}</p>
                <p>{match.studyPreference || 'No study preference listed yet.'}</p>
              </div>
              <div>
                <strong>{match.score}</strong>
                <span>match score</span>
              </div>
              <div>
                <span>{match.sharedCourses.map((course) => course.code).join(', ')}</span>
                <span>{match.overlapCount} overlapping window(s)</span>
                <span>{match.averageRating ? `${match.averageRating.toFixed(1)} / 5 reliability` : 'No ratings yet'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
