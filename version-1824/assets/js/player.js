(function () {
  window.initMoviePlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var wrap = video.closest('.player-wrap');
    var overlay = wrap ? wrap.querySelector('.player-overlay') : null;
    var status = wrap ? wrap.querySelector('.player-status') : null;
    var started = false;
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playNow() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          hideOverlay();
        });
      }
    }

    function start() {
      hideOverlay();
      setStatus('');
      if (started) {
        playNow();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', playNow, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playNow();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              setStatus('播放失败，请稍后重试');
              hlsInstance.destroy();
            }
          }
        });
        return;
      }
      setStatus('播放失败，请稍后重试');
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
