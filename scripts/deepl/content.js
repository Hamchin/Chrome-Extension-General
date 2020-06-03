// テキストの整形処理
function convertText(text) {
    text = text.replace(/-[ \n]/g, ''); // 単語の分裂を修正
    text = text.replace(/\n/g, ' '); // 改行を空白へ変換
    text = text.replace(/[ ]+/g, ' '); // 冗長な空白を削除
    text = text.replace(/Fig\./g, 'Fig'); // Fig. -> Fig
    text = text.replace(/et al\./g, 'et al'); // et al. -> et al
    text = text.replace(/e\.g\. /g, 'e.g., '); // e.g. -> e.g.,
    text = text.replace(/i\.e\. /g, 'i.e., '); // i.e. -> i.e.,
    text = text.replace(/([0-9]+)[ ]*\.[ ]*([0-9]+)/g, '$1.$2'); // 12 . 34 -> 12.34
    text = text.replace(/\.[ ]+/g, '.\n\n'); // ピリオド後の空白を改行へ変換
    return text;
}

// キーイベント
$('body').on('keydown', (e) => {
    // Escキーでフォーカス解除
    if (e.keyCode === 27) {
        $(':focus').blur();
        return true;
    }
    // フォーカスされている場合
    if ($(':focus').length > 0) {
        return true;
    }
    // Enterキーでテキストエリアへフォーカス
    if (e.keyCode === 13) {
        const source = $('.lmt__source_textarea');
        // Shift + Enter でテキスト整形
        if (e.shiftKey) {
            let text = $(source).val();
            text = convertText(text);
            $(source).val(text);
        }
        $(source).focus();
        return false;
    }
    return true;
});

// オブザーバー
const observer = new MutationObserver(() => {
    // ハッシュが存在する場合
    if (location.hash !== '') {
        // 履歴削除リクエスト
        chrome.runtime.sendMessage('deleteHistory');
    }
    // 言語選択の位置を最上部へ固定
    $('.lmt__language_container').css('top', '');
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);

// バックグラウンド削除
$('.lmt__stickyMenubar_whiteBackground').remove();
