// ダイアログ監視 -> ゴミ箱を空にする
const dialogObserver = new MutationObserver(() => {
    if ($('.lb-k').length === 0) return;
    $('button[name="d"]').click();
    dialogObserver.disconnect();
});

// マウスダウンイベント: [ゴミ箱を空にする]ボタン
$(document).on('mousedown', 'button[aria-label="ゴミ箱を空にする"]', () => {
    const options = { childList: true, subtree: true };
    dialogObserver.observe(document, options);
});

// マウスインイベント: アップロードポップアップ
$(document).on('mouseenter', '.a-Cd', () => {
    // アップロード完了の場合 -> キャンセル
    const text = $('.a-Cd').attr('aria-label');
    if (text.match(/アップロード完了/)) return;
    // アップロード履歴の表示
    $('.a-Cd-oa').addClass('visible');
});

// マウスアウトイベント: アップロードポップアップ
$(document).on('mouseleave', '.a-Cd', () => {
    // アップロード履歴の非表示
    $('.a-Cd-oa').removeClass('visible');
});
