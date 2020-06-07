// 状態
const state = {
    url: '',
    onChannel: false,
    onVideo: false,
    scrollTop: 0,
    timestamp: 0,
    mouseDownTime: null
};

// タイトルスペース拡張
function expandTitle() {
    const titleStyle = {'max-height': '80px', '-webkit-line-clamp': '4'};
    $('[id="video-title"]').css(titleStyle);
}

// チャンネル紹介動画停止
function stopChannelVideo() {
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
    // モード解除
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
    }
    // モード移行
    else {
        const video = $('.video-stream').get(0);
        video.requestPictureInPicture().catch(() => {});
    }
}

// 強制スクロール防止
function stopForceScroll(scrollTop) {
    // ピクチャーインピクチャー中に画面トップまで戻った場合
    if (scrollTop === 0 && document.pictureInPictureElement) {
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
        state.onChannel = pathList.includes('channel') || pathList.includes('user');
        // 動画ページへ遷移したか否か
        state.onVideo = pathList.includes('watch');
        // 状態リセット
        state.scrollTop = 0;
        state.timestamp = Date.now();
        state.mouseDownTime = null;
        document.exitPictureInPicture().catch(() => {});
    }
    // チャンネル紹介動画停止
    if (state.onChannel) stopChannelVideo();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// スクロールイベント
$(window).scroll(() => {
    if (!state.onVideo) return;
    const scrollTop = $(this).scrollTop();
    stopForceScroll(scrollTop);
});

// マウスダウンイベント
$(window).mousedown(() => {
    if (!state.onVideo) return;
    state.mouseDownTime = performance.now();
});

// マウスアップイベント
$(window).mouseup(() => {
    if (!state.onVideo) return;
    if (!state.mouseDownTime) return;
    const mouseUpTime = performance.now();
    if (mouseUpTime - state.mouseDownTime < 200) return;
    controlPictureInPicture();
});

// マウス移動イベント
$(window).mousemove(() => {
    state.mouseDownTime = null;
});
