'use strict';

const $ = require('jQuery');

// オブザーバー
const observer = new MutationObserver(() => {
    // アップロードのポップアップ
    const popup = $('.a-Cd.Hb-ja-hc.a-Cd-Na');
    if ($(popup).length > 0) {
        const label = $(popup).attr('aria-label');
        if (label.match("アップロード完了")) {
            // アップロード履歴の削除
            $('.a-Cd-Ea-oa').empty();
            // ポップアップ非表示
            $(popup).hide();
        }
        else {
            // ポップアップ表示
            $(popup).show();
        }
    }
    // 自動でゴミ箱を空にする
    if ($('.lb-k').length > 0) {
        const button = $('.h-De-Vb.h-De-Y');
        if ($(button).text() == "ゴミ箱を空にする") $(button).click();
    }
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
