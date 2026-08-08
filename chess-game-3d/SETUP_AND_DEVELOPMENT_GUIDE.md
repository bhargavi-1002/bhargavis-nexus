# Chess Game 3D - Complete Setup & Development Guide

## Project Overview
A feature-rich 3D chess game built with React, Next.js, Three.js, Node.js, Express, MongoDB, and Socket.io. The application supports:
- User authentication with JWT tokens
- Play vs Computer (AI) with difficulty levels
- Online multiplayer with real-time WebSocket communication
- Friend request system
- Daily chess puzzles
- Multiple board themes and animations
- ELO rating system
- Game history and statistics

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.0.0 with React 18.2.0
- **3D Rendering**: Three.js (0.128.0)
- **Real-time Communication**: Socket.io-client 4.7.1
- **State Management**: Zustand 4.4.0
- **HTTP Client**: Axios 1.5.0
- **Styling**: Tailwind CSS 3.3.0
- **Language**: TypeScript 5.2.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 5.7.0 with Mongoose 7.4.0
- **Real-time**: Socket.io 4.7.1
- **Authentication**: JWT (jsonwebtoken 9.0.2), Bcrypt (bcryptjs 2.4.3)
- **Chess Logic**: chess.js 1.0.0-beta.8
- **Environment**: dotenv 16.3.1
- **CORS**: cors 2.8.5

---

## Prerequisites

### Required Software
1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB** (Community Edition)
   - Download: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **Git**
   - Download: https://git-scm.com/

4. **VS Code** (Recommended)
   - Download: https://code.visualstudio.com/

---

## Complete Installation & Setup Instructions

### Step 1: Clone the Repository
```powershell
cd C:\Users\krishna
git clone https://github.com/bhargavi-1002/chess-game-3d.git
cd chess-game-3d
```

### Step 2: Install Backend Dependencies
```powershell
cd C:\Users\krishna\chess-game-3d\backend
npm install
```

**Expected Output:**
```
added 432 packages, and audited 433 packages in ~27s
found 0 vulnerabilities
```

### Step 3: Create Backend Environment File
```powershell
notepad .env
```

**Paste the following content:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/chess-game

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# WebSocket Configuration
WS_PORT=5000
```

Save and close (Ctrl + S).

### Step 4: Install Frontend Dependencies
```powershell
cd C:\Users\krishna\chess-game-3d\frontend
npm install
```

**Expected Output:**
```
added 141 packages, and audited 142 packages in ~47s
```

### Step 5: Create Frontend Environment File
```powershell
notepad .env.local
```

**Paste the following content:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Debug Mode (optional)
NEXT_PUBLIC_DEBUG=false
```

Save and close (Ctrl + S).

---

## Database Setup

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Server** from https://www.mongodb.com/try/download/community
2. **Start MongoDB Service**:
   ```powershell
   # On Windows, MongoDB starts automatically after installation
   # Or manually start it:
   net start MongoDB
   ```

3. **Verify Connection**:
   ```powershell
   mongo
   # or
   mongosh
   ```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in backend `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chess-game
   ```

---

## Running the Application

### Terminal 1: Start Backend Server
```powershell
cd C:\Users\krishna\chess-game-3d\backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected
```

### Terminal 2: Start Frontend Development Server
Open a new PowerShell window:
```powershell
cd C:\Users\krishna\chess-game-3d\frontend
npm run dev
```

**Expected Output:**
```
> next dev
ready - started server on 0.0.0.0:3000
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## Project File Structure

```
chess-game-3d/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema with ratings and friends
│   │   ├── Game.js              # Game schema for PvP and PvC
│   │   └── Puzzle.js            # Chess puzzle schema
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints (register, login)
│   │   ├── users.js             # User profile and friend system
│   │   ├── games.js             # Game creation and move tracking
│   │   └── puzzles.js           # Daily puzzles and solutions
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── socket/
│   │   └── socketHandlers.js    # WebSocket event handlers
│   ├── server.js                # Express server setup
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment variables template
│   └── .env                     # Local environment variables (not in git)
│
├── frontend/
│   ├── components/
│   │   ├── Board3D.tsx          # 3D chess board using Three.js
│   │   ├── Authentication.tsx   # Login/Register UI
│   │   ├── PlayerOptions.tsx    # Game mode selection (PvC, PvP)
│   │   └── DailyPuzzle.tsx      # Daily puzzle component
│   ├── pages/
│   │   ├── index.tsx            # Main page with navigation
│   │   └── _app.tsx             # Next.js app wrapper
│   ├── assets/
│   │   ├── themes/              # Board theme JSON files
│   │   ├── backgrounds/         # Background images
│   │   └── 3d-models/           # Chess piece 3D models
│   ├── utils/
│   │   └── api.ts               # API client configuration
│   ├── package.json             # Frontend dependencies
│   ├── .env.local               # Local environment variables (not in git)
│   ├── tsconfig.json            # TypeScript configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── next.config.js           # Next.js configuration
│
├── docs/
│   ├── API_DOCUMENTATION.md     # API endpoints documentation
│   ├── SOCKET_EVENTS.md         # WebSocket events documentation
│   └── DEVELOPMENT.md           # Development guidelines
│
├── .gitignore                   # Git ignore file
├── README.md                    # Project overview
└── SETUP_AND_DEVELOPMENT_GUIDE.md  # This file
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register              # Create new user account
POST   /login                 # User login with JWT token
```

### User Routes (`/api/users`)
```
GET    /:id                   # Get user profile
GET    /search/:query         # Search users by username
POST   /:id/friend-request    # Send friend request
POST   /:id/accept-friend     # Accept friend request
```

### Game Routes (`/api/games`)
```
POST   /create                # Create new game
GET    /:id                   # Get game details
POST   /:id/move              # Record a move
POST   /:id/end               # End game and update ratings
GET    /history/:userId       # Get user's game history
```

### Puzzle Routes (`/api/puzzles`)
```
GET    /daily                 # Get today's puzzle
GET    /difficulty/:level     # Get puzzles by difficulty
GET    /:id                   # Get specific puzzle
POST   /:id/submit            # Submit puzzle solution
```

---

## WebSocket Events

### Client → Server Events
```javascript
'user-connect'           // User connects to game server
'invite-game'           // Send game invitation
'accept-invitation'     // Accept game invitation
'move'                  // Send chess move
'chat-message'          // Send chat message during game
'game-end'             // End game signal
```

### Server → Client Events
```javascript
'game-invitation'       // Receive game invitation
'player-joined'        // Opponent joined game
'opponent-move'        // Receive opponent's move
'new-message'          // Receive chat message
'game-finished'        // Game ended signal
```

---

## Database Schema Details

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  rating: Number (default: 1200),
  wins: Number (default: 0),
  losses: Number (default: 0),
  draws: Number (default: 0),
  friends: [ObjectId],
  friendRequests: [
    {
      from: ObjectId,
      status: String (pending/accepted/rejected),
      createdAt: Date
    }
  ],
  avatar: String,
  bio: String,
  lastLogin: Date,
  createdAt: Date
}
```

