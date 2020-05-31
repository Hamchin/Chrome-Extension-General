// タイトルスペース拡張
function expandTitle() {
    const titleStyle = {'max-height': '80px', '-webkit-line-clamp': '4'};
    $('[id="video-title"]').css(titleStyle);
}

// チャンネル紹介動画停止
function stopChannelVideo() {
    let videos = document.getElementsByClassName('video-stream');
    videos = Array.from(videos);
    videos.forEach((video) => video.pause());
}

// 動画プレイヤーのポジション制御
function controlVideoPosition() {
    const video = $('.video-stream');
    if ($(this).scrollTop() > 560) {
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

// 状態
const state = {
    pathname: '',
    nowOnChannel: false,
    alreadyWatched: false,
    clicked: false,
    scrollTop: 0
};

// オブザーバー
const observer = new MutationObserver(() => {
    // タイトルスペース拡張
    expandTitle();
    // ページ遷移検出
    const pathname = location.pathname;
    if (state.pathname !== pathname) {
        state.pathname = pathname;
        const pathList = pathname.split('/');
        // チャンネルページへ遷移したか否か
        state.nowOnChannel = pathList.includes('channel') || pathList.includes('user');
        // 動画ページへ初めて訪れた場合
        if (pathList.includes('watch') && !state.alreadyWatched) {
            state.alreadyWatched = true;
            $(window).scroll(controlVideoPosition);
            $('#comments').click(() => (state.clicked = true));
        }
    }
    // チャンネル紹介動画停止
    if (state.nowOnChannel) stopChannelVideo();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// 強制スクロール防止
$(window).scroll(() => {
    const scrollTop = $(this).scrollTop();
    // クリック時に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    if (state.clicked && scrollTop === 0) {
        $(this).scrollTop(state.scrollTop);
        state.clicked = false;
        return;
    }
    // スクロール位置の保持
    state.scrollTop = scrollTop;
});
