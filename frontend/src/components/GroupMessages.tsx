import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import type { GroupMessage, StudyGroup } from '../types';

type GroupMessagesProps = {
  group: StudyGroup | null;
  token: string | null;
};

function formatMessageTime(dateValue: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(dateValue));
}

export function GroupMessages({ group, token }: GroupMessagesProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!group) {
      setMessages([]);
      setBody('');
      setStatus('');
      return;
    }

    const groupId = group.id;

    async function loadMessages() {
      setIsLoading(true);
      setStatus('');
      try {
        const data = await apiRequest<GroupMessage[]>(`/groups/${groupId}/messages`, { token });
        setMessages(data);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Could not load messages.');
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages().catch(console.error);
  }, [group, token]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    if (!group || !body.trim()) {
      return;
    }

    setIsSending(true);
    setStatus('');

    try {
      const message = await apiRequest<GroupMessage>(`/groups/${group.id}/messages`, {
        method: 'POST',
        token,
        body: JSON.stringify({ body: body.trim() })
      });

      setMessages((current) => [...current, message]);
      setBody('');
      setStatus('Message posted.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  }

  if (!group) {
    return (
      <section className="card message-panel empty-state">
        <p className="eyebrow">Group Messages</p>
        <h2>Select a group</h2>
        <p className="muted">Choose a group from the list to view announcements and discussion messages.</p>
      </section>
    );
  }

  return (
    <section className="card message-panel">
      <div className="card-header">
        <div>
          <p className="eyebrow">Group Messages</p>
          <h2>{group.title}</h2>
          <p className="muted">Messages are stored with the group so members can review updates later.</p>
        </div>
        <span className="pill">{group.course.code}</span>
      </div>

      {status && <p className={status.includes('posted') ? 'success' : 'error'}>{status}</p>}

      <div className="message-list">
        {isLoading ? (
          <p className="muted">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="muted">No messages yet. Start the group discussion by posting an update.</p>
        ) : (
          messages.map((message) => (
            <article className="message-item" key={message.id}>
              <div className="message-meta">
                <strong>{message.user.name}</strong>
                <span>{formatMessageTime(message.createdAt)}</span>
              </div>
              <p>{message.body}</p>
            </article>
          ))
        )}
      </div>

      <form className="message-form" onSubmit={sendMessage}>
        <label>
          New message
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Post a study update, meeting reminder, or group announcement."
          />
        </label>
        <button type="submit" disabled={isSending || !body.trim()}>
          {isSending ? 'Posting...' : 'Post message'}
        </button>
      </form>
    </section>
  );
}
