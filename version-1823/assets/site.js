(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = $('[data-menu-toggle]');
  var mobilePanel = $('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  $all('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = $('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var hero = $('[data-hero]');
  if (hero) {
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  var filterInput = $('[data-filter-input]');
  var filterList = $('[data-filter-list]');
  if (filterInput && filterList) {
    var params = new URLSearchParams(window.location.search);
    var queryInput = $('[data-query-input]');
    var query = params.get('q') || '';
    if (queryInput && query) {
      filterInput.value = query;
    }
    var cards = $all('[data-search]', filterList);
    var empty = $('[data-empty-state]');
    function filterCards() {
      var value = filterInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    filterInput.addEventListener('input', filterCards);
    filterCards();
  }
}());
