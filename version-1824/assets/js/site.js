(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function bindMenu() {
    var button = qs('.menu-toggle');
    var menu = qs('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
      button.textContent = opened ? '×' : '☰';
    });
  }

  function bindSearchForms() {
    qsa('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var root = form.getAttribute('data-root') || './';
        var value = input ? input.value.trim() : '';
        var target = root + 'search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function bindHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var prev = qs('.hero-prev', root);
    var next = qs('.hero-next', root);
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function bindLocalFilters() {
    qsa('.local-filter').forEach(function (input) {
      var targetSelector = input.getAttribute('data-filter-target');
      if (!targetSelector) {
        return;
      }
      input.addEventListener('input', function () {
        var key = input.value.trim().toLowerCase();
        qsa(targetSelector).forEach(function (card) {
          var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
          card.style.display = haystack.indexOf(key) === -1 ? 'none' : '';
        });
      });
    });
  }

  function renderSearchPage() {
    var container = qs('#search-results');
    if (!container || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('.search-page-form input[name="q"]');
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 240);
    if (!matches.length) {
      container.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
      return;
    }
    container.innerHTML = matches.map(function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card"><a href="' + escapeHtml(movie.url) + '"><div class="card-cover"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="card-year">' + escapeHtml(movie.year) + '</span><span class="card-play">▶</span></div><div class="card-body"><div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.oneLine) + '</p><div class="tag-row">' + tags + '</div></div></a></article>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindLocalFilters();
    renderSearchPage();
  });
})();
