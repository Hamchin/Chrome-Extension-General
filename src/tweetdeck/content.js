// ========================================
//  通知送信
// ========================================

// リンクの最終部分の抽出
const getLastPart = (link) => {
    const parts = link.split('/');
    return parts[parts.length - 1];
};

// 通知送信
const sendNotices = () => {
    if (chrome.app === undefined) return;
    if (chrome.app.isInstalled === undefined) return;
    // 自身のユーザーネーム取得
    const receiverName = $('.js-account-summary').find('[rel="user"]').data('user-name');
    // 通知カラム取得
    const columns = $('.app-columns').find('.icon-notifications').closest('.column');
    if ($(columns).length === 0) return;
    // 通知アイテム取得
    const items = $(columns).first().find('.stream-item');
    $(items).each((_, item) => {
        // 送信済みの場合 -> スキップ
        if ($(item).hasClass('done')) return;
        // いいね以外の場合 -> スキップ
        const heart = $(item).find('.activity-header').find('.icon-heart-filled');
        if ($(heart).length === 0) return;
        // リプライの場合 -> スキップ
        const reply = $(item).find('.tweet-body').find('.other-replies');
        if ($(reply).length > 0) return;
        // 自分以外のツイートの場合 -> スキップ
        const username = $(item).find('.account-link').find('.username').first().text();
        if (username !== '@' + receiverName) return;
        // 相手のユーザーネーム取得
        const userLink = $(item).find('.activity-header').find('.account-link').attr('href');
        const senderName = getLastPart(userLink);
        // ツイートID取得
        const tweetLink = $(item).find('.tweet-header').find('.tweet-timestamp').find('a').attr('href');
        const tweetId = getLastPart(tweetLink);
        // タイムスタンプ取得
        const dataTime = $(item).find('.activity-header').find('.tweet-timestamp').data('time');
        const timestamp = Math.floor(dataTime / 1000);
        // 通知送信
        const data = {
            receiver_name: receiverName,
            sender_name: senderName,
            tweet_id: tweetId,
            timestamp: timestamp
        };
        const message = { type: 'SEND_NOTICE', data: data };
        chrome.runtime.sendMessage(message, (status) => {
            // 成功時 -> マーキング
            if (status !== 200) return;
            $(item).addClass('done');
        });
    });
};

// 通知送信 (毎分)
setInterval(sendNotices, 1000 * 60);

// ========================================
//  カラムツイート
// ========================================

// カラムツイートのクリア
const clearColumnTweets = (column) => {
    const settingLink = $(column).find('.column-settings-link');
    Promise.resolve()
    .then(() => new Promise((resolve) => {
        // 設定ボタンのクリック
        if ($(settingLink).length === 0) return;
        $(settingLink).get(0).click();
        resolve();
    }))
    .then(() => new Promise((resolve) => {
        // クリアボタンのクリック
        const clearButton = $(column).find('.icon-clear-timeline');
        if ($(clearButton).length === 0) return;
        $(clearButton).get(0).click();
        resolve();
    }))
    .then(() => new Promise(() => {
        // 設定ボタンのクリック
        if ($(settingLink).length === 0) return;
        $(settingLink).get(0).click();
        // 設定パネルの非表示
        $(column).find('.column-options').hide();
    }));
};

// ========================================
//  モーダルツイート
// ========================================

// モーダルツイートのフィルタリング
const filterModalTweets = (target) => {
    $(target).find('.stream-item').each((_, item) => {
        // リツイート -> 非表示
        const isRetweet = $(item).find('.tweet-context').length > 0;
        if (isRetweet) $(item).addClass('hidden');
        // リプライ -> 非表示
        const isReply = $(item).find('.other-replies').length > 0;
        if (isReply) $(item).addClass('hidden');
    });
};

// モーダル用オブザーバー
const modalObserver = new MutationObserver((mutations) => {
    const target = mutations[0].target;
    if (!target.classList.contains('chirp-container')) return;
    filterModalTweets(target);
});

// モーダルツイートのフィルタリング設定
const toggleFilterModalTweets = (modal) => {
    // フィルタリング無効化
    if ($(modal).hasClass('filter-enabled')) {
        $(modal).removeClass('filter-enabled');
        $(modal).find('.stream-item').removeClass('hidden');
        modalObserver.disconnect();
    }
    // フィルタリング有効化
    else {
        $(modal).addClass('filter-enabled');
        const options = { childList: true, subtree: true };
        modalObserver.observe(modal.get(0), options);
        filterModalTweets(modal.get(0));
    }
};

// ========================================
//  イベント
// ========================================

// クリックイベント on カラムアイコン
$(document).on('click', '.column-type-icon', (e) => {
    // カラムツイートのクリア
    const columns = $(e.target).closest('.app-columns');
    if (columns.length > 0) {
        const column = $(e.target).closest('.column');
        clearColumnTweets(column);
    }
});

// マウスダウンイベント on 設定ボタン
$(document).on('mousedown', '.column-settings-link', (e) => {
    // 設定パネルの表示
    const column = $(e.target).closest('.column');
    $(column).find('.column-options').show();
});

// ダブルクリックイベント on ヘッダー
$(document).on('dblclick', '.js-column-header', (e) => {
    // モーダルツイートのフィルタリング設定
    const modal = $(e.target).closest('.open-modal');
    if (modal.length > 0) toggleFilterModalTweets(modal);
});
