export type GameStatus = 'recruiting' | 'confirmed' | 'finished';

export type PermissionMode = 'invite-only' | 'one-forward';

export type PlayerStatus = 'pending' | 'confirmed' | 'tentative' | 'want-in';

export type Gender = 'male' | 'female' | 'unknown';

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isSelected: boolean;
}

export interface Invitee {
  id: string;
  gameId: string;
  name: string;
  gender: Gender;
  familiarity: number;
  priority: number;
  status: PlayerStatus;
  role?: string;
  seatOrder: number;
  note?: string;
}

export interface Game {
  id: string;
  title: string;
  type: string;
  duration: number;
  store: string;
  price: number;
  password: string;
  permission: PermissionMode;
  hostName: string;
  status: GameStatus;
  createdAt: string;
  notes?: string;
  timeSlots: TimeSlot[];
  invitees: Invitee[];
  requiredPlayers: number;
}

export interface CreateGameData {
  title: string;
  type: string;
  duration: number;
  store: string;
  price: number;
  password: string;
  permission: PermissionMode;
  hostName: string;
  notes?: string;
  timeSlots: Omit<TimeSlot, 'id'>[];
  invitees: Omit<Invitee, 'id' | 'gameId' | 'seatOrder'>[];
  requiredPlayers: number;
}

export interface CurrentUser {
  name: string;
  isHost: boolean;
}
