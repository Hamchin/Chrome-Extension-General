// オブザーバー
const observer = new MutationObserver(() => {
    // ダイアログ
    const dialog = $('.yes-no-dialog');
    if ($(dialog).length > 0) {
        const title = $(dialog).find('h2').text();
        const runtimeIcon = $('[fill="#93ADCF"]');
        // 自動でランタイムを再起動する
        if (title.match("再起動") || title.match("リセット")) {
            $(dialog).find('paper-button' + '#ok').click();
        }
        // 自動でランタイムを復帰する
        if (title.match("切断") && $(runtimeIcon).length > 1) {
            $(dialog).find('paper-button' + '#ok').click();
        }
    };
});
const options = { childList: true, subtree: true };
observer.observe(document, options);
