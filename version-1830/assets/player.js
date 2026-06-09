(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector('[data-player]');
        var overlay = document.querySelector('[data-play-overlay]');

        if (!video || !overlay) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var attached = false;
        var hls = null;

        function attachStream() {
            if (attached || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 40,
                    capLevelToPlayerSize: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            attached = true;
        }

        function playVideo() {
            attachStream();
            video.setAttribute('controls', 'controls');
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
