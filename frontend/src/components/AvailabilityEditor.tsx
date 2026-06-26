import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { AvailabilityWindow } from '../types';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AvailabilityEditor() {
  const { token } = useAuth();
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiRequest<AvailabilityWindow[]>('/availability/me', { token }).then(setWindows).catch(console.error);
  }, [token]);

  function updateWindow(index: number, patch: Partial<AvailabilityWindow>) {
    setWindows((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function save() {
    const cleaned = windows.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));
    const updated = await apiRequest<AvailabilityWindow[]>('/availability/me', {
      method: 'PUT',
      token,
      body: JSON.stringify({ windows: cleaned })
    });
    setWindows(updated);
    setMessage('Availability saved.');
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Schedule Matching</p>
          <h2>Availability</h2>
        </div>
        <button
          onClick={() => setWindows((current) => [...current, { dayOfWeek: 1, startTime: '15:00', endTime: '17:00' }])}
        >
          Add window
        </button>
      </div>

      <div className="stack">
        {windows.map((window, index) => (
          <div className="availability-row" key={`${window.id || 'new'}-${index}`}>
            <select value={window.dayOfWeek} onChange={(event) => updateWindow(index, { dayOfWeek: Number(event.target.value) })}>
              {dayLabels.map((label, day) => (
                <option key={label} value={day}>
                  {label}
                </option>
              ))}
            </select>
            <input value={window.startTime} onChange={(event) => updateWindow(index, { startTime: event.target.value })} />
            <input value={window.endTime} onChange={(event) => updateWindow(index, { endTime: event.target.value })} />
            <button className="ghost" onClick={() => setWindows((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <button onClick={save}>Save availability</button>
      {message && <p className="success">{message}</p>}
    </section>
  );
}
