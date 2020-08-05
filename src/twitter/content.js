// 状態
const state = { scrollTop: 0 };

// マウスダウンイベント
$(document).on('mousedown', () => {
    // スクロール位置の保持
    state.scrollTop = $(window).scrollTop();
});

// クリックイベント
$(document).on('click', (e) => {
    // 画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    if ($(window).scrollTop() !== 0) return;
    if ($(e.target).css('cursor') === 'pointer') return;
    $(window).scrollTop(state.scrollTop);
});
