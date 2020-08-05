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
        if ($(item).hasClass('send-completed')) return;
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
            $(item).addClass('send-completed');
        });
    });
};

// 通知送信 (毎分)
setInterval(sendNotices, 1000 * 60);

// ========================================
//  DOM操作
// ========================================

// タイムラインのクリア
const clearTimeline = (e) => {
    // カラムアイコンのクリック時
    const icon = $(e.target).closest('.column-type-icon');
    if ($(icon).length === 0) return;
    const column = $(icon).closest('.column-panel');
    const settings = $(column).find('.column-settings-link');
    Promise.resolve()
    .then(() => {
        return new Promise((resolve) => {
            // 設定ボタンクリック
            if ($(settings).length === 0) return;
            $(settings)[0].click();
            resolve();
        });
    })
    .then(() => {
        return new Promise((resolve) => {
            // クリアボタンクリック
            const clear = $(column).find('.icon-clear-timeline');
            if ($(clear).length === 0) return;
            $(clear)[0].click();
            resolve();
        });
    })
    .then(() => {
        return new Promise((resolve) => {
            // 設定ボタンクリック
            if ($(settings).length === 0) return;
            $(settings)[0].click();
            // オプション非表示
            $(column).find('.column-options').hide();
            resolve();
        });
    });
};

// オプション表示
const showOption = (e) => {
    // スライダーのクリック時
    const sliders = $(e.target).closest('.icon-sliders');
    if ($(sliders).length === 0) return;
    const column = $(sliders).closest('.column-panel');
    $(column).find('.column-options').show();
};

// モーダルツイートのフィルタリング設定
const toggleFilterModalTweets = (e) => {
    // モーダルのカラムアイコンのクリック時
    const icon = $(e.target).closest('.column-type-icon');
    if ($(icon).length === 0) return;
    const modal = $(icon).closest('.open-modal');
    if ($(modal).length === 0) return;
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
        modalObserver.observe(modal[0], options);
        filterModalTweets(modal[0]);
    }
};

// モーダルツイートのフィルタリング
const filterModalTweets = (target) => {
    $(target).find('.stream-item').each((_, item) => {
        // リツイートおよびリプライの非表示
        const isRetweet = $(item).find('.tweet-context').length > 0;
        const isReply = $(item).find('.other-replies').length > 0;
        if (isRetweet || isReply) $(item).addClass('hidden');
    });
};

// カラムツイートのフィルタリング設定
const toggleFilterColumnTweets = (e) => {
    // カラムヘッダーのダブルクリック時
    const header = $(e.target).closest('.column-header');
    if ($(header).length === 0) return;
    const column = $(header).closest('.column');
    const columnId = $(column).data('column');
    if (columnId === undefined) return;
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
        columnObserver[columnId] = createObserver(filterColumnTweets);
        columnObserver[columnId].observe(column[0], options);
        filterColumnTweets(column[0]);
    }
};

// カラムツイートのフィルタリング
const filterColumnTweets = (target) => {
    $(target).find('.stream-item').each((_, item) => {
        // メディアツイートの場合 -> スキップ
        const media = $(item).find('.tweet-body').children('.media-preview');
        if ($(media).length > 0) return;
        // いいねされていないツイートの非表示
        const likeCount = $(item).find('.like-count').text();
        if (likeCount === '') $(item).addClass('hidden');
        else $(item).removeClass('hidden');
    });
};

// オブザーバー作成
const createObserver = (callback) => {
    return new MutationObserver((mutations) => {
        const target = mutations[0].target;
        const isContainer = target.classList.contains('chirp-container');
        if (isContainer) callback(target);
    });
};

// モーダル監視
const modalObserver = createObserver(filterModalTweets);

// カラム監視
const columnObserver = {};

// マウスダウンイベント
$(document).on('mousedown', (e) => {
    // タイムラインのクリア
    clearTimeline(e);
    // オプション表示
    showOption(e);
    // モーダルツイートのフィルタリング設定
    toggleFilterModalTweets(e);
});

// ダブルクリックイベント
$(document).on('dblclick', (e) => {
    // カラムツイートのフィルタリング設定
    toggleFilterColumnTweets(e);
});
