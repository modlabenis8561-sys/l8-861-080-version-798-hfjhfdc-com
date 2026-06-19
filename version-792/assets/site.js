const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalizeText(value) {
  return (value || '').toString().toLowerCase().replace(/\s+/g, '');
}

function setupMenu() {
  const button = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileNav');
  if (!button || !menu) {
    return;
  }
  button.addEventListener('click', () => {
    const opened = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!opened));
    menu.hidden = opened;
  });
}

function setupHero() {
  const slides = selectAll('.hero-slide');
  const dots = selectAll('.hero-dot');
  if (!slides.length) {
    return;
  }
  let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
  const show = nextIndex => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  };
  dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => show(dotIndex)));
  window.setInterval(() => show(index + 1), 5200);
}

function setupSearch() {
  const cards = selectAll('.movie-card, .ranking-item');
  const localInputs = selectAll('.instant-search');
  const filterButtons = selectAll('.filter-chip');
  const noResults = document.querySelector('.no-results');
  let activeFilter = 'all';

  const apply = term => {
    const query = normalizeText(term);
    let visible = 0;
    cards.forEach(card => {
      const source = normalizeText(card.dataset.search);
      const type = card.dataset.type || '';
      const matchText = !query || source.includes(query);
      const matchFilter = activeFilter === 'all' || type.includes(activeFilter) || card.dataset.category === activeFilter;
      const ok = matchText && matchFilter;
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });
    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  if (initial) {
    localInputs.forEach(input => {
      input.value = initial;
    });
  }
  if (cards.length && (initial || localInputs.length)) {
    apply(initial);
  }

  localInputs.forEach(input => {
    input.addEventListener('input', () => apply(input.value));
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach(item => item.classList.toggle('is-active', item === button));
      const input = localInputs[0];
      apply(input ? input.value : '');
    });
  });
}

function setupImages() {
  selectAll('img').forEach(image => {
    image.addEventListener('error', () => {
      image.style.opacity = '0';
    }, { once: true });
  });
}

async function setupPlayers() {
  const players = selectAll('.video-player');
  if (!players.length) {
    return;
  }

  let HlsModule = null;
  const loadModule = async () => {
    if (!HlsModule) {
      HlsModule = await import('./hls.js');
    }
    return HlsModule.H;
  };

  players.forEach(video => {
    const shell = video.closest('.video-shell');
    const button = shell ? shell.querySelector('.play-overlay') : null;
    const state = shell ? shell.querySelector('.player-state') : null;
    const stream = video.dataset.stream;
    let ready = false;

    const setState = text => {
      if (state) {
        state.textContent = text;
      }
    };

    const play = async () => {
      if (!stream) {
        setState('暂未接入播放');
        return;
      }
      try {
        if (!ready) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else {
            const Hls = await loadModule();
            if (Hls && Hls.isSupported()) {
              const hls = new Hls({ lowLatencyMode: true, backBufferLength: 60 });
              hls.loadSource(stream);
              hls.attachMedia(video);
            } else {
              video.src = stream;
            }
          }
          ready = true;
        }
        video.controls = true;
        if (button) {
          button.hidden = true;
        }
        setState('');
        await video.play();
      } catch (error) {
        if (button) {
          button.hidden = false;
        }
        setState('播放失败，请稍后再试');
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMenu();
  setupHero();
  setupSearch();
  setupImages();
  setupPlayers();
});
