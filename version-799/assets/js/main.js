(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var opened = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero-slider]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
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
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          restart();
        });
      });
      restart();
    }

    var filterInput = document.querySelector(".filter-input");
    var filterList = document.querySelector(".filter-list");
    if (filterInput && filterList) {
      filterInput.addEventListener("input", function () {
        var value = filterInput.value.trim().toLowerCase();
        var items = filterList.querySelectorAll(".movie-card, .rank-row");
        items.forEach(function (item) {
          var text = item.textContent.toLowerCase() + " " + Array.prototype.map.call(item.attributes, function (attribute) {
            return attribute.value;
          }).join(" ").toLowerCase();
          item.classList.toggle("is-filtered-out", value && text.indexOf(value) === -1);
        });
      });
    }

    var searchRoot = document.getElementById("search-results");
    if (searchRoot && window.STELLAR_SEARCH) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      var input = document.getElementById("search-page-input");
      if (input) {
        input.value = query;
      }
      if (!query) {
        searchRoot.innerHTML = "";
        return;
      }
      var lower = query.toLowerCase();
      var results = window.STELLAR_SEARCH.filter(function (movie) {
        return movie.search.indexOf(lower) !== -1;
      });
      searchRoot.innerHTML = results.map(function (movie) {
        return [
          "<article class=\"movie-card\">",
          "<a href=\"./" + movie.file + "\" aria-label=\"观看" + movie.title.replace(/\"/g, "&quot;") + "\">",
          "<figure class=\"poster-wrap\">",
          "<img src=\"./" + movie.cover + ".jpg\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\" loading=\"lazy\">",
          "<span class=\"poster-badge\">" + movie.region + "</span>",
          "<span class=\"poster-year\">" + movie.year + "</span>",
          "<div class=\"poster-shade\"><span class=\"play-chip\">立即观看</span></div>",
          "</figure>",
          "<div class=\"card-body compact\">",
          "<h3>" + movie.title + "</h3>",
          "<p>" + movie.oneLine + "</p>",
          "<div class=\"tag-row\"><span>" + movie.region + "</span><span>" + movie.type + "</span></div>",
          "</div>",
          "</a>",
          "</article>"
        ].join("");
      }).join("");
    }
  });
})();
