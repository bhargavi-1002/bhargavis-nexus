const GameModel = require('../models/gameModel');
const UserModel = require('../models/userModel');
const GameStateManager = require('../utils/gameStateManager');

const socketHandlers = (io) => {
  const userSockets = {}; // Map userId -> socketId
  const gameRooms = {}; // Map gameId -> room data
  const timers = {}; // Map gameId -> timer intervals

  /**
   * Get AI difficulty rating for time-based matchmaking
   */
  const getAIDifficultyForTime = (timeControl) => {
    if (timeControl < 60) return 'expert'; // Bullet: strong AI
    if (timeControl < 300) return 'hard'; // Blitz: hard AI
    if (timeControl < 900) return 'medium'; // Rapid: medium AI
    return 'easy'; // Classical: easy AI for practice
  };

  /**
   * Initialize game timer
   */
  const startGameTimer = (gameId, gameData) => {
    const timeControl = gameData.time_control || 600;
    let whiteTime = timeControl;
    let blackTime = timeControl;
    let currentTurn = 'w';
    let lastMoveTime = Date.now();

    // Clear any existing timer
    if (timers[gameId]) {
      clearInterval(timers[gameId]);
    }

    // Update timers every 100ms
    timers[gameId] = setInterval(async () => {
      const elapsed = (Date.now() - lastMoveTime) / 1000;

      if (currentTurn === 'w') {
        whiteTime -= elapsed;
      } else {
        blackTime -= elapsed;
      }

      lastMoveTime = Date.now();

      // Emit time update to all players in game
      io.to(gameId).emit('time-update', {
        whiteTime: Math.max(0, whiteTime),
        blackTime: Math.max(0, blackTime)
      });

      // Check for time loss
      if (whiteTime <= 0 || blackTime <= 0) {
        clearInterval(timers[gameId]);
        delete timers[gameId];

        const result = whiteTime <= 0 ? 'black-win' : 'white-win';
        io.to(gameId).emit('time-expired', {
          result,
          reason: whiteTime <= 0 ? 'White ran out of time' : 'Black ran out of time'
        });
      }
    }, 100);

    gameRooms[gameId] = {
      gameData,
      whiteTime,
      blackTime,
      currentTurn,
      lastMoveTime
    };
  };

  /**
   * Update turn and reset move timer
   */
  const updateTurn = (gameId, newTurn) => {
    if (gameRooms[gameId]) {
      gameRooms[gameId].currentTurn = newTurn;
      gameRooms[gameId].lastMoveTime = Date.now();
    }
  };

  io.on('connection', (socket) => {
    console.log('🎮 New user connected:', socket.id);

    // User connects/authenticates
    socket.on('user-connect', (userId) => {
      userSockets[userId] = socket.id;
      socket.userId = userId;
      socket.emit('connection-confirmed', { socketId: socket.id, userId });
      console.log(`✅ User ${userId} connected with socket ${socket.id}`);
    });

    // Join game room
    socket.on('join-game', async (data) => {
      try {
        const { gameId, userId } = data;
        socket.join(gameId);

        const game = await GameModel.findById(gameId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Initialize game state
        const gameState = new GameStateManager(game);

        // Start timer if not started
        if (!gameRooms[gameId]) {
          startGameTimer(gameId, game);
        }

        io.to(gameId).emit('player-joined', {
          gameId,
          players: game.game_players,
          turn: gameState.getTurn(),
          legalMoves: gameState.getLegalMoves(),
          board: gameState.getBoard(),
          fen: gameState.getFen()
        });

        console.log(`🎮 User joined game ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: 'Error joining game', error: error.message });
      }
    });

    // Send game invitation
    socket.on('invite-game', (data) => {
      try {
        const { from, to, gameId, gameName } = data;
        const targetSocket = userSockets[to];

        if (targetSocket) {
          io.to(targetSocket).emit('game-invitation', {
            from,
            gameId,
            gameName,
            timestamp: new Date()
          });
          socket.emit('invitation-sent', { to, gameId });
          console.log(`📨 Game invitation sent from ${from} to ${to}`);
        } else {
          socket.emit('error', { message: 'Opponent not online' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Error sending invitation', error: error.message });
      }
    });

    // Accept game invitation
    socket.on('accept-invitation', async (data) => {
      try {
        const { gameId, userId } = data;
        socket.join(gameId);

        const game = await GameModel.findById(gameId);

        // Notify both players
        io.to(gameId).emit('invitation-accepted', {
          gameId,
          players: game.game_players,
          startTime: new Date()
        });

        console.log(`✅ Game invitation accepted for ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: 'Error accepting invitation', error: error.message });
      }
    });

    // Decline game invitation
    socket.on('decline-invitation', (data) => {
      const { from, to, gameId } = data;
      const targetSocket = userSockets[from];

      if (targetSocket) {
        io.to(targetSocket).emit('invitation-declined', { gameId });
      }
    });

    // Make move
    socket.on('move', async (data) => {
      try {
        const { gameId, from, to, promotion, userId } = data;

        const game = await GameModel.findById(gameId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.status !== 'ongoing') {
          socket.emit('error', { message: 'Game is not in progress' });
          return;
        }

        // Initialize game state and validate move
        const gameState = new GameStateManager(game);
        const moveResult = gameState.makeMove(from, to, promotion, userId);

        if (!moveResult.success) {
          socket.emit('move-invalid', {
            error: moveResult.error,
            from,
            to
          });
          return;
        }

        // Update game in database
        await GameModel.addMove(gameId, { from, to, promotion });

        // Check if game ended
        if (moveResult.gameStatus.isOver) {
          await GameModel.updateStatus(gameId, 'completed', moveResult.gameStatus.result);

          // Clear timer
          if (timers[gameId]) {
            clearInterval(timers[gameId]);
            delete timers[gameId];
          }

          // Calculate ratings
          if (game.game_type === 'pvp' && game.game_players.length === 2) {
            const RatingCalculator = require('../utils/ratingCalculator');
            const ratingCalc = new RatingCalculator();
            const ratingChanges = ratingCalc.calculateNewRatings(
              game.game_players[0].rating_before,
              game.game_players[1].rating_before,
              moveResult.gameStatus.result
            );

            const ratings = [
              { userId: game.game_players[0].user_id, color: 'white', ratingAfter: ratingChanges.whiteNewRating },
              { userId: game.game_players[1].user_id, color: 'black', ratingAfter: ratingChanges.blackNewRating }
            ];

            await GameModel.updatePlayerRatings(gameId, ratings);

            // Update user stats
            const whiteUser = await UserModel.findById(game.game_players[0].user_id);
            const blackUser = await UserModel.findById(game.game_players[1].user_id);

            if (moveResult.gameStatus.result === 'white-win') {
              await UserModel.updateStats(whiteUser.id, { wins: whiteUser.wins + 1 });
              await UserModel.updateStats(blackUser.id, { losses: blackUser.losses + 1 });
            } else if (moveResult.gameStatus.result === 'black-win') {
              await UserModel.updateStats(blackUser.id, { wins: blackUser.wins + 1 });
              await UserModel.updateStats(whiteUser.id, { losses: whiteUser.losses + 1 });
            } else {
              await UserModel.updateStats(whiteUser.id, { draws: whiteUser.draws + 1 });
              await UserModel.updateStats(blackUser.id, { draws: blackUser.draws + 1 });
            }

            // Notify game end
            io.to(gameId).emit('game-ended', {
              result: moveResult.gameStatus.result,
              reason: moveResult.gameStatus.reason,
              ratingChanges
            });
          }
        } else {
          // Update turn
          const newTurn = gameState.getTurn();
          updateTurn(gameId, newTurn);

          // Broadcast move to all players
          io.to(gameId).emit('opponent-move', {
            from,
            to,
            promotion: promotion || null,
            fen: gameState.getFen(),
            turn: newTurn,
            inCheck: moveResult.inCheck,
            legalMoves: gameState.getLegalMoves()
          });

          // Get AI move if PvC
          if (game.game_type === 'pvc' && newTurn === 'b') {
            setTimeout(() => {
              const freshGameState = new GameStateManager(game);
              const AIEngine = require('../utils/aiEngine');
              const ai = new AIEngine(game.difficulty);
              const aiMove = ai.getBestMove(freshGameState.engine);

              socket.emit('ai-move', {
                from: aiMove.from,
                to: aiMove.to,
                promotion: aiMove.promotion || null
              });
            }, 500); // Slight delay for realism
          }
        }

        socket.emit('move-success', {
          move: moveResult.move,
          fen: gameState.getFen()
        });

        console.log(`♟️ Move made: ${from} -> ${to}`);
      } catch (error) {
        console.error('Move error:', error);
        socket.emit('error', { message: 'Error processing move', error: error.message });
      }
    });

    // Request legal moves
    socket.on('get-legal-moves', async (data) => {
      try {
        const { gameId, square } = data;
        const game = await GameModel.findById(gameId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const gameState = new GameStateManager(game);
        const legalMoves = gameState.getMovesForSquare(square);

        socket.emit('legal-moves', {
          square,
          moves: legalMoves
        });
      } catch (error) {
        socket.emit('error', { message: 'Error getting legal moves', error: error.message });
      }
    });

    // Send chat message
    socket.on('chat-message', (data) => {
      try {
        const { gameId, message, sender } = data;

        io.to(gameId).emit('new-message', {
          message,
          sender,
          timestamp: new Date()
        });

        console.log(`💬 Message in game ${gameId}: ${message}`);
      } catch (error) {
        socket.emit('error', { message: 'Error sending message', error: error.message });
      }
    });

    // Request draw
    socket.on('request-draw', (data) => {
      const { gameId, from } = data;
      const opponent = Object.keys(userSockets).find(
        userId => userSockets[userId] !== socket.id && 
        io.sockets.sockets.get(userSockets[userId])?.rooms?.has(gameId)
      );

      if (opponent) {
        io.to(userSockets[opponent]).emit('draw-requested', { from, gameId });
      }
    });

    // Accept draw
    socket.on('accept-draw', async (data) => {
      try {
        const { gameId } = data;
        const game = await GameModel.findById(gameId);

        if (game && game.status === 'ongoing') {
          await GameModel.updateStatus(gameId, 'completed', 'draw');

          io.to(gameId).emit('game-ended', {
            result: 'draw',
            reason: 'Draw by agreement'
          });

          if (timers[gameId]) {
            clearInterval(timers[gameId]);
            delete timers[gameId];
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Error accepting draw', error: error.message });
      }
    });

    // Resign from game
    socket.on('resign', async (data) => {
      try {
        const { gameId, userId } = data;
        const game = await GameModel.findById(gameId);

        if (game && game.status === 'ongoing') {
          // Determine result based on who resigned
          const resigningPlayer = game.game_players.find(p => p.user_id === userId);
          const result = resigningPlayer.color === 'white' ? 'black-win' : 'white-win';

          await GameModel.updateStatus(gameId, 'completed', result);

          io.to(gameId).emit('game-ended', {
            result,
            reason: 'Resignation'
          });

          if (timers[gameId]) {
            clearInterval(timers[gameId]);
            delete timers[gameId];
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Error resigning', error: error.message });
      }
    });

    // Leave game
    socket.on('leave-game', (data) => {
      const { gameId } = data;
      socket.leave(gameId);
      console.log(`❌ User left game ${gameId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);

      // Remove from user sockets
      if (socket.userId) {
        delete userSockets[socket.userId];
      }

      // Clean up abandoned games
      for (const gameId in gameRooms) {
        if (timers[gameId]) {
          clearInterval(timers[gameId]);
          delete timers[gameId];
        }
      }
    });
  });
};

module.exports = socketHandlers;
