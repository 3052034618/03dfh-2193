import { X } from 'lucide-react';
import type { Gender } from '@/types';

interface InviteeTagProps {
  name: string;
  gender?: Gender;
  onRemove?: () => void;
  readOnly?: boolean;
}

export const InviteeTag = ({ name, gender = 'unknown', onRemove, readOnly = false }: InviteeTagProps) => {
  const genderColor = {
    male: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    female: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    unknown: 'bg-theater-500/50 text-ivory-300 border-theater-400/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${genderColor[gender]}`}
    >
      <span>{name}</span>
      {!readOnly && (
        <button
          onClick={onRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
};
