import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

/**
 * API Client for Chess Game 3D Frontend
 */

// Axios instance with auth
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.io instance
let socket: ReturnType<typeof io> | null = null;

export const initSocket = (userId: string) => {
  if (!socket) {
    socket = io(WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      socket?.emit('user-connect', userId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  return socket;
};

/**
 * Authentication API
 */
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    apiClient.post('/api/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password })
};

/**
 * Users API
 */
export const usersAPI = {
  getProfile: (userId: string) =>
    apiClient.get(`/api/users/${userId}`),

  getCurrentProfile: () =>
    apiClient.get('/api/users/profile/me'),

  searchUsers: (query: string) =>
    apiClient.get(`/api/users/search/${query}`),

  getLeaderboard: (limit = 50, offset = 0) =>
    apiClient.get('/api/users/leaderboard/top', { params: { limit, offset } }),

  updateProfile: (avatar: string, bio: string) =>
    apiClient.put('/api/users/profile/update', { avatar, bio }),

  getFriendsLis: () =>
    apiClient.get('/api/users/friends/list'),

  getPendingFriendRequests: () =>
    apiClient.get('/api/users/friend-requests/pending'),

  sendFriendRequest: (targetUserId: string) =>
    apiClient.post('/api/users/friend-request/send', { targetUserId }),

  acceptFriendRequest: (fromUserId: string) =>
    apiClient.post('/api/users/friend-request/accept', { fromUserId }),

  declineFriendRequest: (fromUserId: string) =>
    apiClient.post('/api/users/friend-request/decline', { fromUserId }),

  removeFriend: (friendUserId: string) =>
    apiClient.post('/api/users/friend/remove', { friendUserId }),

  getUserStats: (userId: string) =>
    apiClient.get(`/api/users/stats/${userId}`)
};

/**
 * Games API
 */
export const gamesAPI = {
  createGame: (gameType: string, difficulty?: string, timeControl?: number, theme?: string, opponentId?: string) =>
    apiClient.post('/api/games/create', {
      gameType,
      difficulty,
      timeControl,
      theme,
      opponentId
    }),

  getGame: (gameId: string) =>
    apiClient.get(`/api/games/${gameId}`),

  makeMove: (gameId: string, from: string, to: string, promotion?: string) =>
    apiClient.post(`/api/games/${gameId}/move`, {
      from,
      to,
      promotion
    }),

  getLegalMoves: (gameId: string, square: string) =>
    apiClient.get(`/api/games/${gameId}/legal-moves/${square}`),

  endGame: (gameId: string, result: string) =>
    apiClient.post(`/api/games/${gameId}/end`, { result }),

  getGameHistory: (userId: string) =>
    apiClient.get(`/api/games/history/${userId}`),

  getGameStats: (userId: string) =>
    apiClient.get(`/api/games/stats/${userId}`)
};

/**
 * Puzzles API
 */
export const puzzlesAPI = {
  getDailyPuzzle: () =>
    apiClient.get('/api/puzzles/daily'),

  getPuzzlesByDifficulty: (difficulty: string, limit = 20, offset = 0) =>
    apiClient.get(`/api/puzzles/by-difficulty/${difficulty}`, { params: { limit, offset } }),

  getPuzzlesByTheme: (theme: string, limit = 20, offset = 0) =>
    apiClient.get(`/api/puzzles/by-theme/${theme}`, { params: { limit, offset } }),

  getMatchedPuzzles: (limit = 10) =>
    apiClient.get('/api/puzzles/matched/byrating', { params: { limit } }),

  getPuzzle: (puzzleId: string) =>
    apiClient.get(`/api/puzzles/${puzzleId}`),

  getPuzzleSolution: (puzzleId: string) =>
    apiClient.get(`/api/puzzles/${puzzleId}/solution`),

  submitPuzzle: (puzzleId: string, moves: any[]) =>
    apiClient.post(`/api/puzzles/${puzzleId}/submit`, { moves }),

  getPuzzleHint: (puzzleId: string) =>
    apiClient.get(`/api/puzzles/${puzzleId}/hint`),

  getPuzzlesStats: () =>
    apiClient.get('/api/puzzles/stats/overview'),

  searchPuzzles: (query: string, limit = 10) =>
    apiClient.get(`/api/puzzles/search/${query}`, { params: { limit } })
};

/**
 * WebSocket Events
 */
export const socketEvents = {
  // Connection
  onConnect: (callback: () => void) => socket?.on('connect', callback),
  onDisconnect: (callback: () => void) => socket?.on('disconnect', callback),
  onConnectionConfirmed: (callback: (data: any) => void) => socket?.on('connection-confirmed', callback),

  // Game
  joinGame: (gameId: string, userId: string) => socket?.emit('join-game', { gameId, userId }),
  onPlayerJoined: (callback: (data: any) => void) => socket?.on('player-joined', callback),

  // Invitations
  inviteGame: (to: string, gameId: string, gameName?: string) =>
    socket?.emit('invite-game', { to, gameId, gameName }),
  onGameInvitation: (callback: (data: any) => void) => socket?.on('game-invitation', callback),
  acceptInvitation: (gameId: string, userId: string) =>
    socket?.emit('accept-invitation', { gameId, userId }),
  declineInvitation: (from: string, to: string, gameId: string) =>
    socket?.emit('decline-invitation', { from, to, gameId }),
  onInvitationAccepted: (callback: (data: any) => void) => socket?.on('invitation-accepted', callback),
  onInvitationDeclined: (callback: (data: any) => void) => socket?.on('invitation-declined', callback),

  // Moves
  makeMove: (gameId: string, from: string, to: string, promotion?: string, userId?: string) =>
    socket?.emit('move', { gameId, from, to, promotion, userId }),
  onOpponentMove: (callback: (move: any) => void) => socket?.on('opponent-move', callback),
  onMoveSuccess: (callback: (data: any) => void) => socket?.on('move-success', callback),
  onMoveInvalid: (callback: (error: any) => void) => socket?.on('move-invalid', callback),

  // Legal Moves
  getLegalMovesSocket: (gameId: string, square: string) =>
    socket?.emit('get-legal-moves', { gameId, square }),
  onLegalMoves: (callback: (data: any) => void) => socket?.on('legal-moves', callback),

  // Timer
  onTimeUpdate: (callback: (data: any) => void) => socket?.on('time-update', callback),
  onTimeExpired: (callback: (data: any) => void) => socket?.on('time-expired', callback),

  // Chat
  sendMessage: (gameId: string, message: string, sender: string) =>
    socket?.emit('chat-message', { gameId, message, sender }),
  onNewMessage: (callback: (data: any) => void) => socket?.on('new-message', callback),

  // Draw & Resignation
  requestDraw: (gameId: string, from: string) =>
    socket?.emit('request-draw', { gameId, from }),
  onDrawRequested: (callback: (data: any) => void) => socket?.on('draw-requested', callback),
  acceptDraw: (gameId: string) => socket?.emit('accept-draw', { gameId }),
  resign: (gameId: string, userId: string) => socket?.emit('resign', { gameId, userId }),

  // Game End
  onGameEnded: (callback: (data: any) => void) => socket?.on('game-ended', callback),

  // AI Move
  onAIMove: (callback: (move: any) => void) => socket?.on('ai-move', callback),

  // Error
  onError: (callback: (error: any) => void) => socket?.on('error', callback),

  // Leave
  leaveGame: (gameId: string) => socket?.emit('leave-game', { gameId })
};

export default {
  apiClient,
  initSocket,
  authAPI,
  usersAPI,
  gamesAPI,
  puzzlesAPI,
  socketEvents
};
