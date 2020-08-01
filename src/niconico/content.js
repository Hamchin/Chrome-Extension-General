// 状態
const state = {
    url: '',
    onVideo: false,
    allowPictureInPicture: false
};

// ピクチャーインピクチャー制御
const controlPictureInPicture = () => {
    if (state.onVideo === false) return;
    if (state.allowPictureInPicture === false) return;
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
};

// オブザーバー
const observer = new MutationObserver(() => {
    // ページが遷移した場合
    if (state.url !== location.href) {
        state.url = location.href;
        const pathList = location.pathname.split('/');
        state.onVideo = pathList.includes('watch');
    }
});
const options = { childList: true, subtree: true };
observer.observe(document, options);

// スクロールイベント
$(window).scroll((e) => {
    state.allowPictureInPicture = false;
});

// キーダウンイベント
$(window).keydown((e) => {
    const tagName = $(':focus').prop('tagName');
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
    // <p>キーでピクチャーインピクチャー制御
    if (e.keyCode === 80) {
        state.allowPictureInPicture = true;
        setTimeout(controlPictureInPicture, 10);
    }
});
