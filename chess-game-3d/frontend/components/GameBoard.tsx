import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import Board3D from './Board3D';

interface GameBoardProps {
  gameId: string;
  userId: string;
  onGameEnd?: () => void;
  theme?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameId, userId, onGameEnd, theme = 'classic' }) => {
  const {
    game,
    isLoading,
    error,
    legalMoves,
    selectedSquare,
    isMyTurn,
    moveHistory,
    handleSquareClick,
    handleMove,
    handleResign,
    handleOfferDraw,
    handleAcceptDraw
  } = useGameState(gameId, userId);

  const [drawOffered, setDrawOffered] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Game not found</div>
      </div>
    );
  }

  const isWhite = game.players[0]?.userId === userId;
  const opponentName = isWhite ? game.players[1]?.username : game.players[0]?.username;
  const myRating = isWhite ? game.players[0]?.rating : game.players[1]?.rating;
  const opponentRating = isWhite ? game.players[1]?.rating : game.players[0]?.rating;

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chess Game</h1>
          <p className="text-gray-400 text-sm">{game.gameType === 'pvc' ? `vs AI (${game.difficulty})` : `vs ${opponentName}`}</p>
        </div>
        <div className="text-right">
          {game.status === 'completed' && (
            <div className="bg-yellow-600 px-4 py-2 rounded-lg">
              <p className="font-bold">
                {game.result === 'white-win' ? (isWhite ? 'You Won!' : `${opponentName} Won`) : game.result === 'black-win' ? (isWhite ? `${opponentName} Won` : 'You Won!') : 'Draw'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex gap-6">
        {/* Board */}
        <div className="flex-1 bg-gray-800 p-4 rounded-lg">
          <Board3D
            fen={game.fen}
            theme={theme}
            onSquareClick={handleSquareClick}
            onPieceMove={handleMove}
            legalMoves={legalMoves}
            selectedSquare={selectedSquare}
            isEnabled={isMyTurn && game.status === 'ongoing'}
          />
        </div>

        {/* Info Panel */}
        <div className="w-64 space-y-4">
          {/* Timers */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="mb-4">
              <p className="text-sm text-gray-400">White</p>
              <p className={`text-2xl font-bold ${!isWhite && isMyTurn ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(game.whiteTime / 60)}:{String(game.whiteTime % 60).padStart(2, '0')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Black</p>
              <p className={`text-2xl font-bold ${isWhite && isMyTurn ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(game.blackTime / 60)}:{String(game.blackTime % 60).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Move History */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Moves</h3>
            <div className="h-40 overflow-y-auto text-sm space-y-1">
              {moveHistory.map((move, idx) => (
                <div key={idx} className="text-gray-300">
                  {idx + 1}. {move.from}-{move.to}
                </div>
              ))}
            </div>
          </div>

          {/* Game Controls */}
          <div className="space-y-2">
            {game.status === 'ongoing' && (
              <>
                <button
                  onClick={handleOfferDraw}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                >
                  Offer Draw
                </button>
                <button
                  onClick={handleResign}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm"
                >
                  Resign
                </button>
              </>
            )}
            {game.status === 'completed' && (
              <button
                onClick={onGameEnd}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
              >
                Back to Menu
              </button>
            )}
          </div>

          {/* Status */}
          {error && <div className="bg-red-600 p-3 rounded-lg text-sm">{error}</div>}
          {!isMyTurn && game.status === 'ongoing' && (
            <div className="bg-blue-600 p-3 rounded-lg text-sm">Waiting for opponent...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
