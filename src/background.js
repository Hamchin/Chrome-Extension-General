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

// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // チャットをリロードする
    if (message.type === 'RELOAD_CHAT') {
        chrome.tabs.sendMessage(sender.tab.id, message);
        return true;
    }
    // ミュートを切り替える
    if (message.type === 'SWITCH_MUTE') {
        const muted = sender.tab.mutedInfo.muted;
        const updateProperties = { muted: !muted };
        chrome.tabs.update(sender.tab.id, updateProperties);
        return true;
    }
});
