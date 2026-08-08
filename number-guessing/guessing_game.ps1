function Play-Game {
    Clear-Host
    Write-Host "==============================" -ForegroundColor Green
    Write-Host " 🟩 NUMBER GUESSING GAME 🟩" -ForegroundColor Green
    Write-Host "==============================" -ForegroundColor Green
    Write-Host "I am thinking of a number between 1 and 100.`n"

    # Configure game settings
    $secretNumber = Get-Random -Minimum 1 -Maximum 101
    $attemptsLeft = 7
    $score = 100

    while ($attemptsLeft -gt 0) {
        Write-Host "Attempts remaining: $attemptsLeft | Current Score: $score" -ForegroundColor Cyan
        
        # Get user input
        $input = Read-Host "Enter your guess (1-100)"
        $guess = 0

        # Validate user input is a number
        if (-not [int]::TryParse($input, [ref]$guess)) {
            Write-Host "❌ Invalid input! Please enter a valid number.`n" -ForegroundColor Red
            continue
        }

        # Validate range
        if ($guess -lt 1 -or $guess -gt 100) {
            Write-Host "❌ Out of bounds! Stay between 1 and 100.`n" -ForegroundColor Red
            continue
        }

        # Check the guess
        if ($guess -eq $secretNumber) {
            Write-Host "`n🎉 Congratulations! You guessed the number $secretNumber!" -ForegroundColor Yellow
            Write-Host "🏆 Final Score: $score`n" -ForegroundColor Yellow
            return
        }
        elseif ($guess -lt $secretNumber) {
            Write-Host "📉 Too low! Try a higher number.`n" -ForegroundColor Magenta
        }
        else {
            Write-Host "📈 Too high! Try a lower number.`n" -ForegroundColor Magenta
        }

        # Deduct resources
        $attemptsLeft--
        $score -= 10
    }

    Write-Host "`n💀 Game Over! You ran out of attempts." -ForegroundColor Red
    Write-Host "The correct number was: $secretNumber`n" -ForegroundColor Red
}

# Main Game Loop
do {
    Play-Game
    $playAgain = Read-Host "Do you want to play again? (y/n)"
} while ($playAgain -eq 'y' -or $playAgain -eq 'Y')

Write-Host "`nThanks for playing! Goodbye!" -ForegroundColor Green
