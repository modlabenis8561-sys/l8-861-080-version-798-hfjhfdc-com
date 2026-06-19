(function () {
  function getBase() {
    return document.body.getAttribute('data-base') || './';
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function initSearchForms() {
    var base = getBase();
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = base + 'search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function matchesCard(card, keyword, genre, year) {
    var text = [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-tags') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
    var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
    var keywordOk = !keyword || text.indexOf(keyword) !== -1;
    var genreOk = !genre || cardGenre.indexOf(genre) !== -1;
    var yearOk = !year || cardYear === year;
    return keywordOk && genreOk && yearOk;
  }

  function initLocalFilters() {
    var filter = document.querySelector('[data-local-filter]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!filter || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-card'));
    var keywordInput = filter.querySelector('input[name="keyword"]');
    var genreSelect = filter.querySelector('select[name="genre"]');
    var yearSelect = filter.querySelector('select[name="year"]');
    var reset = filter.querySelector('[data-reset-filter]');
    var status = document.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var genre = genreSelect ? genreSelect.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchesCard(card, keyword, genre, year);
        card.classList.toggle('is-filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = keyword ? '搜索结果：' + keyword + '，匹配 ' + visible + ' 部影片。' : '请输入关键词或使用下方筛选。';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (keywordInput) {
        keywordInput.addEventListener(eventName, apply);
      }
      if (genreSelect) {
        genreSelect.addEventListener(eventName, apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener(eventName, apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        filter.reset();
        if (keywordInput) {
          keywordInput.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function initPlayer() {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function attachSource() {
      if (!source || video.getAttribute('data-ready') === 'true') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
      attachSource();
      if (button) {
        button.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && !video.ended) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchForms();
    initLocalFilters();
    initPlayer();
  });
})();
