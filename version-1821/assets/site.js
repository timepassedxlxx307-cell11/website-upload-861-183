(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = selectAll('[data-hero-slide]', hero);
      var dots = selectAll('[data-hero-dot]', hero);
      var index = 0;

      function activate(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, currentIndex) {
          slide.classList.toggle('is-active', currentIndex === index);
        });

        dots.forEach(function (dot, currentIndex) {
          dot.classList.toggle('is-active', currentIndex === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          activate(index + 1);
        }, 5200);
      }
    }

    selectAll('[data-filter-panel]').forEach(function (panelNode) {
      var input = panelNode.querySelector('.filter-input');
      var buttons = selectAll('.filter-button', panelNode);
      var list = panelNode.parentElement.querySelector('[data-filter-list]');
      var activeFilter = 'all';

      function runFilter() {
        var query = normalize(input && input.value);
        var cards = list ? selectAll('[data-search]', list) : [];

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var matchesText = !query || text.indexOf(query) !== -1;
          var matchesButton = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
          card.classList.toggle('is-hidden-card', !(matchesText && matchesButton));
        });
      }

      if (input) {
        input.addEventListener('input', runFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          runFilter();
        });
      });
    });
  });
})();

function renderSearchPage() {
  var results = document.getElementById('searchResults');
  var status = document.getElementById('searchStatus');
  var input = document.getElementById('searchQuery');

  var data = window.MOVIE_SEARCH_DATA;

  if (!results || !Array.isArray(data)) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = String(params.get('q') || '').trim();
  var lowerQuery = query.toLowerCase();

  if (input) {
    input.value = query;
  }

  var source = data;
  var matches = lowerQuery ? source.filter(function (movie) {
    var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
    return text.indexOf(lowerQuery) !== -1;
  }) : source.slice(0, 36);

  if (status) {
    status.textContent = query ? '搜索结果：' + query : '精选内容';
  }

  results.innerHTML = matches.slice(0, 120).map(function (movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="movie-card-link" href="' + escapeHtml(movie.url) + '">' +
      '<div class="movie-poster-wrap">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="movie-poster" loading="lazy">' +
      '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
      '<span class="movie-play">▶</span>' +
      '</div>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-tags">' + tags + '</div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }).join('') || '<div class="prose-card"><h2>暂无匹配内容</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
