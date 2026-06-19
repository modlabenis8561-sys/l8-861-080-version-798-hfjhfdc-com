(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupSearch() {
        var input = document.getElementById("siteSearch");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }
        var filter = function () {
            var q = input.value.trim().toLowerCase();
            var items = document.querySelectorAll(".movie-card, .rank-item");
            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute("data-title") || "",
                    item.getAttribute("data-meta") || "",
                    item.getAttribute("data-tags") || "",
                    item.textContent || ""
                ].join(" ").toLowerCase();
                item.classList.toggle("is-filtered-out", q && haystack.indexOf(q) === -1);
            });
        };
        input.addEventListener("input", filter);
        if (initial) {
            filter();
        }
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    ready(function () {
        setupNavigation();
        setupSearch();
        setupHero();
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    if (!video || !source) {
        return;
    }
    var started = false;
    var hlsInstance = null;
    var attach = function () {
        if (started) {
            return;
        }
        started = true;
        if (button) {
            button.classList.add("is-hidden");
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
        } else {
            video.src = source;
            video.play().catch(function () {});
        }
    };
    if (button) {
        button.addEventListener("click", attach);
    }
    video.addEventListener("click", attach, { once: true });
    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance && hlsInstance.destroy) {
            hlsInstance.destroy();
        }
    });
}
