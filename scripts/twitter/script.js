// 状態
const state = { scrollTop: 0 };

// マウスダウンイベント: ドキュメント -> スクロール位置を保持する
$(document).on('mousedown', () => {
    state.scrollTop = $(window).scrollTop();
});

// クリックイベント: ドキュメント -> 元のスクロール位置へ戻る
$(document).on('click', (e) => {
    if ($(window).scrollTop() !== 0) return;
    if ($(e.target).css('cursor') === 'pointer') return;
    $(window).scrollTop(state.scrollTop);
});

// クリックイベント: タブ -> 画面トップまで戻る
$(document).on('click', '[role="tab"]', () => {
    $(window).scrollTop(0);
});
