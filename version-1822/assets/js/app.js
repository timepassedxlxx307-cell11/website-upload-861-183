(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var controls = Array.prototype.slice.call(document.querySelectorAll("[data-hero-control]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      controls.forEach(function (control, i) {
        control.classList.toggle("active", i === index);
      });
    }
    controls.forEach(function (control, i) {
      control.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupPageFilter() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-result]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    if (!input || !cards.length) {
      return;
    }
    var chip = "";
    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-match") || "").toLowerCase();
        var ok = (!keyword || text.indexOf(keyword) !== -1) && (!chip || text.indexOf(chip) !== -1);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    input.addEventListener("input", apply);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        chip = button.getAttribute("data-filter-value") || "";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  }

  function setupSearchPage() {
    var mount = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    if (!mount || !form || !input || !window.movieSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-gradient\"></span><span class=\"play-chip\">▶</span></a>" +
        "<div class=\"movie-info\"><div class=\"meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
        "<h3><a href=\"" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-line\">" + tags + "</div></div></article>";
    }
    function render() {
      var q = input.value.trim().toLowerCase();
      var list = window.movieSearchData.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 160);
      if (!list.length) {
        mount.innerHTML = "<div class=\"empty-result\" style=\"display:block\">没有找到相关影片</div>";
        return;
      }
      mount.innerHTML = list.map(card).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var params = new URLSearchParams(window.location.search);
      params.set("q", input.value.trim());
      history.replaceState(null, "", "search.html?" + params.toString());
      render();
    });
    render();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupPlayer() {
    var video = document.querySelector("#moviePlayer");
    var start = document.querySelector("[data-player-start]");
    var wrap = document.querySelector("[data-player-wrap]");
    if (!video || !start) {
      return;
    }
    var src = video.getAttribute("data-src");
    var initialized = false;
    function initialize() {
      if (!src) {
        return;
      }
      if (initialized) {
        video.play().catch(function () {});
        return;
      }
      initialized = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        video._hls = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
      if (wrap) {
        wrap.classList.add("is-playing");
      }
    }
    start.addEventListener("click", initialize);
    video.addEventListener("click", function () {
      if (video.paused) {
        initialize();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupPageFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
