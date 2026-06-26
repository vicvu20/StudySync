import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Group 11</p>
          <h1>StudySync</h1>
          <p className="muted">Course-based study groups with scheduling, history, and accountability.</p>
        </div>

        <nav className="nav">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/groups">Groups</NavLink>
        </nav>

        <div className="profile-chip">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
