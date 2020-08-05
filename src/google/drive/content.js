// ダイアログ監視 -> ゴミ箱を空にする
const dialogObserver = new MutationObserver(() => {
    if ($('.lb-k').length === 0) return;
    $('.h-De-Vb.h-De-Y').click();
    dialogObserver.disconnect();
});

// マウスダウンイベント on [ゴミ箱を空にする]ボタン
$(document).on('mousedown', '.h-v-x', () => {
    const options = { childList: true, subtree: true };
    dialogObserver.observe(document, options);
});

// マウスインイベント on アップロードポップアップ
$(document).on('mouseenter', '.a-Cd', () => {
    // アップロード履歴の表示
    $('.a-Cd-oa').addClass('display');
});

// マウスアウトイベント on アップロードポップアップ
$(document).on('mouseleave', '.a-Cd', () => {
    // アップロード履歴の非表示
    $('.a-Cd-oa').removeClass('display');
});
