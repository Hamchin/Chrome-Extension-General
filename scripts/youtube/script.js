// 初期状態
const initialState = { scrollTop: 0, clicked: false };

// 状態
let state = {};

// マウスダウンイベント: シンプルリンク
$(document).on('mousedown', '.yt-simple-endpoint', () => {
    state.scrollTop = $(window).scrollTop();
    state.clicked = true;
    setTimeout(() => state.clicked = false, 100);
});

// クリックイベント: シンプルリンク
$(document).on('click', '.yt-simple-endpoint', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    // PIP中に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    const isPIP = document.pictureInPictureElement !== null;
    const isFloated = $('.video-float-frame').length > 0;
    if (isPIP === false && isFloated === false) return;
    if ($(window).scrollTop() !== 0) return;
    $(window).scrollTop(state.scrollTop);
});

// 動画フィルターボタンを追加する
const addVideoFilterButton = () => {
    if ($('.video-filter-btn').length > 0) return;
    const menu = $('#title-container #menu');
    if ($(menu).length === 0) return;
    const icon = $('<yt-icon>');
    const iconButton = $('<yt-icon-button>', { class: 'video-filter-btn', title: 'Show Broadcast Videos', type: 'disabled' });
    $(iconButton).append(icon);
    $(menu).first().before(iconButton);
    $(icon).html('<svg viewBox="0 0 24 24"><path d="M16.94 6.91l-1.41 1.45c.9.94 1.46 2.22 1.46 3.64s-.56 2.71-1.46 3.64l1.41 1.45c1.27-1.31 2.05-3.11 2.05-5.09s-.78-3.79-2.05-5.09zM19.77 4l-1.41 1.45C19.98 7.13 21 9.44 21 12.01c0 2.57-1.01 4.88-2.64 6.54l1.4 1.45c2.01-2.04 3.24-4.87 3.24-7.99 0-3.13-1.23-5.96-3.23-8.01zM7.06 6.91c-1.27 1.3-2.05 3.1-2.05 5.09s.78 3.79 2.05 5.09l1.41-1.45c-.9-.94-1.46-2.22-1.46-3.64s.56-2.71 1.46-3.64L7.06 6.91zM5.64 5.45L4.24 4C2.23 6.04 1 8.87 1 11.99c0 3.13 1.23 5.96 3.23 8.01l1.41-1.45C4.02 16.87 3 14.56 3 11.99s1.01-4.88 2.64-6.54z"></path><circle cx="12" cy="12" r="3"></circle></svg>');
};

// クリックイベント: 動画フィルターボタン
$(document).on('click', '.video-filter-btn', (e) => {
    const section = $(e.target).closest('ytd-section-list-renderer');
    $(section).toggleClass('video-filter-enabled');
    // 各動画を分類する
    $(section).find('ytd-grid-video-renderer').each((_, item) => {
        const isFound = (query) => $(item).find(query).length > 0;
        // 配信中の場合
        if (isFound('.badge-style-type-live-now')) {
            $(item).attr('type', 'live');
        }
        // 配信予約の場合
        else if (isFound('paper-button')) {
            $(item).attr('type', 'reminder');
        }
        // それ以外の場合
        else {
            $(item).attr('type', 'default');
        }
    });
    $(window).scrollTop(1);
    $(window).scrollTop(0);
});

// キーダウンイベント: ドキュメント
$(document).on('keydown', (e) => {
    // 修飾キーの場合 -> キャンセル
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;
    // ライブチャットフローの表示を切り替える
    if (e.key === '=') {
        if (location.pathname !== '/watch') return;
        // コントロールボタンをクリックする
        const button = $('.ylcf-control-button');
        if ($(button).length === 0) return;
        $(button).click();
        $(button).data('timestamp', performance.now());
        // プレーヤーのバーを表示する
        const player = $('.html5-video-player');
        $(player).removeClass('ytp-autohide');
        // プレーヤーのバーを数秒後に非表示にする
        setTimeout(() => {
            const before = $(button).data('timestamp');
            const after = performance.now();
            if (after - before < 2000) return;
            $(player).addClass('ytp-autohide');
        }, 2000);
    }
    // 音量を調節する
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (location.pathname !== '/watch') return;
        e.preventDefault();
        // 既にプレーヤーにフォーカス中の場合 -> キャンセル
        const player = document.querySelector('.html5-video-player');
        if (document.activeElement.isEqualNode(player)) return;
        // プレーヤーにキーイベントを送信する
        const keyEvent = new KeyboardEvent('keydown', { keyCode: e.keyCode });
        player.dispatchEvent(keyEvent);
    }
});

