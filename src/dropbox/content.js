API_URL = "https://script.google.com/macros/s/AKfycbzzNETfBv_sIEe7WKO6t5jk0JIBLYwkxOMtNbjNs3uhruHjAMal/exec";

// 状態
const state = {
    enableTakeOver: false,
    text: ""
};

// 英語から日本語へ翻訳
function getTranslatedData(sentence) {
    const data = {
        text: sentence,
        source: "en",
        target: "ja"
    };
    const request = {
        url: API_URL,
        dataType: "json",
        type: "GET",
        data: data
    };
    return $.ajax(request);
}

// 翻訳結果をスレッドへ表示
function addResult(source, target) {
    // 翻訳アイテム
    const translateItem = $('<li>', { class: 'translate-item' });
    $('<p>', { class: 'sentence', text: source }).appendTo(translateItem);
    $('<p>', { class: 'sentence', text: target }).appendTo(translateItem);
    // DeepL翻訳リンク
    const footer = $('<div>', { class: 'sentence text-right' });
    const url = `https://www.deepl.com/translator#en/ja/${source}`;
    $('<a>', { href: url, target: '_blank', text: 'DeepL' }).appendTo(footer);
    $(footer).appendTo(translateItem);
    // スレッドへ追加
    $('.sc-comment-stream-threads').append(translateItem);
}

// 翻訳処理
function translate(sentences) {
    // センテンスの数が1つの場合は空文字を追加
    if (sentences.length === 1) sentences.push('');
    // センテンスの数が一定以上の場合は中断
    if (sentences.length > 20) {
        alert("Too many sentences.");
        return;
    }
    // スレッドの内容を空にする
    $('.sc-comment-stream-threads').empty();
    // それぞれのセンテンスを翻訳してリストへ格納
    let outputList = [];
    for(let i = 0; i < sentences.length; i++) {
        const data = getTranslatedData(sentences[i]);
        outputList.push(data);
    }
    // 翻訳処理が全て完了した時点で結果をスレッドへ表示
    $.when.apply($, outputList).done(function() {
        // スレッドの内容を空にする
        $('.sc-comment-stream-threads').empty();
        for(let i = 0; i < arguments.length; i++) {
            // 翻訳に失敗したセンテンスはスキップ
            if (arguments[i][0].code !== 200) continue;
            // センテンスの表示処理
            const text = arguments[i][0].text;
            addResult(sentences[i], text);
        }
    });
}

// マウスダウンイベント
$('body').on('mousedown', (e) => {
    // PDF外の場合は中断
    const classList = e.target.parentNode.classList;
    if (!classList.contains('_3ndj83M4eq')) return;
    startTime = performance.now();
});

// マウスアップイベント
$('body').on('mouseup', (e) => {
    // PDF外の場合は中断
    const classList = e.target.parentNode.classList;
    if (!classList.contains('_3ndj83M4eq')) return;
    // マウスダウンの時間が一定未満の場合は中断
    const endTime = performance.now();
    if (endTime - startTime < 100) return;
    // 選択中のテキストを取得
    let text = window.getSelection().toString();
    if (state.enableTakeOver) text = state.text + ' ' + text;
    // テキストを整形して翻訳
    const message = {type: 'convertText', text: text};
    chrome.runtime.sendMessage(message, (text) => {
        if (state.enableTakeOver) state.text = text;
        if (text === '') return;
        const sentences = text.split('\n');
        translate(sentences);
    });
});

// キーダウンイベント
$('body').on('keydown', (e) => {
    // フォーカスされている場合は中断
    if ($(':focus').length > 0) return;
    // Enterキーでテキスト保持/解除
    if (e.keyCode === 13) {
        if (state.enableTakeOver) {
            state.enableTakeOver = false;
            $('.message').remove();
        }
        else {
            state.enableTakeOver = true;
            const message = "Enable translation by taking over text.";
            const element = $('<p>', { class: 'message', text: message });
            $('.sc-comment-editor-coach-mark-container').append(element);
        }
        state.text = "";
    }
    // 左キーでページアップ
    if (e.keyCode === 37) {
        $('[data-test="page-up"]').click();
        $(':focus').blur();
    }
    // 右キーでページダウン
    if (e.keyCode === 39) {
        $('[data-test="page-down"]').click();
        $(':focus').blur();
    }
});

// オブザーバー
const observer = new MutationObserver(() => {
    // アノテーションボタン非表示
    $('.sc-add-annotation-highlight-button').hide();
    // サジェスト非表示
    $('.sc-suggested-comments').hide();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
