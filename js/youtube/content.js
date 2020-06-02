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

// 動画プレイヤーのポジション制御
function controlVideoPosition(scrollTop) {
    const video = $('.video-stream');
    if (scrollTop > 560) {
        if ($(video).css('position') !== 'fixed') {
            const videoWidth = $(video).width();
            const videoHeight = $(video).height();
            $(video).css('position', 'fixed');
            $(video).data('width', videoWidth);
            $(video).data('height', videoHeight);
            $(video).width(videoWidth * 0.5);
            $(video).height(videoHeight * 0.5);
            $(video).css({top: '65px', left: '10px'});
            $('#comments').css('margin-left', `${videoWidth * 0.5 + 10}px`);
        }
    }
    else {
        if ($(video).css('position') !== 'absolute') {
            $(video).css('position', 'absolute');
            $(video).width($(video).data('width'));
            $(video).height($(video).data('height'));
            $(video).css({top: '0px', left: '0px'});
            $('#comments').css('margin-left', '');
        }
    }
}

// 強制スクロール防止
function stopForceScroll(scrollTop) {
    // クリック時に画面トップまで戻った場合
    if (state.clicked && scrollTop === 0) {
        // 元のスクロール位置へ戻る
        $(this).scrollTop(state.scrollTop);
    }
    else {
        // スクロール位置の保持
        state.scrollTop = scrollTop;
    }
    state.clicked = false;
}

// 状態
const state = {
    pathname: '',
    onChannel: false,
    onVideo: false,
    clicked: false,
    scrollTop: 0,
    timestamp: 0
};

// オブザーバー
const observer = new MutationObserver(() => {
    const pathname = location.pathname;
    // タイトルスペース拡張
    expandTitle();
    // ページが遷移した場合
    if (state.pathname !== pathname) {
        state.pathname = pathname;
        const pathList = pathname.split('/');
        // チャンネルページへ遷移したか否か
        state.onChannel = pathList.includes('channel') || pathList.includes('user');
        // 動画ページへ遷移したか否か
        state.onVideo = pathList.includes('watch');
        // 状態リセット
        state.clicked = false;
        state.scrollTop = 0;
        state.timestamp = Date.now();
    }
    // チャンネル紹介動画停止
    if (state.onChannel) stopChannelVideo();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// スクロールイベント
$(window).scroll(() => {
    const scrollTop = $(this).scrollTop();
    // 動画ページにいる場合
    if (state.onVideo) {
        stopForceScroll(scrollTop);
        controlVideoPosition(scrollTop);
    }
});

// クリックイベント
$(window).click((e) => {
    // 動画ページにいる場合
    if (state.onVideo) {
        const id = e.target.parentNode.id;
        // 要素がコメントである場合
        if (id === 'content-text') {
            state.clicked = true;
        }
    }
});
