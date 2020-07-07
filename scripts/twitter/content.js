// 状態
const state = {
    scrollTop: 0,
    clicked: false,
    pointer: false
};

// スクロールイベント
$(window).scroll(() => {
    const scrollTop = $(this).scrollTop();
    // クリック時に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    if (scrollTop === 0 && state.clicked && !state.pointer) {
        $(this).scrollTop(state.scrollTop);
        return;
    }
    // スクロール位置の保持
    state.scrollTop = scrollTop;
});

// クリックイベント
$(window).click(() => {
    state.clicked = true;
    setTimeout(() => (state.clicked = false), 1);
});

// マウスダウンイベント
$(window).mousedown((e) => {
    state.pointer = $(e.target).css('cursor') === 'pointer';
});

// マウスアップイベント
$(window).mouseup((e) => {
    setTimeout(() => (state.pointer = false), 1);
});
