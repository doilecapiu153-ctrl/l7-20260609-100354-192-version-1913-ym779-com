(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var button = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                stop();
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initFilters() {
        var listRoot = document.querySelector('[data-list-root]');
        if (!listRoot) {
            return;
        }
        var cards = selectAll('[data-movie-card]', listRoot);
        var panel = document.querySelector('[data-filter-panel]');
        var input = document.querySelector('[data-page-search]');
        var state = document.querySelector('[data-result-state]');
        var activeYear = '';
        var activeType = '';
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function setButtons(target) {
            if (!panel || !target) {
                return;
            }
            selectAll('button', panel).forEach(function (button) {
                if (button.hasAttribute('data-filter-all')) {
                    button.classList.toggle('active', !activeYear && !activeType);
                } else if (button.hasAttribute('data-filter-year')) {
                    button.classList.toggle('active', button === target && Boolean(activeYear));
                } else if (button.hasAttribute('data-filter-type')) {
                    button.classList.toggle('active', button === target && Boolean(activeType));
                }
            });
        }

        function apply() {
            var text = normalize(input ? input.value : query);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search') || card.textContent);
                var year = card.getAttribute('data-year') || '';
                var type = card.getAttribute('data-type') || '';
                var ok = true;
                if (text && haystack.indexOf(text) === -1) {
                    ok = false;
                }
                if (activeYear && year !== activeYear) {
                    ok = false;
                }
                if (activeType && type !== activeType) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (state) {
                state.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (panel) {
            panel.addEventListener('click', function (event) {
                var button = event.target.closest('button');
                if (!button) {
                    return;
                }
                if (button.hasAttribute('data-filter-all')) {
                    activeYear = '';
                    activeType = '';
                    if (input) {
                        input.value = '';
                    }
                    setButtons(button);
                    apply();
                    return;
                }
                if (button.hasAttribute('data-filter-year')) {
                    activeYear = button.getAttribute('data-filter-year') || '';
                    activeType = '';
                    setButtons(button);
                    apply();
                    return;
                }
                if (button.hasAttribute('data-filter-type')) {
                    activeType = button.getAttribute('data-filter-type') || '';
                    activeYear = '';
                    setButtons(button);
                    apply();
                    return;
                }
                if (button.hasAttribute('data-clear-filter')) {
                    activeYear = '';
                    activeType = '';
                    if (input) {
                        input.value = '';
                    }
                    setButtons(button);
                    apply();
                }
            });
        }

        apply();
    }

    function initHeaderSearch() {
        var fields = selectAll('[data-header-search]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        fields.forEach(function (field) {
            if (query && !field.value) {
                field.value = query;
            }
        });
    }

    function initPlayer() {
        var players = selectAll('[data-player]');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var source = player.getAttribute('data-src') || '';
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function loadSource() {
                if (video.getAttribute('data-loaded') === '1') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hlsInstance) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            } else {
                                hlsInstance.destroy();
                                video.src = source;
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                video.setAttribute('data-loaded', '1');
            }

            function playVideo() {
                loadSource();
                player.classList.add('playing');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        player.classList.remove('playing');
                    });
                }
            }

            button.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                if (!video.seeking) {
                    player.classList.remove('playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initFavorite() {
        var button = document.querySelector('[data-favorite]');
        if (!button) {
            return;
        }
        var id = button.getAttribute('data-favorite');
        var key = 'movie_favorites';
        var saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (error) {
            saved = [];
        }
        function render() {
            button.textContent = saved.indexOf(id) === -1 ? '收藏' : '已收藏';
        }
        button.addEventListener('click', function () {
            var index = saved.indexOf(id);
            if (index === -1) {
                saved.push(id);
            } else {
                saved.splice(index, 1);
            }
            localStorage.setItem(key, JSON.stringify(saved));
            render();
        });
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHeaderSearch();
        initHero();
        initFilters();
        initPlayer();
        initFavorite();
    });
})();
