import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Users, DollarSign, BookOpen, Crown, Lock, Info } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { PasswordModal } from '@/components/PasswordModal';
import { SeatManager } from '@/components/SeatManager';
import { PlayerStatusSelector } from '@/components/PlayerStatusSelector';
import { StatusBadge } from '@/components/StatusBadge';
import type { PlayerStatus } from '@/types';

export const GameDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGame, currentUser, setCurrentUser, verifyPassword, isNameInvited, updateInviteeStatus, init } = useGameStore();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHostView, setIsHostView] = useState(false);
  const [myInviteeId, setMyInviteeId] = useState<string | null>(null);

  const game = id ? getGame(id) : undefined;

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (game && currentUser) {
      const isHost = currentUser.isHost && currentUser.name === game.hostName;
      setIsHostView(isHost);
      
      if (!isHost) {
        const myInvitee = game.invitees.find((inv) => inv.name === currentUser.name);
        if (myInvitee) {
          setMyInviteeId(myInvitee.id);
        }
      }
    }
  }, [game, currentUser]);

  useEffect(() => {
    if (game && !currentUser) {
      setShowPasswordModal(true);
    }
  }, [game, currentUser]);

  const handlePasswordSubmit = (name: string, password: string) => {
    if (!game) return;

    if (!verifyPassword(game.id, password)) {
      setPasswordError('口令不正确，请重试');
      return;
    }

    if (game.permission === 'invite-only' && !isNameInvited(game.id, name) && name !== game.hostName) {
      setPasswordError('你不在邀请名单中，请联系车头添加');
      return;
    }

    const isHost = name === game.hostName;
    setCurrentUser(name, isHost);
    setPlayerName(name);
    setShowPasswordModal(false);
    setPasswordError('');

    if (!isHost && !isNameInvited(game.id, name)) {
      const { addInvitee } = useGameStore.getState();
      addInvitee(game.id, {
        name,
        gender: 'unknown',
        familiarity: 2,
        priority: 3,
        status: 'pending',
      });
    }

    if (!isHost) {
      const updatedGame = getGame(game.id);
      const myInvitee = updatedGame?.invitees.find((inv) => inv.name === name);
      if (myInvitee) {
        setMyInviteeId(myInvitee.id);
      }
    }

    setIsHostView(isHost);
  };

  const handleStatusChange = (status: PlayerStatus) => {
    if (!game || !myInviteeId) return;
    updateInviteeStatus(game.id, myInviteeId, status);
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
  const myInvitee = myInviteeId ? game.invitees.find((inv) => inv.id === myInviteeId) : null;
  const confirmedCount = game.invitees.filter((i) => i.status === 'confirmed').length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-ivory-400 hover:text-ivory-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回首页
        </button>

        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold heading-serif gold-text">
                  {game.title}
                </h1>
                <StatusBadge status={game.status} type="game" />
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
              {isHostView ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-amber/20 border border-gold-amber/30">
                  <Crown className="w-4 h-4 text-gold-amber" />
                  <span className="text-sm font-medium text-gold-amber">你是车头</span>
                </div>
              ) : (
                myInvitee && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ivory-400">我的状态：</span>
                    <StatusBadge status={myInvitee.status} type="player" />
                  </div>
                )
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theater-600/50">
                <Lock className="w-4 h-4 text-ivory-400" />
                <span className="text-sm text-ivory-400">
                  口令：<span className="font-mono text-gold-amber">{game.password}</span>
                </span>
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
                    （另有 {game.timeSlots.filter((ts) => !ts.isSelected).length} 个备选时间）
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isHostView ? (
            <div className="lg:col-span-3">
              <SeatManager game={game} />
            </div>
          ) : (
            <>
              <div className="lg:col-span-2">
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-ivory-100 mb-4">我的报名状态</h2>
                  {myInvitee ? (
                    <PlayerStatusSelector
                      currentStatus={myInvitee.status}
                      onChange={handleStatusChange}
                    />
                  ) : (
                    <p className="text-ivory-400">加载中...</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-ivory-100 mb-4">人数情况</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-ivory-300">已确认</span>
                        <span className="text-emerald-400 font-medium">{confirmedCount} 人</span>
                      </div>
                      <div className="h-2 bg-theater-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${(confirmedCount / game.requiredPlayers) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ivory-400">还需</span>
                      <span className="text-gold-amber font-medium">
                        {Math.max(0, game.requiredPlayers - confirmedCount)} 人
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-ivory-100 mb-4">报名名单</h2>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {game.invitees.map((invitee) => (
                      <div
                        key={invitee.id}
                        className="flex items-center justify-between py-2 border-b border-theater-600/30 last:border-0"
                      >
                        <span className="text-sm text-ivory-200">
                          {invitee.name}
                          {invitee.name === playerName && (
                            <span className="ml-2 text-xs text-gold-amber">（我）</span>
                          )}
                        </span>
                        <StatusBadge status={invitee.status} type="player" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => navigate('/')}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
        title={`进入「${game.title}」`}
      />
    </div>
  );
};
