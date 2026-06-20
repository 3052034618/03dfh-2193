import { Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import type { Game } from '@/types';
import { StatusBadge } from './StatusBadge';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();
  
  const confirmedCount = game.invitees.filter((inv) => inv.status === 'confirmed').length;
  const progress = Math.min((confirmedCount / game.requiredPlayers) * 100, 100);
  
  const firstSlot = game.timeSlots.find((ts) => ts.isSelected) || game.timeSlots[0];

  return (
    <div
      onClick={() => navigate(`/game/${game.id}`)}
      className="glass-card glass-card-hover cursor-pointer overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold heading-serif text-ivory-100 mb-1 group-hover:gold-text transition-all">
              {game.title}
            </h3>
            <p className="text-sm text-ivory-400">{game.type}</p>
          </div>
          <StatusBadge status={game.status} type="game" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-ivory-300">
            <Clock className="w-4 h-4 text-gold-amber" />
            <span>{firstSlot?.date || '待定'} {firstSlot?.time || ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-ivory-300">
            <MapPin className="w-4 h-4 text-gold-amber" />
            <span>{game.store}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2 text-ivory-300">
              <Users className="w-4 h-4 text-gold-amber" />
              <span>已确认 {confirmedCount}/{game.requiredPlayers} 人</span>
            </div>
            <span className="text-gold-amber font-medium">¥{game.price}/人</span>
          </div>
          <div className="h-2 bg-theater-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-amber to-gold-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-theater-500/30">
          <div className="flex -space-x-2">
            {game.invitees.slice(0, 4).map((invitee) => (
              <div
                key={invitee.id}
                className={`w-8 h-8 rounded-full border-2 border-theater-600 flex items-center justify-center text-xs font-medium
                  ${invitee.status === 'confirmed' ? 'bg-gradient-to-br from-gold-amber to-gold-500 text-theater-900' : 'bg-theater-500 text-ivory-400'}`}
                title={invitee.name}
              >
                {invitee.name.charAt(0)}
              </div>
            ))}
            {game.invitees.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-theater-600 bg-theater-500 flex items-center justify-center text-xs text-ivory-400">
                +{game.invitees.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gold-amber text-sm font-medium">
            <span>进入车局</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
