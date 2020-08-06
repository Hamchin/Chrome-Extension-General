// 状態
const initialState = { scrollTop: 0, count: 0 };
let state = {};

// マウスダウンイベント
$(document).on('mousedown', () => {
    // スクロール位置を保持する
    state.scrollTop = $(window).scrollTop();
});

// クリックイベント
$(document).on('click', () => {
    setTimeout(() => {
        // PIP中に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
        if (!document.pictureInPictureElement) return;
        if ($(window).scrollTop() !== 0) return;
        $(window).scrollTop(state.scrollTop);
    }, 100);
});

// チャンネル動画停止用オブザーバー
const videoStopObserver = new MutationObserver(() => {
    // 検知回数が上限に達した場合 -> 検知終了
    state.count += 1;
    if (state.count === 40) videoStopObserver.disconnect();
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

// タブ更新イベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 初期化
    if (message.status !== 'complete') return;
    state = { ...initialState };
    videoStopObserver.disconnect();
    document.exitPictureInPicture().catch(() => {});
    // チャンネルページ以外の場合 -> キャンセル
    const regex = RegExp('/(c|channel|user|)/');
    if (!regex.test(location.pathname)) return;
    // チャンネル動画を停止する
    const options = { childList: true, subtree: true };
    videoStopObserver.observe(document, options);
});
