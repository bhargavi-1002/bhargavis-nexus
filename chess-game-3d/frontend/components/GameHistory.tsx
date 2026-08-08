import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface GameRecord {
  _id: string;
  players: Array<{ username: string }>;
  result: string;
  moves: Array<{ from: string; to: string }>;
  createdAt: string;
  timeControl: string;
}

const GameHistory: React.FC = () => {
  const { data, isLoading, error, get } = useApi();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!)?._id : null;
      if (userId) {
        const result = await get(`/api/games/history/${userId}`);
        if (result.success) {
          setGames(result.data);
        }
      }
    };

    fetchHistory();
  }, [get]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Game History</h2>

      {isLoading && <div className="text-gray-400">Loading games...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="flex gap-6">
        {/* Games List */}
        <div className="flex-1">
          <div className="space-y-2">
            {games.length === 0 ? (
              <p className="text-gray-400">No games yet</p>
            ) : (
              games.map((game) => (
                <div
                  key={game._id}
                  onClick={() => setSelectedGame(game)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedGame?._id === game._id ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{game.players[0].username} vs {game.players[1].username}</p>
                      <p className="text-sm text-gray-400">{formatDate(game.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-300">{game.result}</p>
                      <p className="text-sm text-gray-400">{game.timeControl}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Game Details */}
        {selectedGame && (
          <div className="w-80 bg-gray-700 p-4 rounded-lg">
            <h3 className="font-bold mb-4">Game Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-400">White</p>
                <p className="font-bold">{selectedGame.players[0].username}</p>
              </div>
              <div>
                <p className="text-gray-400">Black</p>
                <p className="font-bold">{selectedGame.players[1].username}</p>
              </div>
              <div>
                <p className="text-gray-400">Result</p>
                <p className="font-bold">{selectedGame.result}</p>
              </div>
              <div>
                <p className="text-gray-400">Time Control</p>
                <p className="font-bold">{selectedGame.timeControl}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Moves ({selectedGame.moves.length})</p>
                <div className="bg-gray-600 p-2 rounded text-xs max-h-40 overflow-y-auto">
                  {selectedGame.moves.map((move, idx) => (
                    <span key={idx} className="mr-2">
                      {idx % 2 === 0 && <span className="text-gray-400">{Math.floor(idx / 2) + 1}.</span>} {move.from}-{move.to}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
