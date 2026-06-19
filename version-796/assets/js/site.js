(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-menu-toggle");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", String(open));
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || input.value.trim() === "") {
                    event.preventDefault();
                    return;
                }
            });
        });

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (slides.length === 0) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide") || 0));
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            restart();
        }

        document.querySelectorAll("[data-sort-scope]").forEach(function (scope) {
            var grid = document.querySelector("[data-sortable-grid]");
            if (!grid) {
                return;
            }
            var original = Array.prototype.slice.call(grid.children);
            scope.querySelectorAll("button[data-sort]").forEach(function (button) {
                button.addEventListener("click", function () {
                    scope.querySelectorAll("button[data-sort]").forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    var mode = button.getAttribute("data-sort");
                    var items = original.slice();
                    if (mode === "year") {
                        items.sort(function (a, b) {
                            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                        });
                    } else if (mode === "heat") {
                        items.sort(function (a, b) {
                            return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
                        });
                    }
                    items.forEach(function (item) {
                        grid.appendChild(item);
                    });
                });
            });
        });

        var searchGrid = document.querySelector("[data-search-grid]");
        if (searchGrid) {
            var params = new URLSearchParams(window.location.search);
            var query = (params.get("q") || "").trim();
            var title = document.querySelector("[data-search-title]");
            var empty = document.querySelector("[data-empty-state]");
            var input = document.querySelector(".large-search input[name='q']");
            if (input) {
                input.value = query;
            }
            if (title && query) {
                title.textContent = "搜索：" + query;
            }
            var visible = 0;
            Array.prototype.slice.call(searchGrid.children).forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var match = query === "" || haystack.indexOf(query.toLowerCase()) !== -1;
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
    });
}());
