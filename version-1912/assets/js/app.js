(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function closestCardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
    }

    function openMobileMenu() {
        var button = one('[data-menu-button]');
        var menu = one('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        all('[data-hero-slider]').forEach(function (slider) {
            var slides = all('[data-hero-slide]', slider);
            var dots = all('[data-hero-dot]', slider);
            if (slides.length <= 1) {
                return;
            }
            var index = 0;
            function activate(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    activate(i);
                });
            });
            window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        });
    }

    function initSearchRedirect() {
        all('[data-jump-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = one('input[name="q"]', form);
                var keyword = input ? input.value.trim() : '';
                var target = form.getAttribute('data-search-target') || 'search.html';
                if (keyword) {
                    window.location.href = target + '?q=' + encodeURIComponent(keyword);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initFilters() {
        var panel = one('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var keywordInput = one('[data-filter-keyword]', panel);
        var yearSelect = one('[data-filter-year]', panel);
        var regionSelect = one('[data-filter-region]', panel);
        var typeSelect = one('[data-filter-type]', panel);
        var cards = all('[data-search-card]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && keywordInput) {
            keywordInput.value = q;
        }
        function valueOf(el) {
            return el ? el.value.trim().toLowerCase() : '';
        }
        function apply() {
            var keyword = valueOf(keywordInput);
            var year = valueOf(yearSelect);
            var region = valueOf(regionSelect);
            var type = valueOf(typeSelect);
            cards.forEach(function (card) {
                var text = closestCardText(card);
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
                    ok = false;
                }
                if (region && (card.getAttribute('data-region') || '').toLowerCase() !== region) {
                    ok = false;
                }
                if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
                    ok = false;
                }
                card.classList.toggle('hidden-by-filter', !ok);
            });
        }
        [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (el) {
            if (!el) {
                return;
            }
            el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
        });
        apply();
    }

    function initPlayers() {
        all('[data-player]').forEach(function (player) {
            var video = one('video', player);
            var button = one('[data-play-button]', player);
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-video-url');
            function start() {
                if (!source) {
                    return;
                }
                if (button) {
                    button.classList.add('is-hidden');
                }
                if (video.getAttribute('data-ready') === '1') {
                    video.play();
                    return;
                }
                video.setAttribute('data-ready', '1');
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                    video._hls = hls;
                } else {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play();
                    }, { once: true });
                    video.load();
                }
            }
            if (button) {
                button.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (video.getAttribute('data-ready') !== '1') {
                    start();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        openMobileMenu();
        initHero();
        initSearchRedirect();
        initFilters();
        initPlayers();
    });
})();
