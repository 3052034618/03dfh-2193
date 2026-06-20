import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { PasswordModal } from '@/components/PasswordModal';
import { SeatManager } from '@/components/SeatManager';
import { PlayerStatusSelector } from '@/components/PlayerStatusSelector';
import { StatusBadge } from '@/components/StatusBadge';
import type { PlayerStatus, VerifiedGameAccess } from '@/types';

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
  } = useGameStore();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [, forceUpdate] = useState(0);

  const game = useMemo(() => games.find((g) => g.id === gameId), [games, gameId]);

  const verifiedAccess: VerifiedGameAccess | null = useMemo(
    () => (gameId ? getVerifiedUserForGame(gameId) : null),
    [games, gameId, getVerifiedUserForGame, game],
  );

  const myInvitee = useMemo(
    () => (gameId ? getMyInviteeInGame(gameId) : null),
    [games, gameId, getMyInviteeInGame, game],
  );

  const isHostView = useMemo(
    () => !!verifiedAccess?.isHost && !!game && verifiedAccess.name === game.hostName,
    [verifiedAccess, game],
  );

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (game && !verifiedAccess) {
      setShowPasswordModal(true);
    } else if (verifiedAccess) {
      setShowPasswordModal(false);
    }
  }, [game, verifiedAccess]);

  const handlePasswordSubmit = (name: string, password: string) => {
    if (!game) return;

    const result = verifyAndEnterGame(game.id, name, password);

    if (result.success === false) {
      setPasswordError(result.error);
      return;
    }

    setPasswordError('');
    setShowPasswordModal(false);
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
    setShowPasswordModal(true);
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
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const firstSlot = game.timeSlots.find((ts) => ts.isSelected) || game.timeSlots[0];
  const confirmedCount = game.invitees.filter((i) => i.status === 'confirmed').length;
  const remaining = Math.max(0, game.requiredPlayers - confirmedCount);
  const progressPct = Math.min((confirmedCount / game.requiredPlayers) * 100, 100);

  const roleRequirements = game.roleRequirements ?? [];
  const assignedRoles = game.invitees
    .filter((inv) => inv.role && inv.status === 'confirmed')
    .map((inv) => inv.role as string);

  const unfilledRoles = roleRequirements.filter((r) => !assignedRoles.includes(r));

  const myRole = myInvitee?.role;
  const myStatus = myInvitee?.status;

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
                <div className="flex items-center gap-2 text-sm text-ivory-300">
                  <MapPin className="w-4 h-4 text-gold-amber flex-shrink-0" />
                  <span className="truncate">{game.store || '待定'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ivory-300">
                  <DollarSign className="w-4 h-4 text-gold-amber flex-shrink-0" />
                  <span>¥{game.price}/人</span>
                </div>
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
              <div className="text-xs text-ivory-500">
                权限模式：
                {game.permission === 'invite-only' ? (
                  <span className="text-ivory-400">仅受邀可进</span>
                ) : (
                  <span className="text-ivory-400">可转邀1位</span>
                )}
              </div>
            </div>
          </div>

          {firstSlot && (
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

          {game.notes && (
            <div className="mt-4 p-4 bg-theater-700/50 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gold-amber mt-0.5 flex-shrink-0" />
                <p className="text-sm text-ivory-300">{game.notes}</p>
              </div>
            </div>
          )}
        </div>

        {isHostView ? (
          <div className="animate-fade-in">
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
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
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
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-gold-amber" />
                  <h3 className="text-base font-semibold text-ivory-100">车头信息</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-amber to-gold-500 flex items-center justify-center">
                    <span className="text-theater-900 font-bold">
                      {game.hostName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-ivory-100">{game.hostName}</p>
                    <p className="text-xs text-ivory-500">有问题请联系车头</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 bg-gradient-to-br from-gold-amber/5 to-transparent border-gold-amber/20">
                <h3 className="text-base font-semibold text-ivory-100 mb-2">报名状态说明</h3>
                <ul className="text-xs text-ivory-400 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">能来</span>
                    <span>确定时间没问题，准时到场</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">待定</span>
                    <span>基本可以，等确认一下时间</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">想蹭车</span>
                    <span>时间不太稳，但很想参加</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <PasswordModal
        isOpen={showPasswordModal && !!game}
        onClose={() => navigate('/')}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
        title={`进入「${game?.title ?? '车局'}」`}
      />
    </div>
  );
};
