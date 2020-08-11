// 状態
const state = {
    timestamp: 0,
    enableTakeOver: false,
    text: ''
};

// 英語から日本語へ翻訳する
const getTranslatedData = (text) => {
    const request = {
        url: DEEPL_TRANSLATE_API_URL,
        dataType: 'json',
        type: 'GET',
        data: { text }
    };
    return $.ajax(request);
};

// 翻訳結果をスレッドへ表示する
const addResult = (source, target) => {
    // 翻訳アイテム
    const translateItem = $('<li>', { class: 'translate-item' });
    $('<p>', { class: 'sentence', text: source }).appendTo(translateItem);
    $('<p>', { class: 'sentence', text: target }).appendTo(translateItem);
    // スレッドへ追加する
    $('.sc-comment-stream-threads').append(translateItem);
};

// 翻訳処理
const translate = (sentences) => {
    // 文の数が上限以上の場合 -> キャンセル
    if (sentences.length > 40) {
        alert('Too many sentences.');
        return;
    }
    // スレッドの内容を空にする
    $('.sc-comment-stream-threads').empty();
    // タイムスタンプを記録する
    const timestamp = Date.now();
    state.timestamp = timestamp;
    // 各文を翻訳してリストへ格納する
    const results = [];
    sentences.forEach((sentence) => {
        const data = getTranslatedData(sentence);
        results.push(data);
    });
    // 翻訳が全て完了した時点
    $.when.apply($, results).done((...dataList) => {
        if (timestamp !== state.timestamp) return;
        // 文が1個の場合 -> 配列へ変換する
        if (sentences.length === 1) dataList = [dataList];
        // 各結果をスレッドへ表示する
        dataList.forEach((data) => {
            if (data[0].statusCode !== 200) return;
            const { source, target } = JSON.parse(data[0].body);
            addResult(source, target);
        });
    });
};

// マウスアップイベント on PDF
$(document).on('mouseup', '.pdf-viewer', async () => {
    await new Promise(resolve => setTimeout(resolve, 1));
    // 選択中のテキストを取得する
    let text = window.getSelection().toString();
    if (text === '') return;
    if (state.enableTakeOver) text = state.text + ' ' + text;
    // テキストを整形する
    text = formatText(text);
    if (state.enableTakeOver) state.text = text;
    // テキストを分割して翻訳する
    const sentences = splitText(text);
    translate(sentences);
});

// キーダウンイベント
$(document).on('keydown', (e) => {
    // フォーカスされている場合 -> キャンセル
    if ($(':focus').length > 0) return;
    // Enterキー
    if (e.keyCode === 13) {
        // テキストの引き継ぎを無効化する
        if (state.enableTakeOver) {
            state.enableTakeOver = false;
            $('.message').remove();
        }
        // テキストの引き継ぎを有効化する
        else {
            state.enableTakeOver = true;
            const message = 'Enable translation by taking over text.';
            const element = $('<p>', { class: 'message', text: message });
            $('.sc-comment-editor-coach-mark-container').append(element);
        }
        state.text = '';
    }
});
