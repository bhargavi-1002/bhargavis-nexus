import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import Board3D from './Board3D';

interface Puzzle {
  _id: string;
  fen: string;
  theme: string;
  difficulty: string;
  solution: Array<{ from: string; to: string }>;
  explanation: string;
  rating: number;
}

const PuzzlePlayer: React.FC = () => {
  const { isLoading, error, get, post } = useApi();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reward, setReward] = useState(0);

  useEffect(() => {
    const fetchPuzzle = async () => {
      const result = await get('/api/puzzles/daily');
      if (result.success) {
        setPuzzle(result.data);
        setMoveCount(0);
        setSolved(false);
        setShowHint(false);
        setReward(0);
      }
    };

    fetchPuzzle();
  }, [get]);

  const handleSquareClick = (square: string) => {
    if (solved || !puzzle) return;

    if (!selectedSquare) {
      setSelectedSquare(square);
    } else {
      handleMove(selectedSquare, square);
      setSelectedSquare(null);
    }
  };

  const handleMove = async (from: string, to: string) => {
    if (!puzzle) return;

    const isCorrect = puzzle.solution[moveCount]?.from === from && puzzle.solution[moveCount]?.to === to;

    if (isCorrect) {
      setMoveCount(moveCount + 1);

      if (moveCount + 1 === puzzle.solution.length) {
        // Puzzle solved!
        setSolved(true);
        const result = await post(`/api/puzzles/${puzzle._id}/submit`, {
          moves: puzzle.solution
        });

        if (result.success) {
          setReward(result.data.ratingChange);
        }
      }
    } else {
      alert('Incorrect move!');
    }
  };

  const handleGetHint = async () => {
    if (!puzzle) return;

    const result = await get(`/api/puzzles/${puzzle._id}/hint`);
    if (result.success) {
      setShowHint(true);
    }
  };

  const handleSkip = async () => {
    const result = await get('/api/puzzles/daily');
    if (result.success) {
      setPuzzle(result.data);
      setMoveCount(0);
      setSolved(false);
      setShowHint(false);
      setReward(0);
      setSelectedSquare(null);
    }
  };

  if (isLoading) return <div className="text-white">Loading puzzle...</div>;
  if (!puzzle) return <div className="text-white">No puzzle available</div>;

  const difficultyColors: Record<string, string> = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-orange-400',
    expert: 'text-red-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Daily Puzzle</h2>

      <div className="flex gap-6">
        {/* Board */}
        <div className="flex-1 bg-gray-700 p-4 rounded-lg">
          <Board3D
            fen={puzzle.fen}
            theme="classic"
            onSquareClick={handleSquareClick}
            legalMoves={[]}
            selectedSquare={selectedSquare}
            isEnabled={!solved}
          />
        </div>

        {/* Info */}
        <div className="w-80 space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">Theme</p>
            <p className="text-xl font-bold">{puzzle.theme}</p>

            <p className="text-gray-400 mt-2">Difficulty</p>
            <p className={`text-xl font-bold ${difficultyColors[puzzle.difficulty]}`}>
              {puzzle.difficulty.toUpperCase()}
            </p>

            <p className="text-gray-400 mt-2">Rating</p>
            <p className="text-xl font-bold">♟ {puzzle.rating}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">Progress</p>
            <p className="text-xl font-bold">
              {moveCount}/{puzzle.solution.length} moves
            </p>
          </div>

          {showHint && puzzle.solution.length > 0 && (
            <div className="bg-blue-900 p-4 rounded-lg">
              <p className="text-gray-300">First move:</p>
              <p className="font-bold text-lg">{puzzle.solution[0].from} → {puzzle.solution[0].to}</p>
            </div>
          )}

          {solved && (
            <div className="bg-green-900 p-4 rounded-lg">
              <p className="text-green-300 font-bold text-lg">Puzzle Solved! ✓</p>
              <p className="text-gray-300 mt-2">Rating gained: <span className="font-bold text-yellow-400">+{reward}</span></p>
            </div>
          )}

          <div className="space-y-2">
            {!solved && (
              <>
                <button
                  onClick={handleGetHint}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Get Hint
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                >
                  Skip
                </button>
              </>
            )}
            {solved && (
              <button
                onClick={handleSkip}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Next Puzzle
              </button>
            )}
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="bg-gray-700 p-4 rounded-lg text-sm">
            <p className="font-bold mb-2">About this puzzle</p>
            <p className="text-gray-300">{puzzle.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePlayer;
