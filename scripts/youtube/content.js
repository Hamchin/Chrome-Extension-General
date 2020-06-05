// 状態
const state = {
    url: '',
    onChannel: false,
    onVideo: false,
    scrollTop: 0,
    timestamp: 0,
    pictureInPicture: false
};

// 秒数から時間へ変換
function convertTime(totalSeconds) {
    totalSeconds = Math.floor(totalSeconds);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {totalSeconds, seconds, minutes, hours};
}

// 時間から文字列へ変換
function convertTimeString(time) {
    const hourString = time.hours ? String(time.hours) : '';
    const minuteString = time.hours ? ('0' + time.minutes).slice(-2) : String(time.minutes);
    const secondString = ('0' + time.seconds).slice(-2);
    const timeString = [hourString, minuteString, secondString].filter(s => s).join(':');
    return timeString;
}

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

// 動画ページのレイアウト制御
function controlVideoLayout() {
    // 動画プレイヤー
    const player = $('#movie_player');
    const playerRect = $(player).get(0).getBoundingClientRect();
    // 動画本体
    const video = $('.video-stream');
    // シークバー
    const seekBar = $('.ytp-chrome-bottom');
    // ヘッダー
    const header = $('#container');
    // ページ右側
    const rightSide = $('#secondary');
    // ページ左側
    const leftSide = $('#primary-inner');
    // 動画情報
    const videoInfo = $('#info.style-scope');
    const videoMeta = $('#meta');
    // ページ全体
    const page = $('#page-manager');
    // 動画が隠れるまでスクロールされた場合 -> レイアウトを変更する
    if (playerRect.height + playerRect.top < $(header).height()) {
        if (!state.pictureInPicture || $(video).css('top') === '0px') {
            state.pictureInPicture = true;
            // 動画本体 -> サイズを縮小して左上に固定する
            const videoWidth = $(video).width();
            const videoHeight = $(video).height();
            $(video).data('width', videoWidth);
            $(video).data('height', videoHeight);
            const getSize = (size) => Math.floor(size * 0.8);
            $(video).css({width: getSize(videoWidth), height: getSize(videoHeight)});
            const videoTop = $(header).height() + 10;
            $(video).css({position: 'fixed', top: videoTop, left: 10});
            // シークバー -> サイズを縮小して動画下部に固定する
            const barTop = videoTop + $(video).height() - 36;
            const barMarginLeft = -0.1 * $(seekBar).width() + 8;
            $(seekBar).css({position: 'fixed', top: barTop, transform: 'scale(0.82)'});
            $(seekBar).css({'margin-left': barMarginLeft, 'background-color': 'rgba(0, 0, 0, 0.5)'});
            // ページ右側 -> 縮小して右に寄せる
            $(rightSide).css({position: 'relative', left: 60, transform: 'scaleX(0.9)'});
            // ページ左側 -> 縮小して右に寄せる
            const leftSideLeft = $(video).width() + 10;
            const leftSideWidth = $('body').width() - leftSideLeft - $(rightSide).width() + 60;
            $(leftSide).css({position: 'relative', left: leftSideLeft, width: leftSideWidth});
            // 動画情報 -> 非表示
            $(videoInfo).hide();
            $(videoMeta).hide();
            // ページ全体 -> 横スクロール禁止
            $(page).css({'overflow-x': 'hidden'});
        }
    }
    // 元の位置までスクロールが戻った場合 -> レイアウトを戻す
    else {
        if (state.pictureInPicture || $(video).css('top') !== '0px') {
            state.pictureInPicture = false;
            // 動画本体
            $(video).css({width: $(video).data('width'), height: $(video).data('height')});
            $(video).css({position: 'absolute', top: 0, left: 0});
            // シークバー
            $(seekBar).css({position: '', top: '', transform: ''});
            $(seekBar).css({'margin-left': '', 'background-color': ''});
            // ページ右側
            $(rightSide).css({position: '', left: '', transform: ''});
            // ページ左側
            $(leftSide).css({position: '', left: '', width: ''});
            // 動画情報
            $(videoInfo).show();
            $(videoMeta).show();
            // ページ全体
            $(page).css({'overflow-x': ''});
        }
    }
}

// 強制スクロール防止
function stopForceScroll(scrollTop) {
    // 強制的に画面トップまで戻った場合
    if (scrollTop === 0 && state.scrollTop > 500) {
        // 元のスクロール位置へ戻る
        $(this).scrollTop(state.scrollTop);
    }
    else {
        // スクロール情報の保持
        state.scrollTop = scrollTop;
    }
}

// オブザーバー
const observer = new MutationObserver(() => {
    // タイトルスペース拡張
    expandTitle();
    // ページが遷移した場合
    if (state.url !== location.href) {
        state.url = location.href;
        const pathList = location.pathname.split('/');
        // チャンネルページへ遷移したか否か
        state.onChannel = pathList.includes('channel') || pathList.includes('user');
        // 動画ページへ遷移したか否か
        state.onVideo = pathList.includes('watch');
        // 状態リセット
        state.scrollTop = 0;
        state.timestamp = Date.now();
        state.pictureInPicture = false;
    }
    // チャンネル紹介動画停止
    if (state.onChannel) stopChannelVideo();
    // 動画ページのレイアウト制御
    if (state.onVideo) controlVideoLayout();
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
        controlVideoLayout();
    }
});
