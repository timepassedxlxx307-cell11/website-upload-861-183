(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var menuButton = document.querySelector(".menu-toggle");
        if (menuButton) {
            menuButton.addEventListener("click", function() {
                var opened = document.body.classList.toggle("menu-open");
                menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero-carousel]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                if (slides.length > 1) {
                    timer = window.setInterval(function() {
                        showSlide(current + 1);
                    }, 5200);
                }
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            }

            dots.forEach(function(dot, index) {
                dot.addEventListener("click", function() {
                    showSlide(index);
                    restart();
                });
            });

            start();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function(form) {
            var scope = form.closest(".section") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var emptyState = scope.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var keywordInput = form.elements.keyword;
            var genreInput = form.elements.genre;
            var yearInput = form.elements.year;

            if (keywordInput && params.get("q")) {
                keywordInput.value = params.get("q");
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilter() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var genre = normalize(genreInput && genreInput.value);
                var year = normalize(yearInput && yearInput.value);
                var visible = 0;

                cards.forEach(function(card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardGenre = normalize(card.getAttribute("data-genre"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (genre && cardGenre.indexOf(genre) === -1 && text.indexOf(genre) === -1) {
                        matched = false;
                    }

                    if (year && cardYear.indexOf(year) === -1) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("show", visible === 0);
                }
            }

            form.addEventListener("input", applyFilter);
            form.addEventListener("change", applyFilter);
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                applyFilter();
            });
            applyFilter();
        });
    });
})();
