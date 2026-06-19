var MoviePlayer = (function () {
    function mount(streamUrl, options) {
        var ids = options || {};
        var video = document.getElementById(ids.videoId || "movieVideo");
        var cover = document.getElementById(ids.coverId || "playerCover");
        var button = document.getElementById(ids.buttonId || "playerButton");
        var started = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function start() {
            if (!started) {
                started = true;
                attachStream();
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }

        function toggleVideo() {
            if (!started) {
                start();
                return;
            }
            if (video.paused) {
                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {});
                }
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", toggleVideo);
        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    return {
        mount: mount
    };
})();
