import { create } from 'zustand';
import type { Game, Invitee, CreateGameData, PlayerStatus, VerifiedGameAccess } from '@/types';
import { generateId } from '@/utils/idGenerator';
import {
  saveGames,
  loadGames,
  saveVerifiedAccess,
  isVerifiedForGame,
  getLatestVerifiedForGame,
  clearVerifiedAccessForGame,
} from '@/utils/storage';

export type VerifyResult =
  | { success: true; isHost: boolean; isNewInvitee: boolean; invitee: Invitee | null }
  | { success: false; error: string };

interface GameStore {
  games: Game[];

  init: () => void;

  createGame: (data: CreateGameData) => Game;
  updateGame: (id: string, data: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  getGame: (id: string) => Game | undefined;

  addInvitee: (
    gameId: string,
    invitee: Omit<Invitee, 'id' | 'gameId' | 'seatOrder' | 'reminderCount' | 'lastReminderAt'>,
  ) => Invitee;
  removeInvitee: (gameId: string, inviteeId: string) => void;
  updateInvitee: (gameId: string, inviteeId: string, data: Partial<Invitee>) => void;
  reorderInvitees: (gameId: string, inviteeIds: string[]) => void;
  updateInviteeStatus: (gameId: string, inviteeId: string, status: PlayerStatus) => void;

  sendReminder: (gameId: string, inviteeId: string) => void;
  sendBulkReminders: (gameId: string, filterStatus?: PlayerStatus[]) => number;

  verifyAndEnterGame: (gameId: string, name: string, password: string) => VerifyResult;
  getVerifiedUserForGame: (gameId: string) => VerifiedGameAccess | null;
  getMyInviteeInGame: (gameId: string) => Invitee | null;
  clearMyGameAccess: (gameId: string) => void;
  getInviteeByName: (gameId: string, name: string) => Invitee | undefined;
  getForwardedCountByInviter: (gameId: string, inviterName: string) => number;
  canForwardInvite: (gameId: string, inviterName: string) => { can: boolean; reason?: string };
}

const mockGames: Game[] = [
  {
    id: 'mock-1',
    title: '《月光下的谋杀案》',
    type: '硬核推理',
    duration: 5,
    store: '迷雾推理社',
    price: 128,
    password: '1234',
    permission: 'invite-only',
    hostName: '阿明',
    status: 'recruiting',
    createdAt: new Date().toISOString(),
    notes: '本周六晚，记得带脑子来',
    requiredPlayers: 6,
    roleRequirements: ['侦探', '嫌疑人A', '嫌疑人B', '死者家属', '警察', '神秘人'],
    timeSlots: [
      { id: 'ts-1', date: '2026-06-22', time: '19:00', isSelected: true },
      { id: 'ts-2', date: '2026-06-23', time: '19:30', isSelected: false },
    ],
    invitees: [
      { id: 'inv-1', gameId: 'mock-1', name: '小红', gender: 'female', familiarity: 5, priority: 1, status: 'confirmed', seatOrder: 0, role: '侦探', reminderCount: 0 },
      { id: 'inv-2', gameId: 'mock-1', name: '阿强', gender: 'male', familiarity: 4, priority: 2, status: 'confirmed', seatOrder: 1, role: '嫌疑人A', reminderCount: 0 },
      { id: 'inv-3', gameId: 'mock-1', name: '美美', gender: 'female', familiarity: 3, priority: 3, status: 'tentative', seatOrder: 2, reminderCount: 1, lastReminderAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'inv-4', gameId: 'mock-1', name: '大壮', gender: 'male', familiarity: 4, priority: 2, status: 'want-in', seatOrder: 3, reminderCount: 0 },
      { id: 'inv-5', gameId: 'mock-1', name: '小丽', gender: 'female', familiarity: 5, priority: 1, status: 'pending', seatOrder: 4, reminderCount: 2, lastReminderAt: new Date(Date.now() - 7200000).toISOString() },
    ],
  },
  {
    id: 'mock-2',
    title: '《古风：长安异闻录》',
    type: '情感沉浸',
    duration: 4.5,
    store: '如梦令剧本馆',
    price: 168,
    password: '5678',
    permission: 'one-forward',
    hostName: '小薇',
    status: 'recruiting',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: '需要哭戏好的玩家',
    requiredPlayers: 7,
    roleRequirements: ['太子', '公主', '将军', '丞相', '侠女', '诗人', '太医'],
    timeSlots: [
      { id: 'ts-3', date: '2026-06-25', time: '14:00', isSelected: true },
    ],
    invitees: [
      { id: 'inv-6', gameId: 'mock-2', name: '阿杰', gender: 'male', familiarity: 5, priority: 1, status: 'confirmed', seatOrder: 0, reminderCount: 0 },
      { id: 'inv-7', gameId: 'mock-2', name: '小雪', gender: 'female', familiarity: 4, priority: 2, status: 'confirmed', seatOrder: 1, reminderCount: 0 },
    ],
  },
];

const withReminderDefaults = <
  T extends Partial<Omit<Invitee, 'id' | 'gameId' | 'seatOrder'>>,
>(
  inv: T,
): Omit<Invitee, 'id' | 'gameId' | 'seatOrder'> => ({
  name: inv.name!,
  gender: inv.gender ?? 'unknown',
  familiarity: inv.familiarity ?? 3,
  priority: inv.priority ?? 3,
  status: inv.status ?? 'pending',
  role: inv.role,
  note: inv.note,
  reminderCount: inv.reminderCount ?? 0,
  lastReminderAt: inv.lastReminderAt,
  invitedById: inv.invitedById,
});

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],

  init: () => {
    const savedGames = loadGames();

    const normalizeGames = (games: Game[]): Game[] =>
      games.map((g) => ({
        ...g,
        roleRequirements: g.roleRequirements ?? [],
        invitees: g.invitees.map((inv) => ({
          ...inv,
          reminderCount: inv.reminderCount ?? 0,
        })),
      }));

    if (savedGames.length > 0) {
      set({ games: normalizeGames(savedGames) });
    } else {
      const normalized = normalizeGames(mockGames);
      set({ games: normalized });
      saveGames(normalized);
    }
  },

  createGame: (data: CreateGameData) => {
    const newGame: Game = {
      id: generateId(),
      title: data.title,
      type: data.type,
      duration: data.duration,
      store: data.store,
      price: data.price,
      password: data.password,
      permission: data.permission,
      hostName: data.hostName,
      status: 'recruiting',
      createdAt: new Date().toISOString(),
      notes: data.notes,
      requiredPlayers: data.requiredPlayers,
      roleRequirements: data.roleRequirements ?? [],
      timeSlots: data.timeSlots.map((ts) => ({ ...ts, id: generateId() })),
      invitees: data.invitees.map((inv, index) => ({
        ...withReminderDefaults(inv),
        id: generateId(),
        gameId: '',
        seatOrder: index,
      })),
    };

    newGame.invitees = newGame.invitees.map((inv) => ({ ...inv, gameId: newGame.id }));

    set((state) => {
      const newGames = [...state.games, newGame];
      saveGames(newGames);
      return { games: newGames };
    });

    return newGame;
  },

  updateGame: (id: string, data: Partial<Game>) => {
    set((state) => {
      const newGames = state.games.map((game) =>
        game.id === id ? { ...game, ...data } : game,
      );
      saveGames(newGames);
      return { games: newGames };
    });
  },

  deleteGame: (id: string) => {
    set((state) => {
      const newGames = state.games.filter((game) => game.id !== id);
      saveGames(newGames);
      return { games: newGames };
    });
  },

  getGame: (id: string) => {
    return get().games.find((game) => game.id === id);
  },

  addInvitee: (gameId, invitee) => {
    let createdInvitee: Invitee | null = null;

    set((state) => {
      const newGames = state.games.map((game) => {
        if (game.id !== gameId) return game;
        createdInvitee = {
          ...withReminderDefaults(invitee),
          id: generateId(),
          gameId,
          seatOrder: game.invitees.length,
        } as Invitee;
        return { ...game, invitees: [...game.invitees, createdInvitee!] };
      });
      saveGames(newGames);
      return { games: newGames };
    });

    return createdInvitee!;
  },

  removeInvitee: (gameId: string, inviteeId: string) => {
    set((state) => {
      const newGames = state.games.map((game) => {
        if (game.id !== gameId) return game;
        return { ...game, invitees: game.invitees.filter((inv) => inv.id !== inviteeId) };
      });
      saveGames(newGames);
      return { games: newGames };
    });
  },

  updateInvitee: (gameId: string, inviteeId: string, data: Partial<Invitee>) => {
    set((state) => {
      const newGames = state.games.map((game) => {
        if (game.id !== gameId) return game;
        return {
          ...game,
          invitees: game.invitees.map((inv) =>
            inv.id === inviteeId ? { ...inv, ...data } : inv,
          ),
        };
      });
      saveGames(newGames);
      return { games: newGames };
    });
  },

  reorderInvitees: (gameId: string, inviteeIds: string[]) => {
    set((state) => {
      const newGames = state.games.map((game) => {
        if (game.id !== gameId) return game;
        const reordered = inviteeIds
          .map((id, index) => {
            const invitee = game.invitees.find((inv) => inv.id === id);
            return invitee ? { ...invitee, seatOrder: index } : null;
          })
          .filter(Boolean) as Invitee[];

        const remaining = game.invitees.filter(
          (inv) => !inviteeIds.includes(inv.id),
        );

        return { ...game, invitees: [...reordered, ...remaining] };
      });
      saveGames(newGames);
      return { games: newGames };
    });
  },

  updateInviteeStatus: (gameId: string, inviteeId: string, status: PlayerStatus) => {
    get().updateInvitee(gameId, inviteeId, { status });
  },

  sendReminder: (gameId: string, inviteeId: string) => {
    set((state) => {
      const newGames = state.games.map((game) => {
        if (game.id !== gameId) return game;
        return {
          ...game,
          invitees: game.invitees.map((inv) =>
            inv.id === inviteeId
              ? {
                  ...inv,
                  reminderCount: (inv.reminderCount ?? 0) + 1,
                  lastReminderAt: new Date().toISOString(),
                }
              : inv,
          ),
        };
      });
      saveGames(newGames);
      return { games: newGames };
    });
  },

  sendBulkReminders: (gameId: string, filterStatus?: PlayerStatus[]) => {
    let count = 0;
    set((state) => {
      const newGames = state.games.map((game) => {
        if (game.id !== gameId) return game;
        return {
          ...game,
          invitees: game.invitees.map((inv) => {
            const shouldRemind =
              !filterStatus || filterStatus.includes(inv.status);
            if (shouldRemind && inv.status !== 'confirmed') {
              count++;
              return {
                ...inv,
                reminderCount: (inv.reminderCount ?? 0) + 1,
                lastReminderAt: new Date().toISOString(),
              };
            }
            return inv;
          }),
        };
      });
      saveGames(newGames);
      return { games: newGames };
    });
    return count;
  },

  verifyAndEnterGame: (gameId, name, password): VerifyResult => {
    const game = get().getGame(gameId);
    if (!game) {
      return { success: false, error: '车局不存在' };
    }

    if (game.password !== password) {
      return { success: false, error: '口令不正确，请重试' };
    }

    const isHost = name === game.hostName;

    let existingInvitee = game.invitees.find((inv) => inv.name === name);
    const isOriginalInvitee = !!existingInvitee;

    if (game.permission === 'invite-only') {
      if (!isHost && !isOriginalInvitee) {
        return {
          success: false,
          error: '本车局为私密邀请制，你不在邀请名单中，请联系车头添加',
        };
      }
    } else if (game.permission === 'one-forward') {
      if (!isHost && !isOriginalInvitee) {
        return {
          success: false,
          error: '本模式下需由受邀玩家转邀，请让熟人在车头处登记转邀信息',
        };
      }
    }

    const access: VerifiedGameAccess = {
      gameId,
      name,
      isHost,
      accessedAt: new Date().toISOString(),
    };
    saveVerifiedAccess(access);

    return {
      success: true,
      isHost,
      isNewInvitee: false,
      invitee: existingInvitee ?? null,
    };
  },

  getVerifiedUserForGame: (gameId) => {
    return getLatestVerifiedForGame(gameId);
  },

  getMyInviteeInGame: (gameId: string) => {
    const verified = getLatestVerifiedForGame(gameId);
    if (!verified) return null;
    const game = get().getGame(gameId);
    if (!game) return null;
    return game.invitees.find((inv) => inv.name === verified.name) ?? null;
  },

  clearMyGameAccess: (gameId: string) => {
    clearVerifiedAccessForGame(gameId);
  },

  getInviteeByName: (gameId: string, name: string) => {
    const game = get().getGame(gameId);
    return game?.invitees.find((inv) => inv.name === name);
  },

  getForwardedCountByInviter: (gameId: string, inviterName: string) => {
    const game = get().getGame(gameId);
    if (!game) return 0;
    const inviter = game.invitees.find((inv) => inv.name === inviterName);
    if (!inviter) return 0;
    return game.invitees.filter((inv) => inv.invitedById === inviter.id).length;
  },

  canForwardInvite: (gameId: string, inviterName: string) => {
    const game = get().getGame(gameId);
    if (!game) return { can: false, reason: '车局不存在' };
    if (game.permission !== 'one-forward') {
      return { can: false, reason: '本模式下不可转邀' };
    }
    if (inviterName === game.hostName) {
      return { can: false, reason: '车头不需要转邀' };
    }
    const inviter = game.invitees.find((inv) => inv.name === inviterName);
    if (!inviter) {
      return { can: false, reason: '你不在邀请名单中' };
    }
    if (inviter.invitedById) {
      return { can: false, reason: '你是由朋友转邀进入的，不能再继续转邀他人' };
    }
    const count = get().getForwardedCountByInviter(gameId, inviterName);
    if (count >= 1) {
      return { can: false, reason: '你的转邀名额已用完（每位受邀玩家最多带1位朋友）' };
    }
    return { can: true };
  },
}));
