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
    const GButton = document.getElementById('gtx-trans');
    // Google翻訳ボタンが存在する場合 -> 隣にボタンを設置する
    if (GButton !== null) {
        const GBRect = GButton.getBoundingClientRect();
        $(button).css('top', window.pageYOffset + GBRect.y);
        $(button).css('left', window.pageXOffset + GBRect.x + GBRect.width);
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
    // 翻訳ボタン
    const button = $('.ext-trans-btn');
    setTimeout(() => $(button).addClass('ext-hidden'), 10);
    // 翻訳モーダル
    const modal = $('.ext-trans-modal');
    $(modal).empty();
    // タイムスタンプを記録する
    const timestamp = Date.now();
    $(modal).data('timestamp', timestamp);
    // テキストを分割する
    const text = $(button).data('text') || '';
    const sentences = splitText(formatText(text));
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
    // チェック
    if (timestamp !== $(modal).data('timestamp')) return;
    $(modal).removeClass('ext-hidden');
    // 各結果を表示する
    GResponses.forEach((response, i) => {
        const source = sentences[i];
        const target = (response.code === 200) ? response.text : '';
        const item = $('<div>', { class: 'ext-trans-item' });
        $('<p>', { class: 'ext-trans-source', text: source }).appendTo(item);
        $('<p>', { class: 'ext-trans-target', text: target }).appendTo(item);
        $(item).appendTo(modal);
    });
    $(modal).scrollTop(0);
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
    // チェック
    if ($(modal).hasClass('ext-hidden')) return;
    if (timestamp !== $(modal).data('timestamp')) return;
    // 各結果を更新する
    DResponses.forEach((response, i) => {
        if (response.code !== 200) return;
        const [source, target] = [sentences[i], response.text];
        const item = $('.ext-trans-item')[i];
        $(item).find('.ext-trans-source').text(source);
        $(item).find('.ext-trans-target').text(target);
    });
});
