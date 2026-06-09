(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var button = document.querySelector('.mobile-menu-button');
        var menu = document.querySelector('.mobile-menu');

        if (button && menu) {
            button.addEventListener('click', function () {
                var isHidden = menu.hasAttribute('hidden');
                if (isHidden) {
                    menu.removeAttribute('hidden');
                } else {
                    menu.setAttribute('hidden', 'hidden');
                }
            });
        }

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });

            if (slides.length > 1) {
                start();
            }
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-page-search]'));
        searchInputs.forEach(function (input) {
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
            input.addEventListener('input', function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-type') || ''
                    ].join(' ').toLowerCase();
                    card.style.display = haystack.indexOf(value) === -1 ? 'none' : '';
                });
            });
        });

        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var type = button.getAttribute('data-filter-type');
                var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
                filterButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                cards.forEach(function (card) {
                    var cardType = card.getAttribute('data-type') || '';
                    card.style.display = type === 'all' || cardType === type ? '' : 'none';
                });
            });
        });
    });
})();
