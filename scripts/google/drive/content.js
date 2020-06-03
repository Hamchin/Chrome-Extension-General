// オブザーバー
const observer = new MutationObserver(() => {
    // アップロードポップアップの自動非表示
    const popup = $('.a-Cd.Hb-ja-hc.a-Cd-Na');
    if ($(popup).length > 0) {
        const content = $(popup)[0];
        const label = $(content).attr('aria-label');
        if (label.match("アップロード完了")) {
            $('.a-Cd-Ea-oa').empty(); // アップロード履歴の削除
            $(content).hide(); // ポップアップ非表示
        }
        else {
            $(content).show(); // ポップアップ表示
        }
    }
    // ゴミ箱の確認ポップアップの自動承認
    if ($('.lb-k').length > 0) {
        const button = $('.h-De-Vb.h-De-Y')[0];
        if ($(button).text() == "ゴミ箱を空にする") $(button).click();
    }
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
