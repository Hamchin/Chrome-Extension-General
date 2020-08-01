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
            const text = $(source).val();
            const sentences = formatText(text);
            $(source).val(sentences.join('\n\n'));
        }
        $(source).focus();
        return false;
    }
    return true;
});

// クリックイベント on コピーボタン
$('.lmt__target_toolbar__copy').click(() => {
    // テキストエリアへフォーカス
    const source = $('.lmt__source_textarea');
    $(source).focus();
});
