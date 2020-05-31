// オブザーバー
const observer = new MutationObserver(() => {
    // 検索レコメンド非表示
    $('[id^=ed_]').hide();
    $('[id^=eob_]').hide();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
