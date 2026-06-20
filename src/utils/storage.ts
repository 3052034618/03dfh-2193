import type { Game, VerifiedGameAccess } from '@/types';

const GAMES_KEY = 'jubentai_games';
const VERIFIED_ACCESS_KEY = 'jubentai_verified_access';

export const saveGames = (games: Game[]): void => {
  try {
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  } catch (e) {
    console.error('Failed to save games to localStorage', e);
  }
};

export const loadGames = (): Game[] => {
  try {
    const data = localStorage.getItem(GAMES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load games from localStorage', e);
  }
  return [];
};

export const saveVerifiedAccess = (access: VerifiedGameAccess): void => {
  try {
    const all = loadAllVerifiedAccess();
    const filtered = all.filter((a) => !(a.gameId === access.gameId && a.name === access.name));
    filtered.push(access);
    localStorage.setItem(VERIFIED_ACCESS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save verified access to localStorage', e);
  }
};

export const loadAllVerifiedAccess = (): VerifiedGameAccess[] => {
  try {
    const data = localStorage.getItem(VERIFIED_ACCESS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load verified access from localStorage', e);
  }
  return [];
};

export const getVerifiedAccessForGame = (gameId: string): VerifiedGameAccess[] => {
  return loadAllVerifiedAccess().filter((a) => a.gameId === gameId);
};

export const isVerifiedForGame = (gameId: string, name: string): VerifiedGameAccess | null => {
  const all = loadAllVerifiedAccess();
  return all.find((a) => a.gameId === gameId && a.name === name) || null;
};

export const clearVerifiedAccessForGame = (gameId: string): void => {
  try {
    const all = loadAllVerifiedAccess();
    const filtered = all.filter((a) => a.gameId !== gameId);
    localStorage.setItem(VERIFIED_ACCESS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to clear verified access from localStorage', e);
  }
};

export const getLatestVerifiedForGame = (gameId: string): VerifiedGameAccess | null => {
  const list = getVerifiedAccessForGame(gameId);
  if (list.length === 0) return null;
  return list.sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime())[0];
};
