(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    function inYearRange(year, range) {
        var value = Number(String(year || '').match(/\d{4}/));
        if (!range) {
            return true;
        }
        if (range === 'before-2010') {
            return value > 0 && value < 2010;
        }
        if (range.indexOf('-') > -1) {
            var parts = range.split('-').map(Number);
            return value >= parts[0] && value <= parts[1];
        }
        return String(year || '').indexOf(range) > -1;
    }

    function setupFilters() {
        var grid = document.querySelector('[data-movie-grid]');
        var filterBar = document.querySelector('[data-filter-bar]');
        if (!grid || !filterBar) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var keywordInput = filterBar.querySelector('.js-movie-filter');
        var regionSelect = filterBar.querySelector('.js-region-filter');
        var typeSelect = filterBar.querySelector('.js-type-filter');
        var yearSelect = filterBar.querySelector('.js-year-filter');
        var visibleCount = filterBar.querySelector('[data-visible-count]');
        var emptyState = document.querySelector('[data-empty-state]');

        function fillSelect(select, attributeName, defaultLabel) {
            if (!select) {
                return;
            }
            var values = cards.map(function (card) {
                return card.getAttribute(attributeName) || '';
            }).filter(Boolean).filter(function (value, index, array) {
                return array.indexOf(value) === index;
            }).sort(function (a, b) {
                return a.localeCompare(b, 'zh-Hans-CN');
            });
            select.innerHTML = '<option value="">' + defaultLabel + '</option>' + values.map(function (value) {
                return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
            }).join('');
        }

        fillSelect(regionSelect, 'data-region', '全部地区');
        fillSelect(typeSelect, 'data-type', '全部类型');

        function applyFilters() {
            var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
            var region = regionSelect && regionSelect.value || '';
            var type = typeSelect && typeSelect.value || '';
            var yearRange = yearSelect && yearSelect.value || '';
            var count = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var matchesKeyword = !keyword || haystack.indexOf(keyword) > -1;
                var matchesRegion = !region || card.getAttribute('data-region') === region;
                var matchesType = !type || card.getAttribute('data-type') === type;
                var matchesYear = inYearRange(card.getAttribute('data-year'), yearRange);
                var visible = matchesKeyword && matchesRegion && matchesType && matchesYear;
                card.hidden = !visible;
                if (visible) {
                    count += 1;
                }
            });

            if (visibleCount) {
                visibleCount.textContent = String(count);
            }
            if (emptyState) {
                emptyState.hidden = count !== 0;
            }
        }

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (window.__movieSiteHlsPromise) {
            return window.__movieSiteHlsPromise;
        }
        window.__movieSiteHlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('HLS library failed to load'));
            };
            document.head.appendChild(script);
        });
        return window.__movieSiteHlsPromise;
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('.js-hls-player');
            var button = player.querySelector('[data-play-button]');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-src');
            var started = false;

            function playWithNativeSource() {
                video.src = source;
                return video.play();
            }

            function startPlayback() {
                if (!source) {
                    button.querySelector('small').textContent = '未找到播放源';
                    return;
                }
                if (started) {
                    video.play();
                    return;
                }
                started = true;
                button.querySelector('small').textContent = '正在加载播放源...';

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    playWithNativeSource().then(function () {
                        button.classList.add('is-hidden');
                    }).catch(function () {
                        button.classList.add('is-hidden');
                    });
                    return;
                }

                loadHlsLibrary().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            video.play().finally(function () {
                                button.classList.add('is-hidden');
                            });
                        });
                        hls.on(Hls.Events.ERROR, function (event, data) {
                            if (!data || !data.fatal) {
                                return;
                            }
                            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            } else {
                                hls.destroy();
                                playWithNativeSource().catch(function () {
                                    button.querySelector('small').textContent = '播放源加载失败，请刷新重试';
                                });
                            }
                        });
                    } else {
                        playWithNativeSource().finally(function () {
                            button.classList.add('is-hidden');
                        });
                    }
                }).catch(function () {
                    playWithNativeSource().finally(function () {
                        button.classList.add('is-hidden');
                    });
                });
            }

            button.addEventListener('click', startPlayback);
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
        });
    }

    function createSearchCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>#' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<a class="movie-card" href="' + escapeHtml(item.url) + '" data-title="' + escapeHtml(item.title) + '">' +
                '<figure class="movie-poster">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<figcaption class="poster-badge">' + escapeHtml(item.year) + '</figcaption>' +
                    '<span class="play-mark" aria-hidden="true">▶</span>' +
                '</figure>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<h3>' + escapeHtml(item.title) + '</h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="movie-tags">' + tags + '</div>' +
                '</div>' +
            '</a>';
    }

    function setupSearchPage() {
        var resultRoot = document.querySelector('[data-search-results]');
        if (!resultRoot || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-page-input]');
        var summary = document.querySelector('[data-search-summary]');
        if (input) {
            input.value = query;
        }
        if (!query) {
            resultRoot.innerHTML = '';
            return;
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
            var haystack = [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                (item.tags || []).join(' '),
                item.oneLine
            ].join(' ').toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) > -1;
            });
        }).slice(0, 200);

        if (summary) {
            summary.textContent = '“' + query + '” 找到 ' + matches.length + ' 条结果，最多显示前 200 条。';
        }
        resultRoot.innerHTML = matches.map(createSearchCard).join('') || '<p class="empty-state">没有找到相关影片。</p>';
    }

    function setupImageFallback() {
        document.addEventListener('error', function (event) {
            var target = event.target;
            if (!target || target.tagName !== 'IMG') {
                return;
            }
            target.style.visibility = 'hidden';
            var figure = target.closest('figure.movie-poster');
            if (figure) {
                figure.classList.add('image-error');
            }
        }, true);
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
        setupPlayers();
        setupSearchPage();
        setupImageFallback();
    });
}());
