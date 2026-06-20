import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMenu() {
  const button = $('[data-menu-toggle]');
  const panel = $('[data-mobile-panel]');
  if (!button || !panel) {
    return;
  }
  button.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function initSiteSearch() {
  $$('[data-site-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('input[name="q"]', form);
      const keyword = input ? input.value.trim() : '';
      const target = form.getAttribute('data-search-url') || 'search.html';
      if (keyword) {
        window.location.href = `${target}?q=${encodeURIComponent(keyword)}`;
      } else {
        window.location.href = target;
      }
    });
  });
}

function initHero() {
  const root = $('[data-hero]');
  if (!root) {
    return;
  }
  const slides = $$('[data-hero-slide]', root);
  const dots = $$('[data-hero-dot]', root);
  if (slides.length < 2) {
    return;
  }
  let index = 0;
  const setActive = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const next = Number(dot.getAttribute('data-hero-dot'));
      setActive(next);
    });
  });
  setInterval(() => setActive(index + 1), 5200);
}

function initFilters() {
  const form = $('[data-filter-form]');
  const input = $('[data-filter-input]');
  const list = $('[data-filter-list]');
  const empty = $('[data-empty-state]');
  if (!form || !input || !list) {
    return;
  }
  const cards = $$('.movie-card', list);
  const apply = () => {
    const keyword = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const haystack = card.getAttribute('data-search') || '';
      const matched = !keyword || haystack.includes(keyword);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    apply();
  });
  input.addEventListener('input', apply);
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    input.value = query;
    apply();
  }
}

function initPlayer() {
  const video = $('[data-player-video]');
  const button = $('[data-play-button]');
  const stage = $('[data-player-stage]');
  if (!video) {
    return;
  }
  const stream = video.getAttribute('data-stream');
  if (!stream) {
    return;
  }
  let prepared = false;
  let hls = null;
  const prepare = () => {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  };
  const start = () => {
    prepare();
    if (stage) {
      stage.classList.add('is-playing');
    }
    video.controls = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        if (stage) {
          stage.classList.remove('is-playing');
        }
      });
    }
  };
  if (button) {
    button.addEventListener('click', start);
  }
  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', () => {
    if (stage) {
      stage.classList.add('is-playing');
    }
  });
  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSiteSearch();
  initHero();
  initFilters();
  initPlayer();
});
