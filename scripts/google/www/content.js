// 状態
const state = {url: ''};

// オブザーバー
const observer = new MutationObserver(() => {
    // ページが遷移した場合
    if (state.url !== location.href) {
        state.url = location.href;
        // 履歴削除リクエスト
        chrome.runtime.sendMessage('deleteHistory');
    }
    // 広告透明化
    $('#taw').css('opacity', 0);
    // 検索レコメンド削除
    $('[id^=ed_]').remove();
    $('[id^=eob_]').remove();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
