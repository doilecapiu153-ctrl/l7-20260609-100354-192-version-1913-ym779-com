(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearSearch = document.querySelector('[data-clear-search]');
  var cardList = document.querySelector('[data-card-list]');
  var emptyState = document.querySelector('[data-empty-state]');

  function applySearch() {
    if (!searchInput || !cardList) {
      return;
    }
    var query = searchInput.value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-search]'));
    var visibleCount = 0;
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var visible = !query || haystack.indexOf(query) !== -1;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (clearSearch && searchInput) {
    clearSearch.addEventListener('click', function () {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }

  function attachPlayer(shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('.play-trigger');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;

    function playVideo() {
      if (!video || !stream) {
        return;
      }
      shell.classList.add('player-ready');
      video.controls = true;

      if (video.getAttribute('data-loaded') === 'true') {
        video.play().catch(function () {});
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.setAttribute('data-loaded', 'true');
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.setAttribute('data-loaded', 'true');
          video.play().catch(function () {});
        });
      }
    }

    shell.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('video')) {
        return;
      }
      playVideo();
    });

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        shell.classList.add('player-ready');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
