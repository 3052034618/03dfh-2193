import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, Lock, Users, ShieldCheck, Share2, Copy, Check } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { InviteeTag } from '@/components/InviteeTag';
import { generatePassword } from '@/utils/idGenerator';
import { saveVerifiedAccess } from '@/utils/storage';
import type { TimeSlot, Invitee, PermissionMode, Gender } from '@/types';

export const CreateGamePage = () => {
  const navigate = useNavigate();
  const { createGame } = useGameStore();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdGameId, setCreatedGameId] = useState('');
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState(4);
  const [store, setStore] = useState('');
  const [price, setPrice] = useState(100);
  const [requiredPlayers, setRequiredPlayers] = useState(6);
  const [hostName, setHostName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState(generatePassword());
  const [permission, setPermission] = useState<PermissionMode>('invite-only');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [invitees, setInvitees] = useState<Omit<Invitee, 'id' | 'gameId' | 'seatOrder' | 'reminderCount' | 'invitedById' | 'lastReminderAt'>[]>([]);
  const [newInviteeName, setNewInviteeName] = useState('');
  const [newInviteeGender, setNewInviteeGender] = useState<Gender>('unknown');

  const gameTypes = ['硬核推理', '情感沉浸', '欢乐机制', '恐怖惊悚', '阵营对抗', '还原本', '本格', '变格'];

  const addInvitee = () => {
    if (!newInviteeName.trim()) return;
    
    const exists = invitees.some((inv) => inv.name === newInviteeName.trim());
    if (exists) {
      setNewInviteeName('');
      return;
    }

    setInvitees([
      ...invitees,
      {
        name: newInviteeName.trim(),
        gender: newInviteeGender,
        familiarity: 3,
        priority: 3,
        status: 'pending',
      },
    ]);
    setNewInviteeName('');
    setNewInviteeGender('unknown');
  };

  const removeInvitee = (name: string) => {
    setInvitees(invitees.filter((inv) => inv.name !== name));
  };

  const regeneratePassword = () => {
    setPassword(generatePassword());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !hostName.trim() || timeSlots.length === 0) {
      return;
    }

    const game = createGame({
      title: title.trim(),
      type: type || '未分类',
      duration,
      store: store.trim(),
      price,
      password,
      permission,
      hostName: hostName.trim(),
      contactInfo: contactInfo.trim() || undefined,
      notes: notes.trim() || undefined,
      timeSlots: timeSlots.map((ts) => ({ date: ts.date, time: ts.time, isSelected: ts.isSelected })),
      invitees,
      requiredPlayers,
    });

    setCreatedGameId(game.id);
    saveVerifiedAccess({
      gameId: game.id,
      name: hostName.trim(),
      isHost: true,
      accessedAt: new Date().toISOString(),
    });
    setStep('success');
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/game/${createdGameId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-amber to-gold-500 flex items-center justify-center shadow-gold-glow">
            <Check className="w-10 h-10 text-theater-900" />
          </div>
          
          <h2 className="text-2xl font-bold heading-serif gold-text mb-2">车局创建成功！</h2>
          <p className="text-ivory-400 mb-6">分享下面的链接和口令给你的小伙伴吧</p>

          <div className="bg-theater-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-ivory-400">访问口令</span>
              <span className="text-2xl font-mono font-bold gold-text tracking-widest">{password}</span>
            </div>
            <div className="divider mb-3" />
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate text-sm text-ivory-300 bg-theater-800/50 px-3 py-2 rounded-lg">
                {window.location.origin}/game/{createdGameId}
              </div>
              <button
                onClick={copyInviteLink}
                className="btn-secondary px-3 py-2 flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/game/${createdGameId}`)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              进入车局管理
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-ivory-400 hover:text-ivory-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回首页
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold heading-serif gold-text mb-2">创建新车局</h1>
          <p className="text-ivory-400">填写剧本信息，邀请你的小伙伴</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-ivory-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-amber/20 text-gold-amber text-sm flex items-center justify-center">1</span>
              剧本信息
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="label-text">剧本名称 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如：《月光下的谋杀案》"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">剧本类型</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-field"
                  >
                    <option value="">选择类型</option>
                    {gameTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">预计时长（小时）</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    max={12}
                    step={0.5}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">店家</label>
                  <input
                    type="text"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    placeholder="推理社名称"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">预计人均（元）</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">需要人数</label>
                <input
                  type="range"
                  value={requiredPlayers}
                  onChange={(e) => setRequiredPlayers(Number(e.target.value))}
                  min={2}
                  max={12}
                  className="w-full h-2 bg-theater-600 rounded-lg appearance-none cursor-pointer accent-gold-amber"
                />
                <div className="text-center text-gold-amber font-semibold mt-1">
                  {requiredPlayers} 人
                </div>
              </div>

              <div>
                <label className="label-text">可选时间段 *</label>
                <TimeSlotPicker timeSlots={timeSlots} onChange={setTimeSlots} />
              </div>

              <div>
                <label className="label-text">备注</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="任何想跟大家说的..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-ivory-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-amber/20 text-gold-amber text-sm flex items-center justify-center">2</span>
              权限设置
            </h2>

            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                ${permission === 'invite-only' 
                  ? 'bg-gold-amber/10 border-gold-amber/40' 
                  : 'bg-theater-600/30 border-theater-500/30 hover:border-theater-400/50'}`}
              >
                <input
                  type="radio"
                  name="permission"
                  checked={permission === 'invite-only'}
                  onChange={() => setPermission('invite-only')}
                  className="mt-1 accent-gold-amber"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-gold-amber" />
                    <span className="font-medium text-ivory-100">只允许受邀查看</span>
                  </div>
                  <p className="text-sm text-ivory-400">只有你添加到邀请名单的人才能进入车局查看详情</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                ${permission === 'one-forward' 
                  ? 'bg-gold-amber/10 border-gold-amber/40' 
                  : 'bg-theater-600/30 border-theater-500/30 hover:border-theater-400/50'}`}
              >
                <input
                  type="radio"
                  name="permission"
                  checked={permission === 'one-forward'}
                  onChange={() => setPermission('one-forward')}
                  className="mt-1 accent-gold-amber"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-5 h-5 text-gold-amber" />
                    <span className="font-medium text-ivory-100">可由熟人转邀一次</span>
                  </div>
                  <p className="text-sm text-ivory-400">受邀玩家可以转发给一位朋友，对方也能进入查看</p>
                </div>
              </label>
            </div>

            <div className="mt-4 p-4 bg-theater-700/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gold-amber" />
                  <span className="text-ivory-200">访问口令</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-bold gold-text tracking-widest">{password}</span>
                  <button
                    type="button"
                    onClick={regeneratePassword}
                    className="p-2 rounded-lg text-ivory-400 hover:text-gold-amber hover:bg-theater-500/50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-ivory-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-amber/20 text-gold-amber text-sm flex items-center justify-center">3</span>
              邀请名单
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newInviteeName}
                onChange={(e) => setNewInviteeName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInvitee())}
                placeholder="输入名字后按回车添加"
                className="input-field flex-1"
              />
              <select
                value={newInviteeGender}
                onChange={(e) => setNewInviteeGender(e.target.value as Gender)}
                className="input-field w-28"
              >
                <option value="unknown">未知</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
              <button
                type="button"
                onClick={addInvitee}
                disabled={!newInviteeName.trim()}
                className="btn-secondary px-4 flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-theater-700/30 rounded-xl">
              {invitees.length === 0 ? (
                <p className="text-ivory-500 text-sm">还没有添加邀请的人</p>
              ) : (
                invitees.map((inv) => (
                  <InviteeTag
                    key={inv.name}
                    name={inv.name}
                    gender={inv.gender}
                    onRemove={() => removeInvitee(inv.name)}
                  />
                ))
              )}
            </div>

            <p className="text-xs text-ivory-500 mt-2">
              已邀请 <span className="text-gold-amber font-medium">{invitees.length}</span> 人
              （可在车局创建后继续添加和管理）
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-ivory-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-amber/20 text-gold-amber text-sm flex items-center justify-center">4</span>
              你的信息
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label-text">你的名字 *</label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="作为车头，你的名字"
                  className="input-field"
                  required
                />
                <p className="text-xs text-ivory-500 mt-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  你将作为该车局的车头（组织者）
                </p>
              </div>
              <div>
                <label className="label-text">对外联系方式</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="如：微信号 xxx 或手机 138****6789"
                  className="input-field"
                />
                <p className="text-xs text-ivory-500 mt-1">
                  玩家进入后仅可看到此联系信息
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !hostName.trim() || timeSlots.length === 0}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              创建车局
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
