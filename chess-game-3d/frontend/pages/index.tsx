'use client';

import React, { useState, useEffect } from 'react';
import Authentication from '../components/Authentication';
import PlayerOptions from '../components/PlayerOptions';
import GameBoard from '../components/GameBoard';
import PuzzlePlayer from '../components/PuzzlePlayer';
import UserProfile from '../components/UserProfile';
import Leaderboard from '../components/Leaderboard';
import FriendsList from '../components/FriendsList';
import GameHistory from '../components/GameHistory';
import { useAuth } from '../hooks/useAuth';

type Page = 'auth' | 'menu' | 'game' | 'puzzle' | 'profile' | 'leaderboard' | 'friends' | 'history';

export default function Home() {
  const { isAuthenticated, user, login, register, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [theme, setTheme] = useState('classic');
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'pvc' | 'pvp' | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('menu');
    } else {
      setCurrentPage('auth');
    }
  }, [isAuthenticated]);

  const handleGameStart = async (mode: 'pvc' | 'pvp', difficulty?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/api/games/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ gameType: mode, difficulty: difficulty || 'medium' })
      });

      if (response.ok) {
        const game = await response.json();
        setGameId(game._id);
        setGameMode(mode);
        setCurrentPage('game');
      } else {
        alert('Failed to create game');
      }
    } catch (err) {
      alert('Error creating game');
    }
  };

  const handleGameEnd = () => {
    setGameId(null);
    setGameMode(null);
    setCurrentPage('menu');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      {isAuthenticated && (
        <div className="flex justify-between items-center p-6 bg-gray-800 shadow-lg border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-white">♟ Chess Game 3D</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-white font-bold">{user?.username}</p>
              <p className="text-yellow-400 font-bold">♟ {user?.rating || 1200}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar (for logged-in users) */}
      {isAuthenticated && currentPage !== 'game' && (
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex p-4 gap-4 max-w-7xl mx-auto">
            <button
              onClick={() => setCurrentPage('menu')}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === 'menu' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setCurrentPage('puzzle')}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === 'puzzle' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Puzzles
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === 'profile' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setCurrentPage('friends')}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === 'friends' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => setCurrentPage('leaderboard')}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === 'leaderboard' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === 'history' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              History
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Auth Page */}
        {currentPage === 'auth' && !isAuthenticated && (
          <Authentication onSuccess={() => {}} />
        )}

        {/* Menu Page */}
        {currentPage === 'menu' && isAuthenticated && (
          <div className="space-y-8">
            {/* Theme Selector */}
            <div className="flex justify-center gap-4">
              {['classic', 'blue', 'green', 'wood', 'dark'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg transition ${
                    theme === t ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Play Game Section */}
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Play Chess</h2>
              <PlayerOptions onSelectMode={handleGameStart} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm">Your Rating</p>
                <p className="text-3xl font-bold text-yellow-400">♟ {user?.rating || 1200}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm">Total Games</p>
                <p className="text-3xl font-bold text-white">{user?.stats?.totalGames || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-3xl font-bold text-green-400">
                  {user?.stats?.totalGames
                    ? ((user.stats.wins / user.stats.totalGames) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Game Page */}
        {currentPage === 'game' && gameId && user && (
          <GameBoard
            gameId={gameId}
            userId={user._id}
            onGameEnd={handleGameEnd}
            theme={theme}
          />
        )}

        {/* Puzzle Page */}
        {currentPage === 'puzzle' && (
          <div>
            <button
              onClick={() => setCurrentPage('menu')}
              className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
            <PuzzlePlayer />
          </div>
        )}

        {/* Profile Page */}
        {currentPage === 'profile' && user && (
          <div>
            <button
              onClick={() => setCurrentPage('menu')}
              className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
            <UserProfile userId={user._id} />
          </div>
        )}

        {/* Friends Page */}
        {currentPage === 'friends' && (
          <div>
            <button
              onClick={() => setCurrentPage('menu')}
              className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
            <FriendsList />
          </div>
        )}

        {/* Leaderboard Page */}
        {currentPage === 'leaderboard' && (
          <div>
            <button
              onClick={() => setCurrentPage('menu')}
              className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
            <Leaderboard />
          </div>
        )}

        {/* History Page */}
        {currentPage === 'history' && (
          <div>
            <button
              onClick={() => setCurrentPage('menu')}
              className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              ← Back
            </button>
            <GameHistory />
          </div>
        )}
      </div>
    </div>
  );
}
