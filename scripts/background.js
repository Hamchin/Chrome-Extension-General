// 削除対象
const texts = [
    "https://twitter.com/search",
    "https://www.youtube.com/results",
    "https://www.google.com/search",
    "https://www.google.co.jp/search",
    "https://www.google.com/maps",
    "https://www.google.co.jp/maps",
    "https://translate.google.com text",
    "https://translate.google.co.jp text",
    "https://www.deepl.com/translator en ja",
    "http://jin115.com comment"
];

// 履歴削除
function deleteHistory(texts) {
    texts.forEach((text) => {
        chrome.history.search({text: text}, (items) => {
            items.forEach((item) => chrome.history.deleteUrl({url: item.url}));
        });
    });
}

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => deleteHistory(texts));
