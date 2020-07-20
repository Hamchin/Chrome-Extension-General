'use strict';

const $ = require('jQuery');

// 状態
const state = {
    url: '',
    cursor: '',
    onChannel: false,
    onVideo: false,
    scrollTop: 0,
    timestamp: 0
};

// タイトルスペース拡張
function expandTitle() {
    const titleStyle = {'max-height': '80px', '-webkit-line-clamp': '4'};
    $('[id="video-title"]').css(titleStyle);
}

// チャンネル紹介動画停止
function stopChannelVideo() {
    if (state.onChannel === false) return;
    $('.video-stream').each((_, video) => {
        const videoElement = $(video).get(0);
        // 既にチェック済みの場合は中断
        if ($(video).data('checked') === state.timestamp) return;
        // 動画の準備が完了していない場合は中断
        if (videoElement.paused) return;
        // 動画の停止
        videoElement.pause();
        // チェック
        $(video).data('checked', state.timestamp);
    });
}

// ピクチャーインピクチャー制御
function controlPictureInPicture() {
    if (state.onVideo === false) return;
    // モード解除
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
    }
    // モード移行
    else {
        const video = $('.video-stream').get(0);
        if (video === undefined) return;
        video.requestPictureInPicture().catch(() => {});
    }
}

// 強制スクロール防止
function stopForceScroll(scrollTop) {
    // ピクチャーインピクチャー中に画面トップまで戻った場合は元のスクロール位置へ戻る
    if (scrollTop === 0 && state.cursor === 'pointer' && document.pictureInPictureElement) {
        $(window).scrollTop(state.scrollTop);
    }
    // スクロール情報の保持
    else {
        state.scrollTop = scrollTop;
    }
}

// オブザーバー
const observer = new MutationObserver(() => {
    // タイトルスペース拡張
    expandTitle();
    // ページが遷移した場合
    if (state.url !== location.href) {
        state.url = location.href;
        const pathList = location.pathname.split('/');
        // チャンネルページへ遷移したか否か
        state.onChannel = (() => {
            const keys = ['c', 'channel', 'user'];
            const includeList = keys.map(key => pathList.includes(key));
            return includeList.includes(true);
        })();
        // 動画ページへ遷移したか否か
        state.onVideo = pathList.includes('watch');
        // 状態リセット
        state.cursor = '';
        state.scrollTop = 0;
        state.timestamp = Date.now();
        document.exitPictureInPicture().catch(() => {});
    }
    // チャンネル紹介動画停止
    stopChannelVideo();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// スクロールイベント
$(window).scroll((e) => {
    const scrollTop = $(window).scrollTop();
    stopForceScroll(scrollTop);
});

// マウスダウンイベント
$(window).mousedown((e) => {
    state.cursor = $(e.target).css('cursor');
});

// マウスアップイベント
$(window).mouseup((e) => {
    setTimeout(() => (state.cursor = ''), 100);
});

// キーダウンイベント
$(window).keydown((e) => {
    const tagName = $(':focus').prop('tagName');
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
    // <p>キーでピクチャーインピクチャー制御
    if (e.keyCode === 80) controlPictureInPicture();
});
