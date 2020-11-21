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

// ダブルクリックイベント: ヘッダー
$(document).on('dblclick', '#masthead-container', () => {
    // 動画ページの場合
    if (location.pathname === '/watch') {
        const button = $('#show-hide-button').find('paper-button');
        Promise.resolve()
        .then(() => new Promise((resolve) => {
            // チャット非表示ボタンをクリックする
            if ($(button).length === 0) return;
            $(button).click();
            resolve();
        }))
        .then(() => new Promise(() => {
            // チャット表示ボタンをクリックする
            if ($(button).length === 0) return;
            $(button).click();
        }));
    }
    // 登録チャンネルページの場合
    if (location.pathname === '/feed/subscriptions') {
        // 画面トップまで戻る
        $(window).scrollTop(0);
        // フィルタリングを切り替える
        $('ytd-section-list-renderer').toggleClass('filter-enabled');
        // 動画アイテム
        $('ytd-grid-video-renderer').each((_, item) => {
            // 配信中の場合 -> キャンセル
            const badge = $(item).find('.badge-style-type-live-now');
            if ($(badge).length > 0) return;
            // 配信予約の場合 -> キャンセル
            const reminder = $(item).find('ytd-toggle-button-renderer');
            if ($(reminder).length > 0) return;
            // アイテムを非表示にする
            $(item).addClass('hidden');
        });
    }
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

// ミュートを解除する
const unmute = () => {
    const button = $('.ytp-mute-button');
    if ($(button).length === 0) return;
    const isMuted = $(button).attr('aria-label').includes('ミュート解除');
    if (isMuted) $(button).click();
};

// ライブチャットフローを有効化する
const enableLiveChatFlow = () => {
    const button = $('.ylcf-control-button');
    if ($(button).length === 0) return;
    const isDisabled = $(button).attr('aria-pressed') === 'false';
    if (isDisabled) $(button).click();
};

// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // タブ更新以外の場合 -> キャンセル
    if (message.type !== 'UPDATED') return;
    if (message.data.status !== 'complete') return;
    // 初期化
    videoStopObserver.disconnect();
    document.exitPictureInPicture().catch(() => {});
    // パスが存在しない場合 -> キャンセル
    const pathList = location.pathname.split('/').filter(path => path !== '');
    if (pathList.length === 0) return;
    // チャンネルページの場合
    const channelPaths = ['c', 'channel', 'user'];
    if (channelPaths.includes(pathList[0])) {
        // チャンネル動画を停止する
        const options = { childList: true, subtree: true };
        videoStopObserver.observe(document, options);
    }
    // 動画ページの場合
    if (pathList[0] === 'watch') {
        // ミュートを解除する
        unmute();
        // ライブチャットフローを有効化する
        enableLiveChatFlow();
    }
});
