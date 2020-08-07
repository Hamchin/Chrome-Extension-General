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
    const receiver = $('.js-account-summary').find('[rel="user"]').data('user-name');
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
        if (username !== '@' + receiver) return;
        // 相手のユーザーネーム取得
        const userLink = $(item).find('.activity-header').find('.account-link').attr('href');
        const sender = getLastPart(userLink);
        // ツイートID取得
        const tweetLink = $(item).find('.tweet-header').find('.tweet-timestamp').find('a').attr('href');
        const tweet_id = getLastPart(tweetLink);
        // タイムスタンプ取得
        const dataTime = $(item).find('.activity-header').find('.tweet-timestamp').data('time');
        const timestamp = Math.floor(dataTime / 1000);
        // 通知送信
        const data = { receiver, sender, tweet_id, timestamp };
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

// カラムツイートのフィルタリング
const filterColumnTweets = (target) => {
    $(target).find('.stream-item').each((_, item) => {
        // いいね数ゼロ -> 非表示
        const likeCount = parseInt($(item).find('.like-count').text() || 0);
        if (likeCount === 0) $(item).addClass('hidden');
        else $(item).removeClass('hidden');
        // メディアツイートの場合 -> 表示
        const media = $(item).find('.tweet-body').children('.media-preview');
        if ($(media).length > 0) $(item).removeClass('hidden');
        // いいね済み -> 非表示
        const heart = $(item).find('.tweet-footer').find('.icon-heart-filled');
        if ($(heart).length > 0) $(item).addClass('hidden');
        // リツイート -> 非表示
        const isRetweet = $(item).find('.tweet-context').length > 0;
        if (isRetweet) $(item).addClass('hidden');
        // リプライ -> 非表示
        const isReply = $(item).find('.other-replies').length > 0;
        if (isReply) $(item).addClass('hidden');
    });
};

// カラム用オブザーバーの作成
const createColumnObserver = () => {
    return new MutationObserver((mutations) => {
        const target = mutations[0].target;
        const container = $(target).closest('.chirp-container');
        if ($(container).length === 0) return;
        filterColumnTweets(container);
    });
};

// カラム用オブザーバー
const columnObserver = {};

// カラムツイートのフィルタリング設定
const toggleFilterColumnTweets = (column) => {
    const columnId = $(column).data('column');
    // フィルタリング無効化
    if ($(column).hasClass('filter-enabled')) {
        $(column).removeClass('filter-enabled');
        $(column).find('.stream-item').removeClass('hidden');
        columnObserver[columnId].disconnect();
        delete columnObserver[columnId];
    }
    // フィルタリング有効化
    else {
        $(column).addClass('filter-enabled');
        const options = { childList: true, subtree: true };
        columnObserver[columnId] = createColumnObserver();
        columnObserver[columnId].observe(column.get(0), options);
        filterColumnTweets(column.get(0));
    }
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
    // カラムツイートのフィルタリング設定
    const columns = $(e.target).closest('.app-columns');
    if (columns.length > 0) {
        const column = $(e.target).closest('.column');
        toggleFilterColumnTweets(column);
    }
    // モーダルツイートのフィルタリング設定
    const modal = $(e.target).closest('.open-modal');
    if (modal.length > 0) {
        toggleFilterModalTweets(modal);
    }
});
