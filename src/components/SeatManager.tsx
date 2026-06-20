import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Users, Plus, Filter, ArrowUpDown, Copy, Check, Send, Crown } from 'lucide-react';
import type { Game, Invitee, PlayerStatus } from '@/types';
import { SeatCard } from './SeatCard';
import { useGameStore } from '@/store/useGameStore';

interface SeatManagerProps {
  game: Game;
}

type FilterType = 'all' | 'confirmed' | 'tentative' | 'want-in' | 'pending';
type SortType = 'seatOrder' | 'familiarity' | 'priority' | 'status';

export const SeatManager = ({ game }: SeatManagerProps) => {
  const { addInvitee, removeInvitee, reorderInvitees, updateInviteeStatus } = useGameStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('seatOrder');
  const [newInviteeName, setNewInviteeName] = useState('');
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredInvitees = game.invitees
    .filter((inv) => {
      if (filter === 'all') return true;
      return inv.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'familiarity':
          return b.familiarity - a.familiarity;
        case 'priority':
          return b.priority - a.priority;
        case 'status':
          const statusOrder = ['confirmed', 'tentative', 'want-in', 'pending'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        case 'seatOrder':
        default:
          return a.seatOrder - b.seatOrder;
      }
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredInvitees.findIndex((i) => i.id === active.id);
      const newIndex = filteredInvitees.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(filteredInvitees, oldIndex, newIndex).map((i) => i.id);
      reorderInvitees(game.id, newOrder);
    }
  };

  const handleAddInvitee = () => {
    if (!newInviteeName.trim()) return;
    
    const exists = game.invitees.some((inv) => inv.name === newInviteeName.trim());
    if (exists) {
      setNewInviteeName('');
      return;
    }

    addInvitee(game.id, {
      name: newInviteeName.trim(),
      gender: 'unknown',
      familiarity: 3,
      priority: 3,
      status: 'pending',
    });
    setNewInviteeName('');
  };

  const handleRemoveInvitee = (id: string) => {
    removeInvitee(game.id, id);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/game/${game.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendReminder = () => {
    const pendingInvitees = game.invitees.filter((inv) => inv.status === 'pending');
    alert(`已向 ${pendingInvitees.length} 位未确认的玩家发送提醒！`);
  };

  const confirmedCount = game.invitees.filter((i) => i.status === 'confirmed').length;
  const tentativeCount = game.invitees.filter((i) => i.status === 'tentative').length;
  const wantInCount = game.invitees.filter((i) => i.status === 'want-in').length;
  const pendingCount = game.invitees.filter((i) => i.status === 'pending').length;

  const statusConfig: { key: FilterType; label: string; count: number; color: string }[] = [
    { key: 'all', label: '全部', count: game.invitees.length, color: 'text-ivory-300' },
    { key: 'confirmed', label: '已确认', count: confirmedCount, color: 'text-emerald-400' },
    { key: 'tentative', label: '待定', count: tentativeCount, color: 'text-amber-400' },
    { key: 'want-in', label: '想蹭车', count: wantInCount, color: 'text-purple-400' },
    { key: 'pending', label: '待确认', count: pendingCount, color: 'text-ivory-400' },
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-amber/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-gold-amber" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ivory-100">座位管理</h2>
            <p className="text-sm text-ivory-400">
              已确认 {confirmedCount}/{game.requiredPlayers} 人
              {confirmedCount >= game.requiredPlayers && (
                <span className="ml-2 text-emerald-400">已满员 ✓</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={sendReminder}
            className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            发送提醒
          </button>
          <button
            onClick={copyInviteLink}
            className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制' : '复制链接'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusConfig.map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${filter === item.key
                ? 'bg-gold-amber/20 text-gold-amber border border-gold-amber/30'
                : 'bg-theater-600/30 text-ivory-400 border border-transparent hover:text-ivory-200'
              }`}
          >
            {item.label}
            <span className={`ml-1.5 ${item.color}`}>({item.count})</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 text-ivory-400">
          <ArrowUpDown className="w-4 h-4" />
          <span className="text-sm">排序：</span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
          className="px-3 py-1.5 bg-theater-600/50 border border-theater-500/30 rounded-lg text-sm text-ivory-200 focus:outline-none focus:border-gold-amber/50"
        >
          <option value="seatOrder">座位顺序</option>
          <option value="familiarity">熟悉程度</option>
          <option value="priority">上车优先级</option>
          <option value="status">报名状态</option>
        </select>
        <div className="flex-1" />
        <Filter className="w-4 h-4 text-ivory-400" />
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newInviteeName}
          onChange={(e) => setNewInviteeName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInvitee())}
          placeholder="添加新玩家..."
          className="input-field flex-1 py-2 text-sm"
        />
        <button
          onClick={handleAddInvitee}
          disabled={!newInviteeName.trim()}
          className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
        {filteredInvitees.length === 0 ? (
          <div className="text-center py-12 text-ivory-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无玩家</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredInvitees.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {filteredInvitees.map((invitee) => (
                <SeatCard
                  key={invitee.id}
                  invitee={invitee}
                  isHost={true}
                  onRemove={handleRemoveInvitee}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {game.hostName && (
        <div className="mt-4 pt-4 border-t border-theater-500/30 flex items-center gap-2">
          <Crown className="w-4 h-4 text-gold-amber" />
          <span className="text-sm text-ivory-400">车头：</span>
          <span className="text-sm font-medium text-gold-amber">{game.hostName}</span>
        </div>
      )}
    </div>
  );
};
