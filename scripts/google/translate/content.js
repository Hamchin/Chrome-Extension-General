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

// キーイベント on 言語選択
$('.tl-wrap').on('keydown', (e) => {
    const activeElement = document.activeElement;
    // 左または上でフォーカスの逆移動
    if ([37, 38].includes(e.keyCode) && activeElement.previousSibling) {
        activeElement.previousSibling.focus();
        return true;
    }
    // 右または下でフォーカスの移動
    if ([39, 40].includes(e.keyCode) && activeElement.nextSibling) {
        activeElement.nextSibling.focus();
        return true;
    }
    return true;
});

// キーイベント on 全体
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
    const container = $('.sl-sugg-button-container')[1];
    const btnList = $(container).children();
    // 左キーで言語選択(左)へフォーカス
    if (e.keyCode === 37) {
        $(btnList)[0].focus();
        return true;
    }
    // 右キーで言語選択(右)へフォーカス
    if (e.keyCode === 39) {
        $(btnList)[1].focus();
        return true;
    }
    // Enterキーでテキストエリアへフォーカス
    if (e.keyCode === 13) {
        const source = $('#source');
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
