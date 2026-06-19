(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    start();
  }

  function initLocalFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-type]"));
    var input = panel.querySelector("[data-local-search]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var type = "all";
    var term = "";

    function apply() {
      cards.forEach(function (card) {
        var cardType = card.getAttribute("data-type") || "";
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var typeMatch = type === "all" || cardType === type;
        var textMatch = !term || text.indexOf(term) > -1;
        card.classList.toggle("is-hidden", !(typeMatch && textMatch));
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        type = button.getAttribute("data-filter-type") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", function () {
        term = input.value.trim().toLowerCase();
        apply();
      });
    }
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player-box]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video[data-stream]");
      var trigger = box.querySelector("[data-play-trigger]");
      if (!video || !trigger) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !stream) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        trigger.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            trigger.classList.remove("is-hidden");
          });
        }
      }

      trigger.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        trigger.classList.add("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var output = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!form || !input || !output || !status || !window.MovieSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (ch) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[ch];
      });
    }

    function render() {
      var term = input.value.trim().toLowerCase();
      if (!term) {
        output.innerHTML = "";
        status.textContent = "输入关键词开始搜索";
        return;
      }
      var results = window.MovieSearchData.filter(function (movie) {
        return movie.text.toLowerCase().indexOf(term) > -1;
      }).slice(0, 96);
      status.textContent = results.length ? "找到 " + results.length + " 部相关影片" : "暂无匹配影片";
      output.innerHTML = results.map(function (movie) {
        return "<a class=\"search-result-card\" href=\"" + escapeHtml(movie.url) + "\">" +
          "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span><h2>" + escapeHtml(movie.title) + "</h2>" +
          "<p>" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.genre) + "</p>" +
          "<p>" + escapeHtml(movie.oneLine) + "</p></span></a>";
      }).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var term = input.value.trim();
      var nextUrl = term ? "./search.html?q=" + encodeURIComponent(term) : "./search.html";
      window.history.replaceState(null, "", nextUrl);
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });
})();
