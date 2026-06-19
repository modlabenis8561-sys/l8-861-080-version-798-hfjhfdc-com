import { H as Hls } from './hls-dru42stk.js';

const video = document.querySelector('#movie-player');
const shell = document.querySelector('.video-shell');
const trigger = document.querySelector('[data-play-trigger]');
const message = document.querySelector('[data-player-message]');

const showMessage = (text) => {
    if (message) {
        message.textContent = text;
    }
};

const attachSource = () => {
    if (!video || video.dataset.ready === 'true') {
        return;
    }

    const source = video.dataset.src;

    if (!source) {
        showMessage('当前影片播放源暂不可用。');
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.ready = 'true';
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.ready = 'true';
        return;
    }

    showMessage('当前浏览器不支持 HLS 播放，请更换现代浏览器访问。');
};

const playVideo = async () => {
    if (!video) {
        return;
    }

    attachSource();

    try {
        await video.play();
        if (shell) {
            shell.classList.add('is-playing');
        }
    } catch (error) {
        showMessage('请再次点击播放按钮，或确认浏览器允许媒体播放。');
    }
};

if (trigger) {
    trigger.addEventListener('click', playVideo);
}

if (video) {
    video.addEventListener('play', () => {
        if (shell) {
            shell.classList.add('is-playing');
        }
    });

    video.addEventListener('pause', () => {
        if (shell && video.currentTime === 0) {
            shell.classList.remove('is-playing');
        }
    });
}
