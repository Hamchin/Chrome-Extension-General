// 状態
const state = {
    url: '',
    cursor: '',
    onChannel: false,
    onVideo: false,
    press: false,
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
    $('.video-stream').each((i, video) => {
        const videoElement = $(video).get(0);
        // 既にチェック済みの場合
        if ($(video).data('checked') === state.timestamp) return;
        // 動画の準備が完了していない場合
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
    if (state.press === false) return;
    if (state.cursor !== 'auto') return;
    if (window.getSelection().toString() !== '') return;
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
    // ピクチャーインピクチャー中に画面トップまで戻った場合
    if (scrollTop === 0 && state.cursor === 'pointer' && document.pictureInPictureElement) {
        // 元のスクロール位置へ戻る
        $(this).scrollTop(state.scrollTop);
    }
    else {
        // スクロール情報の保持
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
        state.press = false;
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
    const scrollTop = $(this).scrollTop();
    stopForceScroll(scrollTop);
});

// マウスダウンイベント
$(window).mousedown((e) => {
    state.press = true;
    state.cursor = $(e.target).css('cursor');
    setTimeout(controlPictureInPicture, 200);
});

// マウスアップイベント
$(window).mouseup((e) => {
    state.press = false;
    setTimeout(() => (state.cursor = ''), 100);
});
