// オブザーバー
const observer = new MutationObserver(() => {
    // 検索レコメンド削除
    $('[id^=ed_]').remove();
    $('[id^=eob_]').remove();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
