API_URL = "http://0.0.0.0:2000/notice/create";

// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 通知送信
    if (message.type === 'sendNotice') {
        $.ajax({
            url: API_URL,
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

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // 不要な履歴を削除する
    chrome.history.search({text: '', maxResults: 100}, (items) => {
        const history = items.map(item => item.url);
        const targets = history.filter(url => url.match(/[\?#@]/));
        targets.forEach(url => chrome.history.deleteUrl({url: url}));
    });
});
