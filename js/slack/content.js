// オブザーバー
const observer = new MutationObserver(() => {
    // フッター削除
    $('.p-message_pane_input__preview_subtitle').remove();
    $('.p-message_pane_input__preview_metadata').remove();
    // 新規メッセージボタン削除
    $('.p-message_pane__top_banners').remove();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
