function initMoviePlayer(source) {
  document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('movieVideo');
    var overlay = document.querySelector('[data-player-overlay]');
    var hls = null;
    var ready = false;

    if (!video) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    }

    function start() {
      attach();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
}
