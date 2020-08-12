// 状態
const state = {
    timestamp: 0,
    enableTakeOver: false,
    text: ''
};

// 翻訳処理
const translate = async (sentences) => {
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
    // 各文を翻訳する
    const promises = sentences.map(async (sentence) => {
        return await $.ajax({
            url: DEEPL_TRANSLATE_API_URL,
            dataType: 'json',
            type: 'GET',
            data: { text: sentence }
        });
    });
    const responses = await Promise.all(promises);
    if (timestamp !== state.timestamp) return;
    // 各結果を表示する
    responses.forEach((response, i) => {
        if (response.code !== 200) return;
        const [source, target] = [sentences[i], response.text];
        const translateItem = $('<li>', { class: 'trans-item' });
        $('<p>', { class: 'sentence', text: source }).appendTo(translateItem);
        $('<p>', { class: 'sentence', text: target }).appendTo(translateItem);
        $('.sc-comment-stream-threads').append(translateItem);
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
            $('.label').remove();
        }
        // テキストの引き継ぎを有効化する
        else {
            state.enableTakeOver = true;
            const message = 'Enable translation by taking over text.';
            const element = $('<p>', { class: 'label', text: message });
            $('.sc-comment-editor-coach-mark-container').append(element);
        }
        state.text = '';
    }
});
