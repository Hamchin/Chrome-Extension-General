'use strict';

const $ = require('jQuery');

// 状態
const state = {
    scrollTop: 0,
    clicked: false,
    cursor: ''
};

// スクロールイベント
$(window).scroll((e) => {
    const scrollTop = $(window).scrollTop();
    // クリック時に画面トップまで戻った場合 -> 元のスクロール位置へ戻る
    if (scrollTop === 0 && state.clicked && state.cursor !== 'pointer') {
        $(window).scrollTop(state.scrollTop);
        return;
    }
    // スクロール位置の保持
    state.scrollTop = scrollTop;
});

// クリックイベント
$(window).click((e) => {
    state.clicked = true;
    setTimeout(() => (state.clicked = false), 1);
});

// マウスダウンイベント
$(window).mousedown((e) => {
    state.cursor = $(e.target).css('cursor');
});

// マウスアップイベント
$(window).mouseup((e) => {
    setTimeout(() => (state.pointer = false), 1);
});
