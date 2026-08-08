import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DailyPuzzleProps {
  token: string;
}

const DailyPuzzle: React.FC<DailyPuzzleProps> = ({ token }) => {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDailyPuzzle = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/puzzles/daily`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPuzzle(response.data);
      } catch (error) {
        console.error('Failed to fetch daily puzzle:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyPuzzle();
  }, [token, apiUrl]);

  const handleSolvePuzzle = async () => {
    // Implement puzzle solving logic
    setSolved(true);
  };

  if (loading) return <div className="text-center py-8">Loading puzzle...</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Daily Puzzle</h2>

      {puzzle && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-bold mb-2">Difficulty: {puzzle.difficulty}</h3>
            <p className="text-gray-600">Theme: {puzzle.theme}</p>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-bold mb-4">Board Position (FEN)</h3>
            <p className="font-mono text-sm text-gray-600">{puzzle.fen}</p>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-bold mb-4">Your Task</h3>
            <p className="text-gray-600 mb-4">
              Find the best move to win material or achieve checkmate.
            </p>
            <button
              onClick={handleSolvePuzzle}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Show Solution
            </button>
          </div>

          {solved && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-700 mb-2">Solution</h3>
              <p className="text-gray-700">{puzzle.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyPuzzle;
