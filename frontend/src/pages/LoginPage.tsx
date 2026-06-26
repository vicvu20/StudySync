import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { token, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: 'jessica@studysync.dev',
    password: 'password123',
    major: 'Computer Science'
  });

  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">StudySync</p>
        <h1>Find classmates who actually want to study.</h1>
        <p className="muted">
          Course matching, shared availability, group sessions, messages, and post-session reliability ratings.
        </p>

        <form onSubmit={handleSubmit} className="stack">
          {mode === 'register' && (
            <>
              <label>
                Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label>
                Major
                <input value={form.major} onChange={(event) => setForm({ ...form, major: event.target.value })} />
              </label>
            </>
          )}
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>

        <button className="ghost wide" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in'}
        </button>
      </section>
    </main>
  );
}
