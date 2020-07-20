'use strict';

const $ = require('jQuery');
const formatText = require('../lib/formatText');

// キーイベント
$('body').on('keydown', (e) => {
    // Escキーでフォーカス解除
    if (e.keyCode === 27) {
        $(':focus').blur();
        return true;
    }
    // フォーカスされている場合
    if ($(':focus').length > 0) {
        return true;
    }
    // Enterキーでテキストエリアへフォーカス
    if (e.keyCode === 13) {
        const source = $('.lmt__source_textarea');
        // Shift + Enter でテキスト整形
        if (e.shiftKey) {
            const text = $(source).val();
            const sentences = formatText(text);
            $(source).val(sentences.join('\n\n'));
        }
        $(source).focus();
        return false;
    }
    return true;
});

// クリックイベント on コピーボタン
$('.lmt__target_toolbar__copy').click(() => {
    // テキストエリアへフォーカス
    const source = $('.lmt__source_textarea');
    $(source).focus();
});

// オブザーバー
const observer = new MutationObserver(() => {
    // 言語選択の位置を最上部へ固定
    $('.lmt__language_container').css('top', '');
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// バックグラウンド削除
$('.lmt__stickyMenubar_whiteBackground').remove();
