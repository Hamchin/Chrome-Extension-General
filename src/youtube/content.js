// 状態
const state = { scrollTop: 0 };

// マウスダウンイベント
$(document).on('mousedown', () => {
    // スクロール位置の保持
    state.scrollTop = $(window).scrollTop();
});

// クリックイベント
$(document).on('click', (e) => {
    setTimeout(() => {
        // PIP中に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
        if (!document.pictureInPictureElement) return;
        if ($(window).scrollTop() !== 0) return;
        if ($(e.target).css('cursor') !== 'pointer') return;
        $(window).scrollTop(state.scrollTop);
    }, 100);
});

// タブ更新イベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.status !== 'complete') return;
    const regex = RegExp('/(c|channel|user|)/');
    const setMute = (type) => chrome.runtime.sendMessage({ type });
    // チャンネルページの場合 -> ミュートオン
    if (regex.test(location.pathname)) {
        setMute('MUTE_ON');
    }
    // チャンネルページ以外の場合 -> ミュートオフ
    else {
        const video = $('ytd-channel-video-player-renderer').find('video');
        $(video).each((_, video) => video.pause());
        setMute('MUTE_OFF');
    }
});
