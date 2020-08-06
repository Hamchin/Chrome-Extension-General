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
});

// タブ更新イベント
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 更新情報をコンテンツスクリプトへ送信する
    chrome.tabs.sendMessage(tabId, changeInfo);
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
