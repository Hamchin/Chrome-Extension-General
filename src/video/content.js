// ピクチャーインピクチャー制御
const controlPictureInPicture = () => {
    // モード解除
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
        return;
    }
    // モード移行
    $('video').each((_, video) => {
        if ($(video).attr('src') === undefined) return;
        video.requestPictureInPicture().catch(() => {});
    });
};

// キーダウンイベント
$(document).on('keydown', (e) => {
    // フォーカスされている場合 -> キャンセル
    const tagName = $(':focus').prop('tagName');
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
    // Pキー -> ピクチャーインピクチャー制御
    if (e.keyCode === 80) controlPictureInPicture();
});
