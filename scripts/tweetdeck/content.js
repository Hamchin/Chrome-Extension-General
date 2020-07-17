// リンクの最終部分の抽出
function getLastPart(link) {
    const parts = link.split('/');
    return parts[parts.length - 1];
}

// 通知送信
function sendNotices() {
    // 自身のユーザーネーム取得
    const receiver = $('.js-account-summary').find('[rel="user"]').attr('data-user-name');
    // 通知カラム取得
    const icon = $('.app-columns-container').find('.icon-notifications');
    if ($(icon).length === 0) return;
    const panel = $(icon).parent().parent();
    // 通知アイテム取得
    const items = $(panel).find('.stream-item');
    $(items).each((_, item) => {
        // いいねチェック
        const heart = $(item).find('.activity-header').find('.icon-heart-filled');
        if ($(heart).length === 0) return;
        // 通知未送信チェック
        if ($(heart).hasClass('already-send-notification')) return;
        // 非リプライチェック
        const reply = $(item).find('.tweet-body').find('.other-replies');
        if ($(reply).length > 0) return;
        // 自分自身のツイートチェック
        const username = $(item).find('.account-link').find('.username').first().text();
        if (username !== '@' + receiver) return;
        // 相手のユーザーネーム取得
        const userLink = $(item).find('.activity-header').find('.account-link').attr('href');
        const sender = getLastPart(userLink);
        // ツイートID取得
        const tweetLink = $(item).find('.tweet-header').find('.tweet-timestamp').find('a').attr('href');
        const tweet_id = getLastPart(tweetLink);
        // タイムスタンプ取得
        const dataTime = $(item).find('.activity-header').find('.tweet-timestamp').attr('data-time');
        const timestamp = dataTime.substr(0, 10);
        // 通知送信
        const data = {receiver, sender, tweet_id, timestamp};
        const message = {type: 'sendNotice', data: data};
        chrome.runtime.sendMessage(message, (status) => {
            // 成功時 -> マーキング
            if (status === 200) $(heart).addClass('already-send-notification');
        });
    });
}

// 通知送信 (毎分)
setInterval(() => {
    if ($('.stop-send-notifications').length > 0) return;
    sendNotices();
}, 1000 * 60);

// マウスダウンイベント
$('body').on('mousedown', (e) => {
    const classList = e.target.classList;
    // カラムアイコンクリック時
    if (classList.contains('column-type-icon')) {
        // 通知送信停止/再開
        if (classList.contains('icon-notifications')) {
            classList.toggle('stop-send-notifications');
            return;
        }
        // タイムラインのクリア
        const result = new Promise((resolve) => {
            const parentNode = e.target.parentNode.parentNode;
            resolve(parentNode);
        });
        result.then((parentNode) => {
            // 設定ボタンクリック
            const settings = $(parentNode).find('.column-settings-link');
            if ($(settings).length > 0) $(settings)[0].click();
            return parentNode;
        })
        .then((parentNode) => {
            // クリアボタンクリック
            const clear = $(parentNode).find('[data-action="clear"]');
            if ($(clear).length > 0) $(clear)[0].click();
            return parentNode;
        })
        .then((parentNode) => {
            // 設定ボタンクリック
            const settings = $(parentNode).find('.column-settings-link');
            if ($(settings).length > 0) $(settings)[0].click();
            // オプション非表示
            $(parentNode).find('.js-column-options-container').hide();
        });
    }
    // オプション表示
    if (classList.contains('icon-sliders')) {
        const parentNode = e.target.parentNode.parentNode.parentNode.parentNode.parentNode;
        $(parentNode).find('.js-column-options-container').show();
    }
});

// オブザーバー
const observer = new MutationObserver(() => {
    // バー非表示
    $('.js-column-message.scroll-none').each((_, bar) => $(bar).hide());
    // 自動クリアボタンのポインター化
    $('.js-column-header.column-header').each((_, bar) => {
        const icon = $(bar).find('.pull-left.icon');
        $(icon).css('cursor', 'pointer');
    });
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
