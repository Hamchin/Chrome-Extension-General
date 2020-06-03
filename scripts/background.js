// 連想配列 { タブID : URLリスト }
const tabMap = new Map();

// メッセージ受信イベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 履歴削除リクエストの場合
    if (message === 'deleteHistory') {
        const tabId = sender.tab.id;
        const url = sender.tab.url;
        const urls = tabMap.has(tabId) ? tabMap.get(tabId) : [];
        // 重複していない場合 -> 履歴追加
        if (!urls.includes(url)) tabMap.set(tabId, [...urls, url]);
        sendResponse();
    }
});

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // 履歴削除
    if (tabMap.has(tabId)) {
        const urls = tabMap.get(tabId);
        urls.forEach((url) => chrome.history.deleteUrl({url: url}));
        tabMap.delete(tabId);
    }
});

// 連想配列の出力
chrome.browserAction.onClicked.addListener(() => console.log(tabMap));
