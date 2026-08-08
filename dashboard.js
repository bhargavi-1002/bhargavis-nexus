/**
 * BHARGAVI'S NEXUS - DASHBOARD INTERACTIVITY & AMBIENT CANVAS
 */

(function () {
    'use strict';

    // Ensure DOM is loaded before initializing dashboard mechanics
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    document.addEventListener('DOMContentLoaded', function () {
        initAmbientCanvas();
        initSearchAndFilters();
        initHighScoreDisplay();
        initAudioControls();
        initMobileDrawer();
    });

    // =========================================================================
    // 1. Ambient Floating Particles & Glass Orbs Canvas
    // =========================================================================
    function initAmbientCanvas() {
        var canvas = document.getElementById('ambient-canvas');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var width = canvas.width = window.innerWidth;
        var height = canvas.height = window.innerHeight;

        window.addEventListener('resize', function () {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        var particles = [];
        var numParticles = Math.min(Math.floor(width / 35), 45);
        var colors = [
            'rgba(56, 189, 248, ',  // Cyan
            'rgba(129, 140, 248, ', // Indigo
            'rgba(244, 63, 94, ',   // Rose
            'rgba(168, 85, 247, ',  // Purple
            'rgba(16, 185, 129, '   // Emerald
        ];

        for (var i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1.5,
                colorBase: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.4 + 0.1,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulseAngle: Math.random() * Math.PI * 2
            });
        }

        function render() {
            ctx.clearRect(0, 0, width, height);

            for (var j = 0; j < particles.length; j++) {
                var p = particles[j];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                p.pulseAngle += p.pulseSpeed;
                var currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.15;
                if (currentAlpha < 0.05) currentAlpha = 0.05;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.colorBase + currentAlpha + ')';
                ctx.shadowColor = p.colorBase + '0.6)';
                ctx.shadowBlur = 10;
                ctx.fill();
            }

            requestAnimationFrame(render);
        }

        render();
    }

    // =========================================================================
    // 2. Real-Time Search & Category Tag Filtering
    // =========================================================================
    function initSearchAndFilters() {
        var searchInput = document.getElementById('game-search-input');
        var clearSearchBtn = document.getElementById('clear-search-btn');
        var filterContainer = document.getElementById('category-filter-tags');
        var cards = document.querySelectorAll('.game-card');
        var emptyState = document.getElementById('empty-state');
        var resetFilterBtn = document.getElementById('reset-filter-btn');
        var statVisible = document.getElementById('stat-visible-games');
        var activeCategory = 'all';

        function applyFilter() {
            var query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            var visibleCount = 0;

            if (clearSearchBtn) {
                if (query.length > 0) {
                    clearSearchBtn.classList.remove('hidden');
                } else {
                    clearSearchBtn.classList.add('hidden');
                }
            }

            cards.forEach(function (card) {
                var title = card.getAttribute('data-title') || card.querySelector('h2').textContent;
                var desc = card.getAttribute('data-desc') || card.querySelector('p').textContent;
                var category = card.getAttribute('data-category') || '';

                var matchesSearch = title.toLowerCase().indexOf(query) !== -1 || desc.toLowerCase().indexOf(query) !== -1;
                var matchesCategory = (activeCategory === 'all') || (category === activeCategory);

                if (matchesSearch && matchesCategory) {
                    card.style.display = 'flex';
                    card.classList.add('fade-in');
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in');
                }
            });

            if (emptyState) {
                if (visibleCount === 0) {
                    emptyState.classList.remove('hidden');
                } else {
                    emptyState.classList.add('hidden');
                }
            }

            if (statVisible) {
                statVisible.textContent = visibleCount;
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                applyFilter();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                    window.ArcadeSDK.SoundManager.playClick();
                }
                applyFilter();
            });
        }

        if (filterContainer) {
            filterContainer.addEventListener('click', function (e) {
                var tag = e.target.closest('.filter-tag');
                if (!tag) return;

                var category = tag.getAttribute('data-category');
                if (!category) return;

                activeCategory = category;

                var allTags = filterContainer.querySelectorAll('.filter-tag');
                allTags.forEach(function (t) { t.classList.remove('active'); });
                tag.classList.add('active');

                if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                    window.ArcadeSDK.SoundManager.playSelect();
                }

                applyFilter();
            });
        }

        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', function () {
                if (searchInput) searchInput.value = '';
                activeCategory = 'all';

                if (filterContainer) {
                    var allTags = filterContainer.querySelectorAll('.filter-tag');
                    allTags.forEach(function (t) {
                        if (t.getAttribute('data-category') === 'all') {
                            t.classList.add('active');
                        } else {
                            t.classList.remove('active');
                        }
                    });
                }

                if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                    window.ArcadeSDK.SoundManager.playSelect();
                }

                applyFilter();
            });
        }

        // Global Keyboard Shortcut: '/' to focus search input, 'Esc' to clear
        document.addEventListener('keydown', function (e) {
            var activeElement = document.activeElement;
            var isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

            if (e.key === '/' && !isInput) {
                e.preventDefault();
                if (searchInput) searchInput.focus();
            } else if (e.key === 'Escape' && isInput) {
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.blur();
                    applyFilter();
                }
            }
        });
    }

    // =========================================================================
    // 3. Dynamic High Score Synchronization
    // =========================================================================
    function initHighScoreDisplay() {
        function updateScores() {
            if (!window.ArcadeSDK) return;

            var scores = window.ArcadeSDK.getAllScores();
            var totalScore = window.ArcadeSDK.getTotalScore();

            for (var gameId in scores) {
                if (scores.hasOwnProperty(gameId)) {
                    var el = document.getElementById('score-' + gameId);
                    if (el) {
                        el.textContent = scores[gameId].toLocaleString();
                    }
                }
            }

            var totalStatEl = document.getElementById('stat-aggregate-score');
            if (totalStatEl) {
                totalStatEl.textContent = totalScore.toLocaleString();
            }
        }

        updateScores();

        // Listen for custom SDK score updates
        window.addEventListener('arcadeScoreUpdated', function () {
            updateScores();
        });
    }

    // =========================================================================
    // 4. Web Audio SFX & UI Audio Controls
    // =========================================================================
    function initAudioControls() {
        var soundToggleBtn = document.getElementById('sound-toggle-btn');
        var soundIcon = document.getElementById('sound-icon');
        var soundLabel = document.getElementById('sound-label');

        function updateBtnUI() {
            if (!window.ArcadeSDK || !window.ArcadeSDK.SoundManager) return;
            var isMuted = window.ArcadeSDK.SoundManager.isMuted();

            if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
            if (soundLabel) soundLabel.textContent = isMuted ? 'Sound OFF' : 'Sound ON';

            if (soundToggleBtn) {
                if (isMuted) {
                    soundToggleBtn.classList.add('muted');
                } else {
                    soundToggleBtn.classList.remove('muted');
                }
            }
        }

        updateBtnUI();

        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', function () {
                if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                    window.ArcadeSDK.SoundManager.toggleMute();
                    updateBtnUI();
                    if (!window.ArcadeSDK.SoundManager.isMuted()) {
                        window.ArcadeSDK.SoundManager.playSelect();
                    }
                }
            });
        }

        // Attach hover & click sound effects to interactive cards and buttons
        var interactiveEls = document.querySelectorAll('.game-card, .glass-btn, .filter-tag');
        interactiveEls.forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                    window.ArcadeSDK.SoundManager.playHover();
                }
            });

            el.addEventListener('click', function () {
                if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                    window.ArcadeSDK.SoundManager.playClick();
                }
            });
        });
    }

    // =========================================================================
    // 5. Mobile Responsive Navigation Drawer
    // =========================================================================
    function initMobileDrawer() {
        var mobileMenuBtn = document.getElementById('mobile-menu-btn');
        var mobileDrawer = document.getElementById('mobile-drawer');
        var closeDrawerBtn = document.getElementById('close-drawer-btn');
        var drawerCategoryTags = document.getElementById('drawer-category-tags');
        var resetScoresBtn = document.getElementById('reset-scores-btn');

        function openDrawer() {
            if (mobileDrawer) mobileDrawer.classList.remove('hidden');
            if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                window.ArcadeSDK.SoundManager.playSelect();
            }
        }

        function closeDrawer() {
            if (mobileDrawer) mobileDrawer.classList.add('hidden');
            if (window.ArcadeSDK && window.ArcadeSDK.SoundManager) {
                window.ArcadeSDK.SoundManager.playClick();
            }
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', openDrawer);
        }

        if (closeDrawerBtn) {
            closeDrawerBtn.addEventListener('click', closeDrawer);
        }

        if (drawerCategoryTags) {
            drawerCategoryTags.addEventListener('click', function (e) {
                var btn = e.target.closest('.drawer-tag-btn');
                if (!btn) return;

                var category = btn.getAttribute('data-category');
                var mainFilter = document.querySelector('#category-filter-tags .filter-tag[data-category="' + category + '"]');
                if (mainFilter) {
                    mainFilter.click();
                }

                var allDrawerBtns = drawerCategoryTags.querySelectorAll('.drawer-tag-btn');
                allDrawerBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');

                closeDrawer();
            });
        }

        if (resetScoresBtn) {
            resetScoresBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to reset all high scores on Bhargavi\'s Nexus?')) {
                    if (window.ArcadeSDK && window.ArcadeSDK.HighScore) {
                        window.ArcadeSDK.HighScore.clearAllScores();
                        if (window.ArcadeSDK.SoundManager) {
                            window.ArcadeSDK.SoundManager.playSuccess();
                        }
                        alert('All platform high scores have been reset.');
                        closeDrawer();
                    }
                }
            });
        }
    }

})();
