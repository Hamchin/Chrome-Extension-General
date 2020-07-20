'use strict';

const $ = require('jQuery');

const API_URL = "http://0.0.0.0:2000/notice/create";

// 整形されたテキストを取得する
function getFormattedText(text) {
    text = text.trim(); // 両端の空白を削除する
    text = text.replace(/-[ \n]/g, ''); // 単語の分裂を修正する
    text = text.replace(/\n/g, ' '); // 改行を空白へ置換する
    text = text.replace(/[ ]+/g, ' '); // 冗長な空白を削除する
    text = text.replace(/Fig\./g, 'Fig'); // Fig. -> Fig
    text = text.replace(/Figs\./g, 'Figs'); // Figs. -> Figs
    text = text.replace(/et al\./g, 'et al'); // et al. -> et al
    text = text.replace(/e\.g\. /g, 'e.g., '); // e.g. -> e.g.,
    text = text.replace(/i\.e\. /g, 'i.e., '); // i.e. -> i.e.,
    text = text.replace(/([0-9]+)[ ]*\.[ ]*([0-9]+)/g, '$1.$2'); // 12 . 34 -> 12.34
    text = text.replace(/\.[ ]+/g, '.\n'); // ピリオド後の空白を改行へ置換する
    return text;
}

// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Twitterの通知を送信する
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
    // 整形されたテキストのリストを取得する
    if (message.type === 'getSentences') {
        const text = getFormattedText(message.text);
        const sentences = (text === '') ? [] : text.split('\n');
        sendResponse(sentences);
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
