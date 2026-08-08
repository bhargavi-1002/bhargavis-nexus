/**
 * ELO Rating Calculator
 * Standard chess rating system following FIDE guidelines
 */

class RatingCalculator {
  constructor(kFactor = 32) {
    this.kFactor = kFactor; // Default K-factor for most players
  }

  /**
   * Calculate ELO changes after a game
   * @param {number} whiteRating - White player's rating before game
   * @param {number} blackRating - Black player's rating before game
   * @param {string} result - 'white-win', 'black-win', or 'draw'
   * @returns {object} New ratings for both players
   */
  calculateNewRatings(whiteRating, blackRating, result) {
    const whiteExpected = this.getExpectedScore(whiteRating, blackRating);
    const blackExpected = this.getExpectedScore(blackRating, whiteRating);

    let whiteScore, blackScore;

    switch (result) {
      case 'white-win':
        whiteScore = 1;
        blackScore = 0;
        break;
      case 'black-win':
        whiteScore = 0;
        blackScore = 1;
        break;
      case 'draw':
        whiteScore = 0.5;
        blackScore = 0.5;
        break;
      default:
        throw new Error('Invalid game result');
    }

    const whiteNewRating = Math.round(
      whiteRating + this.kFactor * (whiteScore - whiteExpected)
    );

    const blackNewRating = Math.round(
      blackRating + this.kFactor * (blackScore - blackExpected)
    );

    return {
      whiteNewRating,
      blackNewRating,
      whiteChange: whiteNewRating - whiteRating,
      blackChange: blackNewRating - blackRating,
      whiteExpected: whiteExpected.toFixed(2),
      blackExpected: blackExpected.toFixed(2)
    };
  }

  /**
   * Calculate expected score for a player
   * Uses standard ELO formula
   * @param {number} playerRating - Player's current rating
   * @param {number} opponentRating - Opponent's rating
   * @returns {number} Expected score (0-1)
   */
  getExpectedScore(playerRating, opponentRating) {
    const ratingDiff = opponentRating - playerRating;
    return 1 / (1 + Math.pow(10, ratingDiff / 400));
  }

  /**
   * Get K-factor based on rating (more points gained for beginners)
   * @param {number} rating - Player's rating
   * @returns {number} K-factor value
   */
  getKFactorByRating(rating) {
    if (rating < 1200) return 48;      // Beginners gain/lose more
    if (rating < 1800) return 32;      // Standard players
    if (rating < 2200) return 24;      // Advanced players
    return 16;                          // Master level (lose less)
  }

  /**
   * Calculate performance rating (approximate rating based on game)
   * @param {number} opponentRating - Opponent's rating
   * @param {string} result - Game result from this player's perspective
   * @returns {number} Performance rating estimate
   */
  getPerformanceRating(opponentRating, result) {
    switch (result) {
      case 'win':
        return opponentRating + 400;
      case 'draw':
        return opponentRating;
      case 'loss':
        return opponentRating - 400;
      default:
        return opponentRating;
    }
  }

  /**
   * Calculate provisional rating for new players
   * Used for players with < 26 games
   * @param {array} gameResults - Array of game results with opponent ratings
   * @returns {number} Provisional rating
   */
  calculateProvisionalRating(gameResults) {
    if (gameResults.length === 0) return 1200; // Starting rating

    let totalPerformance = 0;
    let gameCount = Math.min(gameResults.length, 25); // Cap at 25 games

    for (let i = 0; i < gameCount; i++) {
      const game = gameResults[i];
      const performance = this.getPerformanceRating(
        game.opponentRating,
        game.result
      );
      totalPerformance += performance;
    }

    return Math.round(totalPerformance / gameCount);
  }

  /**
   * Get rating difference interpretation
   * @param {number} whiteRating - White rating
   * @param {number} blackRating - Black rating
   * @returns {string} Description of rating difference
   */
  getRatingDifferenceDescription(whiteRating, blackRating) {
    const diff = Math.abs(whiteRating - blackRating);

    if (diff <= 25) return 'evenly matched';
    if (diff <= 50) return 'slight advantage';
    if (diff <= 100) return 'clear advantage';
    if (diff <= 200) return 'significant advantage';
    return 'overwhelming advantage';
  }

  /**
   * Set custom K-factor
   * @param {number} kFactor - New K-factor value
   */
  setKFactor(kFactor) {
    this.kFactor = kFactor;
  }

  /**
   * Get rating category/title based on rating
   * @param {number} rating - Player's rating
   * @returns {string} Category name
   */
  getRatingCategory(rating) {
    if (rating < 800) return 'Beginner';
    if (rating < 1200) return 'Novice';
    if (rating < 1600) return 'Intermediate';
    if (rating < 1800) return 'Intermediate Advanced';
    if (rating < 2000) return 'Advanced';
    if (rating < 2200) return 'Expert';
    if (rating < 2400) return 'Master';
    if (rating < 2600) return 'International Master';
    return 'Grandmaster';
  }
}

module.exports = RatingCalculator;
