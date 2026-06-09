(function() {
    function setupMoviePlayer(playerId, streamUrl) {
        var root = document.getElementById(playerId);
        if (!root) {
            return;
        }

        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        var message = root.querySelector(".player-message");
        var hlsInstance = null;
        var prepared = false;

        function showMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function prepare() {
            if (prepared || !video) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
                    if (data && data.fatal) {
                        showMessage("视频加载失败，请稍后再试");
                    }
                });
                return;
            }

            showMessage("视频暂时无法播放");
        }

        function play() {
            prepare();
            root.classList.add("is-playing");
            if (video) {
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function() {
                        root.classList.remove("is-playing");
                    });
                }
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("play", function() {
                root.classList.add("is-playing");
            });
            video.addEventListener("ended", function() {
                root.classList.remove("is-playing");
            });
        }

        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
