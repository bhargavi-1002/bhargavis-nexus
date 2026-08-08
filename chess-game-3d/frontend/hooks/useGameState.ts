import { useEffect, useState, useCallback, useRef } from 'react';

interface GameData {
  _id: string;
  players: Array<{ userId: string; username: string; rating: number }>;
  moves: Array<{ from: string; to: string; timestamp: number }>;
  fen: string;
  status: 'ongoing' | 'completed';
  result?: 'white-win' | 'black-win' | 'draw';
  whiteTime: number;
  blackTime: number;
  gameType: 'pvc' | 'pvp';
  difficulty?: string;
  timeControl: string;
}

interface MoveData {
  from: string;
  to: string;
  promotion?: string;
}

export const useGameState = (gameId: string, userId: string) => {
  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [moveHistory, setMoveHistory] = useState<MoveData[]>([]);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Initialize game connection
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/games/${gameId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const gameData = await response.json();
          setGame(gameData);
          setMoveHistory(gameData.moves);

          const isWhite = gameData.players[0]?.userId === userId;
          const moveCount = gameData.moves.length;
          const isWhiteTurn = moveCount % 2 === 0;
          setIsMyTurn(isWhite ? isWhiteTurn : !isWhiteTurn);
        }
      } catch (err) {
        setError('Failed to load game');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, userId, apiUrl]);

  const handleSquareClick = useCallback(
    (square: string) => {
      if (!isMyTurn || game?.status === 'completed') return;

      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (selectedSquare) {
        handleMove(selectedSquare, square);
      } else {
        setSelectedSquare(square);
        // Request legal moves from backend
        const fetchLegalMoves = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/api/games/${gameId}/legal-moves/${square}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              setLegalMoves(data.legalMoves || []);
            }
          } catch (err) {
            console.error('Error fetching legal moves:', err);
          }
        };
        fetchLegalMoves();
      }
    },
    [selectedSquare, isMyTurn, gameId, game?.status, apiUrl]
  );

  const handleMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/games/${gameId}/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ from, to, promotion })
        });

        if (response.ok) {
          const updatedGame = await response.json();
          setGame(updatedGame);
          setMoveHistory(updatedGame.moves);
          setSelectedSquare(null);
          setLegalMoves([]);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Invalid move');
        }
      } catch (err) {
        setError('Error making move');
      }
    },
    [gameId, apiUrl]
  );

  const handleResign = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/games/${gameId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ result: isMyTurn ? 'loss' : 'win' })
      });
    } catch (err) {
      setError('Error resigning');
    }
  }, [gameId, isMyTurn, apiUrl]);

  const handleOfferDraw = useCallback(() => {
    setError('Draw offer sent (feature pending)');
  }, []);

  const handleAcceptDraw = useCallback(() => {
    setError('Draw accepted (feature pending)');
  }, []);

  return {
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
  };
};
