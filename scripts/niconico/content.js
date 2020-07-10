// 状態
const state = {
    url: '',
    cursor: '',
    onVideo: false,
    press: false
};

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
        const video = $('video').get(0);
        if (video === undefined) return;
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
        state.cursor = '';
        state.press = false;
    }
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

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
