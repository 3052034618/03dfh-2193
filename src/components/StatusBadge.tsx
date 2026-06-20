import type { PlayerStatus, GameStatus } from '@/types';

interface StatusBadgeProps {
  status: PlayerStatus | GameStatus;
  type?: 'player' | 'game';
}

const playerStatusConfig = {
  pending: { label: '待确认', className: 'bg-ivory-400/20 text-ivory-300 border border-ivory-400/30' },
  confirmed: { label: '已确认', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  tentative: { label: '待定', className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  'want-in': { label: '想蹭车', className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
};

const gameStatusConfig = {
  recruiting: { label: '招募中', className: 'bg-gold-amber/20 text-gold-amber border border-gold-amber/30' },
  confirmed: { label: '已成局', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  finished: { label: '已结束', className: 'bg-ivory-400/20 text-ivory-400 border border-ivory-400/30' },
};

export const StatusBadge = ({ status, type = 'player' }: StatusBadgeProps) => {
  const config = type === 'player' ? playerStatusConfig[status as PlayerStatus] : gameStatusConfig[status as GameStatus];

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};
