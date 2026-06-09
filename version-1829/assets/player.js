(function () {
    function setupPlayer(root) {
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var stream = root.getAttribute("data-stream");
        var hlsInstance = null;
        if (!video || !stream) {
            return;
        }
        function prepare() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.setAttribute("data-ready", "1");
        }
        function start() {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var playback = video.play();
            if (playback && playback.catch) {
                playback.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(setupPlayer);
    });
})();
