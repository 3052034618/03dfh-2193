import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, User, Star, Bell, Edit3 } from 'lucide-react';
import type { Invitee } from '@/types';
import { StatusBadge } from './StatusBadge';

interface SeatCardProps {
  invitee: Invitee;
  isHost?: boolean;
  onRemove?: (id: string) => void;
  onEdit?: (invitee: Invitee) => void;
  onRemind?: (invitee: Invitee) => void;
}

export const SeatCard = ({ invitee, isHost = false, onRemove, onEdit, onRemind }: SeatCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: invitee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const genderColor = {
    male: 'from-blue-500 to-blue-600',
    female: 'from-pink-500 to-pink-600',
    unknown: 'from-ivory-400 to-ivory-500',
  };

  const formatLastReminder = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-4 ${isHost ? 'cursor-grab active:cursor-grabbing' : ''} transition-all`}
    >
      <div className="flex items-start gap-3">
        {isHost && (
          <button
            className="mt-1 text-ivory-400 hover:text-gold-amber transition-colors cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${genderColor[invitee.gender]} flex items-center justify-center flex-shrink-0`}>
          <User className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-ivory-100 truncate">{invitee.name}</h4>
            <StatusBadge status={invitee.status} type="player" />
            {isHost && (invitee.reminderCount ?? 0) > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gold-amber/15 text-gold-amber border border-gold-amber/20"
                title={`已提醒${invitee.reminderCount}次，上次${formatLastReminder(invitee.lastReminderAt)}`}
              >
                <Bell className="w-3 h-3" />
                {invitee.reminderCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-ivory-400">
            {invitee.role && (
              <span className="px-2 py-0.5 rounded bg-theater-500/50 text-gold-amber">
                {invitee.role}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-gold-amber fill-gold-amber" />
              <span>熟悉度 {invitee.familiarity}</span>
            </div>
            <span className="text-ivory-500">·</span>
            <span>优先级 {invitee.priority}</span>
          </div>

          {invitee.note && (
            <p className="text-xs text-ivory-500 mt-1 truncate">{invitee.note}</p>
          )}

          {isHost && invitee.lastReminderAt && (
            <p className="text-xs text-ivory-500 mt-1">
              上次提醒：{formatLastReminder(invitee.lastReminderAt)}
            </p>
          )}
        </div>

        {isHost && (
          <div className="flex items-center gap-1">
            {invitee.status !== 'confirmed' && (
              <button
                onClick={() => onRemind?.(invitee)}
                className="p-1.5 rounded-lg text-ivory-400 hover:text-gold-amber hover:bg-gold-amber/10 transition-colors"
                title="单独提醒"
              >
                <Bell className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit?.(invitee)}
              className="p-1.5 rounded-lg text-ivory-400 hover:text-gold-amber hover:bg-theater-500/50 transition-colors"
              title="编辑"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove?.(invitee.id)}
              className="p-1.5 rounded-lg text-ivory-400 hover:text-accent-500 hover:bg-accent-500/10 transition-colors"
              title="移除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
