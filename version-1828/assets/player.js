import { H as Hls } from './hls-vendor-dru42stk.js';

export function setupPlayer(videoId, buttonId, stateId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var state = document.getElementById(stateId);
  var hls = null;
  var attached = false;

  if (!video || !button || !source) {
    return;
  }

  function showError() {
    if (state) {
      state.hidden = false;
    }
    button.hidden = true;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError();
        }
      });
      return;
    }

    showError();
  }

  function playVideo() {
    attachSource();
    if (state) {
      state.hidden = true;
    }
    button.hidden = true;
    video.controls = true;
    video.play().catch(function () {
      button.hidden = false;
    });
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('error', showError);
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
