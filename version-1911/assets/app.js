(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 6200);
        }
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
        var genreSelect = filterPanel.querySelector('[data-filter-genre]');
        var regionSelect = filterPanel.querySelector('[data-filter-region]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var resultCount = filterPanel.querySelector('[data-result-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && keywordInput) {
            keywordInput.value = initialQuery;
        }

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var genre = normalize(genreSelect && genreSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var tags = normalize(card.getAttribute('data-tags'));
                var year = normalize(card.getAttribute('data-year'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var haystack = [title, tags, year, cardRegion, cardType].join(' ');
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (genre && tags.indexOf(genre) === -1) {
                    matched = false;
                }

                if (region && cardRegion.indexOf(region) === -1) {
                    matched = false;
                }

                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = '匹配影片 ' + visible;
            }
        }

        [keywordInput, genreSelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function setupPlayer(card) {
        var shell = card.querySelector('.player-shell');
        var video = card.querySelector('[data-player]');
        var mainButton = card.querySelector('[data-player-play]');
        var toggleButton = card.querySelector('[data-player-toggle]');
        var muteButton = card.querySelector('[data-player-mute]');
        var fullscreenButton = card.querySelector('[data-player-fullscreen]');
        var message = card.querySelector('[data-player-message]');

        if (!shell || !video) {
            return;
        }

        var streamUrl = video.getAttribute('data-stream');
        var loaded = false;

        function setMessage(value) {
            if (message) {
                message.textContent = value || '';
            }
        }

        function loadStream() {
            if (loaded || !streamUrl) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setMessage('播放加载失败，请稍后再试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                setMessage('当前环境暂时无法播放该视频');
            }
        }

        function playVideo() {
            loadStream();
            var playPromise = video.play();

            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    setMessage('点击播放按钮即可开始观看');
                });
            }
        }

        function togglePlay() {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        video.addEventListener('click', togglePlay);

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');

            if (mainButton) {
                mainButton.textContent = 'Ⅱ';
            }

            if (toggleButton) {
                toggleButton.textContent = '暂停';
            }

            setMessage('');
        });

        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');

            if (mainButton) {
                mainButton.textContent = '▶';
            }

            if (toggleButton) {
                toggleButton.textContent = '播放';
            }
        });

        [mainButton, toggleButton].forEach(function (button) {
            if (button) {
                button.addEventListener('click', togglePlay);
            }
        });

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        }

        loadStream();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player-card]')).forEach(setupPlayer);
}());
