(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                start();
            });
        });
        root.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        root.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards(query, area) {
        var text = normalize(query);
        var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.textContent);
            card.classList.toggle("is-filtered-out", text && haystack.indexOf(text) === -1);
        });
    }

    function setupFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        if (!areas.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        var pageSearch = document.querySelector("[data-page-search]");
        if (pageSearch) {
            pageSearch.value = initial;
        }
        areas.forEach(function (area) {
            filterCards(initial, area);
        });
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function (form) {
            var input = form.querySelector("[data-filter-input]");
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                areas.forEach(function (area) {
                    filterCards(input ? input.value : "", area);
                });
            });
            if (input) {
                input.addEventListener("input", function () {
                    areas.forEach(function (area) {
                        filterCards(input.value, area);
                    });
                });
            }
        });
        if (pageSearch) {
            pageSearch.addEventListener("input", function () {
                areas.forEach(function (area) {
                    filterCards(pageSearch.value, area);
                });
            });
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
