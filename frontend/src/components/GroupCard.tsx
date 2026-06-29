import type { StudyGroup } from '../types';

type GroupCardProps = {
  group: StudyGroup;
  onJoin: (groupId: string) => void;
  onSelect?: (groupId: string) => void;
  isSelected?: boolean;
};

export function GroupCard({ group, onJoin, onSelect, isSelected = false }: GroupCardProps) {
  return (
    <article className={`card group-card ${isSelected ? 'selected-card' : ''}`}>
      <div className="card-header">
        <div>
          <p className="eyebrow">{group.course.code}</p>
          <h3>{group.title}</h3>
        </div>
        <span className="pill">{group.meetingMode.replace('_', ' ')}</span>
      </div>
      <p>{group.description || 'No description yet.'}</p>
      <div className="meta-grid">
        <span>Goal: {group.studyGoal || 'General study'}</span>
        <span>Location: {group.location || 'TBD'}</span>
        <span>Members: {group._count?.memberships ?? 0}/{group.maxMembers}</span>
        <span>Sessions: {group._count?.sessions ?? 0}</span>
      </div>
      <div className="button-row">
        <button type="button" onClick={() => onJoin(group.id)}>
          Request to join
        </button>
        {onSelect && (
          <button type="button" className="ghost" onClick={() => onSelect(group.id)}>
            View messages
          </button>
        )}
      </div>
    </article>
  );
}
