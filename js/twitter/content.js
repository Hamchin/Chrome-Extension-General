// 状態
const state = {scrollTop: 0, clicked: false};

// スクロールイベント
$(window).scroll(() => {
    const scrollTop = $(this).scrollTop();
    // クリック時に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    if (state.clicked && scrollTop === 0) {
        $(this).scrollTop(state.scrollTop);
        return;
    }
    // スクロール位置の保持
    state.scrollTop = scrollTop;
});

// クリックイベント
$(window).click(() => {
    state.clicked = true; // フラグを立てる
    setTimeout(() => (state.clicked = false), 1); // 直後にフラグを解除する
});
