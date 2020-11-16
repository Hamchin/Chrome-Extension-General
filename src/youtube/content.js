// 状態
const state = { scrollTop: 0 };

// マウスダウンイベント: シンプルリンク
$(document).on('mousedown', '.yt-simple-endpoint', () => {
    // スクロール位置を保持する
    state.scrollTop = $(window).scrollTop();
});

// クリックイベント: シンプルリンク
$(document).on('click', '.yt-simple-endpoint', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    // PIP中に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    if (document.pictureInPictureElement === null) return;
    if ($(window).scrollTop() !== 0) return;
    $(window).scrollTop(state.scrollTop);
});

// ダブルクリックイベント: ドキュメント
$(document).on('dblclick', () => {
    const button = $('#show-hide-button').find('paper-button');
    Promise.resolve()
    .then(() => new Promise((resolve) => {
        // チャット非表示ボタンをクリックする
        if ($(button).length === 0) return;
        $(button).get(0).click();
        resolve();
    }))
    .then(() => new Promise(() => {
        // チャット表示ボタンをクリックする
        if ($(button).length === 0) return;
        $(button).get(0).click();
    }));
});

// チャンネル動画停止用オブザーバー
const videoStopObserver = new MutationObserver(() => {
    // 動画が存在しない場合 -> キャンセル
    const video = $('ytd-channel-video-player-renderer').find('video');
    if ($(video).length === 0) return;
    // 動画の準備が未完了の場合 -> キャンセル
    const videoElement = $(video).get(0);
    if (videoElement.paused) return;
    // 動画を停止する
    videoElement.pause();
    videoStopObserver.disconnect();
});

// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // タブ更新以外の場合 -> キャンセル
    if (message.type !== 'UPDATED') return;
    if (message.data.status !== 'complete') return;
    // 初期化
    videoStopObserver.disconnect();
    document.exitPictureInPicture().catch(() => {});
    // チャンネルページ以外の場合 -> キャンセル
    const pathList = location.pathname.split('/').filter(path => path !== '');
    if (pathList.length === 0) return;
    const channelPaths = ['c', 'channel', 'user'];
    if (channelPaths.includes(pathList[0]) === false) return;
    // チャンネル動画を停止する
    const options = { childList: true, subtree: true };
    videoStopObserver.observe(document, options);
});
