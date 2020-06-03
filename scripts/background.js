// 削除条件
const deleteCondition = [
    ["https://twitter.com/search"],
    ["https://www.youtube.com/results"],
    ["https://www.google.com/search"],
    ["https://www.google.co.jp/search"],
    ["https://www.google.com/maps"],
    ["https://www.google.co.jp/maps"],
    ["https://translate.google.com", "text"],
    ["https://translate.google.co.jp", "text"],
    ["https://www.deepl.com/translator", "en", "ja"],
    ["http://jin115.com", "comment"]
];

// コンパイル
function compile(condition) {
    const joinAnd = (words) => '^' + words.map(word => `(?=.*${word})`).join('');
    const joinOr = (words) => words.join('|');
    const rx = joinOr(condition.map(words => joinAnd(words)));
    return new RegExp(rx);
}

// 正規表現オブジェクト
const matcher = compile(deleteCondition);

// 連想配列 { タブID : 履歴 }
const tabMap = new Map();

// タブ更新イベント
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // シークレットウィンドウの場合 -> キャンセル
    if (tab.incognito) return;
    // URLを持たない場合 -> キャンセル
    if (!changeInfo.url) return;
    // 対象タブの履歴取得
    const history = tabMap.has(tabId) ? tabMap.get(tabId) : [];
    // 既にURLが存在する場合 -> キャンセル
    if (history.includes(changeInfo.url)) return;
    // 対象タブの履歴更新
    tabMap.set(tabId, [...history, changeInfo.url]);
});

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // 対象タブの情報を持たない場合 -> キャンセル
    if (!tabMap.has(tabId)) return;
    // 対象タブの履歴取得
    const history = tabMap.get(tabId);
    // 削除対象にマッチした場合 -> 履歴削除
    history.forEach((url) => {
        if (!matcher.test(url)) return;
        chrome.history.deleteUrl({url: url});
    });
    // 対象タブの情報削除
    tabMap.delete(tabId);
});

// アイコンクリックイベント
chrome.browserAction.onClicked.addListener(() => {
    // 個々の削除条件のテキスト化
    const texts = deleteCondition.map(words => words.join(' '));
    // 履歴検索 -> 履歴削除
    texts.forEach((text) => {
        chrome.history.search({text: text}, (items) => {
            items.forEach((item) => chrome.history.deleteUrl({url: item.url}));
        });
    });
});
