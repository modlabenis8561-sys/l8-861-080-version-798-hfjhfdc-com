function initializePlayer(source) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    var hlsInstance = null;
    var attached = false;

    if (!video || !source) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function beginPlayback() {
        attachSource();
        video.controls = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var request = video.play();
        if (request && typeof request.catch === "function") {
            request.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", beginPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            beginPlayback();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
