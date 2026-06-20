(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getPrefix() {
    var path = window.location.pathname;
    if (path.indexOf('/movie/') !== -1 || path.indexOf('/category/') !== -1) {
      return '../';
    }
    return '';
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.classList.toggle('is-active');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('.hero-carousel');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('.hero-thumb'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.concat(thumbs).forEach(function (button) {
      button.addEventListener('click', function () {
        var target = Number(button.getAttribute('data-target')) || 0;
        show(target);
        schedule();
      });
    });

    carousel.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    carousel.addEventListener('mouseleave', schedule);
    schedule();
  }

  function setupFilterGrids() {
    var wrappers = Array.prototype.slice.call(document.querySelectorAll('.js-filter-grid'));
    wrappers.forEach(function (wrapper) {
      var keywordInput = wrapper.querySelector('.js-page-filter');
      var genreSelect = wrapper.querySelector('.js-genre-filter');
      var sortSelect = wrapper.querySelector('.js-sort-select');
      var grid = wrapper.querySelector('.movie-grid');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function cardText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
      }

      function filter() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var genre = genreSelect ? genreSelect.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = cardText(card);
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchGenre = !genre || text.indexOf(genre) !== -1;
          card.hidden = !(matchKeyword && matchGenre);
        });
      }

      function sortCards() {
        var type = sortSelect ? sortSelect.value : 'default';
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (type === 'heat') {
            return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
          }
          if (type === 'score') {
            return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
          }
          if (type === 'year') {
            return String(b.getAttribute('data-year')).localeCompare(String(a.getAttribute('data-year')), 'zh-Hans-CN');
          }
          if (type === 'title') {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          }
          return 0;
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (keywordInput) {
        keywordInput.addEventListener('input', filter);
      }
      if (genreSelect) {
        genreSelect.addEventListener('change', filter);
      }
      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          sortCards();
          filter();
        });
      }
    });
  }

  function setupSearchPage() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var meta = document.getElementById('searchMeta');
    if (!input || !results || !meta || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function createCard(movie, prefix) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card">' +
        '<a class="poster-link" href="' + prefix + escapeHtml(movie.url) + '">' +
        '<img src="' + prefix + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="play-icon">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<h3><a href="' + prefix + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.description) + '</p>' +
        '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function render() {
      var term = input.value.trim().toLowerCase();
      var list = window.MOVIE_INDEX.filter(function (movie) {
        if (!term) {
          return true;
        }
        return [movie.title, movie.description, movie.category, movie.genre, movie.year, movie.region, movie.type, (movie.tags || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .indexOf(term) !== -1;
      }).slice(0, 240);
      meta.textContent = term ? '搜索结果：' + input.value.trim() : '热门片库';
      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }
      results.innerHTML = list.map(function (movie) {
        return createCard(movie, '');
      }).join('');
    }

    input.addEventListener('input', render);
    render();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-layer');
      var message = shell.querySelector('.player-message');
      var videoUrl = shell.getAttribute('data-video');
      var started = false;
      var hls = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function start() {
        if (!video || !videoUrl) {
          setMessage('播放地址暂不可用');
          return;
        }
        if (!started) {
          started = true;
          if (button) {
            button.classList.add('is-hidden');
          }
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage('播放出错，请刷新后重试');
                hls.destroy();
                hls = null;
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
          } else {
            video.src = videoUrl;
          }
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('点击视频控制栏开始播放');
          });
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      shell.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (!started) {
          start();
        }
      });
    });
  }

  function setupSmoothPlayLinks() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.scroll-play'));
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilterGrids();
    setupSearchPage();
    setupPlayers();
    setupSmoothPlayLinks();
  });
}());
