import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface LeaderboardEntry {
  rank: number;
  username: string;
  rating: number;
  wins: number;
  losses: number;
}

const Leaderboard: React.FC = () => {
  const { data, isLoading, error, get } = useApi();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const result = await get('/api/users/leaderboard/top');
      if (result.success) {
        setLeaderboard(result.data);
      }
    };

    fetchLeaderboard();
  }, [get]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Global Leaderboard</h2>

      {isLoading && <div className="text-gray-400">Loading leaderboard...</div>}
      {error && <div className="text-red-500">Error loading leaderboard: {error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-white text-sm">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2 text-right">Rating</th>
              <th className="px-4 py-2 text-right">Wins</th>
              <th className="px-4 py-2 text-right">Losses</th>
              <th className="px-4 py-2 text-right">W/L Ratio</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700 transition">
                <td className="px-4 py-2">
                  <span className="font-bold text-yellow-400">#{entry.rank}</span>
                </td>
                <td className="px-4 py-2">{entry.username}</td>
                <td className="px-4 py-2 text-right font-bold">{entry.rating}</td>
                <td className="px-4 py-2 text-right text-green-400">{entry.wins}</td>
                <td className="px-4 py-2 text-right text-red-400">{entry.losses}</td>
                <td className="px-4 py-2 text-right">
                  {entry.losses > 0 ? (entry.wins / entry.losses).toFixed(2) : entry.wins > 0 ? '∞' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