// キーダウンイベント: テキストエリア
$(document).on('keydown', 'input, textarea, ytd-commentbox', (e) => e.stopPropagation());

// フロートフレームを設定する
const setVideoFloatFrame = (enabled) => {
    const player = $('.html5-video-player');
    const parent = $(player).closest('ytd-player');
    // フロートフレームを有効にする
    if (enabled) {
        $(player).addClass('video-float-frame');
        $(player).addClass('video-zoom-out');
        $(player).css('width', $(parent).css('width'));
        $(player).css('height', $(parent).css('height'));
    }
    // フロートフレームを無効にする
    else {
        $(player).removeClass('video-float-frame');
        $(player).removeClass('video-zoom-out');
        $(player).css('width', '');
        $(player).css('height', '');
    }
};

// マウスオーバーイベント: フロートフレーム -> ズームイン
$(document).on('mouseenter', '.video-float-frame', (e) => {
    const player = $(e.target).closest('.video-float-frame');
    $(player).removeClass('video-zoom-out');
});

// マウスアウトイベント: フロートフレーム -> ズームアウト
$(document).on('mouseleave', '.video-float-frame', (e) => {
    const player = $(e.target).closest('.video-float-frame');
    $(player).addClass('video-zoom-out');
});

// チャンネル動画停止用オブザーバー
const videoStopObserver = new MutationObserver(() => {
    const video = document.querySelector('ytd-channel-video-player-renderer video');
    if (video === null || video.paused) return;
    video.pause();
    videoStopObserver.disconnect();
});

// フロートフレーム用オブザーバー
const videoFloatFrameObserver = new IntersectionObserver((entries) => {
    if (state.clicked) return;
    if (entries.length === 0) return;
    setVideoFloatFrame(!entries[0].isIntersecting);
});

// 音量リセット用オブザーバー
const volumeResetObserver = new MutationObserver(() => localStorage.removeItem('yt-player-volume'));

// 初期化
const initialize = () => {
    state = { ...initialState };
    setVideoFloatFrame(false);
    videoStopObserver.disconnect();
    videoFloatFrameObserver.disconnect();
    volumeResetObserver.disconnect();
    document.exitPictureInPicture().catch(() => {});
    // チャンネルページの場合 -> チャンネル動画を停止する
    const pathList = location.pathname.split('/').filter(path => path !== '');
    const firstPath = pathList.length ? pathList[0] : '';
    const channelPaths = ['c', 'channel', 'user'];
    if (channelPaths.includes(firstPath)) {
        const options = { childList: true, subtree: true };
        videoStopObserver.observe(document, options);
    }
    // 登録チャンネルページの場合 -> 動画フィルターボタンを追加する
    if (location.pathname === '/feed/subscriptions') {
        addVideoFilterButton();
        setTimeout(addVideoFilterButton, 2000);
    }
    // 動画ページの場合
    if (location.pathname === '/watch') {
        // フロートフレーム用オブザーバーを起動する
        const player = document.querySelector('ytd-player');
        if (player !== null) videoFloatFrameObserver.observe(player);
        // 音量リセット用オブザーバーを起動する
        const panel = document.querySelector('.ytp-volume-panel');
        const options = { attributes: true };
        if (panel !== null) volumeResetObserver.observe(panel, options);
    }
};

// チャットを更新する
const reloadChat = () => {
    if (location.pathname !== '/watch') return;
    const button = $('#show-hide-button paper-button');
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
};

// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // タブが更新された場合
    if (message.type === 'UPDATED') initialize();
    // チャット更新ボタンが押された場合
    if (message.type === 'RELOAD_CHAT') reloadChat();
});
