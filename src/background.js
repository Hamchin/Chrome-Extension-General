// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Twitterの通知を送信する
    if (message.type === 'SEND_NOTICE') {
        $.ajax({
            url: TWITTER_NOTICE_API_URL,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(message.data)
        })
        .then(
            (data, textStatus, jqXHR) => sendResponse(jqXHR.status),
            (jqXHR, textStatus, errorThrown) => sendResponse(jqXHR.status)
        );
        return true;
    }
    // テキストをGoogle翻訳する
    if (message.type === 'GOOGLE_TRANSLATE') {
        $.ajax({
            url: GOOGLE_TRANSLATE_API_URL,
            type: 'GET',
            dataType: 'json',
            data: message.data
        })
        .then(
            data => sendResponse(data),
            _ => sendResponse(null)
        );
        return true;
    }
    // テキストをDeepL翻訳する
    if (message.type === 'DEEPL_TRANSLATE') {
        $.ajax({
            url: DEEPL_TRANSLATE_API_URL,
            type: 'GET',
            dataType: 'json',
            data: message.data
        })
        .then(
            data => sendResponse(data),
            _ => sendResponse(null)
        );
        return true;
    }
});

// タブ更新イベント
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 更新情報を送信する
    const message = { type: 'UPDATED', data: changeInfo };
    chrome.tabs.sendMessage(tabId, message);
});

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // 不要な履歴を削除する
    chrome.history.search({text: '', maxResults: 100}, (items) => {
        const history = items.map(item => item.url);
        const targets = history.filter(url => url.match(/[\?#@]/));
        targets.forEach(url => chrome.history.deleteUrl({url: url}));
    });
});

// ダウンロードイベント
chrome.downloads.onChanged.addListener((downloadDelta) => {
    // ダウンロードアイテムを削除する
    if (downloadDelta.state === undefined) return;
    if (downloadDelta.state.current !== 'complete') return;
    const item = { id: downloadDelta.id };
    setTimeout(() => chrome.downloads.erase(item), 5000);
});