### Game Schema
```javascript
{
  players: [
    {
      userId: ObjectId,
      color: String (white/black),
      ratingBefore: Number,
      ratingAfter: Number
    }
  ],
  gameType: String (pvp/pvc),
  difficulty: String (easy/medium/hard/expert),
  status: String (ongoing/completed/abandoned),
  result: String (white-win/black-win/draw),
  moves: [
    {
      from: String,
      to: String,
      promotion: String,
      timestamp: Date
    }
  ],
  timeControl: Number (seconds),
  theme: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Puzzle Schema
```javascript
{
  fen: String (required),
  theme: String (required),
  difficulty: String (easy/medium/hard/expert),
  solution: [
    {
      from: String,
      to: String,
      promotion: String
    }
  ],
  explanation: String,
  rating: Number (default: 1500),
  attempts: Number,
  successes: Number,
  isDaily: Boolean,
  date: Date,
  createdAt: Date
}
```

---

## Development Commands

### Backend
```powershell
# Development mode with auto-reload
npm run dev

# Production build
npm start

# Run tests
npm test
```

### Frontend
```powershell
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error
```
MongooseError: Cannot connect to MongoDB
```
**Solution:**
- Ensure MongoDB service is running
- Check `MONGODB_URI` in `.env` is correct
- For local: `mongodb://localhost:27017/chess-game`
- For Atlas: Use connection string with credentials

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different ports in .env
PORT=5001
```

### Issue 3: CORS Errors
```
Access to XMLHttpRequest blocked by CORS
```
**Solution:**
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Ensure Socket.io CORS config allows frontend origin

### Issue 4: npm install fails
```
npm ERR! code EINVALIDTAGNAME
```
**Solution:**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm cache clean --force`
- Run `npm install` again

---

## Performance Optimization Tips

1. **3D Rendering**: Implement piece culling and LOD (Level of Detail)
2. **WebSocket**: Use message compression for faster communication
3. **Database**: Add indexes on frequently queried fields
4. **Frontend**: Implement code splitting and lazy loading
5. **Caching**: Use Redis for session management

---

## Security Considerations

1. **JWT_SECRET**: Change in production to a strong random string
2. **HTTPS**: Use SSL/TLS in production
3. **MongoDB**: Enable authentication and restrict network access
4. **Input Validation**: Validate all user inputs on both client and server
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **CORS**: Restrict allowed origins in production

---

## Next Steps for Enhanced Development

### High Priority
1. Implement chess engine/AI using chess.js library
2. Add piece animations and smooth move transitions
3. Implement game timer (blitz, rapid, classical)
4. Add move validation using chess.js
5. Implement game notation (PGN format)

### Medium Priority
1. Add more 3D themes and animations
2. Implement leaderboards
3. Add game analysis tools
4. Implement replaying saved games
5. Add player statistics dashboard

### Future Features
1. Tournament system
2. Streaming integration
3. Mobile app (React Native)
4. Coaching system
5. Community forums

---

## Debugging Tips

### Backend Debugging
```powershell
# Enable debug logs
$env:DEBUG = '*'
npm run dev
```

### Frontend Debugging
1. Open DevTools (F12)
2. Check Console for errors
3. Use Network tab to monitor API calls
4. Check Application tab for localStorage data

### MongoDB Debugging
```powershell
# Connect to MongoDB
mongosh

# List databases
show dbs

# Switch to chess-game database
use chess-game

# View collections
show collections

# Query users
db.users.find()
```

---

## Deployment Checklist

- [ ] Change JWT_SECRET to production value
- [ ] Update MONGODB_URI to production database
- [ ] Set NODE_ENV to production
- [ ] Enable HTTPS
- [ ] Set up environment variables on hosting platform
- [ ] Test all API endpoints
- [ ] Test WebSocket connections
- [ ] Run security audit
- [ ] Set up monitoring and logging
- [ ] Create database backups
- [ ] Set up CI/CD pipeline

---

## Support & Resources

- **Three.js Documentation**: https://threejs.org/docs/
- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Documentation**: https://expressjs.com/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **Socket.io Documentation**: https://socket.io/docs/
- **Chess.js GitHub**: https://github.com/jhlywa/chess.js

---

## Contact & Collaboration

For issues, features requests, or contributions, please create an issue or pull request on GitHub.

**Repository**: https://github.com/bhargavi-1002/chess-game-3d

---

**Last Updated**: June 4, 2026
**Version**: 1.0.0
