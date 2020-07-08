// 状態
const state = {
    url: '',
    onVideo: false,
    mouseDownTime: null
};

// ピクチャーインピクチャー制御
function controlPictureInPicture() {
    // モード解除
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
    }
    // モード移行
    else {
        const video = $('video').get(0);
        if (!video) return;
        video.requestPictureInPicture().catch(() => {});
    }
}

// オブザーバー
const observer = new MutationObserver(() => {
    // ページが遷移した場合
    if (state.url !== location.href) {
        state.url = location.href;
        const pathList = location.pathname.split('/');
        state.onVideo = pathList.includes('watch');
        state.mouseDownTime = null;
    }
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// マウスダウンイベント
$(window).mousedown((e) => {
    // 動画ページ -> 状態記録
    if (state.onVideo) {
        state.mouseDownTime = performance.now();
    }
});

// マウスアップイベント
$(window).mouseup((e) => {
    // 動画ページ
    if (state.onVideo) {
        // テキスト選択中の場合 -> キャンセル
        if (window.getSelection().toString()) return;
        // クリック時間が短い場合 -> キャンセル
        const mouseUpTime = performance.now();
        if (mouseUpTime - state.mouseDownTime < 200) return;
        // ピクチャーインピクチャー制御
        controlPictureInPicture();
    }
});
