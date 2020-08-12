// ロード
$(document).ready(() => {
    // 翻訳ボタン
    const button = $('<button>', { class: 'ext-trans-btn ext-hidden' });
    const icon = $('<div>', { class: 'ext-trans-icon' });
    const iconUrl = chrome.extension.getURL('icons/DeepL.svg');
    $(icon).css('background-image', `url(${iconUrl})`);
    $(icon).appendTo(button);
    $(button).appendTo('body');
    // 翻訳モーダル
    const modal = $('<div>', { class: 'ext-trans-modal ext-hidden' });
    $(modal).appendTo('body');
});

// マウスアップイベント
$(document).on('mouseup', async () => {
    await new Promise(resolve => setTimeout(resolve, 5));
    // フォームにフォーカスされている場合 -> キャンセル
    const tagName = $(':focus').prop('tagName');
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
    // 選択中のテキストを取得する
    const selection = window.getSelection();
    const text = selection.toString();
    // 英字が含まれていない場合 -> キャンセル
    if (text.match(/[\u0041-\u005A\u0061-\u007A]/g) === null) return;
    // 日本語が含まれている場合 -> キャンセル
    if (text.match(/[\u3040-\u31FF\u3400-\u9FFF]/g) !== null) return;
    // 翻訳ボタン
    const button = $('.ext-trans-btn');
    const GTButton = document.getElementById('gtx-trans');
    // Google翻訳ボタンが存在する場合 -> 隣にボタンを設置する
    if (GTButton !== null) {
        const GTRect = GTButton.getBoundingClientRect();
        $(button).css('top', window.pageYOffset + GTRect.y);
        $(button).css('left', window.pageXOffset + GTRect.x + GTRect.width);
    }
    // Google翻訳ボタンが存在しない場合 -> 最後尾にボタンを設置する
    else {
        const selectionRects = selection.getRangeAt(0).getClientRects();
        const lastRect = selectionRects[selectionRects.length - 1];
        $(button).css('top', window.pageYOffset + lastRect.y + lastRect.height);
        $(button).css('left', window.pageXOffset + lastRect.x + lastRect.width);
    }
    $(button).removeClass('ext-hidden');
});

// マウスダウンイベント
$(document).on('mousedown', (e) => {
    // 翻訳ボタンが存在する場合
    const button = $('.ext-trans-btn');
    if ($(button).hasClass('ext-hidden') === false) {
        // ボタンをクリックした場合 -> テキストを保持する
        if ($(e.target).closest(button).length > 0) {
            const text = window.getSelection().toString();
            $(button).data('text', text);
        }
        // ボタン外をクリックした場合 -> ボタンの非表示
        else {
            $(button).addClass('ext-hidden');
            $(button).data('text', '');
        }
    }
    // 翻訳モーダルが存在する場合
    const modal = $('.ext-trans-modal');
    if ($(modal).hasClass('ext-hidden') === false) {
        // モーダル外をクリックした場合 -> モーダルの非表示
        if ($(e.target).closest(modal).length === 0) {
            $(modal).addClass('ext-hidden');
            $(modal).empty();
        }
    }
});

// クリックイベント on 翻訳ボタン
$(document).on('click', '.ext-trans-btn', async () => {
    const button = $('.ext-trans-btn');
    setTimeout(() => $(button).addClass('ext-hidden'), 5);
    const text = $(button).data('text');
    if (text === undefined) return;
    // テキストを分割する
    const sentences = splitText(text);
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
    // 翻訳モーダル
    const modal = $('.ext-trans-modal');
    $(modal).empty();
    $(modal).removeClass('ext-hidden');
    // 各結果を表示する
    responses.forEach((response, i) => {
        if (response.code !== 200) return;
        const [source, target] = [sentences[i], response.text];
        const item = $('<div>', { class: 'ext-trans-item' });
        $('<p>', { class: 'ext-trans-text', text: source }).appendTo(item);
        $('<p>', { class: 'ext-trans-text', text: target }).appendTo(item);
        $(item).appendTo(modal);
    });
    $(modal).scrollTop(0);
});
