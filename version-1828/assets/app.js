function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
      restartHero();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  restartHero();

  var searchInput = document.querySelector("[data-search-input]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var emptyState = document.querySelector("[data-empty-state]");
  var activeFilter = "all";

  function updateCards() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute("data-search") || "";
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesFilter = activeFilter === "all" || text.indexOf(activeFilter) !== -1;
      var visible = matchesQuery && matchesFilter;

      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", updateCards);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      updateCards();
    });
  });
});
