// ブラウザバックイベント -> ブラウザバックをキャンセルする
window.addEventListener('popstate', () => history.pushState(null, null, null));

// 変更監視: ドキュメント
const observer = new MutationObserver(() => {
    const dialog = $('.yes-no-dialog');
    if ($(dialog).length === 0) return;
    const title = $(dialog).find('h2').text();
    const button = $(dialog).find('paper-button' + '#ok');
    // 自動でランタイムを再起動する
    if (title.match('再起動') || title.match('リセット')) $(button).click();
    // 自動でランタイムを復帰する
    if (title.match('切断')) $(button).click();
});

observer.observe(document.body, { childList: true });
