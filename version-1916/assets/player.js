(function () {
    function getNativeSupport(video) {
        return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('[data-player-video]');
        var button = player.querySelector('[data-player-toggle]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var loaded = false;
        var hls = null;

        function loadStream() {
            if (!video || !stream || loaded) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (getNativeSupport(video)) {
                video.src = stream;
            } else {
                video.src = stream;
            }

            loaded = true;
        }

        function playVideo() {
            loadStream();
            var request = video.play();
            if (request && typeof request.then === 'function') {
                request.catch(function () {});
            }
        }

        if (button && video) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });

            video.addEventListener('loadedmetadata', function () {
                if (video.duration && Number.isFinite(video.duration)) {
                    video.currentTime = Math.min(video.currentTime, video.duration);
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
}());
