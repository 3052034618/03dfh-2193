import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  DollarSign,
  BookOpen,
  Crown,
  Info,
  LogOut,
  Theater,
  AlertTriangle,
  Sparkles,
  UserCheck,
  UserX,
  UserPlus,
  Check,
  X,
  CheckCircle,
  Phone,
  LayoutDashboard,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { PasswordModal } from '@/components/PasswordModal';
import { SeatManager } from '@/components/SeatManager';
import { PlayerStatusSelector } from '@/components/PlayerStatusSelector';
import { StatusBadge } from '@/components/StatusBadge';
import type { PlayerStatus, VerifiedGameAccess, Game } from '@/types';

export const GameDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const gameId = id ?? '';

  const {
    games,
    init,
    verifyAndEnterGame,
    getVerifiedUserForGame,
    getMyInviteeInGame,
    updateInviteeStatus,
    clearMyGameAccess,
    addInvitee,
    canForwardInvite,
    confirmGame,
    updateGame,
  } = useGameStore();

  const [passwordError, setPasswordError] = useState('');
  const [, forceUpdate] = useState(0);
  const [friendName, setFriendName] = useState('');
  const [showForwardSuccess, setShowForwardSuccess] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [contactInput, setContactInput] = useState('');

  const game = games.find((g) => g.id === gameId);
  const verifiedAccess: VerifiedGameAccess | null = gameId ? getVerifiedUserForGame(gameId) : null;
  const myInvitee = gameId ? getMyInviteeInGame(gameId) : null;
  const isHostView = !!verifiedAccess?.isHost && !!game && verifiedAccess.name === game.hostName;

  useEffect(() => {
    init();
  }, [init]);

  const handlePasswordSubmit = (name: string, password: string) => {
    if (!game) return;
    const result = verifyAndEnterGame(game.id, name, password);
    if (result.success === false) {
      setPasswordError(result.error);
      return;
    }
    setPasswordError('');
    forceUpdate((n) => n + 1);
  };

  const handleStatusChange = (status: PlayerStatus) => {
    if (!game || !myInvitee) return;
    updateInviteeStatus(game.id, myInvitee.id, status);
    forceUpdate((n) => n + 1);
  };

  const handleLogout = () => {
    if (!game) return;
    clearMyGameAccess(game.id);
    forceUpdate((n) => n + 1);
  };

  const handleForwardInvite = () => {
    if (!game || !myInvitee || !friendName.trim()) return;
    const check = canForwardInvite(game.id, myInvitee.name);
    if (!check.can) {
      alert(check.reason ?? '暂不可转邀');
      return;
    }
    const exists = game.invitees.some((inv) => inv.name === friendName.trim());
    if (exists) {
      alert('该朋友已在名单中');
      return;
    }
    addInvitee(game.id, {
      name: friendName.trim(),
      gender: 'unknown',
      familiarity: 2,
      priority: 4,
      status: 'pending',
      invitedById: myInvitee.id,
    });
    setFriendName('');
    setShowForwardSuccess(true);
    setTimeout(() => setShowForwardSuccess(false), 3000);
    forceUpdate((n) => n + 1);
  };

  const handleConfirmGame = () => {
    if (!game) return;
    if (confirm('确认将此车局标记为已成局？')) {
      confirmGame(game.id);
      forceUpdate((n) => n + 1);
    }
  };

  const handleSaveContact = () => {
    if (!game) return;
    updateGame(game.id, { contactInfo: contactInput.trim() || undefined });
    setEditingContact(false);
    forceUpdate((n) => n + 1);
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-theater-600/50 flex items-center justify-center">
            <Theater className="w-10 h-10 text-ivory-500" />
          </div>
          <h2 className="text-2xl font-bold text-ivory-200 mb-2">车局不存在</h2>
          <p className="text-ivory-400 mb-6">该车局可能已被删除或链接无效</p>
          <button onClick={() => navigate('/')} className="btn-primary">返回首页</button>
        </div>
      </div>
    );
  }

  if (!verifiedAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-theater-900 via-theater-800 to-theater-900">
        <div className="max-w-md w-full text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-amber to-gold-500 flex items-center justify-center shadow-gold-glow">
            <Theater className="w-10 h-10 text-theater-900" />
          </div>
          <h1 className="text-2xl font-bold heading-serif gold-text mb-2">私密车局</h1>
          <p className="text-ivory-400 text-sm">请验证身份以查看详情</p>
        </div>
        <PasswordModal
          isOpen={true}
          onClose={() => navigate('/')}
          onSubmit={handlePasswordSubmit}
          error={passwordError}
          title="进入私密车局"
          standalone
        />
      </div>
    );
  }

  const firstSlot = game.timeSlots.find((ts) => ts.isSelected) || game.timeSlots[0];
  const confirmedCount = game.invitees.filter((i) => i.status === 'confirmed').length;
  const tentativeCount = game.invitees.filter((i) => i.status === 'tentative').length;
  const wantInCount = game.invitees.filter((i) => i.status === 'want-in').length;
  const pendingCount = game.invitees.filter((i) => i.status === 'pending').length;
  const remaining = Math.max(0, game.requiredPlayers - confirmedCount);
  const progressPct = Math.min((confirmedCount / game.requiredPlayers) * 100, 100);

  const roleRequirements = game.roleRequirements ?? [];
  const assignedRoles = game.invitees
    .filter((inv) => inv.role && inv.status === 'confirmed')
    .map((inv) => inv.role as string);
  const unfilledRoles = roleRequirements.filter((r) => !assignedRoles.includes(r));

  const myRole = myInvitee?.role;
  const myStatus = myInvitee?.status;

  const isOriginalInvitee = myInvitee && !myInvitee.invitedById;
  const forwardCheck =
    game && myInvitee && isOriginalInvitee
      ? canForwardInvite(game.id, myInvitee.name)
      : { can: false, reason: '你是由朋友转邀进入的' };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-ivory-400 hover:text-ivory-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </button>
          {verifiedAccess && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-ivory-400 hover:text-ivory-100 hover:bg-theater-600/50 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              切换身份
            </button>
          )}
        </div>

        <div className="glass-card p-6 mb-6 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold heading-serif gold-text">
                  {game.title}
                </h1>
                <StatusBadge status={game.status} type="game" />
                {verifiedAccess && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-theater-600/80 text-ivory-300 border border-theater-500/40">
                    以「{verifiedAccess.name}」身份查看
                  </span>
                )}
              </div>
              <p className="text-ivory-300 mb-4">{game.type}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-ivory-300">
                  <Clock className="w-4 h-4 text-gold-amber flex-shrink-0" />
                  <span>{game.duration} 小时</span>
                </div>
                {isHostView && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-ivory-300">
                      <MapPin className="w-4 h-4 text-gold-amber flex-shrink-0" />
                      <span className="truncate">{game.store || '待定'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ivory-300">
                      <DollarSign className="w-4 h-4 text-gold-amber flex-shrink-0" />
                      <span>¥{game.price}/人</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2 text-sm text-ivory-300">
                  <Users className="w-4 h-4 text-gold-amber flex-shrink-0" />
                  <span>{confirmedCount}/{game.requiredPlayers} 人</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {isHostView && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-amber/20 border border-gold-amber/30">
                  <Crown className="w-4 h-4 text-gold-amber" />
                  <span className="text-sm font-medium text-gold-amber">你是车头</span>
                </div>
              )}
              {verifiedAccess && !isHostView && myStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ivory-400">我的状态：</span>
                  <StatusBadge status={myStatus} type="player" />
                </div>
              )}
              {isHostView && (
                <div className="text-xs text-ivory-500">
                  权限模式：
                  {game.permission === 'invite-only' ? (
                    <span className="text-ivory-400">仅受邀可进</span>
                  ) : (
                    <span className="text-ivory-400">可转邀1位</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {isHostView && firstSlot && (
            <div className="mt-4 pt-4 border-t border-theater-500/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold-amber" />
                <span className="text-sm text-ivory-300">首选时间：</span>
                <span className="text-sm font-medium text-ivory-100">
                  {firstSlot.date} {firstSlot.time}
                </span>
                {game.timeSlots.filter((ts) => !ts.isSelected).length > 0 && (
                  <span className="text-xs text-ivory-500">
                    （另有 {game.timeSlots.filter((ts) => !ts.isSelected).length} 个备选）
                  </span>
                )}
              </div>
            </div>
          )}

          {isHostView && game.notes && (
            <div className="mt-4 p-4 bg-theater-700/50 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gold-amber mt-0.5 flex-shrink-0" />
                <p className="text-sm text-ivory-300">{game.notes}</p>
              </div>
            </div>
          )}
        </div>

        {isHostView ? (
          <div className="space-y-6 animate-fade-in">
            <GameDashboard game={game} onConfirmGame={handleConfirmGame} />

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-gold-amber" />
                <h3 className="text-base font-semibold text-ivory-100">对外联系方式</h3>
              </div>
              {editingContact ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="如：微信号 xxx 或手机 138****6789"
                    className="input-field flex-1 py-2 text-sm"
                    autoFocus
                  />
                  <button onClick={handleSaveContact} className="btn-primary px-4 py-2 text-sm">
                    保存
                  </button>
                  <button onClick={() => setEditingContact(false)} className="btn-secondary px-4 py-2 text-sm">
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ivory-300">
                    {game.contactInfo || '未设置'}
                  </span>
                  <button
                    onClick={() => {
                      setContactInput(game.contactInfo ?? '');
                      setEditingContact(true);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-theater-600/50 text-ivory-400 hover:text-gold-amber hover:bg-theater-500/50 transition-colors"
                  >
                    {game.contactInfo ? '修改' : '设置'}
                  </button>
                </div>
              )}
              <p className="text-xs text-ivory-500 mt-2">玩家进入后仅可看到此联系信息，不会看到店家、人均等详情</p>
            </div>

            <SeatManager game={game} />
          </div>
        ) : verifiedAccess && myInvitee ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold-amber/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gold-amber" />
                  </div>
                  <h2 className="text-lg font-semibold text-ivory-100">我的报名状态</h2>
                </div>
                <PlayerStatusSelector
                  currentStatus={myInvitee.status}
                  onChange={handleStatusChange}
                />
              </div>

              {myRole && (
                <div className="glass-card p-6 border-gold-amber/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-amber/30 to-gold-500/30 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-gold-amber" />
                    </div>
                    <div>
                      <p className="text-sm text-ivory-400">为你分配的角色</p>
                      <h3 className="text-xl font-bold heading-serif gold-text">{myRole}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-ivory-400">
                    请提前熟悉角色背景，游戏中保持代入感哦~
                  </p>
                </div>
              )}

              {!myRole && roleRequirements.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-ivory-100 mb-3">当前招募角色需求</h3>
                  <div className="flex flex-wrap gap-2">
                    {roleRequirements.map((role) => {
                      const filled = assignedRoles.includes(role);
                      return (
                        <span
                          key={role}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5
                            ${filled
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-theater-600/60 text-ivory-300 border border-theater-500/40'
                            }`}
                        >
                          {filled ? <UserCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-gold-amber" />}
                          {role}
                        </span>
                      );
                    })}
                  </div>
                  {unfilledRoles.length > 0 && (
                    <p className="text-xs text-ivory-500 mt-3">
                      还差 {unfilledRoles.length} 个角色未分配确认人
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gold-amber" />
                  <h3 className="text-base font-semibold text-ivory-100">成局进度</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-ivory-300">
                        <span className="text-emerald-400 font-medium">{confirmedCount}</span>
                        <span className="text-ivory-500"> / {game.requiredPlayers} 人已确认</span>
                      </span>
                      <span className="text-ivory-400">{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-2.5 bg-theater-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${game.status === 'confirmed' ? 'bg-gradient-to-r from-gold-amber to-gold-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-1 mb-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400">已确认</span>
                      </div>
                      <p className="text-xl font-bold text-emerald-400">{confirmedCount}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-accent-500/10 border border-accent-500/20">
                      <div className="flex items-center gap-1 mb-1">
                        <UserX className="w-3.5 h-3.5 text-accent-500" />
                        <span className="text-xs text-accent-500">还差</span>
                      </div>
                      <p className="text-xl font-bold text-accent-500">{remaining}</p>
                    </div>
                  </div>

                  {game.status === 'confirmed' && (
                    <div className="mt-2 p-3 rounded-lg bg-gold-amber/15 border border-gold-amber/30 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gold-amber flex-shrink-0" />
                      <span className="text-sm font-medium text-gold-amber">已成局！准备开本吧~</span>
                    </div>
                  )}
                </div>
              </div>

              {isOriginalInvitee && game.permission === 'one-forward' && (
                <div className={`glass-card p-6 transition-all ${!forwardCheck.can ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus className={`w-4 h-4 ${forwardCheck.can ? 'text-gold-amber' : 'text-ivory-500'}`} />
                    <h3 className={`text-base font-semibold ${forwardCheck.can ? 'text-ivory-100' : 'text-ivory-500'}`}>带朋友加入</h3>
                  </div>

                  {showForwardSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 animate-fade-in">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-emerald-400">转邀成功！朋友已加入车局</span>
                    </div>
                  )}

                  {forwardCheck.can ? (
                    <div className="space-y-3">
                      <p className="text-xs text-ivory-400">
                        你可以带 1 位朋友加入本次车局，请填写朋友姓名：
                      </p>
                      <input
                        type="text"
                        value={friendName}
                        onChange={(e) => setFriendName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleForwardInvite())}
                        placeholder="请输入朋友姓名"
                        className="input-field py-2 text-sm"
                      />
                      <button
                        onClick={handleForwardInvite}
                        disabled={!friendName.trim()}
                        className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        登记转邀
                      </button>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-ivory-500">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>还可以带 1 位朋友</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-theater-700/50 border border-theater-600/40 flex items-start gap-2">
                        <X className="w-4 h-4 text-ivory-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-ivory-300 mb-0.5">转邀入口已关闭</p>
                          <p className="text-xs text-ivory-500">
                            {forwardCheck.reason ?? '暂不可转邀'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-ivory-500">
                        <span className="inline-block w-2 h-2 rounded-full bg-ivory-500"></span>
                        <span>转邀名额已用完</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-gold-amber" />
                  <h3 className="text-base font-semibold text-ivory-100">车头联系</h3>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-amber to-gold-500 flex items-center justify-center">
                    <span className="text-theater-900 font-bold">
                      {game.hostName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-ivory-100">{game.hostName}</p>
                    {game.contactInfo ? (
                      <p className="text-sm text-gold-amber">{game.contactInfo}</p>
                    ) : (
                      <p className="text-xs text-ivory-500">暂无联系方式</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const GameDashboard = ({ game, onConfirmGame }: { game: Game; onConfirmGame: () => void }) => {
  const confirmedList = game.invitees.filter((i) => i.status === 'confirmed');
  const tentativeList = game.invitees.filter((i) => i.status === 'tentative');
  const wantInList = game.invitees.filter((i) => i.status === 'want-in');
  const pendingList = game.invitees.filter((i) => i.status === 'pending');

  const confirmedCount = confirmedList.length;
  const remaining = Math.max(0, game.requiredPlayers - confirmedCount);
  const progressPct = Math.min((confirmedCount / game.requiredPlayers) * 100, 100);

  const roleRequirements = game.roleRequirements ?? [];
  const assignedRoles = game.invitees
    .filter((inv) => inv.role && inv.status === 'confirmed')
    .map((inv) => inv.role as string);
  const unfilledRoles = roleRequirements.filter((r) => !assignedRoles.includes(r));

  const statusGroups = [
    { key: 'confirmed', label: '已确认', list: confirmedList, color: 'emerald', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { key: 'tentative', label: '待定', list: tentativeList, color: 'amber', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { key: 'want-in', label: '想蹭车', list: wantInList, color: 'purple', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'pending', label: '未回应', list: pendingList, color: 'slate', icon: <UserX className="w-3.5 h-3.5" /> },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    slate: 'bg-theater-600/50 border-theater-500/40 text-ivory-400',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-amber/20 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-gold-amber" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ivory-100">成局看板</h2>
            <p className="text-sm text-ivory-400">
              已确认 <span className="text-emerald-400 font-medium">{confirmedCount}</span>/{game.requiredPlayers} 人
              {remaining > 0 && <span className="text-accent-500 ml-2">还差 {remaining} 人</span>}
              {remaining === 0 && <span className="text-emerald-400 ml-2">已满员 ✓</span>}
            </p>
          </div>
        </div>
        {game.status === 'recruiting' && confirmedCount >= game.requiredPlayers && (
          <button
            onClick={onConfirmGame}
            className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            确认成局
          </button>
        )}
        {game.status === 'confirmed' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-amber/15 border border-gold-amber/30">
            <CheckCircle className="w-4 h-4 text-gold-amber" />
            <span className="text-sm font-medium text-gold-amber">已成局</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ivory-400">成局进度</span>
          <span className="text-ivory-300">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-3 bg-theater-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${game.status === 'confirmed' ? 'bg-gradient-to-r from-gold-amber to-gold-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statusGroups.map((group) => (
          <div key={group.key} className={`p-3 rounded-xl border ${colorMap[group.color]}`}>
            <div className="flex items-center gap-1.5 mb-1">
              {group.icon}
              <span className="text-xs font-medium">{group.label}</span>
            </div>
            <p className="text-2xl font-bold">{group.list.length}</p>
            <div className="mt-1.5 space-y-0.5">
              {group.list.slice(0, 3).map((inv) => (
                <p key={inv.id} className="text-xs opacity-80 truncate">
                  {inv.name}{inv.role ? ` · ${inv.role}` : ''}
                </p>
              ))}
              {group.list.length > 3 && (
                <p className="text-xs opacity-50">+{group.list.length - 3} 更多</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {roleRequirements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ivory-300 mb-3">角色分配情况</h3>
          <div className="flex flex-wrap gap-2">
            {roleRequirements.map((role) => {
              const filled = assignedRoles.includes(role);
              const filler = game.invitees.find((inv) => inv.role === role && inv.status === 'confirmed');
              return (
                <div
                  key={role}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2
                    ${filled
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'bg-accent-500/10 border border-accent-500/25 text-accent-500'
                    }`}
                >
                  {filled ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  <span className="font-medium">{role}</span>
                  {filler && <span className="text-xs opacity-60">({filler.name})</span>}
                </div>
              );
            })}
          </div>
          {unfilledRoles.length > 0 && (
            <p className="text-xs text-accent-500 mt-2">
              ⚠ {unfilledRoles.length} 个角色尚无人接：{unfilledRoles.join('、')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
