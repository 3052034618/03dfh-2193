import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Users, Plus, Filter, ArrowUpDown, Copy, Check, Bell, Crown, UserPlus } from 'lucide-react';
import type { Game, Invitee, PlayerStatus, Gender } from '@/types';
import { SeatCard } from './SeatCard';
import { useGameStore } from '@/store/useGameStore';

interface SeatManagerProps {
  game: Game;
}

type FilterType = 'all' | 'confirmed' | 'tentative' | 'want-in' | 'pending';
type SortType = 'seatOrder' | 'familiarity' | 'priority' | 'status' | 'reminderCount';

interface InviteeEditModalProps {
  invitee: Invitee;
  onClose: () => void;
  onSave: (invitee: Invitee, data: Partial<Invitee>) => void;
}

const InviteeEditModal = ({ invitee, onClose, onSave }: InviteeEditModalProps) => {
  const [name, setName] = useState(invitee.name);
  const [gender, setGender] = useState<Gender>(invitee.gender);
  const [familiarity, setFamiliarity] = useState(invitee.familiarity);
  const [priority, setPriority] = useState(invitee.priority);
  const [role, setRole] = useState(invitee.role ?? '');
  const [note, setNote] = useState(invitee.note ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-ivory-100 mb-4">编辑玩家信息</h3>
        <div className="space-y-4">
          <div>
            <label className="label-text">姓名</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">性别</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="input-field">
              <option value="unknown">未知</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div>
            <label className="label-text">熟悉程度 ({familiarity}/5)</label>
            <input
              type="range"
              min={1}
              max={5}
              value={familiarity}
              onChange={(e) => setFamiliarity(Number(e.target.value))}
              className="w-full accent-gold-amber"
            />
          </div>
          <div>
            <label className="label-text">上车优先级 ({priority}/5)</label>
            <input
              type="range"
              min={1}
              max={5}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full accent-gold-amber"
            />
          </div>
          <div>
            <label className="label-text">分配角色</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="可选" className="input-field" />
          </div>
          <div>
            <label className="label-text">备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="可选"
              className="input-field resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            取消
          </button>
          <button
            onClick={() =>
              onSave(invitee, {
                name: name.trim(),
                gender,
                familiarity,
                priority,
                role: role.trim() || undefined,
                note: note.trim() || undefined,
              })
            }
            className="btn-primary flex-1"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddFriendModalProps {
  game: Game;
  onClose: () => void;
  onSave: (friendName: string, inviterName: string) => void;
}

const AddFriendModal = ({ game, onClose, onSave }: AddFriendModalProps) => {
  const [friendName, setFriendName] = useState('');
  const [inviterName, setInviterName] = useState('');

  const eligibleInviters = game.invitees.filter((inv) => {
    const forwarded = game.invitees.filter((i) => i.invitedById === inv.id).length;
    return forwarded < 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-ivory-100 mb-2">登记转邀信息</h3>
        <p className="text-sm text-ivory-400 mb-4">
          此模式下每位受邀玩家最多可转邀 1 位朋友加入
        </p>
        <div className="space-y-4">
          <div>
            <label className="label-text">朋友姓名</label>
            <input
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="新玩家姓名"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">由谁转邀</label>
            <select
              value={inviterName}
              onChange={(e) => setInviterName(e.target.value)}
              className="input-field"
            >
              <option value="">选择转邀人...</option>
              {eligibleInviters.map((inv) => (
                <option key={inv.id} value={inv.name}>
                  {inv.name}
                </option>
              ))}
            </select>
            {eligibleInviters.length === 0 && (
              <p className="text-xs text-ivory-500 mt-1">
                所有受邀人均已用完转邀名额
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            取消
          </button>
          <button
            disabled={!friendName.trim() || !inviterName}
            onClick={() => onSave(friendName.trim(), inviterName)}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            登记
          </button>
        </div>
      </div>
    </div>
  );
};

export const SeatManager = ({ game }: SeatManagerProps) => {
  const {
    addInvitee,
    removeInvitee,
    reorderInvitees,
    updateInvitee,
    sendReminder,
    sendBulkReminders,
  } = useGameStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('seatOrder');
  const [newInviteeName, setNewInviteeName] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
        case 'status': {
          const statusOrder = ['confirmed', 'tentative', 'want-in', 'pending'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        }
        case 'reminderCount':
          return (b.reminderCount ?? 0) - (a.reminderCount ?? 0);
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
      showToast('该玩家已存在');
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
    showToast('已添加到邀请名单');
  };

  const handleRemoveInvitee = (id: string) => {
    if (confirm('确定要移除该玩家吗？')) {
      removeInvitee(game.id, id);
    }
  };

  const handleEditInvitee = (invitee: Invitee, data: Partial<Invitee>) => {
    updateInvitee(game.id, invitee.id, data);
    setEditingInvitee(null);
    showToast('玩家信息已更新');
  };

  const handleSingleReminder = (invitee: Invitee) => {
    sendReminder(game.id, invitee.id);
    showToast(`已提醒 ${invitee.name}`);
  };

  const handleBulkReminders = (statusFilter: FilterType) => {
    const statuses: PlayerStatus[] =
      statusFilter === 'all'
        ? ['pending', 'tentative', 'want-in']
        : ([statusFilter] as PlayerStatus[]);

    const sent = sendBulkReminders(game.id, statuses);
    if (sent > 0) {
      showToast(`已批量提醒 ${sent} 位玩家`);
    } else {
      showToast('暂无可提醒的玩家');
    }
  };

  const handleAddFriend = (friendName: string, inviterName: string) => {
    const inviter = game.invitees.find((inv) => inv.name === inviterName);
    if (!inviter) return;

    const forwarded = game.invitees.filter((i) => i.invitedById === inviter.id).length;
    if (forwarded >= 1) {
      showToast(`${inviterName} 的转邀名额已用完`);
      return;
    }

    addInvitee(game.id, {
      name: friendName,
      gender: 'unknown',
      familiarity: 2,
      priority: 4,
      status: 'pending',
      invitedById: inviter.id,
    });

    setShowAddFriendModal(false);
    showToast(`${friendName} 已加入（由 ${inviterName} 转邀）`);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/game/${game.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmedCount = game.invitees.filter((i) => i.status === 'confirmed').length;
  const tentativeCount = game.invitees.filter((i) => i.status === 'tentative').length;
  const wantInCount = game.invitees.filter((i) => i.status === 'want-in').length;
  const pendingCount = game.invitees.filter((i) => i.status === 'pending').length;
  const remindedCount = game.invitees.filter((i) => (i.reminderCount ?? 0) > 0).length;

  const statusConfig: { key: FilterType; label: string; count: number; color: string }[] = [
    { key: 'all', label: '全部', count: game.invitees.length, color: 'text-ivory-300' },
    { key: 'confirmed', label: '已确认', count: confirmedCount, color: 'text-emerald-400' },
    { key: 'tentative', label: '待定', count: tentativeCount, color: 'text-amber-400' },
    { key: 'want-in', label: '想蹭车', count: wantInCount, color: 'text-purple-400' },
    { key: 'pending', label: '待确认', count: pendingCount, color: 'text-ivory-400' },
  ];

  return (
    <div className="glass-card p-6 relative">
      {toastMsg && (
        <div className="absolute top-4 right-4 z-10 px-4 py-2 rounded-xl bg-theater-800/90 border border-gold-amber/40 text-sm text-gold-amber animate-slide-up shadow-card">
          {toastMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
              {remindedCount > 0 && (
                <span className="ml-2 text-ivory-500">· 已提醒 {remindedCount} 人</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative group">
            <button className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              批量提醒
            </button>
            <div className="absolute right-0 mt-1 w-44 bg-theater-800/95 backdrop-blur-md rounded-xl border border-theater-500/40 shadow-card overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {(['all', 'pending', 'tentative', 'want-in'] as FilterType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleBulkReminders(s)}
                  className="w-full px-4 py-2.5 text-left text-sm text-ivory-300 hover:bg-gold-amber/10 hover:text-gold-amber transition-colors"
                >
                  {s === 'all' ? '所有未确认' : s === 'pending' ? '待确认' : s === 'tentative' ? '待定' : '想蹭车'}
                </button>
              ))}
            </div>
          </div>
          {game.permission === 'one-forward' && (
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              登记转邀
            </button>
          )}
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

      <div className="flex items-center gap-2 mb-4 flex-wrap">
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
          <option value="reminderCount">提醒次数</option>
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
          placeholder="添加新玩家姓名..."
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={filteredInvitees.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredInvitees.map((invitee) => (
                <SeatCard
                  key={invitee.id}
                  invitee={invitee}
                  isHost={true}
                  onRemove={handleRemoveInvitee}
                  onEdit={(inv) => setEditingInvitee(inv)}
                  onRemind={handleSingleReminder}
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

      {editingInvitee && (
        <InviteeEditModal
          invitee={editingInvitee}
          onClose={() => setEditingInvitee(null)}
          onSave={handleEditInvitee}
        />
      )}

      {showAddFriendModal && (
        <AddFriendModal
          game={game}
          onClose={() => setShowAddFriendModal(false)}
          onSave={handleAddFriend}
        />
      )}
    </div>
  );
};
