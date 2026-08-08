import React, { useState } from 'react';

interface PlayerOptionsProps {
  onSelectMode: (mode: 'pvc' | 'pvp', difficulty?: string) => void;
}

const PlayerOptions: React.FC<PlayerOptionsProps> = ({ onSelectMode }) => {
  const [selectedMode, setSelectedMode] = useState<'pvc' | 'pvp' | null>(null);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Chess Game</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Play vs Computer */}
        <div
          className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg cursor-pointer hover:shadow-lg transition"
          onClick={() => setSelectedMode('pvc')}
        >
          <h2 className="text-2xl font-bold text-white mb-4">vs Computer</h2>
          <p className="text-blue-100">Challenge the AI with different difficulty levels</p>
        </div>

        {/* Play vs Player */}
        <div
          className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg cursor-pointer hover:shadow-lg transition"
          onClick={() => setSelectedMode('pvp')}
        >
          <h2 className="text-2xl font-bold text-white mb-4">vs Player</h2>
          <p className="text-purple-100">Play online with friends or random opponents</p>
        </div>
      </div>

      {/* Difficulty Selection for PvC */}
      {selectedMode === 'pvc' && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Select Difficulty</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Easy', 'Medium', 'Hard', 'Expert'].map((difficulty) => (
              <button
                key={difficulty}
                className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={() => onSelectMode('pvc', difficulty.toLowerCase())}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Online Mode Options */}
      {selectedMode === 'pvp' && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Play Online</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
              Challenge Friend
            </button>
            <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
              Random Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerOptions;
