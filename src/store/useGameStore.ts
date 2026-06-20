import { create } from 'zustand';
import type { Game, Invitee, CreateGameData, CurrentUser, PlayerStatus, TimeSlot } from '@/types';
import { generateId } from '@/utils/idGenerator';
import { saveGames, loadGames, saveCurrentUser, loadCurrentUser } from '@/utils/storage';

interface GameStore {
  games: Game[];
  currentUser: CurrentUser | null;
  
  init: () => void;
  
  createGame: (data: CreateGameData) => Game;
  updateGame: (id: string, data: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  getGame: (id: string) => Game | undefined;
  
  addInvitee: (gameId: string, invitee: Omit<Invitee, 'id' | 'gameId' | 'seatOrder'>) => void;
  removeInvitee: (gameId: string, inviteeId: string) => void;
  updateInvitee: (gameId: string, inviteeId: string, data: Partial<Invitee>) => void;
  reorderInvitees: (gameId: string, inviteeIds: string[]) => void;
  updateInviteeStatus: (gameId: string, inviteeId: string, status: PlayerStatus) => void;
  
  setCurrentUser: (name: string, isHost: boolean) => void;
  verifyPassword: (gameId: string, password: string) => boolean;
  isNameInvited: (gameId: string, name: string) => boolean;
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
    timeSlots: [
      { id: 'ts-1', date: '2026-06-22', time: '19:00', isSelected: true },
      { id: 'ts-2', date: '2026-06-23', time: '19:30', isSelected: false },
    ],
    invitees: [
      { id: 'inv-1', gameId: 'mock-1', name: '小红', gender: 'female', familiarity: 5, priority: 1, status: 'confirmed', seatOrder: 0, role: '侦探' },
      { id: 'inv-2', gameId: 'mock-1', name: '阿强', gender: 'male', familiarity: 4, priority: 2, status: 'confirmed', seatOrder: 1, role: '嫌疑人A' },
      { id: 'inv-3', gameId: 'mock-1', name: '美美', gender: 'female', familiarity: 3, priority: 3, status: 'tentative', seatOrder: 2 },
      { id: 'inv-4', gameId: 'mock-1', name: '大壮', gender: 'male', familiarity: 4, priority: 2, status: 'want-in', seatOrder: 3 },
      { id: 'inv-5', gameId: 'mock-1', name: '小丽', gender: 'female', familiarity: 5, priority: 1, status: 'pending', seatOrder: 4 },
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
    timeSlots: [
      { id: 'ts-3', date: '2026-06-25', time: '14:00', isSelected: true },
    ],
    invitees: [
      { id: 'inv-6', gameId: 'mock-2', name: '阿杰', gender: 'male', familiarity: 5, priority: 1, status: 'confirmed', seatOrder: 0 },
      { id: 'inv-7', gameId: 'mock-2', name: '小雪', gender: 'female', familiarity: 4, priority: 2, status: 'confirmed', seatOrder: 1 },
    ],
  },
];

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  currentUser: null,

  init: () => {
    const savedGames = loadGames();
    const savedUser = loadCurrentUser();
    
    if (savedGames.length > 0) {
      set({ games: savedGames, currentUser: savedUser });
    } else {
      set({ games: mockGames, currentUser: savedUser });
      saveGames(mockGames);
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
      timeSlots: data.timeSlots.map((ts) => ({ ...ts, id: generateId() })),
      invitees: data.invitees.map((inv, index) => ({
        ...inv,
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
        game.id === id ? { ...game, ...data } : game
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

  addInvitee: (gameId: string, invitee: Omit<Invitee, 'id' | 'gameId' | 'seatOrder'>) => {
    set((state) => {
      const newGames = state.games.map((game) => {
        if (game.id !== gameId) return game;
        const newInvitee: Invitee = {
          ...invitee,
          id: generateId(),
          gameId,
          seatOrder: game.invitees.length,
        };
        return { ...game, invitees: [...game.invitees, newInvitee] };
      });
      saveGames(newGames);
      return { games: newGames };
    });
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
            inv.id === inviteeId ? { ...inv, ...data } : inv
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
        const reordered = inviteeIds.map((id, index) => {
          const invitee = game.invitees.find((inv) => inv.id === id);
          return invitee ? { ...invitee, seatOrder: index } : null;
        }).filter(Boolean) as Invitee[];
        
        const remaining = game.invitees.filter(
          (inv) => !inviteeIds.includes(inv.id)
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

  setCurrentUser: (name: string, isHost: boolean) => {
    const user: CurrentUser = { name, isHost };
    set({ currentUser: user });
    saveCurrentUser(user);
  },

  verifyPassword: (gameId: string, password: string) => {
    const game = get().getGame(gameId);
    return game?.password === password;
  },

  isNameInvited: (gameId: string, name: string) => {
    const game = get().getGame(gameId);
    if (!game) return false;
    return game.invitees.some((inv) => inv.name === name);
  },
}));
