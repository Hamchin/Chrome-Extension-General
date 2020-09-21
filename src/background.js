// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // テキストをGoogle翻訳する
    if (message.type === 'GOOGLE_TRANSLATE') {
        const url = new URL(GOOGLE_TRANSLATE_API_URL);
        url.search = new URLSearchParams(message.data);
        fetch(url.toString())
            .then(response => response.ok ? response.json() : null)
            .then(data => sendResponse(data));
        return true;
    }
    // テキストをDeepL翻訳する
    if (message.type === 'DEEPL_TRANSLATE') {
        const url = new URL(DEEPL_TRANSLATE_API_URL + '/translate');
        url.search = new URLSearchParams(message.data);
        fetch(url.toString())
            .then(response => response.ok ? response.json() : null)
            .then(data => sendResponse(data));
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

// インストールイベント
chrome.runtime.onInstalled.addListener(() => {
    // コンテキストメニュー: DeepL翻訳
    chrome.contextMenus.create({
        type: 'normal',
        id: 'DEEPL_TRANSLATE',
        title: 'DeepL翻訳',
        contexts: ['selection']
    });
});

// クリックイベント: コンテキストメニュー
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // 選択中のテキストをDeepL翻訳する
    if (info.menuItemId === 'DEEPL_TRANSLATE') {
        const text = encodeURIComponent(info.selectionText);
        const url = `https://www.deepl.com/translator#ja/en/${text}`;
        window.open(url);
    }
});
