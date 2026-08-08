-- Chess Game 3D - Supabase Database Schema
-- Run this in Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rating INTEGER DEFAULT 1200,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  avatar TEXT,
  bio TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games Table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type VARCHAR(10) NOT NULL CHECK (game_type IN ('pvp', 'pvc')),
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'abandoned')),
  result VARCHAR(20) CHECK (result IN ('white-win', 'black-win', 'draw')),
  moves JSONB DEFAULT '[]',
  time_control INTEGER DEFAULT 600,
  theme VARCHAR(50) DEFAULT 'classic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Players Table (many-to-many relationship)
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  color VARCHAR(10) NOT NULL CHECK (color IN ('white', 'black')),
  rating_before INTEGER,
  rating_after INTEGER,
  UNIQUE(game_id, color)
);

-- Friend Requests Table
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- Friends Table (accepted friend requests)
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Puzzles Table
CREATE TABLE puzzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fen TEXT NOT NULL,
  theme VARCHAR(100) NOT NULL,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  solution JSONB NOT NULL,
  explanation TEXT,
  rating INTEGER DEFAULT 1500,
  attempts INTEGER DEFAULT 0,
  successes INTEGER DEFAULT 0,
  is_daily BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Puzzle Attempts Table (track user puzzle attempts)
CREATE TABLE puzzle_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL,
  rating_change INTEGER,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_game_type ON games(game_type);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_game_players_user_id ON game_players(user_id);
CREATE INDEX idx_friend_requests_from_user ON friend_requests(from_user_id);
CREATE INDEX idx_friend_requests_to_user ON friend_requests(to_user_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_puzzles_difficulty ON puzzles(difficulty);
CREATE INDEX idx_puzzles_is_daily ON puzzles(is_daily);
CREATE INDEX idx_puzzles_rating ON puzzles(rating);
CREATE INDEX idx_puzzle_attempts_user_id ON puzzle_attempts(user_id);
CREATE INDEX idx_puzzle_attempts_puzzle_id ON puzzle_attempts(puzzle_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_attempts ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Games RLS Policies
CREATE POLICY "Games are publicly readable" ON games FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create games" ON games FOR INSERT WITH CHECK (true);

-- Game Players RLS Policies
CREATE POLICY "Game players are publicly readable" ON game_players FOR SELECT USING (true);

-- Friend Requests RLS Policies
CREATE POLICY "Users can view own friend requests" ON friend_requests FOR SELECT USING (from_user_id::text = auth.uid()::text OR to_user_id::text = auth.uid()::text);
CREATE POLICY "Users can create friend requests" ON friend_requests FOR INSERT WITH CHECK (from_user_id::text = auth.uid()::text);
CREATE POLICY "Users can update received friend requests" ON friend_requests FOR UPDATE USING (to_user_id::text = auth.uid()::text);

-- Friends RLS Policies
CREATE POLICY "Users can view own friends" ON friends FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can insert own friends" ON friends FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Puzzles RLS Policies
CREATE POLICY "Puzzles are publicly readable" ON puzzles FOR SELECT USING (true);

-- Puzzle Attempts RLS Policies
CREATE POLICY "Users can view own puzzle attempts" ON puzzle_attempts FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can create puzzle attempts" ON puzzle_attempts FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
