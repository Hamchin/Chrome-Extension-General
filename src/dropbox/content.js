// 状態
const state = {
    timestamp: 0,
    enableTakeOver: false,
    text: ''
};

// マウスアップイベント on PDF
$(document).on('mouseup', '.pdf-viewer', async () => {
    await new Promise(resolve => setTimeout(resolve, 1));
    // 選択中のテキストを取得する
    let text = window.getSelection().toString();
    if (text === '') return;
    if (state.enableTakeOver) text = state.text + ' ' + text;
    // テキストを分割する
    text = formatText(text);
    if (state.enableTakeOver) state.text = text;
    const sentences = splitText(text);
    // 文の数が上限以上の場合 -> キャンセル
    if (sentences.length > 40) return alert('Too many sentences.');
    // スレッドの内容を空にする
    $('.sc-comment-stream-threads').empty();
    // タイムスタンプを記録する
    const timestamp = Date.now();
    state.timestamp = timestamp;
    // 各文をGoogle翻訳する
    const GPromises = sentences.map(async (sentence) => {
        return await $.ajax({
            url: GOOGLE_TRANSLATE_API_URL,
            dataType: 'json',
            type: 'GET',
            data: { text: sentence }
        });
    });
    const GResponses = await Promise.all(GPromises);
    if (timestamp !== state.timestamp) return;
    // 各結果を表示する
    GResponses.forEach((response, i) => {
        const source = sentences[i];
        const target = (response.code === 200) ? response.text : '';
        const item = $('<li>', { class: 'trans-item' });
        $('<p>', { class: 'trans-source', text: source }).appendTo(item);
        $('<p>', { class: 'trans-target', text: target }).appendTo(item);
        $('.sc-comment-stream-threads').append(item);
    });
    // 各文をDeepL翻訳する
    const DPromises = sentences.map(async (sentence) => {
        return await $.ajax({
            url: DEEPL_TRANSLATE_API_URL,
            dataType: 'json',
            type: 'GET',
            data: { text: sentence }
        });
    });
    const DResponses = await Promise.all(DPromises);
    if (timestamp !== state.timestamp) return;
    // 各結果を表示する
    DResponses.forEach((response, i) => {
        if (response.code !== 200) return;
        const [source, target] = [sentences[i], response.text];
        const item = $('.trans-item')[i];
        $(item).find('.trans-source').text(source);
        $(item).find('.trans-target').text(target);
    });
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
