import type { Game, CurrentUser } from '@/types';

const GAMES_KEY = 'jubentai_games';
const CURRENT_USER_KEY = 'jubentai_current_user';

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

export const saveCurrentUser = (user: CurrentUser): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save current user to localStorage', e);
  }
};

export const loadCurrentUser = (): CurrentUser | null => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load current user from localStorage', e);
  }
  return null;
};

export const clearCurrentUser = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {
    console.error('Failed to clear current user from localStorage', e);
  }
};
