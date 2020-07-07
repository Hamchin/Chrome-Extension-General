// 状態
const state = {
    url: '',
    onChannel: false,
    onVideo: false,
    scrollTop: 0,
    timestamp: 0,
    mouseDownTime: null,
    pointer: false
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
    if (scrollTop === 0 && state.pointer && document.pictureInPictureElement) {
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
        state.scrollTop = 0;
        state.timestamp = Date.now();
        state.mouseDownTime = null;
        state.pointer = false
        document.exitPictureInPicture().catch(() => {});
    }
    // チャンネル紹介動画停止
    if (state.onChannel) stopChannelVideo();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// スクロールイベント
$(window).scroll((e) => {
    // 動画ページ -> 強制スクロール防止
    if (state.onVideo) {
        const scrollTop = $(this).scrollTop();
        stopForceScroll(scrollTop);
    }
});

// マウスダウンイベント
$(window).mousedown((e) => {
    // 動画ページ -> 状態記録
    if (state.onVideo) {
        state.mouseDownTime = performance.now();
        state.pointer = $(e.target).css('cursor') === 'pointer';
    }
});

// マウスアップイベント
$(window).mouseup((e) => {
    // 動画ページ
    if (state.onVideo) {
        setTimeout(() => (state.pointer = false), 100);
        // ポインターカーソルの場合 -> キャンセル
        if (state.pointer) return;
        // テキスト選択中の場合 -> キャンセル
        if (window.getSelection().toString()) return;
        // クリック時間が短い場合 -> キャンセル
        const mouseUpTime = performance.now();
        if (mouseUpTime - state.mouseDownTime < 200) return;
        // ピクチャーインピクチャー制御
        controlPictureInPicture();
    }
});
