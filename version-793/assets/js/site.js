(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function schedule() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        if (slides.length) {
            showSlide(0);
            schedule();
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    schedule();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    schedule();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                    schedule();
                });
            });
        }

        var filterInput = document.querySelector(".filter-input");
        var filterSelect = document.querySelector(".filter-select");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-list .movie-card"));
        var status = document.querySelector(".filter-status");

        function updateFilter() {
            if (!cards.length) {
                return;
            }
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var category = filterSelect ? filterSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = (card.getAttribute("data-search") || "").toLowerCase();
                var cardCategory = card.getAttribute("data-category") || "";
                var keywordMatch = !keyword || searchText.indexOf(keyword) !== -1;
                var categoryMatch = !category || cardCategory === category;
                var show = keywordMatch && categoryMatch;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? "已更新筛选结果" : "没有找到匹配影片";
            }
        }

        if (filterInput || filterSelect) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && filterInput) {
                filterInput.value = query;
            }
            if (filterInput) {
                filterInput.addEventListener("input", updateFilter);
            }
            if (filterSelect) {
                filterSelect.addEventListener("change", function () {
                    if (filterSelect.value && window.location.pathname.indexOf("category-") !== -1) {
                        window.location.href = "./category-" + filterSelect.value + ".html";
                        return;
                    }
                    updateFilter();
                });
            }
            updateFilter();
        }
    });
})();
