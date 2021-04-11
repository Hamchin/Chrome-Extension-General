// ダイアログ監視 -> ゴミ箱を空にする
const dialogObserver = new MutationObserver(() => {
    const dialog = $('.Jf0hed');
    if ($(dialog).length === 0) return;
    $(dialog).find('button').last().click();
    dialogObserver.disconnect();
});

// マウスダウンイベント: [ゴミ箱を空にする]ボタン
$(document).on('mousedown', 'button[aria-label="ゴミ箱を空にする"]', () => {
    const options = { childList: true, subtree: true };
    dialogObserver.observe(document, options);
});
