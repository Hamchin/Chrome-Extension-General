// 状態
const state = { scrollTop: 0 };

// マウスダウンイベント: ドキュメント
$(document).on('mousedown', () => {
    // スクロール位置を保持する
    state.scrollTop = $(window).scrollTop();
});

// クリックイベント: ドキュメント
$(document).on('click', (e) => {
    // 画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    if ($(window).scrollTop() !== 0) return;
    if ($(e.target).css('cursor') === 'pointer') return;
    $(window).scrollTop(state.scrollTop);
});

// クリックイベント: タブ
$(document).on('click', '[role="tab"]', () => {
    // 画面トップまで戻る
    $(window).scrollTop(0);
});
