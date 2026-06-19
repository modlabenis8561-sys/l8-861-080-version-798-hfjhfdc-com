(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            button.classList.toggle("is-open");
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type")
        ].join(" ").toLowerCase();
    }

    function setupFiltering() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var active = "all";
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var text = textOf(card);
                var passQuery = !query || text.indexOf(query) !== -1;
                var passFilter = active === "all" || text.indexOf(active.toLowerCase()) !== -1;
                card.classList.toggle("is-hidden", !(passQuery && passFilter));
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                active = button.getAttribute("data-filter") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        var globalInput = document.querySelector("[data-global-search]");
        if (q) {
            if (input) {
                input.value = q;
            }
            if (globalInput) {
                globalInput.value = q;
            }
            apply();
        }
    }

    window.initMoviePlayer = function (id, source) {
        var box = document.getElementById(id);
        if (!box) {
            return;
        }
        var video = box.querySelector("video");
        var overlay = box.querySelector(".player-overlay");
        var hls;
        if (!video || !source) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        }
        function play() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", function () {
                overlay.classList.add("is-hidden");
                play();
            });
        }
        video.addEventListener("playing", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
    });
})();
