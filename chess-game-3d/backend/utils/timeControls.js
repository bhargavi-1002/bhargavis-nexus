/**
 * Chess Time Controls Utility
 * Defines and manages different chess time formats
 */

class TimeControls {
  static FORMATS = {
    // Ultra-fast
    'bullet': {
      name: 'Bullet',
      minutes: 1,
      seconds: 0,
      increment: 0,
      displayName: '1+0'
    },
    'blitz-1-0': {
      name: 'Blitz',
      minutes: 1,
      seconds: 0,
      increment: 0,
      displayName: '1+0'
    },
    'blitz-2-1': {
      name: 'Blitz',
      minutes: 2,
      seconds: 0,
      increment: 1,
      displayName: '2+1'
    },
    'blitz-3-0': {
      name: 'Blitz',
      minutes: 3,
      seconds: 0,
      increment: 0,
      displayName: '3+0'
    },
    'blitz-3-2': {
      name: 'Blitz',
      minutes: 3,
      seconds: 0,
      increment: 2,
      displayName: '3+2'
    },
    'blitz-5-0': {
      name: 'Blitz',
      minutes: 5,
      seconds: 0,
      increment: 0,
      displayName: '5+0'
    },

    // Rapid
    'rapid-10-0': {
      name: 'Rapid',
      minutes: 10,
      seconds: 0,
      increment: 0,
      displayName: '10+0'
    },
    'rapid-15-10': {
      name: 'Rapid',
      minutes: 15,
      seconds: 0,
      increment: 10,
      displayName: '15+10'
    },
    'rapid-25-10': {
      name: 'Rapid',
      minutes: 25,
      seconds: 0,
      increment: 10,
      displayName: '25+10'
    },

    // Classical
    'classical-30-0': {
      name: 'Classical',
      minutes: 30,
      seconds: 0,
      increment: 0,
      displayName: '30+0'
    },
    'classical-45-15': {
      name: 'Classical',
      minutes: 45,
      seconds: 0,
      increment: 15,
      displayName: '45+15'
    },
    'classical-60-30': {
      name: 'Classical',
      minutes: 60,
      seconds: 0,
      increment: 30,
      displayName: '60+30'
    },

    // Custom
    'custom': {
      name: 'Custom',
      minutes: 0,
      seconds: 0,
      increment: 0,
      displayName: 'Custom'
    }
  };

  /**
   * Get time control configuration
   * @param {string} format - Format key (e.g., 'bullet', 'blitz-3-2')
   * @returns {object} Time control configuration
   */
  static getFormat(format) {
    return TimeControls.FORMATS[format] || TimeControls.FORMATS['rapid-10-0'];
  }

  /**
   * Get total time in seconds for a format
   * @param {string} format - Format key
   * @returns {number} Total seconds per player
   */
  static getTotalSeconds(format) {
    const config = TimeControls.getFormat(format);
    return config.minutes * 60 + config.seconds;
  }

  /**
   * Get time category/name
   * @param {string} format - Format key
   * @returns {string} Category name
   */
  static getCategory(format) {
    return TimeControls.getFormat(format).name;
  }

  /**
   * Get display string
   * @param {string} format - Format key
   * @returns {string} Display format (e.g., "3+2")
   */
  static getDisplayName(format) {
    return TimeControls.getFormat(format).displayName;
  }

  /**
   * Get all available formats in a category
   * @param {string} category - 'bullet', 'blitz', 'rapid', 'classical'
   * @returns {array} Array of format keys
   */
  static getFormatsByCategory(category) {
    return Object.keys(TimeControls.FORMATS).filter(key => {
      const format = TimeControls.FORMATS[key];
      return format.name.toLowerCase() === category.toLowerCase();
    });
  }

  /**
   * Get all formats
   * @returns {object} All time control formats
   */
  static getAllFormats() {
    return TimeControls.FORMATS;
  }

  /**
   * Get recommended difficulty based on time control
   * @param {string} format - Format key
   * @returns {string} Recommended AI difficulty ('easy', 'medium', 'hard', 'expert')
   */
  static getRecommendedAIDifficulty(format) {
    const seconds = TimeControls.getTotalSeconds(format);

    if (seconds < 120) return 'expert';       // Bullet: hardest
    if (seconds < 300) return 'hard';         // Fast blitz
    if (seconds < 600) return 'medium';       // Blitz
    if (seconds < 1800) return 'medium';      // Rapid
    return 'easy';                             // Classical: easier for learning
  }

  /**
   * Get rating adjustment based on time control
   * In bullet/blitz, rating changes are typically reduced
   * @param {string} format - Format key
   * @returns {number} Multiplier for rating change (0-1)
   */
  static getRatingMultiplier(format) {
    const category = TimeControls.getCategory(format);

    if (category === 'Bullet') return 0.5;    // Half points in bullet
    if (category === 'Blitz') return 0.75;    // 75% in blitz
    if (category === 'Rapid') return 1.0;     // Full points in rapid
    return 1.0;                               // Full points in classical
  }

  /**
   * Format seconds to readable time
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time (e.g., "5:30")
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Get time categories for UI selection
   * @returns {array} Array of category objects
   */
  static getCategories() {
    return [
      { name: 'Bullet', description: 'Very fast games (1-2 minutes)', formats: TimeControls.getFormatsByCategory('bullet') },
      { name: 'Blitz', description: 'Fast games (3-5 minutes)', formats: TimeControls.getFormatsByCategory('blitz') },
      { name: 'Rapid', description: 'Medium games (10-25 minutes)', formats: TimeControls.getFormatsByCategory('rapid') },
      { name: 'Classical', description: 'Slow games (30+ minutes)', formats: TimeControls.getFormatsByCategory('classical') }
    ];
  }

  /**
   * Validate time control format
   * @param {string} format - Format to validate
   * @returns {boolean} Is valid format
   */
  static isValidFormat(format) {
    return format in TimeControls.FORMATS;
  }

  /**
   * Create custom time control
   * @param {number} minutes - Minutes per player
   * @param {number} increment - Increment in seconds per move
   * @returns {object} Custom time control config
   */
  static createCustomFormat(minutes, increment = 0) {
    return {
      name: 'Custom',
      minutes,
      seconds: 0,
      increment,
      displayName: `${minutes}+${increment}`
    };
  }
}

module.exports = TimeControls;
