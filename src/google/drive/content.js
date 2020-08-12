// ダイアログ監視 -> ゴミ箱を空にする
const dialogObserver = new MutationObserver(() => {
    if ($('.lb-k').length === 0) return;
    $('.h-De-Vb.h-De-Y').click();
    dialogObserver.disconnect();
});

// マウスダウンイベント on [ゴミ箱を空にする]ボタン
$(document).on('mousedown', '.h-v-x', (e) => {
    const text = e.target.textContent;
    if (text !== 'ゴミ箱を空にする') return;
    const options = { childList: true, subtree: true };
    dialogObserver.observe(document, options);
});

// マウスインイベント on アップロードポップアップ
$(document).on('mouseenter', '.a-Cd', () => {
    // アップロード完了の場合 -> キャンセル
    const text = $('.a-Cd').attr('aria-label');
    if (text.match(/アップロード完了/)) return;
    // アップロード履歴の表示
    $('.a-Cd-oa').addClass('visible');
});

// マウスアウトイベント on アップロードポップアップ
$(document).on('mouseleave', '.a-Cd', () => {
    // アップロード履歴の非表示
    $('.a-Cd-oa').removeClass('visible');
});
