// オブザーバー
const observer = new MutationObserver(() => {
    // ランタイムに関するポップアップの自動承認
    if ($('.yes-no-dialog').length > 0) {
        const dialog = $('.yes-no-dialog')[0];
        const title = $(dialog).find('h2')[0];
        const text = $(title).text();
        const runtimeIcon = $('[fill="#93ADCF"]');
        if (text.match("再起動") || text.match("リセット")) {
            $(dialog).find('paper-button' + '#ok').click();
        }
        if (text.match("切断") && $(runtimeIcon).length > 1) {
            $(dialog).find('paper-button' + '#ok').click();
        }
    };
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
