// タブ更新イベント
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    chrome.tabs.sendMessage(tabId, { type: 'UPDATED' });
});

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // パターンにマッチする履歴を削除する
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
