API_URL = "http://0.0.0.0:2000/notice/create";

// テキストの整形処理
function convertText(text) {
    text = text.replace(/-[ \n]/g, ''); // 単語の分裂を修正
    text = text.replace(/\n/g, ' '); // 改行を空白へ変換
    text = text.replace(/[ ]+/g, ' '); // 冗長な空白を削除
    text = text.replace(/Fig\./g, 'Fig'); // Fig. -> Fig
    text = text.replace(/Figs\./g, 'Figs'); // Figs. -> Figs
    text = text.replace(/et al\./g, 'et al'); // et al. -> et al
    text = text.replace(/e\.g\. /g, 'e.g., '); // e.g. -> e.g.,
    text = text.replace(/i\.e\. /g, 'i.e., '); // i.e. -> i.e.,
    text = text.replace(/([0-9]+)[ ]*\.[ ]*([0-9]+)/g, '$1.$2'); // 12 . 34 -> 12.34
    text = text.replace(/\.[ ]+/g, '.\n\n'); // ピリオド後の空白を改行へ変換
    return text;
}

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
    // テキストの整形処理
    if (message.type === 'convertText') {
        const text = convertText(message.text);
        sendResponse(text);
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
