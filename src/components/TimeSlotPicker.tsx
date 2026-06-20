import { Plus, X, Clock } from 'lucide-react';
import type { TimeSlot } from '@/types';
import { useState } from 'react';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

export const TimeSlotPicker = ({ timeSlots, onChange }: TimeSlotPickerProps) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('19:00');

  const addSlot = () => {
    if (!newDate) return;
    const newSlot: TimeSlot = {
      id: `ts-${Date.now()}`,
      date: newDate,
      time: newTime,
      isSelected: timeSlots.length === 0,
    };
    onChange([...timeSlots, newSlot]);
    setNewDate('');
    setNewTime('19:00');
  };

  const removeSlot = (id: string) => {
    onChange(timeSlots.filter((s) => s.id !== id));
  };

  const toggleSelected = (id: string) => {
    onChange(
      timeSlots.map((s) =>
        s.id === id ? { ...s, isSelected: !s.isSelected } : s
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            onClick={() => toggleSelected(slot.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all
              ${slot.isSelected
                ? 'bg-gold-amber/20 border-gold-amber/50 text-gold-amber'
                : 'bg-theater-600/50 border-theater-500/30 text-ivory-300 hover:border-theater-400/50'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {slot.date} {slot.time}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSlot(slot.id);
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="label-text text-xs">日期</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="input-field py-2 text-sm"
          />
        </div>
        <div className="w-32">
          <label className="label-text text-xs">时间</label>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="input-field py-2 text-sm"
          />
        </div>
        <button
          onClick={addSlot}
          disabled={!newDate}
          className="h-10 px-4 btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">添加</span>
        </button>
      </div>

      {timeSlots.length > 0 && (
        <p className="text-xs text-ivory-500">
          点击时间段可设为首选时间（高亮显示）
        </p>
      )}
    </div>
  );
};
