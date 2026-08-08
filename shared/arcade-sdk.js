/**
 * BHARGAVI'S NEXUS - SHARED ARCADE SDK
 * 
 * Provides:
 * 1. High Score Persistence (localStorage getter/setter, aggregate total score)
 * 2. Web Audio Sound Manager (synthesized sound FX & mute preference)
 * 3. Automatic Navigation Overlay ("← Back to Arcade" button for game subpages)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ArcadeSDK = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var ALL_GAMES = [
        'cyber-runner',
        'endless-runner',
        'space-shooter',
        'memory-card-game',
        'number-guessing',
        'chess-game-3d',
        'tic-tac-toe',
        'pong-game',
        'snake-game'
    ];

    // =========================================================================
    // High Score Manager
    // =========================================================================
    var HighScoreManager = {
        getScore: function (gameId) {
            if (!gameId) return 0;
            try {
                var score = localStorage.getItem('arcade_score_' + gameId);
                return score !== null ? parseInt(score, 10) || 0 : 0;
            } catch (e) {
                return 0;
            }
        },

        saveScore: function (gameId, newScore) {
            if (!gameId) return false;
            var numScore = parseInt(newScore, 10);
            if (isNaN(numScore)) return false;

            var current = this.getScore(gameId);
            if (numScore > current) {
                try {
                    localStorage.setItem('arcade_score_' + gameId, numScore.toString());
                    this._notifyUpdate(gameId, numScore);
                    return true;
                } catch (e) {
                    console.warn('ArcadeSDK: Could not save high score to localStorage', e);
                }
            }
            return false;
        },

        getAllScores: function () {
            var scores = {};
            for (var i = 0; i < ALL_GAMES.length; i++) {
                var id = ALL_GAMES[i];
                scores[id] = this.getScore(id);
            }
            return scores;
        },

        getTotalScore: function () {
            var scores = this.getAllScores();
            var total = 0;
            for (var key in scores) {
                if (scores.hasOwnProperty(key)) {
                    total += scores[key];
                }
            }
            return total;
        },

        clearAllScores: function () {
            try {
                for (var i = 0; i < ALL_GAMES.length; i++) {
                    localStorage.removeItem('arcade_score_' + ALL_GAMES[i]);
                }
                this._notifyUpdate(null, 0);
                return true;
            } catch (e) {
                return false;
            }
        },

        _notifyUpdate: function (gameId, score) {
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                var event;
                if (typeof CustomEvent === 'function') {
                    event = new CustomEvent('arcadeScoreUpdated', {
                        detail: { gameId: gameId, score: score }
                    });
                } else if (document.createEvent) {
                    event = document.createEvent('Event');
                    event.initEvent('arcadeScoreUpdated', true, true);
                    event.detail = { gameId: gameId, score: score };
                }
                if (event) window.dispatchEvent(event);
            }
        }
    };

    // =========================================================================
    // Web Audio Sound FX Manager
    // =========================================================================
    var SoundManager = {
        _audioCtx: null,
        _muted: false,

        init: function () {
            try {
                this._muted = localStorage.getItem('arcade_sound_muted') === 'true';
            } catch (e) {
                this._muted = false;
            }

            if (typeof window !== 'undefined') {
                var self = this;
                var unlockAudio = function () {
                    self._getAudioContext();
                    window.removeEventListener('pointerdown', unlockAudio);
                    window.removeEventListener('keydown', unlockAudio);
                };
                window.addEventListener('pointerdown', unlockAudio);
                window.addEventListener('keydown', unlockAudio);
            }
        },

        _getAudioContext: function () {
            if (typeof window === 'undefined') return null;
            if (!this._audioCtx) {
                var AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this._audioCtx = new AudioContextClass();
                }
            }
            if (this._audioCtx && this._audioCtx.state === 'suspended') {
                this._audioCtx.resume().catch(function () {});
            }
            return this._audioCtx;
        },

        isMuted: function () {
            return this._muted;
        },

        setMuted: function (muted) {
            this._muted = !!muted;
            try {
                localStorage.setItem('arcade_sound_muted', this._muted ? 'true' : 'false');
            } catch (e) {}
            return this._muted;
        },

        toggleMute: function () {
            return this.setMuted(!this.isMuted());
        },

        playHover: function () {
            if (this._muted) return;
            var ctx = this._getAudioContext();
            if (!ctx) return;

            try {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                var now = ctx.currentTime;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(240, now);
                osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);

                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.04);
            } catch (e) {}
        },

        playSelect: function () {
            if (this._muted) return;
            var ctx = this._getAudioContext();
            if (!ctx) return;

            try {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                var now = ctx.currentTime;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.04); // E5

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.09);
            } catch (e) {}
        },

        playClick: function () {
            if (this._muted) return;
            var ctx = this._getAudioContext();
            if (!ctx) return;

            try {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                var now = ctx.currentTime;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.03);

                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.03);
            } catch (e) {}
        },

        playSuccess: function () {
            if (this._muted) return;
            var ctx = this._getAudioContext();
            if (!ctx) return;

            try {
                var now = ctx.currentTime;
                var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach(function (freq, index) {
                    var osc = ctx.createOscillator();
                    var gain = ctx.createGain();
                    var noteTime = now + (index * 0.06);

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, noteTime);

                    gain.gain.setValueAtTime(0.07, noteTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.08);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(noteTime);
                    osc.stop(noteTime + 0.08);
                });
            } catch (e) {}
        },

        playGameOver: function () {
            if (this._muted) return;
            var ctx = this._getAudioContext();
            if (!ctx) return;

            try {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                var now = ctx.currentTime;

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.3);
            } catch (e) {}
        }
    };

    // Initialize sound listener
    SoundManager.init();

    // =========================================================================
    // Navigation Injection Component ("← Back to Arcade")
    // =========================================================================
    var NavigationManager = {
        init: function (options) {
            if (typeof window === 'undefined' || typeof document === 'undefined') return;

            options = options || {};
            var homeUrl = options.homeUrl || '../index.html';
            
            // Check if we are inside a subfolder or if forceNav option is set
            var isSubfolder = options.forceNav || (window.location.pathname.split('/').filter(Boolean).length > 1);
            var alreadyExists = document.querySelector('.arcade-back-btn');

            if (!alreadyExists && (isSubfolder || options.alwaysShow)) {
                var btn = document.createElement('a');
                btn.className = 'arcade-back-btn';
                btn.href = homeUrl;
                btn.innerHTML = '← Back to Arcade';
                btn.setAttribute('aria-label', 'Return to Central Arcade Dashboard');

                btn.addEventListener('mouseenter', function () {
                    SoundManager.playHover();
                });
                btn.addEventListener('click', function () {
                    SoundManager.playSelect();
                });

                if (document.body) {
                    document.body.appendChild(btn);
                } else {
                    document.addEventListener('DOMContentLoaded', function () {
                        document.body.appendChild(btn);
                    });
                }
            }
        }
    };

    // Auto-run navigation check when DOM ready
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                NavigationManager.init();
            });
        } else {
            NavigationManager.init();
        }
    }

    // Export ArcadeSDK Public Interface
    return {
        HighScore: HighScoreManager,
        SoundManager: SoundManager,
        NavigationManager: NavigationManager,
        initNavigation: function (options) {
            return NavigationManager.init(options);
        },
        getHighScore: function (gameId) {
            return HighScoreManager.getScore(gameId);
        },
        saveHighScore: function (gameId, score) {
            return HighScoreManager.saveScore(gameId, score);
        },
        getAllScores: function () {
            return HighScoreManager.getAllScores();
        },
        getTotalScore: function () {
            return HighScoreManager.getTotalScore();
        }
    };
}));
