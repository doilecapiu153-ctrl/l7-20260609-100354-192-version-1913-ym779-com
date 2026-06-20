(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (navButton && mobilePanel) {
    navButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    var reset = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        reset();
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
        reset();
      });
    });
    show(0);
    start();
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  forms.forEach(function (form) {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var input = form.querySelector('[data-filter-input]');
    var typeFilter = form.querySelector('[data-type-filter]');
    var categoryFilter = form.querySelector('[data-category-filter]');
    var empty = document.querySelector('[data-filter-empty]');
    var activeChip = '';
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('keyword') || '';
    if (input && keyword && !input.value) {
      input.value = keyword;
    }
    var normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };
    var apply = function () {
      var query = normalize(input ? input.value : '');
      var typeValue = normalize(typeFilter ? typeFilter.value : '');
      var categoryValue = normalize(categoryFilter ? categoryFilter.value : '');
      var chipValue = normalize(activeChip);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
          ok = false;
        }
        if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
          ok = false;
        }
        if (chipValue && haystack.indexOf(chipValue) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, apply);
      }
      if (typeFilter) {
        typeFilter.addEventListener(eventName, apply);
      }
      if (categoryFilter) {
        categoryFilter.addEventListener(eventName, apply);
      }
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-chip-filter]')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-chip-filter') || '';
        Array.prototype.slice.call(document.querySelectorAll('[data-chip-filter]')).forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });
    apply();
  });
})();
