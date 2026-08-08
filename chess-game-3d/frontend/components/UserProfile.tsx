import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface UserProfileProps {
  userId?: string;
}

interface UserStats {
  username: string;
  rating: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  avatar?: string;
  bio?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { data, isLoading, error, get } = useApi();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const endpoint = userId ? `/api/users/stats/${userId}` : '/api/users/profile/me';
      const result = await get(endpoint);
      if (result.success) {
        setStats(result.data);
      }
    };

    fetchStats();
  }, [userId, get]);

  if (isLoading) return <div className="text-gray-400">Loading profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return <div className="text-gray-400">Profile not found</div>;

  const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      <div className="flex gap-6">
        {stats.avatar && (
          <img src={stats.avatar} alt={stats.username} className="w-24 h-24 rounded-lg" />
        )}

        <div className="flex-1">
          <h2 className="text-3xl font-bold">{stats.username}</h2>
          <p className="text-yellow-400 text-2xl font-bold">♟ {stats.rating}</p>
          {stats.bio && <p className="text-gray-400 mt-2">{stats.bio}</p>}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Total Games</p>
              <p className="text-2xl font-bold">{stats.totalGames}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold">{winRate}%</p>
            </div>
            <div className="bg-green-900 p-4 rounded-lg">
              <p className="text-gray-300 text-sm">Wins</p>
              <p className="text-2xl font-bold text-green-300">{stats.wins}</p>
            </div>
            <div className="bg-red-900 p-4 rounded-lg">
              <p className="text-gray-300 text-sm">Losses</p>
              <p className="text-2xl font-bold text-red-300">{stats.losses}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg col-span-2">
              <p className="text-gray-400 text-sm">Draws</p>
              <p className="text-2xl font-bold">{stats.draws}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
