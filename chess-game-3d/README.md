# ♚ Chess Puzzle Game - Mate in 1 ♚

A beginner-friendly chess puzzle game where you solve "Find Checkmate in 1 Move" puzzles!

## 🎮 Features

- **Interactive Chessboard**: Click to select and move pieces
- **Mate-in-1 Puzzles**: Solve carefully crafted chess puzzles
- **Visual Feedback**: Selected squares highlight, invalid moves alert you
- **Multiple Puzzles**: Navigate through different puzzle scenarios
- **Responsive Design**: Works on desktop and mobile devices
- **Beginner Friendly**: Simple rules, no complex chess engines needed

## 🚀 Quick Start

1. Open `index.html` in your web browser
2. Click on a piece to select it
3. Click on a square to move it
4. Find the checkmate move to solve the puzzle!
5. Use "Reset Puzzle" to try again or "Next Puzzle" to continue

## 📋 How to Play

- **Objective**: Deliver checkmate in exactly one move
- **Selection**: Click a piece to select it (turns yellow)
- **Valid Moves**: Moves follow standard chess rules
- **Checkmate**: When you deliver the correct mate move, you win!
- **Invalid Moves**: If you make a wrong move, it will undo after 1 second

## 🎯 Current Puzzles

1. **Fool's Mate** - Black to move for checkmate
2. **Scholar's Mate Setup** - White to move for checkmate

More puzzles can be easily added to the `puzzles` array in `script.js`!

## 🛠️ Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - Game logic and interactivity

## 📝 File Structure

```
chess-puzzle-game/
├── index.html      # Main HTML structure
├── style.css       # Styling and layout
├── script.js       # Game logic and puzzle data
└── README.md       # Documentation (this file)
```

## ♟️ Chess Piece Symbols

- ♔/♚ King
- ♕/♛ Queen
- ♖/♜ Rook
- ♗/♝ Bishop
- ♘/♞ Knight
- ♙/♟ Pawn

## 🎨 Customization

### Add More Puzzles

Edit the `puzzles` array in `script.js`:

```javascript
{
    name: "Your Puzzle Name",
    board: [...], // 8x8 board state
    turn: 'white', // whose turn to move
    solution: { from: [row, col], to: [row, col] },
    hint: "Your hint here"
}
```

### Customize Colors

Edit `style.css` to change:
- Board colors: `.square.light` and `.square.dark`
- Button colors: `.btn`
- Background gradient: `body`

## 🔮 Future Enhancements

- [ ] Puzzle difficulty levels
- [ ] Timer challenges
- [ ] Score tracking
- [ ] More puzzle positions (20+)
- [ ] Hint system with penalties
- [ ] Sound effects
- [ ] Elo rating-based difficulty
- [ ] Keyboard controls (arrow keys)
- [ ] Puzzle editor for custom positions
- [ ] Leaderboard tracking

## 🤝 Contributing

Want to add more puzzles or improve the game?
1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Submit a pull request!

## 📜 License

Free to use and modify!

## 🎓 Learning Resources

- [Chess.com Lessons](https://www.chess.com/learn)
- [Lichess Puzzles](https://lichess.org/training)
- [Move Validation Logic](https://www.chessprogramming.org/Legal-Move)
- [Checkmate Patterns](https://www.chess.com/terms/checkmate)

---

**Happy puzzle solving! ♚♛♖♕♘♗♙♟**
