import { Check, Clock, ThumbsUp, HelpCircle } from 'lucide-react';
import type { PlayerStatus } from '@/types';

interface PlayerStatusSelectorProps {
  currentStatus: PlayerStatus;
  onChange: (status: PlayerStatus) => void;
}

const statusOptions: { value: PlayerStatus; label: string; description: string; icon: typeof Check; color: string; bgColor: string; borderColor: string }[] = [
  {
    value: 'confirmed',
    label: '能来',
    description: '确定可以参加',
    icon: Check,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    value: 'tentative',
    label: '待定',
    description: '还不确定，再看看',
    icon: Clock,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    value: 'want-in',
    label: '想蹭车',
    description: '时间不稳，但很想玩',
    icon: ThumbsUp,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    value: 'pending',
    label: '未决定',
    description: '还没想好',
    icon: HelpCircle,
    color: 'text-ivory-400',
    bgColor: 'bg-ivory-400/10',
    borderColor: 'border-ivory-400/30',
  },
];

export const PlayerStatusSelector = ({ currentStatus, onChange }: PlayerStatusSelectorProps) => {
  return (
    <div className="space-y-3">
      {statusOptions.map((option) => {
        const isSelected = currentStatus === option.value;
        const Icon = option.icon;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full p-4 rounded-xl border text-left transition-all
              ${isSelected
                ? `${option.bgColor} ${option.borderColor} ring-2 ring-gold-amber/40 ring-offset-2 ring-offset-theater-700`
                : 'bg-theater-600/30 border-theater-500/30 hover:border-theater-400/50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${option.bgColor} ${option.borderColor} border flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${option.color}`} />
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${isSelected ? option.color : 'text-ivory-200'}`}>
                  {option.label}
                </div>
                <p className="text-sm text-ivory-400">{option.description}</p>
              </div>
              {isSelected && (
                <div className={`w-6 h-6 rounded-full ${option.bgColor} ${option.borderColor} border flex items-center justify-center`}>
                  <Check className={`w-4 h-4 ${option.color}`} />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
